import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    console.warn('useAuth deve ser usado dentro de AuthProvider');
    return {
      user: null,
      isAuthenticated: false,
      loading: true,
      mfaPending: false,
      login: async () => ({ success: false, error: 'AuthProvider não encontrado' }),
      verifyOTP: async () => ({ success: false, error: 'AuthProvider não encontrado' }),
      logout: () => {},
      getToken: () => null,
      updateUser: () => {}
    };
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [mfaPending, setMfaPending] = useState(false);
  const [loginError, setLoginError] = useState(null);

  // Verificar se há sessão salva
  useEffect(() => {
    const savedUser = localStorage.getItem('imhomecare_user');
    const savedToken = localStorage.getItem('imhomecare_token');

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setLoginError(null);
      const response = await apiService.login(email, password);

      if (response.success) {
        if (response.token && response.user) {
          // Fluxo DEV_BYPASS_MFA: login direto
          setUser(response.user);
          setIsAuthenticated(true);
          setMfaPending(false);
          localStorage.setItem('imhomecare_user', JSON.stringify(response.user));
          localStorage.setItem('imhomecare_token', response.token);
          return { success: true, token: response.token };
        }

        setUserId(response.userId);
        setMfaPending(true);
        return { success: true, requiresMFA: true };
      }

      setLoginError(response.error);
      return { success: false, error: response.error };
    } catch (error) {
      const errorMsg = error.message || 'Erro ao fazer login';
      setLoginError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const verifyOTP = async (code) => {
    try {
      if (!userId) {
        throw new Error('Usuário não identificado');
      }

      const response = await apiService.verifyOTP(userId, code);

      if (response.success) {
        const userData = response.user;
        const token = response.token;

        setUser(userData);
        setIsAuthenticated(true);
        setMfaPending(false);
        setUserId(null);

        localStorage.setItem('imhomecare_user', JSON.stringify(userData));
        localStorage.setItem('imhomecare_token', token);

        return { success: true };
      }

      return { success: false, error: response.error };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setUserId(null);
    setMfaPending(false);
    setLoginError(null);
    localStorage.removeItem('imhomecare_user');
    localStorage.removeItem('imhomecare_token');
  };

  const getToken = () => {
    return localStorage.getItem('imhomecare_token');
  };

  const updateUser = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem('imhomecare_user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    mfaPending,
    login,
    verifyOTP,
    logout,
    getToken,
    updateUser,
    userId,
    loginError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};