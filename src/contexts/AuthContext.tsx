import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
      // Carrega tanto o token quanto o usuário do storage
      const storedToken = await AsyncStorage.getItem('@work360:token');
      const storedUser = await AsyncStorage.getItem('@work360:user');

      if (storedToken && storedUser) {
        console.log('[AuthContext] Dados da sessão encontrados no storage. Carregando...');
        const user: Usuario = JSON.parse(storedUser);

        // Configura o token na instância da API para requisições futuras
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;

        // Atualiza o estado com os dados do storage, sem chamada de rede
        setUsuario(user);
        setToken(storedToken);
      } else {
        console.log('[AuthContext] Nenhum dado de sessão encontrado.');
      }
    } catch (error) {
      console.error('Falha ao carregar dados da sessão:', error);
      // Se houver erro (ex: JSON inválido ou token expirado), limpar o storage
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

    // Salva o token e o objeto do usuário no AsyncStorage
    await AsyncStorage.multiSet([
      ['@work360:token', new_token],
      ['@work360:user', JSON.stringify(user)],
    ]);
    console.log('[AuthContext] Sessão salva no AsyncStorage.');
  }

  async function signIn(credentials: LoginRequest): Promise<void> {
    console.log('[AuthContext] Iniciando processo de signIn...');
    setLoading(true);
    try {
      // Otimização: A resposta do login agora inclui o token E o objeto do usuário.
      const { token: newToken, usuario: user } = await authService.login(credentials);
      console.log('[AuthContext] Login API bem-sucedido, token recebido.');
      if (!user || !newToken) {
        throw new Error('Resposta de login inválida do servidor.');
      }
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
      // 1. Registra o usuário. A API de registro já retorna o objeto do novo usuário.
      await authService.register(userData);
      console.log('[AuthContext] Registro bem-sucedido. Fazendo login automático...');
      // 2. Faz o login para obter o token e os dados do usuário recém-criado.
      const { token: newToken, usuario: newUser } = await authService.login({ email: userData.email, senha: userData.senha });
      // 3. Usa o usuário e o token do login para configurar a sessão.
      await setupSession(newUser!, newToken);
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
      await AsyncStorage.multiRemove(['@work360:token', '@work360:user']);
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
