import api from './api';
import { Product } from './productService';

export const wishlistService = {
  getWishlist: async (): Promise<Product[]> => {
    try {
      const response = await api.get<Product[]>('/wishlist');
      return response.data;
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      throw error;
    }
  },

  addToWishlist: async (productId: string): Promise<Product[]> => {
    try {
      const response = await api.post<Product[]>(`/wishlist/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  },

  removeFromWishlist: async (productId: string): Promise<Product[]> => {
    try {
      const response = await api.delete<Product[]>(`/wishlist/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  }
};
