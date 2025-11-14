import React, { createContext, useState, useContext, useEffect } from 'react';
import { Usuario, LoginRequest, RegisterRequest } from '../types/models';
import authService from '../services/authService';

interface AuthContextData {
  usuario: Usuario | null;
  loading: boolean;
  signIn: (credentials: LoginRequest) => Promise<void>;
  signUp: (userData: RegisterRequest) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStorageData();
  }, []);

  async function loadStorageData() {
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        setUsuario(user);
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    } finally {
      setLoading(false);
    }
  }

  async function signIn(credentials: LoginRequest) {
    setLoading(true);
    try {
      const response = await authService.login(credentials);
      setUsuario(response.usuario);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function signUp(userData: RegisterRequest) {
    setLoading(true);
    try {
      const response = await authService.register(userData);
      setUsuario(response.usuario);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    setLoading(true);
    try {
      await authService.logout();
      setUsuario(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,
        loading,
        signIn,
        signUp,
        signOut,
        isAuthenticated: !!usuario,
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
