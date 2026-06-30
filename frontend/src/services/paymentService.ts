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

  verifyPayment: async (data: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    userName: string;
    email: string;
    phone: string;
    address: string;
    items: any[];
    total: number;
    paymentMethod: string;
    discountAmount: number;
  }): Promise<any> => {
    const response = await api.post('/payments/verify', data);
    return response.data;
  },

  getPaymentDetails: async (paymentId: string): Promise<any> => {
    const response = await api.get(`/payments/${paymentId}`);
    return response.data;
  }
};
