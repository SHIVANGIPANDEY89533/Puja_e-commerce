import api from './api';

export interface Category {
  _id: string;
  name: string;
  icon?: string;
  banner?: string;
  description?: string;
  status: 'Active' | 'Inactive';
  displayOrder: number;
}

export const categoryService = {
  // Get active categories (public)
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get('/categories');
    return response.data;
  },

  // Get all categories (admin)
  getAllCategories: async (): Promise<Category[]> => {
    const response = await api.get('/categories/all');
    return response.data;
  },

  createCategory: async (data: Partial<Category>): Promise<Category> => {
    const response = await api.post('/categories', data);
    return response.data;
  },

  updateCategory: async (id: string, data: Partial<Category>): Promise<Category> => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },

  reorderCategories: async (categories: { id: string, displayOrder: number }[]): Promise<void> => {
    await api.put('/categories/reorder', { categories });
  }
};
