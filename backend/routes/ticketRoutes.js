import express from 'express';
import { 
  chatWithAI,
  getAIChatHistory,
  createTicket,
  getMyTickets,
  getAllTickets,
  getTicketById,
  addTicketMessage,
  updateTicketStatus
} from '../controllers/ticketController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/ai-chat', protect, chatWithAI);
router.get('/ai-chat/:sessionId', protect, getAIChatHistory);

router.route('/')
  .post(protect, createTicket)
  .get(protect, admin, getAllTickets);

router.get('/my-tickets', protect, getMyTickets);

router.route('/:id')
  .get(protect, getTicketById)
  .put(protect, admin, updateTicketStatus);

router.post('/:id/messages', protect, addTicketMessage);

export default router;
