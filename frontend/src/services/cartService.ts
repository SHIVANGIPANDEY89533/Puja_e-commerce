import api from './api';
import { Product } from './productService';

export interface CartItem {
  _id?: string;
  product: Product;
  quantity: number;
  price: number;
}

export interface CartData {
  _id: string;
  user: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

export const cartService = {
  getCart: async (): Promise<CartData> => {
    try {
      const response = await api.get<CartData>('/cart');
      return response.data;
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }
  },

  addToCart: async (productId: string, quantity: number = 1): Promise<CartData> => {
    try {
      const response = await api.post<CartData>('/cart', { productId, quantity });
      return response.data;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  },

  updateQuantity: async (productId: string, quantity: number): Promise<CartData> => {
    try {
      const response = await api.put<CartData>(`/cart/${productId}`, { quantity });
      return response.data;
    } catch (error) {
      console.error('Error updating cart quantity:', error);
      throw error;
    }
  },

  removeFromCart: async (productId: string): Promise<CartData> => {
    try {
      const response = await api.delete<CartData>(`/cart/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  },

  clearCart: async (): Promise<CartData> => {
    try {
      const response = await api.delete<CartData>('/cart');
      return response.data;
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }
};
