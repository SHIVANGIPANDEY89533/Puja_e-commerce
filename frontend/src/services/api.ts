import axios from 'axios';
import { Platform } from 'react-native';

// Fallback to localhost if ENV is not loaded
// In Expo, process.env.EXPO_PUBLIC_... is statically injected
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://puja-e-commerce.onrender.com/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// We can add interceptors here later if we need to auto-refresh tokens
// or handle global errors.

export default api;
