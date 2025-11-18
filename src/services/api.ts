import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// [IMPORTANTE] Substitua 'SEU_IP_LOCAL' pelo endereço IP da sua máquina na rede.
// Ex: 'http://192.168.1.10:8080/api'.
// 'localhost' não funciona em emuladores Android ou dispositivos físicos.
// Para descobrir seu IP, use 'ipconfig' (Windows) ou 'ifconfig'/'ip a' (Mac/Linux).
const API_BASE_URL = 'http://172.16.55.80:8080';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});
/**
 * Interceptor de requisição para adicionar o token JWT automaticamente.
 * Antes de cada requisição, ele busca o token no AsyncStorage e o anexa
 * ao cabeçalho 'Authorization'.
 */
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

/**
 * Interceptor de resposta para lidar com erros de autenticação (401).
 * Se um token for inválido, ele limpa o armazenamento local para forçar um novo login.
 */
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Mantemos o log de erro de resposta, que é útil.
    console.error(`[API Response Error] Status: ${error.response?.status} | URL: ${error.config?.url}`, error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.warn('[API Response Error] Erro 401 (Não Autorizado). Limpando token local.');
      await AsyncStorage.removeItem('@work360:token');
      // Idealmente, aqui você chamaria uma função de logout do AuthContext para limpar o estado globalmente.
    }
    return Promise.reject(error);
  }
);

export default api;
