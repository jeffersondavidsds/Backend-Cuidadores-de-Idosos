import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contextos/AuthContext';
import { apiService } from '../services/apiService';
import ModalMFA from '../componentes/autenticacao/ModalMFA';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  console.log('Login useAuth:', auth);
  const login = auth?.login ? auth.login : async () => ({ success: false, error: 'Unable to access login function' });
  
  const [mode, setMode] = useState('login'); // 'login' ou 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
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

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!name || !email || !password || !confirmPassword) {
      setError('⚠️ Preencha todos os campos de cadastro.');
      return;
    }

    if (password !== confirmPassword) {
      setError('⚠️ As senhas não coincidem.');
      return;
    }

    if (password.length < 6) {
      setError('⚠️ A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    try {
      const response = await apiService.register(name, email, password);
      if (response.success) {
        setSuccessMessage('✅ Cadastro realizado com sucesso! Faça login agora.');
        setMode('login');
        setConfirmPassword('');
        setPassword('');
        return;
      }
      setError(response.error || 'Erro ao cadastrar.');
    } catch (err) {
      setError(err.message || 'Erro ao cadastrar.');
    }
  };

  const handlePasswordChange = (e) => {
    const pass = e.target.value;
    setPassword(pass);
    setPasswordStrength(calculatePasswordStrength(pass));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!email || !password) {
      setError('⚠️ Preencha e-mail e senha.');
      return;
    }

    const result = await login(email, password);
    
    if (result.success) {
      setError('');
      setSuccessMessage('✔️ Login bem sucedido! Redirecionando...');
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

        {successMessage && (
          <div className="success-msg">
            {successMessage}
          </div>
        )}

        <form onSubmit={mode === 'login' ? handleLogin : handleRegister}>
          {mode === 'register' && (
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
          )}

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
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label>Confirmar senha</label>
              <div className="input-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <span 
                  className="input-icon" 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ cursor: 'pointer' }}
                >
                  {showPassword ? '👁️' : '👁️'}
                </span>
              </div>
            </div>
          )}

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
            {mode === 'login' ? 'Entrar com segurança' : 'Cadastrar'}
          </button>
        </form>

        <div className="login-footer">
          {mode === 'login' ? (
            <button className="btn-secondary" onClick={() => { setMode('register'); setError(''); setSuccessMessage(''); }}>
              Cadastre-se
            </button>
          ) : (
            <button className="btn-secondary" onClick={() => { setMode('login'); setError(''); setSuccessMessage(''); }}>
              Já tenho conta
            </button>
          )}
        </div>

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
