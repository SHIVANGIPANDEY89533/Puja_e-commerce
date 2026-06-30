import api from './api';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  image: string;
}

export interface Order {
  _id: string;
  userId: string;
  userName: string;
  email: string;
  phone: string;
  address: string;
  items: OrderItem[];
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  deliveryExecutive?: string;
  deliveryNotes?: string;
  transactionId?: string;
  paymentDate?: string;
  paymentAmount?: number;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
}

const getOrders = async () => {
  const response = await api.get<Order[]>('/orders');
  return response.data;
};

const getOrderById = async (id: string) => {
  const response = await api.get<Order>(`/orders/${id}`);
  return response.data;
};

const updateOrderStatus = async (id: string, status: string, paymentStatus?: string) => {
  const payload: any = { status };
  if (paymentStatus) {
    payload.paymentStatus = paymentStatus;
  }
  const response = await api.put<Order>(`/orders/${id}/status`, payload);
  return response.data;
};

export const orderService = {
  getOrders,
  getOrderById,
  updateOrderStatus,
};
