/**
 * SETUP RÁPIDO - NoteCare Frontend + Backend
 * ============================================
 * 
 * Siga estes passos para conectar frontend com backend em 5 minutos
 */

// ============================================
// PASSO 1: Criar serviço de API
// ============================================

/*
Criar arquivo: NoteCare/src/services/apiService.js

Cole o seguinte código:
*/

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const apiService = {
  async request(endpoint, method = 'GET', data = null, token = null) {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = { method, headers };
    if (data) options.body = JSON.stringify(data);

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro na requisição');
      }

      return result;
    } catch (error) {
      throw error;
    }
  },

  async register(name, email, password, registration) {
    return this.request('/auth/register', 'POST', { name, email, password, registration });
  },

  async login(email, password) {
    return this.request('/auth/login', 'POST', { email, password });
  },

  async verifyOTP(userId, otpCode) {
    return this.request('/auth/verify-otp', 'POST', { userId, otpCode });
  },

  async getPatients(token) {
    return this.request('/api/patients', 'GET', null, token);
  },

  async getPatient(id, token) {
    return this.request(`/api/patients/${id}`, 'GET', null, token);
  },

  async createPatient(patientData, token) {
    return this.request('/api/patients', 'POST', patientData, token);
  },

  async updatePatient(id, data, token) {
    return this.request(`/api/patients/${id}`, 'PUT', data, token);
  },

  async deletePatient(id, token) {
    return this.request(`/api/patients/${id}`, 'DELETE', null, token);
  },

  async createActivity(patientId, data, token) {
    return this.request(`/api/patients/${patientId}/activities`, 'POST', data, token);
  },

  async updateActivity(patientId, activityId, data, token) {
    return this.request(`/api/patients/${patientId}/activities/${activityId}`, 'PUT', data, token);
  },

  async deleteActivity(patientId, activityId, token) {
    return this.request(`/api/patients/${patientId}/activities/${activityId}`, 'DELETE', null, token);
  }
};

// ============================================
// PASSO 2: Atualizar AuthContext.js
// ============================================

/*
Abra: NoteCare/src/contextos/AuthContext.js

Substitua TODO o código por:
*/

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
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

// ============================================
// PASSO 3: Atualizar DataContext.js
// ============================================

/*
Abra: NoteCare/src/contextos/DataContext.js

Substitua TODO o código por:
*/

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { apiService } from '../services/apiService';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData deve ser usado dentro de DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getToken, isAuthenticated } = useAuth();

  // Carregar pacientes quando autenticado
  useEffect(() => {
    if (isAuthenticated && getToken()) {
      loadPatients();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadPatients = async () => {
    try {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await apiService.getPatients(token);
      if (response.success) {
        setPatients(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPatient = async (patientData) => {
    try {
      const token = getToken();
      const response = await apiService.createPatient(patientData, token);

      if (response.success) {
        await loadPatients();
        return { success: true, patientId: response.patientId };
      }

      return { success: false, error: response.error };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updatePatient = async (patientId, updatedData) => {
    try {
      const token = getToken();
      const response = await apiService.updatePatient(patientId, updatedData, token);

      if (response.success) {
        await loadPatients();
        return { success: true };
      }

      return { success: false, error: response.error };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const deletePatient = async (patientId) => {
    try {
      const token = getToken();
      const response = await apiService.deletePatient(patientId, token);

      if (response.success) {
        await loadPatients();
        return { success: true };
      }

      return { success: false, error: response.error };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const getPatientById = async (patientId) => {
    try {
      const token = getToken();
      const response = await apiService.getPatient(patientId, token);

      if (response.success) {
        return response.data;
      }

      return null;
    } catch (error) {
      console.error('Erro ao buscar paciente:', error);
      return null;
    }
  };

  // ============================================
  // ATIVIDADES
  // ============================================

  const addActivity = async (patientId, activityData) => {
    try {
      const token = getToken();
      const formattedData = {
        type: activityData.type,
        desc: activityData.desc || activityData.description,
        date: activityData.date || new Date().toISOString()
      };

      const response = await apiService.createActivity(patientId, formattedData, token);

      if (response.success) {
        return { success: true, activityId: response.activityId };
      }

      return { success: false, error: response.error };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updateActivity = async (patientId, activityId, updatedData) => {
    try {
      const token = getToken();
      const formattedData = {
        type: updatedData.type,
        desc: updatedData.desc || updatedData.description,
        date: updatedData.date
      };

      const response = await apiService.updateActivity(patientId, activityId, formattedData, token);

      if (response.success) {
        return { success: true };
      }

      return { success: false, error: response.error };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const deleteActivity = async (patientId, activityId) => {
    try {
      const token = getToken();
      const response = await apiService.deleteActivity(patientId, activityId, token);

      if (response.success) {
        return { success: true };
      }

      return { success: false, error: response.error };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    patients,
    loading,
    addPatient,
    updatePatient,
    deletePatient,
    getPatientById,
    addActivity,
    updateActivity,
    deleteActivity,
    refreshPatients: loadPatients
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

// ============================================
// PASSO 4: Criar arquivo .env
// ============================================

/*
Na raiz da pasta NoteCare, crie arquivo: .env

Cole:
*/

# API Backend
REACT_APP_API_URL=http://localhost:5000

// ============================================
// PASSO 5: Instalar dependências (se necessário)
// ============================================

/*
Na pasta NoteCare, execute:
npm install

(Se já tem todas as dependências, pula este passo)
*/

// ============================================
// PASSO 6: Iniciar Frontend
// ============================================

/*
Em um terminal na pasta NoteCare, execute:
npm start

Frontend abrirá em: http://localhost:3000
*/

// ============================================
// VERIFICAÇÃO FINAL
// ============================================

/*
Checklist:

✓ Backend rodando em http://localhost:5000
  - npm run dev na pasta Backend Cuidadores de Idosos

✓ Frontend rodando em http://localhost:3000
  - npm start na pasta NoteCare

✓ Arquivo apiService.js criado
  - src/services/apiService.js

✓ AuthContext.js atualizado
  - Integrando com API

✓ DataContext.js atualizado
  - Integrando com API

✓ Arquivo .env criado
  - REACT_APP_API_URL=http://localhost:5000

✓ Testar fluxo:
  1. Registrar novo usuário
  2. Fazer login
  3. Verificar OTP no email
  4. Criar paciente
  5. Adicionar atividade
  6. Deletar atividade
*/

// ============================================
// TESTES COM POSTMAN (Opcional)
// ============================================

/*
1. Abra Postman
2. Teste cada endpoint:

POST http://localhost:5000/auth/register
Body (JSON):
{
  "name": "Teste Enfermeiro",
  "email": "teste@notcare.com",
  "password": "senha123",
  "registration": "CRE: 12345/SP"
}

GET http://localhost:5000/health
Response: { status: "healthy", ... }

POST http://localhost:5000/auth/login
Body:
{
  "email": "teste@notcare.com",
  "password": "senha123"
}

POST http://localhost:5000/auth/verify-otp
Body:
{
  "userId": 1,
  "otpCode": "123456" // código recebido no email
}

GET http://localhost:5000/api/patients
Header: Authorization: Bearer {token_recebido}
*/

export const QUICK_SETUP_COMPLETE = true;

console.log(`
╔════════════════════════════════════════════════════════════╗
║  ✅ SETUP FRONTFEND COMPLETO!                             ║
║                                                            ║
║  Próximos passos:                                          ║
║  1. npm install (na pasta NoteCare)                       ║
║  2. npm start (na pasta NoteCare)                         ║
║  3. Testar login + 2FA                                    ║
║  4. Testar criar/editar pacientes                         ║
║                                                            ║
║  💾 Adicione arquivo .env ao .gitignore                   ║
║  🔐 Nunca compartilhe seu token JWT                       ║
║  📧 Verificar email para servidor de OTP                  ║
╚════════════════════════════════════════════════════════════╝
`);
