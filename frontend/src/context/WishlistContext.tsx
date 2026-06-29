import React, { createContext, useState, useEffect, useContext } from 'react';
import { Product } from '@/services/productService';
import { wishlistService } from '@/services/wishlistService';
import { useAuth } from './AuthContext';
import { useRouter } from 'expo-router';

interface WishlistContextType {
  wishlist: Product[];
  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const loadWishlist = async () => {
      if (!user) {
        setWishlist([]);
        return;
      }
      try {
        const data = await wishlistService.getWishlist();
        setWishlist(data);
      } catch (error) {
        console.error('Failed to load wishlist:', error);
      }
    };
    loadWishlist();
  }, [user]);

  const addToWishlist = async (product: Product) => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!wishlist.find((p) => p._id === product._id)) {
      setWishlist([...wishlist, product]); // optimistic
      try {
        const updated = await wishlistService.addToWishlist(product._id);
        setWishlist(updated);
      } catch (err) {
        // revert on failure if needed
        console.error(err);
      }
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }
    setWishlist(wishlist.filter((p) => p._id !== productId)); // optimistic
    try {
      const updated = await wishlistService.removeFromWishlist(productId);
      setWishlist(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((p) => p._id === productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
