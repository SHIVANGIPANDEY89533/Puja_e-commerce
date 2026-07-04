import axios from 'axios';
import { Platform } from 'react-native';

// Fallback to production URL for APK builds if env vars aren't loaded properly
// For local testing on a physical device, localhost will not work.
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
