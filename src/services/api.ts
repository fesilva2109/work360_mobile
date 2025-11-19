import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.0.183:8080';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});
//Interceptor de requisição para adicionar o token JWT automaticamente.
 
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await AsyncStorage.getItem('@work360:token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

//Interceptor de resposta para lidar com erros de autenticação (401).

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Mantemos o log de erro de resposta, que é útil.
    console.error(`[API Response Error] Status: ${error.response?.status} | URL: ${error.config?.url}`, error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.warn('[API Response Error] Erro 401 (Não Autorizado). Limpando token local.');
      await AsyncStorage.removeItem('@work360:token');
    }
    return Promise.reject(error);
  }
);

export default api;
