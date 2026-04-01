import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contextos/AuthContext';

// Páginas
import Login from '../paginas/Login';
import Dashboard from '../paginas/Dashboard';
import Pacientes from '../paginas/Pacientes';
import Atividades from '../paginas/Atividades';
import Perfil from '../paginas/Perfil';
import DetalhesPaciente from '../paginas/DetalhesPaciente';

// Layout principal
import MainLayout from '../componentes/layout/MainLayout';

// Componente de rota protegida
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'var(--cream)'
      }}>
        <div style={{ fontSize: '48px' }}>⏳</div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Componente de rota pública (redireciona se já autenticado)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'var(--cream)'
      }}>
        <div style={{ fontSize: '48px' }}>⏳</div>
      </div>
    );
  }

  return !isAuthenticated ? children : <Navigate to="/" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rota de Login */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* Rotas Protegidas */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="pacientes" element={<Pacientes />} />
        <Route path="pacientes/:id" element={<DetalhesPaciente />} />
        <Route path="atividades" element={<Atividades />} />
        <Route path="perfil" element={<Perfil />} />
      </Route>

      {/* Rota 404 - Redireciona para home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
