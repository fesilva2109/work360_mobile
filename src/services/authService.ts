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
    if (isNaN(id) || id <= 0) {
      const errorMsg = `[AuthService] ID de usuário inválido fornecido: ${id}`;
      console.error(errorMsg);
      throw new Error('ID de usuário inválido.');
    }
    console.log(`[AuthService] Buscando dados para o usuário ID: ${id}`);
    const { data } = await api.get<Usuario>(`/usuarios/${id}`);
    console.log('[AuthService] Dados do usuário obtidos da API.');
    return data;
  }
  async getUserByEmail(email: string): Promise<Usuario> {
    try {
      console.log(`[AuthService] Buscando dados do usuário pelo email: ${email}`);
      const { data } = await api.get<Usuario[]>('/usuarios', { params: { email } });
      if (data && data.length > 0) {
        console.log('[AuthService] Usuário encontrado via email.');
        return data[0]; 
      }
      throw new Error('Nenhum usuário encontrado com o email fornecido.');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao buscar dados do usuário por email';
      console.error('[AuthService] Erro ao buscar usuário por email:', errorMessage);
      throw new Error(errorMessage);
    }
  }
}

export default new AuthService();
