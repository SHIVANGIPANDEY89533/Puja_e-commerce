import axios from 'axios';
import { Platform } from 'react-native';

// Fallback to localhost if ENV is not loaded
// In Expo, process.env.EXPO_PUBLIC_... is statically injected
// Force localhost for testing since env vars are being cached by Metro
const BASE_URL = 'http://localhost:5002/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// We can add interceptors here later if we need to auto-refresh tokens
// or handle global errors.

export default api;
