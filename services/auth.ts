import api from './api';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Helpers para manejar almacenamiento compatible con web
const setStorageItem = async (key: string, value: string) => {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
};

const deleteStorageItem = async (key: string) => {
  if (Platform.OS === 'web') {
    localStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
};

const getStorageItem = async (key: string) => {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  }
  return await SecureStore.getItemAsync(key);
};

export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    user: any;
  };
  message: string;
}

export interface UserProfile {
  id_usuario: number;
  nombre: string;
  apellido: string;
  email: string;
  celular: string;
  documento: string;
  tipoDocumento: string;
  rol: string;
  estado_usuario: string;
  fecha_creacion: string;
}

export const authService = {
  async login(correo: string, contrasena: string): Promise<LoginResponse> {
    const response = await api.post('/auth/login', { correo, contrasena });
    const { data } = response;
    
    if (data.success && data.data?.token) {
      await setStorageItem('user_token', data.data.token);
      // Guardamos datos básicos del usuario si es necesario
      if (data.data.user) {
        await setStorageItem('user_info', JSON.stringify(data.data.user));
      }
    }
    
    return data;
  },

  async logout(): Promise<void> {
    try {
      // Intentar llamar al endpoint de logout, pero limpiar localmente sí o sí
      await api.post('/auth/logout');
    } catch (error) {
      console.log('Error en logout API', error);
    } finally {
      await deleteStorageItem('user_token');
      await deleteStorageItem('user_info');
    }
  },

  async getProfile(): Promise<UserProfile> {
    const response = await api.get('/auth/profile');
    return response.data.data;
  },

  async updateProfile(data: Partial<UserProfile>): Promise<any> {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },
  
  async changePassword(currentPassword: string, newPassword: string): Promise<any> {
    const response = await api.put('/auth/change-password', { currentPassword, newPassword });
    return response.data;
  },

  async getToken(): Promise<string | null> {
    return await getStorageItem('user_token');
  }
};
