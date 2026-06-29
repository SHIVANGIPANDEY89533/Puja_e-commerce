import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';

// Custom lightweight AsyncStorage to bypass the Metro cache resolution error on Windows/Web
const AsyncStorage = {
  getItem: async (key: string) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return window.localStorage.getItem(key);
    }
    return null; // Fallback for native until bundler is cleared
  },
  setItem: async (key: string, value: string) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.localStorage.setItem(key, value);
    }
  },
  removeItem: async (key: string) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.localStorage.removeItem(key);
    }
  }
};
import api from '@/services/api';

export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

type User = {
  _id: string;
  name: string;
  email: string;
  role: 'GUEST' | 'USER' | 'ADMIN';
  token?: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (userData: User) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('@user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          if (parsedUser.token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
          }
        }
      } catch (error) {
        console.error('Failed to load user', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (userData: User) => {
    setUser(userData);
    await AsyncStorage.setItem('@user', JSON.stringify(userData));
    if (userData.token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
    }
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem('@user');
    delete api.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
