import api from './api';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  Usuario,
} from '../types/models';

class AuthService {
  //Realiza o login do usuário
 
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      console.log('[AuthService] Tentando fazer login com:', { email: credentials.email });
      const { data } = await api.post<AuthResponse>('/login', credentials);
      console.log('[AuthService] Login API call bem-sucedido.');
      return data;
    } catch (error: any) {
      console.error('[AuthService] Erro na chamada de login API:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Erro ao fazer login');
    }
  }

  //Registra um novo usuário
 
  async register(userData: RegisterRequest): Promise<Usuario> {
    try {
      console.log('[AuthService] Tentando registrar novo usuário com:', { email: userData.email });
      const { data: usuario } = await api.post<Usuario>('/usuarios', userData);
      console.log('[AuthService] Registro API call bem-sucedido.');
      return usuario;
    } catch (error: any) {
      console.error('[AuthService] Erro na chamada de registro API:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Erro ao criar conta');
    }
  }

  async getUserData(id: number): Promise<Usuario> {
    console.log(`[AuthService] Buscando dados para o usuário ID: ${id}`);
    const { data } = await api.get<Usuario>(`/usuarios/${id}`);
    console.log('[AuthService] Dados do usuário obtidos da API.');
    return data;
  }
}

export default new AuthService();
