import axios from 'axios';
import { Platform } from 'react-native';

const fallbackBaseUrl =
  Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';

const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL || fallbackBaseUrl;

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000,
});

export const API_HOST = apiBaseUrl.replace(/\/api\/?$/, '');

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

export default api;
