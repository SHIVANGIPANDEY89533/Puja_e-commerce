import asyncHandler from 'express-async-handler';
import Ticket from '../models/Ticket.js';
import Notification from '../models/Notification.js';
import { getAIResponse } from '../services/aiService.js';

// @desc    Simulate AI Chat
// @route   POST /api/tickets/ai-chat
// @access  Public
const chatWithAI = asyncHandler(async (req, res) => {
  const { message } = req.body;
  if (!message) {
    res.status(400);
    throw new Error('Message is required');
  }

  const aiResponse = await getAIResponse(message);
  res.json({ reply: aiResponse });
});

// @desc    Create a new support ticket
// @route   POST /api/tickets
// @access  Private
const createTicket = asyncHandler(async (req, res) => {
  const { subject, category, description, priority, attachments, initialMessages } = req.body;

  const ticket = await Ticket.create({
    user: req.user._id,
    subject,
    category,
    description,
    priority: priority || 'Medium',
    status: 'Open',
    attachments: attachments || [],
    messages: initialMessages || []
  });

  // Create notification for admin (simulated by assigning to generic 'admin' logic or just generic string in this simplified notification table)
  // Since Notifications are assigned to a specific user, we might want to notify all admins. 
  // For simplicity, we just notify the customer that their ticket was received.
  await Notification.create({
    user: req.user._id,
    message: `Your support ticket #${ticket._id.toString().substring(0, 6)} has been created successfully.`,
    relatedTicket: ticket._id
  });

  res.status(201).json(ticket);
});

// @desc    Get logged in user's tickets
// @route   GET /api/tickets/my-tickets
// @access  Private
const getMyTickets = asyncHandler(async (req, res) => {
  const tickets = await Ticket.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(tickets);
});

// @desc    Get all tickets (Admin)
// @route   GET /api/tickets
// @access  Private/Admin
const getAllTickets = asyncHandler(async (req, res) => {
  const { status, priority, category } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (category) filter.category = category;

  const tickets = await Ticket.find(filter)
    .populate('user', 'name email')
    .sort({ createdAt: -1 });
    
  res.json(tickets);
});

// @desc    Get ticket by ID
// @route   GET /api/tickets/:id
// @access  Private
const getTicketById = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id)
    .populate('user', 'name email')
    .populate('messages.senderId', 'name role');

  if (!ticket) {
    res.status(404);
    throw new Error('Ticket not found');
  }

  // Ensure user owns the ticket OR is an admin
  if (ticket.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view this ticket');
  }

  res.json(ticket);
});

// @desc    Add a message to a ticket
// @route   POST /api/tickets/:id/messages
// @access  Private
const addTicketMessage = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    res.status(404);
    throw new Error('Ticket not found');
  }

  // Ensure authorization
  const isAdmin = req.user.role === 'admin';
  if (ticket.user.toString() !== req.user._id.toString() && !isAdmin) {
    res.status(403);
    throw new Error('Not authorized to update this ticket');
  }

  const newMessage = {
    senderType: isAdmin ? 'Admin' : 'Customer',
    senderId: req.user._id,
    message
  };

  ticket.messages.push(newMessage);
  
  // Update status automatically
  if (isAdmin) {
    ticket.status = 'Waiting for Customer';
    // Notify Customer
    await Notification.create({
      user: ticket.user,
      message: `An admin has replied to your ticket: ${ticket.subject}`,
      relatedTicket: ticket._id
    });
  } else {
    ticket.status = 'In Progress';
    // Ideally notify assignedAdmin here
  }

  await ticket.save();
  res.status(201).json(ticket);
});

// @desc    Update ticket status & assign admin
// @route   PUT /api/tickets/:id
// @access  Private/Admin
const updateTicketStatus = asyncHandler(async (req, res) => {
  const { status, priority, assignedAdmin } = req.body;
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    res.status(404);
    throw new Error('Ticket not found');
  }

  let statusChanged = false;
  if (status && ticket.status !== status) {
    ticket.status = status;
    statusChanged = true;
  }
  
  if (priority) ticket.priority = priority;
  if (assignedAdmin) ticket.assignedAdmin = assignedAdmin;

  await ticket.save();

  if (statusChanged) {
    await Notification.create({
      user: ticket.user,
      message: `The status of your ticket "${ticket.subject}" has been updated to ${status}.`,
      relatedTicket: ticket._id
    });
  }

  res.json(ticket);
});

export {
  chatWithAI,
  createTicket,
  getMyTickets,
  getAllTickets,
  getTicketById,
  addTicketMessage,
  updateTicketStatus
};
