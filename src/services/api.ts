import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://work360-app.azurewebsites.net';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, 
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    console.error(`[API Response Error] Status: ${error.response?.status} | URL: ${error.config?.url}`, error.response?.data || error.message);
    const status = error.response?.status;
    if (status === 401 || status === 403) {
      const reason = status === 401 ? 'Não Autorizado' : 'Acesso Proibido';
      console.warn(`[API Response Error] Erro ${status} (${reason}). O token pode ser inválido ou o usuário não tem permissão.`);
    }
    return Promise.reject(error);
  }
);

export default api;
