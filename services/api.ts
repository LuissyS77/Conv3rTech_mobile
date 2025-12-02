import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Helper para manejar almacenamiento en web y móvil
const getStorageItem = async (key: string) => {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  }
  return await SecureStore.getItemAsync(key);
};

// URL base para la API
// En Android Emulator usa 'http://10.0.2.2:3006/api'
// En iOS Simulator usa 'http://localhost:3006/api'
// En dispositivo físico usa tu IP local, ej: 'http://192.168.0.19:3006/api'
// Producción: 'https://convertech-bf96e8817559.herokuapp.com/api'

const API_URL = 'https://convertech-bf96e8817559.herokuapp.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token a las peticiones
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await getStorageItem('user_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error al obtener el token', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
