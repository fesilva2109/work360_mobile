import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode'; // Instale com: npm install jwt-decode
import { Usuario, LoginRequest, RegisterRequest } from '../types/models';
import authService from '../services/authService';
import api from '../services/api';

interface AuthContextData {
  usuario: Usuario | null;
  token: string | null;
  loading: boolean;
  signIn: (credentials: LoginRequest) => Promise<void>;
  signUp: (userData: RegisterRequest) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStorageData();
  }, []);

  async function loadStorageData(): Promise<void> {
    try {
      const storedToken = await AsyncStorage.getItem('@work360:token');      

      if (storedToken) {
        console.log('[AuthContext] Dados da sessão encontrados no storage. Carregando...');
        // Decodifica o token para obter o ID do usuário (sub = subject)
        const decodedToken: { sub: string } = jwtDecode(storedToken);
        const userId = parseInt(decodedToken.sub, 10);

        // Configura o token na instância da API para requisições futuras
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;

        // Busca os dados do usuário e atualiza o estado
        const user = await authService.getUserData(userId);
        setUsuario(user);
        setToken(storedToken);
      } else {
        console.log('[AuthContext] Nenhum dado de sessão encontrado.');
        setLoading(false); // Garante que o loading termine se não houver token
      }
    } catch (error) {
      console.error('Falha ao carregar dados da sessão:', error);
      // Se houver erro (ex: JSON inválido ou token expirado), limpa o storage
      await signOut();
    } finally {
      // Garante que o estado de carregamento seja desativado em todos os cenários,
      // seja sucesso, falha ou ausência de token.
      setLoading(false);
    }
  }

  /**
   * Função interna para configurar o estado de autenticação.
   * @param user Objeto do usuário.
   * @param new_token Token JWT.
   */
  async function setupSession(user: Usuario, new_token: string): Promise<void> {
    console.log(`[AuthContext] Configurando sessão para o usuário: ${user.email}`);
    setUsuario(user);
    setToken(new_token);

    // Configura o token na instância da API para requisições futuras
    api.defaults.headers.common['Authorization'] = `Bearer ${new_token}`;

    // Salva apenas o token no AsyncStorage
    await AsyncStorage.setItem('@work360:token', new_token);
    console.log('[AuthContext] Sessão salva no AsyncStorage.');
  }

  async function signIn(credentials: LoginRequest): Promise<void> {
    console.log('[AuthContext] Iniciando processo de signIn...');
    setLoading(true);
    try {
      const response = await authService.login(credentials);
      const { token: newToken } = response;
      console.log('[AuthContext] Login API bem-sucedido, token recebido.');

      // [PONTO CHAVE] Configura o token na instância da API ANTES de fazer a próxima chamada.
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      // Decodifica o token para obter o ID do usuário (sub = subject)
      const decodedToken: { sub: string } = jwtDecode(newToken);
      const userId = parseInt(decodedToken.sub, 10);
      console.log(`[AuthContext] Token decodificado. ID do usuário: ${userId}`);

      const user = await authService.getUserData(userId);
      await setupSession(user, newToken);
    } catch (error) {
      console.error('[AuthContext] Erro durante o signIn:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function signUp(userData: RegisterRequest): Promise<void> {
    console.log('[AuthContext] Iniciando processo de signUp...');
    setLoading(true);
    try {
      // Captura o usuário retornado pela API de registro
      const newUser = await authService.register(userData);
      console.log('[AuthContext] Registro bem-sucedido. Fazendo login automático...');
      const { token: newToken } = await authService.login({ email: userData.email, senha: userData.senha });
      await setupSession(newUser, newToken);
    } catch (error) {
      console.error('[AuthContext] Erro durante o signUp:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function signOut(): Promise<void> {
    setLoading(true);
    try {
      await AsyncStorage.removeItem('@work360:token');
      setUsuario(null);
      setToken(null);
      delete api.defaults.headers.common['Authorization'];
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      // Mesmo com erro, tentamos limpar o estado local
      setUsuario(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }
  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
