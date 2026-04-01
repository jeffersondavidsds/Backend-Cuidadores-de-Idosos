import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contextos/AuthContext';
import ModalMFA from '../componentes/autenticacao/ModalMFA';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  console.log('Login useAuth:', auth);
  const login = auth?.login ? auth.login : async () => ({ success: false, error: 'Unable to access login function' });
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showMFA, setShowMFA] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ level: 0, text: '' });

  const calculatePasswordStrength = (pass) => {
    if (!pass) {
      return { level: 0, text: '' };
    }

    let strength = 0;
    if (pass.length >= 8) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^A-Za-z0-9]/.test(pass)) strength++;

    const labels = ['Fraca', 'Regular', 'Boa', 'Forte'];
    const colors = ['#E87A7A', '#E8C450', '#7CC47C', '#5E7A5E'];

    return {
      level: strength,
      text: strength ? `Senha: ${labels[strength - 1]}` : '',
      color: colors[strength - 1] || '#E8E0D6',
      width: strength * 25
    };
  };

  const handlePasswordChange = (e) => {
    const pass = e.target.value;
    setPassword(pass);
    setPasswordStrength(calculatePasswordStrength(pass));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('⚠️ Preencha e-mail e senha.');
      return;
    }

    const result = await login(email, password);
    
    if (result.success) {
      setShowMFA(true);
    } else {
      setError(result.error || 'Erro ao fazer login');
    }
  };

  const handleMFASuccess = () => {
    setShowMFA(false);
    navigate('/');
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    alert('📧 Link de recuperação enviado para seu e-mail');
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="logo-area">
          <div className="logo-icon">🏡</div>
          <div className="logo-title">I'm Home Care</div>
          <div className="logo-subtitle">Cuidado com carinho, todos os dias</div>
        </div>

        {error && (
          <div className="error-msg">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Nome</label>
            <div className="input-wrap">
              <input
                type="text"
                placeholder="Seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
              <span className="input-icon">👤</span>
            </div>
          </div>

          <div className="form-group">
            <label>E-mail</label>
            <div className="input-wrap">
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              <span className="input-icon">✉️</span>
            </div>
          </div>

          <div className="form-group">
            <label>Senha</label>
            <div className="input-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={handlePasswordChange}
                autoComplete="current-password"
              />
              <span 
                className="input-icon" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ cursor: 'pointer' }}
              >
                {showPassword ? '👁️' : '👁️'}
              </span>
            </div>
            
            {password && (
              <>
                <div className="strength-bar">
                  <div 
                    className="strength-fill"
                    style={{
                      width: `${passwordStrength.width}%`,
                      background: passwordStrength.color
                    }}
                  />
                </div>
                <div className="strength-text">{passwordStrength.text}</div>
              </>
            )}
          </div>

          <div className="login-security">
            <span>🔒</span>
            <span>
              Segurança reforçada: após o login, um código de verificação será 
              solicitado para confirmar sua identidade.
            </span>
          </div>

          <button type="submit" className="btn-primary">
            Entrar com segurança
          </button>
        </form>

        <div className="login-footer">
          <a href="#forgot" onClick={handleForgotPassword}>
            Esqueci minha senha
          </a>
        </div>

        <div className="security-badge">
          🔐 <span>Autenticação de dois fatores ativa</span>
        </div>
      </div>

      {showMFA && (
        <ModalMFA
          onSuccess={handleMFASuccess}
          onClose={() => setShowMFA(false)}
        />
      )}
    </div>
  );
};

export default Login;
