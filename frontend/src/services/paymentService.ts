import api from './api';

export const paymentService = {
  getPublicKey: async (): Promise<string> => {
    const response = await api.get('/config/razorpay');
    return response.data;
  },

  createOrder: async (data: { items: any[]; couponCode?: string }): Promise<any> => {
    const response = await api.post('/payments/create-order', data);
    return response.data;
  },

  verifyPayment: async (data: any) => {
    const response = await api.post('/payments/verify', data);
    return response.data;
  },

  getAdminPayments: async () => {
    const response = await api.get('/payments');
    return response.data;
  },

  getAdminPaymentById: async (id: string) => {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  },

  getPaymentStats: async () => {
    const response = await api.get('/payments/stats');
    return response.data;
  },

  updatePaymentStatus: async (id: string, data: { status: string; refundAmount?: number }) => {
    const response = await api.put(`/payments/${id}`, data);
    return response.data;
  },

  getPaymentDetails: async (paymentId: string): Promise<any> => {
    const response = await api.get(`/payments/${paymentId}`);
    return response.data;
  }
};
