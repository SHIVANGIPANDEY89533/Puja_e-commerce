import api from './api';

export interface User {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  role: 'customer' | 'admin' | 'delivery';
  isActive: boolean;
  createdAt: string;
}

export const userService = {
  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
  },
  
  updateRole: async (id: string, role: string): Promise<User> => {
    const response = await api.put(`/users/${id}/role`, { role });
    return response.data;
  },
  
  updateStatus: async (id: string, isActive: boolean): Promise<User> => {
    const response = await api.put(`/users/${id}/status`, { isActive });
    return response.data;
  }
};
