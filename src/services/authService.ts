import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginRequest, RegisterRequest, AuthResponse, Usuario } from '../types/models';

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const { data: usuarios } = await api.get<Usuario[]>('/usuarios', {
        params: { email: credentials.email }
      });

      const usuario = usuarios.find(u => u.email === credentials.email);

      if (!usuario) {
        throw new Error('Usuário não encontrado');
      }

      const mockToken = `mock_token_${usuario.id}_${Date.now()}`;

      await AsyncStorage.setItem('@work360:token', mockToken);
      await AsyncStorage.setItem('@work360:user', JSON.stringify(usuario));

      return {
        token: mockToken,
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
        }
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao fazer login');
    }
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const { data: usuario } = await api.post<Usuario>('/usuarios', userData);

      const mockToken = `mock_token_${usuario.id}_${Date.now()}`;

      await AsyncStorage.setItem('@work360:token', mockToken);
      await AsyncStorage.setItem('@work360:user', JSON.stringify(usuario));

      return {
        token: mockToken,
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
        }
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao criar conta');
    }
  }

  async logout(): Promise<void> {
    await AsyncStorage.multiRemove(['@work360:token', '@work360:user']);
  }

  async getCurrentUser(): Promise<Usuario | null> {
    try {
      const userJson = await AsyncStorage.getItem('@work360:user');
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      return null;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem('@work360:token');
    return !!token;
  }
}

export default new AuthService();
