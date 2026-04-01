/**
 * GUIA DE INTEGRAÇÃO - NoteCare Frontend + Backend
 * ================================================
 * 
 * Este arquivo contém instruções de como conectar o frontend (NoteCare)
 * com o backend API que foi implementado.
 */

// ============================================
// 1. CONFIGURAR A URL BASE DA API
// ============================================

// Criar arquivo: src/config/api.js
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  // Auth
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  VERIFY_OTP: '/auth/verify-otp',
  SEND_OTP: '/auth/send-otp',

  // Pacientes
  GET_PATIENTS: '/api/patients',
  GET_PATIENT: (id) => `/api/patients/${id}`,
  CREATE_PATIENT: '/api/patients',
  UPDATE_PATIENT: (id) => `/api/patients/${id}`,
  DELETE_PATIENT: (id) => `/api/patients/${id}`,

  // Atividades
  GET_ACTIVITIES: (patientId) => `/api/patients/${patientId}/activities`,
  CREATE_ACTIVITY: (patientId) => `/api/patients/${patientId}/activities`,
  UPDATE_ACTIVITY: (patientId, activityId) => `/api/patients/${patientId}/activities/${activityId}`,
  DELETE_ACTIVITY: (patientId, activityId) => `/api/patients/${patientId}/activities/${activityId}`,

  // Perfil
  GET_PROFILE: '/api/me'
};

// ============================================
// 2. CRIAR SERVIÇO DE API
// ============================================

// Criar arquivo: src/services/apiService.js
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

export const apiService = {
  // Função genérica para fazer requisições
  async request(endpoint, method = 'GET', data = null, token = null) {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
      method,
      headers
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

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

  // ============================================
  // AUTENTICAÇÃO
  // ============================================

  async register(name, email, password, registration) {
    return this.request(API_ENDPOINTS.REGISTER, 'POST', {
      name,
      email,
      password,
      registration
    });
  },

  async login(email, password) {
    return this.request(API_ENDPOINTS.LOGIN, 'POST', {
      email,
      password
    });
  },

  async verifyOTP(userId, otpCode) {
    return this.request(API_ENDPOINTS.VERIFY_OTP, 'POST', {
      userId,
      otpCode
    });
  },

  async sendOTP(userId) {
    return this.request(API_ENDPOINTS.SEND_OTP, 'POST', {
      userId
    });
  },

  // ============================================
  // PACIENTES
  // ============================================

  async getPatients(token) {
    return this.request(API_ENDPOINTS.GET_PATIENTS, 'GET', null, token);
  },

  async getPatient(id, token) {
    return this.request(API_ENDPOINTS.GET_PATIENT(id), 'GET', null, token);
  },

  async createPatient(patientData, token) {
    return this.request(API_ENDPOINTS.CREATE_PATIENT, 'POST', patientData, token);
  },

  async updatePatient(id, patientData, token) {
    return this.request(API_ENDPOINTS.UPDATE_PATIENT(id), 'PUT', patientData, token);
  },

  async deletePatient(id, token) {
    return this.request(API_ENDPOINTS.DELETE_PATIENT(id), 'DELETE', null, token);
  },

  // ============================================
  // ATIVIDADES
  // ============================================

  async getActivities(patientId, token) {
    return this.request(API_ENDPOINTS.GET_ACTIVITIES(patientId), 'GET', null, token);
  },

  async createActivity(patientId, activityData, token) {
    return this.request(API_ENDPOINTS.CREATE_ACTIVITY(patientId), 'POST', activityData, token);
  },

  async updateActivity(patientId, activityId, activityData, token) {
    return this.request(API_ENDPOINTS.UPDATE_ACTIVITY(patientId, activityId), 'PUT', activityData, token);
  },

  async deleteActivity(patientId, activityId, token) {
    return this.request(API_ENDPOINTS.DELETE_ACTIVITY(patientId, activityId), 'DELETE', null, token);
  },

  // ============================================
  // PERFIL
  // ============================================

  async getProfile(token) {
    return this.request(API_ENDPOINTS.GET_PROFILE, 'GET', null, token);
  }
};

// ============================================
// 3. ATUALIZAR AuthContext.js
// ============================================

/*
Substituir as funções mock pelo código real:

import { apiService } from '../services/apiService';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null); // Para 2FA
  const [mfaPending, setMfaPending] = useState(false);

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
      const response = await apiService.login(email, password);
      
      if (response.success) {
        setUserId(response.userId);
        setMfaPending(true);
        return { success: true, requiresMFA: true };
      }
      
      return { success: false, error: response.error };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const verifyOTP = async (code) => {
    try {
      if (!userId) {
        return { success: false, error: 'Usuário não identificado' };
      }

      const response = await apiService.verifyOTP(userId, code);
      
      if (response.success) {
        const userData = response.user;
        const token = response.token;

        setUser(userData);
        setIsAuthenticated(true);
        setMfaPending(false);

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
    localStorage.removeItem('imhomecare_user');
    localStorage.removeItem('imhomecare_token');
  };

  const getToken = () => {
    return localStorage.getItem('imhomecare_token');
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    mfaPending,
    login,
    verifyOTP,
    logout,
    getToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
*/

// ============================================
// 4. ATUALIZAR DataContext.js
// ============================================

/*
Substituir as funções mock pelo código real:

import { apiService } from '../services/apiService';
import { useAuth } from './AuthContext';

export const DataProvider = ({ children }) => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();

  useEffect(() => {
    loadPatients();
  }, []);

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
        return response.patientId;
      }
      return null;
    } catch (error) {
      console.error('Erro ao criar paciente:', error);
      throw error;
    }
  };

  const updatePatient = async (patientId, updatedData) => {
    try {
      const token = getToken();
      const response = await apiService.updatePatient(patientId, updatedData, token);
      
      if (response.success) {
        await loadPatients();
      }
      return response.success;
    } catch (error) {
      console.error('Erro ao atualizar paciente:', error);
      throw error;
    }
  };

  const deletePatient = async (patientId) => {
    try {
      const token = getToken();
      const response = await apiService.deletePatient(patientId, token);
      
      if (response.success) {
        await loadPatients();
      }
      return response.success;
    } catch (error) {
      console.error('Erro ao deletar paciente:', error);
      throw error;
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
      const response = await apiService.createActivity(patientId, activityData, token);
      
      if (response.success) {
        // Recarregar dados do paciente
        return response.activityId;
      }
      return null;
    } catch (error) {
      console.error('Erro ao criar atividade:', error);
      throw error;
    }
  };

  const updateActivity = async (patientId, activityId, updatedData) => {
    try {
      const token = getToken();
      const response = await apiService.updateActivity(patientId, activityId, updatedData, token);
      return response.success;
    } catch (error) {
      console.error('Erro ao atualizar atividade:', error);
      throw error;
    }
  };

  const deleteActivity = async (patientId, activityId) => {
    try {
      const token = getToken();
      const response = await apiService.deleteActivity(patientId, activityId, token);
      return response.success;
    } catch (error) {
      console.error('Erro ao deletar atividade:', error);
      throw error;
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
    deleteActivity
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
*/

// ============================================
// 5. ARCHIVO .env DO FRONTEND
// ============================================

/*
Criar arquivo: NoteCare/.env

# API Backend
REACT_APP_API_URL=http://localhost:5000

# Desabilitar warnings no console
REACT_APP_LOG_LEVEL=error
*/

// ============================================
// 6. TESTAR A INTEGRAÇÃO
// ============================================

/*
Checklist de Testes:

1. ✓ Backend rodando: npm run dev (porta 5000)
2. ✓ Frontend rodando: npm start (porta 3000)
3. ✓ CORS configurado no backend
4. ✓ Arquivo .env do frontend com REACT_APP_API_URL
5. ✓ Registrar novo usuário
6. ✓ Fazer login e receber OTP
7. ✓ Verificar OTP e receber token
8. ✓ Criar novo paciente
9. ✓ Listar pacientes
10. ✓ Adicionar atividade
11. ✓ Atualizar dados do paciente
12. ✓ Deletar atividade
13. ✓ Deletar paciente
14. ✓ Fazer logout
*/

// ============================================
// 7. TRATAMENTO DE ERROS COMUNS
// ============================================

/*
ERRO: "No 'Access-Control-Allow-Origin' header"
SOLUÇÃO: 
  - Verifique FRONTEND_URL no .env do backend
  - Backend deve estar rodando em http://localhost:5000
  - Frontend deve estar em http://localhost:3000

ERRO: "Network error at runtime"
SOLUÇÃO:
  - Backend não está rodando
  - Executar: npm run dev na pasta do backend

ERRO: "401 Unauthorized"
SOLUÇÃO:
  - Token expirou (válido 24h)
  - Token não foi armazenado corretamente
  - Fazer login novamente

ERRO: "Código OTP inválido"
SOLUÇÃO:
  - Verificar o código recebido no email
  - Código expira em 10 minutos
  - Usar /auth/send-otp para reenviar

ERRO: "Email já cadastrado"
SOLUÇÃO:
  - Email já existe no banco de dados
  - Use outro email ou delete o usuário do banco
*/

// ============================================
// 8. ESTRUTURA DE PASTAS RECOMENDADA
// ============================================

/*
NoteCare/
├── src/
│   ├── componentes/
│   ├── contextos/
│   │   ├── AuthContext.js (MODIFICADO)
│   │   └── DataContext.js (MODIFICADO)
│   ├── dados/
│   ├── estilos/
│   ├── paginas/
│   ├── rotas/
│   ├── services/
│   │   └── apiService.js (NOVO)
│   ├── config/
│   │   └── api.js (NOVO)
│   ├── App.js
│   └── index.js
├── public/
├── .env (NOVO)
├── .env.example (NOVO)
├── package.json
└── README.md

Backend Cuidadores de Idosos/
├── database.js (IMPLEMENTADO)
├── server.js (IMPLEMENTADO)
├── package.json (ATUALIZADO)
├── .env (NOVO - Nunca commitar)
├── .env.example (NOVO)
├── .gitignore (ATUALIZADO)
├── notcare.db (SQLite - criado automaticamente)
├── tests/
│   └── test-api.js (IMPLEMENTADO)
└── README_API.md (NOVO)
*/

// ============================================
// 9. EXEMPLO COMPLETO DE USO
// ============================================

/*
// 1. Registrar novo usuário
const registerResponse = await apiService.register(
  'Ana Clara Souza',
  'ana@example.com',
  'senha_forte',
  'CRE: 12345/SP'
);
// Response: { success: true, userId: 1 }

// 2. Fazer login
const loginResponse = await apiService.login(
  'ana@example.com',
  'senha_forte'
);
// Response: { success: true, userId: 1, requiresMFA: true, message: "..." }

// 3. Verificar OTP (código recebido por email)
const otpResponse = await apiService.verifyOTP(1, '123456');
// Response: { success: true, token: "jwt_token", user: {...} }

// 4. Armazenar token
localStorage.setItem('imhomecare_token', otpResponse.token);

// 5. Criar paciente
const patientResponse = await apiService.createPatient(
  {
    name: 'Maria da Silva',
    age: 78,
    diagnosis: 'Alzheimer'
  },
  otpResponse.token
);
// Response: { success: true, patientId: 1 }

// 6. Adicionar atividade
const activityResponse = await apiService.createActivity(
  1,
  {
    type: 'med',
    desc: 'Donepezil 5mg com água'
  },
  otpResponse.token
);
// Response: { success: true, activityId: 101 }
*/

export class IntegrationGuide {
  constructor() {
    this.title = 'NoteCare - Guia de Integração Frontend + Backend';
    this.version = '1.0.0';
    this.status = 'Pronto para usar';
    this.lastUpdated = '2024-03-31';
  }

  printGuide() {
    console.log(`
    ╔════════════════════════════════════════════════════════════╗
    ║  ${this.title}        ║
    ║  Status: ${this.status}                              ║
    ║  Versão: ${this.version}                                    ║
    ╚════════════════════════════════════════════════════════════╝

    📚 PRÓXIMOS PASSOS:

    1. Instalação
       ├─ npm install (adiciona dependências)
       ├─ Criar .env com REACT_APP_API_URL
       └─ npm start (rodar frontend)

    2. Backend
       ├─ npm run dev (porta 5000)
       └─ Verificar: http://localhost:5000/health

    3. Testar Fluxo
       ├─ Registrar usuário
       ├─ Fazer login
       ├─ Verificar OTP
       ├─ Criar paciente
       └─ Adicionar atividade

    4. Troubleshooting
       └─ Ver seção "TRATAMENTO DE ERROS COMUNS"

    📖 Documentação: Leia README_API.md para detalhes dos endpoints
    🧪 Testes: npm test no backend
    🚀 Deploy: Seguir instruções em README_API.md
    `);
  }
}

export default IntegrationGuide;
