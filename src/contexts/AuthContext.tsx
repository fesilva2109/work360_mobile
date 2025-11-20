import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Usuario, LoginRequest } from '../types/models';
import authService from '../services/authService';
import api from '../services/api';

interface AuthContextData {
  usuario: Usuario | null;
  token: string | null;
  isLoading: boolean; // Renomeado de 'loading' para consistência
  signIn(credentials: LoginRequest): Promise<void>;
  signUp(credentials: any): Promise<void>; // Adicionada a função signUp
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
          
          // Configura o cabeçalho da API para todas as futuras requisições
          api.defaults.headers.Authorization = `Bearer ${storedToken}`;

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
    const response = await authService.login(credentials);

    const { usuario: user, token: authToken } = response;

    // Configura o cabeçalho da API
    api.defaults.headers.Authorization = `Bearer ${authToken}`;

    setUsuario(user);
    setToken(authToken);

    // Salva os dados no AsyncStorage
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    await AsyncStorage.setItem(TOKEN_STORAGE_KEY, authToken);
    console.log(`[AuthContext] Sessão salva para o usuário: ${user.email}`);
  };

  const signUp = async (credentials: any) => {
    console.log('[AuthContext] Iniciando processo de signUp...');
    // Supondo que seu authService tenha um método register
    // e que ele retorne o mesmo formato do login.
    const response = await authService.register(credentials);

    const { usuario: user, token: authToken } = response;

    api.defaults.headers.Authorization = `Bearer ${authToken}`;

    setUsuario(user);
    setToken(authToken);

    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    await AsyncStorage.setItem(TOKEN_STORAGE_KEY, authToken);
    console.log(`[AuthContext] Nova conta criada e sessão salva para: ${user.email}`);
  };

  const signOut = async () => {
    console.log('[AuthContext] Realizando logout...');
    setUsuario(null);
    setToken(null);

    // Limpa o cabeçalho da API primeiro
    delete api.defaults.headers.common.Authorization;

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