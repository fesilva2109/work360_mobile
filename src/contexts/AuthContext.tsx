import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Usuario, LoginRequest } from '../types/models';
import authService from '../services/authService';
import api from '../services/api';

interface AuthContextData {
  usuario: Usuario | null;
  token: string | null;
  isLoading: boolean; 
  signIn(credentials: LoginRequest): Promise<void>;
  signUp(credentials: any): Promise<void>;
  signOut(): void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

const USER_STORAGE_KEY = '@Work360:usuario';
const TOKEN_STORAGE_KEY = '@Work360:token';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      console.log('[AuthContext] Verificando sessão no storage...');
      try {
        const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
        const storedToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);

        if (storedUser && storedToken) {
          console.log('[AuthContext] Sessão encontrada. Carregando...');
          const userObject = JSON.parse(storedUser);

          setUsuario(userObject);
          setToken(storedToken);
          console.log(`[AuthContext] Sessão restaurada para o usuário: ${userObject.email}`);
        } else {
          console.log('[AuthContext] Nenhuma sessão encontrada.');
        }
      } catch (error) {
        console.error('[AuthContext] Erro ao carregar sessão do storage:', error);
      } finally {
        setIsLoading(false);
        console.log('[AuthContext] Verificação de sessão finalizada.');
      }
    }

    loadSession();
  }, []);

  const signIn = async (credentials: LoginRequest) => {
    console.log('[AuthContext] Iniciando processo de signIn...');
    try {
      const response = await authService.login(credentials);
      const { usuario: user, token: authToken } = response;

      setUsuario(user);
      setToken(authToken);

      // Salva os dados no AsyncStorage
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      await AsyncStorage.setItem(TOKEN_STORAGE_KEY, authToken);
      console.log(`[AuthContext] Sessão salva para o usuário: ${user.email}`);
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw error; 
      }
      // Para outros erros, lança a mensagem vinda do backend.
      if (error.response?.data?.erro) {
        throw new Error(error.response.data.erro);
      }
      // Erro genérico.
      throw new Error('Não foi possível conectar ao servidor.');
    }
  };

  const signUp = async (credentials: any) => {
    console.log('[AuthContext] Iniciando processo de signUp...');
    try {
      const response = await authService.register(credentials);

      const { usuario: user, token: authToken } = response;

      setUsuario(user);
      setToken(authToken);

      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      await AsyncStorage.setItem(TOKEN_STORAGE_KEY, authToken);
      console.log(`[AuthContext] Nova conta criada e sessão salva para: ${user.email}`);
    } catch (error: any) {
      // Lança uma mensagem de erro para a tela de registro
      const errorMessage = error.response?.data?.message || 'Não foi possível criar a conta.';
      throw new Error(errorMessage);
    }
  };

  const signOut = async () => {
    console.log('[AuthContext] Realizando logout...');
    setUsuario(null);
    setToken(null);

    // Remove os dados do AsyncStorage
    await AsyncStorage.removeItem(USER_STORAGE_KEY);
    await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
    console.log('[AuthContext] Sessão removida.');
  };

  return (
    <AuthContext.Provider value={{ usuario, token, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}