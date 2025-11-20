import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.0.183:8080';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Adiciona o token de autenticação em todas as chamadas.
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Para rotas públicas, garante que nenhum token seja enviado.
    if (config.url === '/login' || (config.url === '/usuarios' && config.method === 'post')) {
      // Remove qualquer cabeçalho de autorização que possa existir de uma sessão anterior.
      delete config.headers.Authorization;
      return config;
    }

    const token = await AsyncStorage.getItem('@Work360:token');
    // Para rotas protegidas, adiciona o token.
    if (token) {
      // Adiciona o cabeçalho de autorização
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Faz algo com o erro da requisição
    return Promise.reject(error);
  }
);

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
