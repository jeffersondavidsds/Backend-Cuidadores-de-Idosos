import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contextos/AuthContext';
import Toast from '../compartilhados/Toast';
import './MainLayout.css';

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleNotification = () => {
    displayToast('📋 3 atividades pendentes hoje');
  };

  const displayToast = (message) => {
    setToastMessage(message);
    setShowToast(true);
  };

  return (
    <div className="main-layout">
      {/* Top Bar */}
      <div className="top-bar">
        <div className="top-bar-logo">
          🏡 I'm Home Care
        </div>
        <div className="top-bar-right">
          <button className="notif-btn" onClick={handleNotification}>
            🔔
            <span className="notif-dot"></span>
          </button>
          <div className="avatar-btn" onClick={() => navigate('/perfil')}>
            {user?.avatar || '👩‍⚕️'}
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="app-content">
        <Outlet />
      </div>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <button
          className={`nav-item ${isActive('/') ? 'active' : ''}`}
          onClick={() => navigate('/')}
        >
          <span className="nav-icon">🏠</span>
          <span className="nav-label">Início</span>
        </button>

        <button
          className={`nav-item ${isActive('/pacientes') ? 'active' : ''}`}
          onClick={() => navigate('/pacientes')}
        >
          <span className="nav-icon">👴</span>
          <span className="nav-label">Pacientes</span>
        </button>

        <button
          className={`nav-item ${isActive('/atividades') ? 'active' : ''}`}
          onClick={() => navigate('/atividades')}
        >
          <span className="nav-icon">📋</span>
          <span className="nav-label">Atividades</span>
        </button>

        <button
          className={`nav-item ${isActive('/perfil') ? 'active' : ''}`}
          onClick={() => navigate('/perfil')}
        >
          <span className="nav-icon">👤</span>
          <span className="nav-label">Perfil</span>
        </button>
      </nav>

      {/* Toast */}
      {showToast && (
        <Toast
          message={toastMessage}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default MainLayout;
