import api from './api';

export interface TicketMessage {
  _id?: string;
  senderType: 'Customer' | 'Admin' | 'AI';
  senderId?: {
    _id: string;
    name: string;
    role: string;
  };
  message: string;
  createdAt?: string;
}

export interface Ticket {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  subject: string;
  category: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Open' | 'In Progress' | 'Waiting for Customer' | 'Resolved' | 'Closed';
  attachments: string[];
  relatedOrder?: {
    _id: string;
  };
  assignedAdmin?: string;
  aiSessionId?: string;
  aiChatHistory?: { sender: string; message: string; createdAt?: string }[];
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
}

export const ticketService = {
  chatWithAI: async (message: string, sessionId: string): Promise<{ reply: string }> => {
    const response = await api.post('/tickets/ai-chat', { message, sessionId });
    return response.data;
  },

  getAIChatHistory: async (sessionId: string): Promise<any> => {
    const response = await api.get(`/tickets/ai-chat/${sessionId}`);
    return response.data;
  },

  createTicket: async (data: Partial<Ticket>): Promise<Ticket> => {
    const response = await api.post('/tickets', data);
    return response.data;
  },

  getMyTickets: async (): Promise<Ticket[]> => {
    const response = await api.get('/tickets/my-tickets');
    return response.data;
  },

  getAllTickets: async (filters?: { status?: string, priority?: string, category?: string }): Promise<Ticket[]> => {
    let queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.priority) queryParams.append('priority', filters.priority);
    if (filters?.category) queryParams.append('category', filters.category);
    
    const url = `/tickets${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await api.get(url);
    return response.data;
  },

  getTicketById: async (id: string): Promise<Ticket> => {
    const response = await api.get(`/tickets/${id}`);
    return response.data;
  },

  addMessage: async (id: string, message: string): Promise<Ticket> => {
    const response = await api.post(`/tickets/${id}/messages`, { message });
    return response.data;
  },

  updateTicketStatus: async (id: string, data: { status?: string, priority?: string, assignedAdmin?: string }): Promise<Ticket> => {
    const response = await api.put(`/tickets/${id}`, data);
    return response.data;
  }
};
