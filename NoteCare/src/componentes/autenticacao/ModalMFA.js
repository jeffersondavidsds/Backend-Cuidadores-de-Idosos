import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contextos/AuthContext';
import './ModalMFA.css';

const ModalMFA = ({ onSuccess, onClose }) => {
  const { verifyOTP } = useAuth();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const inputRefs = useRef([]);

  useEffect(() => {
    // Focus no primeiro input quando o modal abrir
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    // Aceita apenas números
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1); // Pega apenas o último caractere
    setCode(newCode);

    // Move para o próximo input se tiver valor
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Verifica automaticamente se todos os campos foram preenchidos
    if (newCode.every(digit => digit !== '') && index === 5) {
      setTimeout(() => handleVerify(newCode.join('')), 200);
    }
  };

  const handleKeyDown = (index, e) => {
    // Volta para o input anterior ao pressionar backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // Permite navegação com setas
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
    setCode(newCode);
    
    // Focus no último input preenchido ou no próximo vazio
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();

    // Verifica automaticamente se o código colado está completo
    if (pastedData.length === 6) {
      setTimeout(() => handleVerify(pastedData), 200);
    }
  };

  const handleVerify = async (codeToVerify = code.join('')) => {
    setError('');

    if (codeToVerify.length !== 6) {
      setError('❌ Digite o código completo');
      return;
    }

    const result = await verifyOTP(codeToVerify);

    if (result.success) {
      onSuccess();
    } else {
      setError(result.error || '❌ Código inválido. Use: 123456');
      // Limpa o código e foca no primeiro input
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleVerify();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>🔑 Verificação de segurança</h3>
        <p>Por sua segurança, enviamos um código de 6 dígitos. Digite abaixo:</p>

        <form onSubmit={handleSubmit}>
          <div className="otp-inputs">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
              />
            ))}
          </div>

          {error && (
            <div className="mfa-error">
              {error}
            </div>
          )}

          <p className="modal-hint">
            Código demo: <strong>123456</strong>
          </p>

          <button type="submit" className="btn-primary">
            Verificar e entrar
          </button>
        </form>
      </div>
    </div>
  );
};

export default ModalMFA;
