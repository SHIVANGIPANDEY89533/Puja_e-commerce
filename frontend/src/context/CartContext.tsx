import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { cartService, CartItem, CartData } from '../services/cartService';
import { useAuth } from './AuthContext';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

interface CartContextType {
  cart: CartData | null;
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  loading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  isInCart: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, token } = useAuth();
  const router = useRouter();

  const cartItems = cart?.items || [];
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  useEffect(() => {
    if (user && token) {
      fetchCart();
    } else {
      setCart(null);
      setLoading(false);
    }
  }, [user, token]);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const data = await cartService.getCart();
      setCart(data);
    } catch (error) {
      console.error('Failed to fetch cart', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    try {
      const updatedCart = await cartService.addToCart(productId, quantity);
      setCart(updatedCart);
      Alert.alert('Success', 'Item added to cart');
    } catch (error: any) {
      console.error('Failed to add to cart', error);
      Alert.alert('Error', error?.response?.data?.message || 'Could not add to cart');
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!user) return;
    
    // Optimistic update
    const previousCart = cart;
    if (cart) {
      const newItems = cart.items.map(item => 
        item.product._id === productId ? { ...item, quantity } : item
      ).filter(item => item.quantity > 0);
      setCart({ ...cart, items: newItems });
    }

    try {
      const updatedCart = await cartService.updateQuantity(productId, quantity);
      setCart(updatedCart);
    } catch (error: any) {
      console.error('Failed to update quantity', error);
      setCart(previousCart); // Rollback
      Alert.alert('Error', error?.response?.data?.message || 'Could not update quantity');
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!user) return;
    
    // Optimistic update
    const previousCart = cart;
    if (cart) {
      setCart({ ...cart, items: cart.items.filter(i => i.product._id !== productId) });
    }

    try {
      const updatedCart = await cartService.removeFromCart(productId);
      setCart(updatedCart);
    } catch (error: any) {
      console.error('Failed to remove from cart', error);
      setCart(previousCart);
      Alert.alert('Error', error?.response?.data?.message || 'Could not remove item');
    }
  };

  const clearCart = async () => {
    if (!user) return;
    try {
      const updatedCart = await cartService.clearCart();
      setCart(updatedCart);
    } catch (error: any) {
      console.error('Failed to clear cart', error);
      Alert.alert('Error', error?.response?.data?.message || 'Could not clear cart');
    }
  };

  const isInCart = (productId: string) => {
    return cartItems.some(item => item.product._id === productId);
  };

  return (
    <CartContext.Provider value={{
      cart,
      cartItems,
      cartCount,
      cartTotal,
      loading,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      isInCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
