import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Usuario, LoginCredentials } from '../types';
import apiService from '../services/api';

interface AuthContextType {
  usuario: Usuario | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const user = await apiService.getCurrentUser();
        setUsuario(user);
      } catch {
        apiService.clearToken();
      }
    }
    setIsLoading(false);
  };

  const login = async (credentials: LoginCredentials) => {
    setError(null);
    setIsLoading(true);
    try {
      const { token, usuario: user } = await apiService.login(credentials);
      apiService.setToken(token);
      setUsuario(user);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Error al iniciar sesión';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    apiService.clearToken();
    setUsuario(null);
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        isLoading,
        isAuthenticated: !!usuario,
        login,
        logout,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
