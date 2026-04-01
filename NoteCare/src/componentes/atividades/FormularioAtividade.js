import React, { useState } from 'react';
import { useData } from '../../contextos/DataContext';
import './FormularioAtividade.css';

const FormularioAtividade = ({ patientId, patientName, onClose, onSuccess }) => {
  const { addActivity } = useData();
  
  const [formData, setFormData] = useState({
    type: 'med',
    desc: '',
    date: new Date().toISOString().slice(0, 16)
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.desc.trim()) {
      alert('⚠️ Por favor, descreva a atividade');
      return;
    }

    addActivity(patientId, {
      type: formData.type,
      desc: formData.desc.trim(),
      date: formData.date || new Date().toISOString()
    });

    alert('✅ Atividade registrada!');
    
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="form-modal-overlay" onClick={onClose}>
      <div className="form-modal activity-form" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle"></div>
        
        <h3>📝 Registrar Atividade</h3>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Paciente</label>
            <div style={{ 
              fontSize: '14px', 
              fontWeight: '700', 
              color: 'var(--sage-dark)', 
              padding: '4px 0' 
            }}>
              {patientName}
            </div>
          </div>

          <div className="form-group">
            <label>Tipo de atividade</label>
            <select
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
            >
              <option value="med">💊 Medicação</option>
              <option value="meal">🍽️ Alimentação</option>
              <option value="hygiene">🛁 Higiene</option>
              <option value="check">🩺 Avaliação de saúde</option>
              <option value="exercise">🏃 Exercício/Fisioterapia</option>
              <option value="note">📝 Observação</option>
              <option value="social">🗣️ Atividade social</option>
            </select>
          </div>

          <div className="form-group">
            <label>Descrição *</label>
            <textarea
              placeholder="Descreva a atividade realizada…"
              value={formData.desc}
              onChange={(e) => handleChange('desc', e.target.value)}
              rows="4"
              required
            />
          </div>

          <div className="form-group">
            <label>Data e hora</label>
            <div className="input-wrap">
              <input
                type="datetime-local"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary">
            Salvar atividade
          </button>

          <button
            type="button"
            className="btn-cancel"
            onClick={onClose}
          >
            Cancelar
          </button>
        </form>
      </div>
    </div>
  );
};

export default FormularioAtividade;
