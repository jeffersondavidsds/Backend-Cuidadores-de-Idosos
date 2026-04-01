import React, { useState, useEffect } from 'react';
import { useData } from '../../contextos/DataContext';
import { 
  AUTONOMY_LABELS, 
  AUTONOMY_DESCRIPTIONS,
  RISK_OPTIONS,
  MOBILITY_OPTIONS,
  COMMUNICATION_OPTIONS
} from '../../dados/mockData';
import './FormularioPaciente.css';

const FormularioPaciente = ({ patientId, onClose, onSuccess }) => {
  const { addPatient, updatePatient, getPatientById } = useData();
  const isEditing = !!patientId;
  const existingPatient = isEditing ? getPatientById(patientId) : null;

  // Estados do formulário
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    contact: '',
    blood: '',
    biometrics: '',
    diagnosis: '',
    conditions: '',
    meds: '',
    allergies: '',
    diet: '',
    autonomyLevel: 3,
    mobility: 'independente',
    communication: 'verbal_clara',
    sleep: '',
    status: 'stable',
    notes: '',
    risks: [],
    customRiskOptions: {},
    env: {
      ac: 'permitido',
      sun: 'permitido',
      cold: 'permitido',
      humidity: 'permitido'
    }
  });

  const [autonomyDescription, setAutonomyDescription] = useState('');
  const [newRiskKey, setNewRiskKey] = useState('');
  const [newRiskLabel, setNewRiskLabel] = useState('');
  const availableRiskOptions = {
    ...RISK_OPTIONS,
    ...(formData.customRiskOptions || {})
  };

  useEffect(() => {
    if (existingPatient) {
      setFormData({
        name: existingPatient.name || '',
        age: existingPatient.age || '',
        contact: existingPatient.contact || '',
        blood: existingPatient.blood || '',
        biometrics: existingPatient.biometrics || '',
        diagnosis: existingPatient.diagnosis || '',
        conditions: existingPatient.conditions || '',
        meds: existingPatient.meds || '',
        allergies: existingPatient.allergies || '',
        diet: existingPatient.diet || '',
        autonomyLevel: existingPatient.autonomyLevel || 3,
        mobility: existingPatient.mobility || 'independente',
        communication: existingPatient.communication || 'verbal_clara',
        sleep: existingPatient.sleep || '',
        status: existingPatient.status || 'stable',
        notes: existingPatient.notes || '',
        risks: existingPatient.risks || [],
        customRiskOptions: existingPatient.customRiskOptions || {},
        env: existingPatient.env || {
          ac: 'permitido',
          sun: 'permitido',
          cold: 'permitido',
          humidity: 'permitido'
        }
      });
    }
  }, [existingPatient]);

  useEffect(() => {
    updateAutonomyDescription(formData.autonomyLevel);
  }, [formData.autonomyLevel]);

  const updateAutonomyDescription = (level) => {
    const description = `${AUTONOMY_LABELS[level]}: ${AUTONOMY_DESCRIPTIONS[level]}`;
    setAutonomyDescription(description);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEnvChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      env: {
        ...prev.env,
        [field]: value
      }
    }));
  };

  const toggleRisk = (riskKey) => {
    setFormData(prev => ({
      ...prev,
      risks: prev.risks.includes(riskKey)
        ? prev.risks.filter(r => r !== riskKey)
        : [...prev.risks, riskKey]
    }));
  };

  const handleAddRiskOption = () => {
    const label = newRiskLabel.trim() || newRiskKey.trim();
    const rawKey = (newRiskKey.trim() || label)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');

    if (!label) {
      alert('Informe o nome do novo fator de risco');
      return;
    }

    const duplicatedLabel = Object.values(availableRiskOptions).some(
      (existingLabel) => existingLabel.toLowerCase() === label.toLowerCase()
    );

    if (duplicatedLabel) {
      alert('Esse fator de risco já existe para este paciente.');
      return;
    }

    const key = `custom_${rawKey || 'risco'}_${Date.now()}`;

    setFormData(prev => ({
      ...prev,
      customRiskOptions: {
        ...(prev.customRiskOptions || {}),
        [key]: label
      },
      risks: prev.risks.includes(key) ? prev.risks : [...prev.risks, key]
    }));

    setNewRiskKey('');
    setNewRiskLabel('');
  };

  const handleRemoveRiskOption = (key) => {
    if (!window.confirm('Remover este fator de risco apenas deste paciente?')) return;

    setFormData(prev => {
      const updatedCustomRiskOptions = { ...(prev.customRiskOptions || {}) };
      delete updatedCustomRiskOptions[key];

      return {
        ...prev,
        customRiskOptions: updatedCustomRiskOptions,
        risks: prev.risks.filter(r => r !== key)
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.age) {
      alert('⚠️ Nome e idade são obrigatórios');
      return;
    }

    const patientData = {
      ...formData,
      age: parseInt(formData.age),
      tags: [formData.diagnosis || 'Paciente']
    };

    if (isEditing) {
      updatePatient(patientId, patientData);
      alert('✅ Paciente atualizado!');
    } else {
      addPatient(patientData);
      alert('✅ Paciente adicionado!');
    }

    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="form-modal-overlay" onClick={onClose}>
      <div className="form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle"></div>
        
        <h3>{isEditing ? '✏️ Editar Paciente' : '➕ Novo Paciente'}</h3>

        <form onSubmit={handleSubmit}>
          {/* Dados Pessoais */}
          <div className="form-divider">Dados Pessoais</div>

          <div className="form-group">
            <label>Nome completo *</label>
            <div className="input-wrap">
              <input
                type="text"
                placeholder="Ex: Maria das Graças"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Idade *</label>
            <div className="input-wrap">
              <input
                type="number"
                placeholder="Ex: 78"
                min="50"
                max="120"
                value={formData.age}
                onChange={(e) => handleChange('age', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Contato familiar</label>
            <div className="input-wrap">
              <input
                type="text"
                placeholder="Ex: (11) 9 9999-0000"
                value={formData.contact}
                onChange={(e) => handleChange('contact', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Tipo sanguíneo</label>
            <div className="input-wrap">
              <input
                type="text"
                placeholder="Ex: A+"
                value={formData.blood}
                onChange={(e) => handleChange('blood', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Peso / Altura</label>
            <div className="input-wrap">
              <input
                type="text"
                placeholder="Ex: 65 kg / 1,60 m"
                value={formData.biometrics}
                onChange={(e) => handleChange('biometrics', e.target.value)}
              />
            </div>
          </div>

          {/* Saúde & Diagnóstico */}
          <div className="form-divider">Saúde & Diagnóstico</div>

          <div className="form-group">
            <label>Diagnóstico principal</label>
            <div className="input-wrap">
              <input
                type="text"
                placeholder="Ex: Alzheimer leve"
                value={formData.diagnosis}
                onChange={(e) => handleChange('diagnosis', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Condições secundárias</label>
            <div className="input-wrap">
              <input
                type="text"
                placeholder="Ex: Hipertensão, Diabetes tipo 2"
                value={formData.conditions}
                onChange={(e) => handleChange('conditions', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Medicações</label>
            <div className="input-wrap">
              <input
                type="text"
                placeholder="Ex: Donepezil 5mg, Omeprazol"
                value={formData.meds}
                onChange={(e) => handleChange('meds', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Alergias</label>
            <div className="input-wrap">
              <input
                type="text"
                placeholder="Ex: Penicilina"
                value={formData.allergies}
                onChange={(e) => handleChange('allergies', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Dieta / Alimentação</label>
            <div className="input-wrap">
              <input
                type="text"
                placeholder="Ex: Dieta pastosa, sem sal"
                value={formData.diet}
                onChange={(e) => handleChange('diet', e.target.value)}
              />
            </div>
          </div>

          {/* Autonomia & Mobilidade */}
          <div className="form-divider">Autonomia & Mobilidade</div>

          <div className="form-group">
            <label>
              Nível de autonomia &nbsp;
              <span style={{ fontSize: '11px', color: 'var(--text-soft)' }}>
                (1 = dependência total · 5 = autonomia total)
              </span>
            </label>
            <div className="aut-slider-row">
              <input
                type="range"
                min="1"
                max="5"
                value={formData.autonomyLevel}
                onChange={(e) => handleChange('autonomyLevel', parseInt(e.target.value))}
              />
              <span className="aut-val-badge">{formData.autonomyLevel}</span>
            </div>
            <div style={{ 
              fontSize: '11.5px', 
              color: 'var(--text-soft)', 
              marginTop: '5px', 
              lineHeight: '1.5' 
            }}>
              {autonomyDescription}
            </div>
          </div>

          <div className="form-group">
            <label>Mobilidade</label>
            <select
              value={formData.mobility}
              onChange={(e) => handleChange('mobility', e.target.value)}
            >
              {Object.entries(MOBILITY_OPTIONS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Comunicação</label>
            <select
              value={formData.communication}
              onChange={(e) => handleChange('communication', e.target.value)}
            >
              {Object.entries(COMMUNICATION_OPTIONS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Padrão de sono</label>
            <div className="input-wrap">
              <input
                type="text"
                placeholder="Ex: 8h, com interrupções"
                value={formData.sleep}
                onChange={(e) => handleChange('sleep', e.target.value)}
              />
            </div>
          </div>

          {/* Fatores de Risco */}
          <div className="form-divider">Fatores de Risco</div>

          <div className="form-group">
            <div className="risk-selection-hint">
              Toque nos chips para selecionar ou desmarcar riscos deste paciente.
            </div>

            <div className="risk-checks">
              {Object.entries(availableRiskOptions).map(([key, label]) => {
                const isSelected = formData.risks.includes(key);
                const isCustomRisk = Boolean(formData.customRiskOptions?.[key]);

                return (
                  <div key={key} className="risk-check-row">
                    <button
                      type="button"
                      className={`risk-check-item ${isSelected ? 'checked' : ''}`}
                      onClick={() => toggleRisk(key)}
                      aria-pressed={isSelected}
                    >
                      <span className="risk-check-mark">{isSelected ? '✓' : '+'}</span>
                      <span>{label}</span>
                    </button>
                    {isCustomRisk && (
                      <button
                        type="button"
                        className="risk-remove-btn"
                        onClick={() => handleRemoveRiskOption(key)}
                        title="Remover risco personalizado"
                      >
                        ✖
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="new-risk-card">
              <div className="new-risk-card-title">✨ Novo fator de risco personalizado</div>
              <div className="new-risk-card-subtitle">
                Ele ficará disponível somente para este paciente.
              </div>

              <div className="new-risk-row">
                <div className="new-risk-field">
                  <label>Nome do risco</label>
                  <input
                    type="text"
                    placeholder="Ex: Risco de fuga"
                    value={newRiskLabel}
                    onChange={(e) => setNewRiskLabel(e.target.value)}
                  />
                </div>

                <div className="new-risk-field">
                  <label>Chave opcional</label>
                  <input
                    type="text"
                    placeholder="Ex: risco_fuga"
                    value={newRiskKey}
                    onChange={(e) => setNewRiskKey(e.target.value)}
                  />
                </div>
              </div>

              <button type="button" className="btn-add-risk" onClick={handleAddRiskOption}>
                + Adicionar e selecionar neste paciente
              </button>
            </div>
          </div>

          {/* Restrições Ambientais */}
          <div className="form-divider">Restrições Ambientais</div>

          <div className="env-picker-row">
            <div className="env-pick-item">
              <label>❄️ Ar-condicionado</label>
              <select
                value={formData.env.ac}
                onChange={(e) => handleEnvChange('ac', e.target.value)}
              >
                <option value="permitido">✅ Permitido</option>
                <option value="moderado">⚠️ Com moderação</option>
                <option value="proibido">🚫 Não recomendado</option>
              </select>
            </div>

            <div className="env-pick-item">
              <label>☀️ Exposição ao sol</label>
              <select
                value={formData.env.sun}
                onChange={(e) => handleEnvChange('sun', e.target.value)}
              >
                <option value="permitido">✅ Permitida</option>
                <option value="moderado">⚠️ Moderada</option>
                <option value="proibido">🚫 Evitar</option>
              </select>
            </div>

            <div className="env-pick-item">
              <label>🥶 Frio</label>
              <select
                value={formData.env.cold}
                onChange={(e) => handleEnvChange('cold', e.target.value)}
              >
                <option value="permitido">✅ Sem restrição</option>
                <option value="moderado">⚠️ Cuidado</option>
                <option value="proibido">🚫 Evitar</option>
              </select>
            </div>

            <div className="env-pick-item">
              <label>💦 Umidade alta</label>
              <select
                value={formData.env.humidity}
                onChange={(e) => handleEnvChange('humidity', e.target.value)}
              >
                <option value="permitido">✅ Sem restrição</option>
                <option value="moderado">⚠️ Moderada</option>
                <option value="proibido">🚫 Evitar</option>
              </select>
            </div>
          </div>

          {/* Geral */}
          <div className="form-divider">Geral</div>

          <div className="form-group">
            <label>Status</label>
            <select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
            >
              <option value="stable">✅ Estável</option>
              <option value="alert">⚠️ Requer atenção</option>
              <option value="critical">🔴 Crítico</option>
            </select>
          </div>

          <div className="form-group">
            <label>Observações gerais</label>
            <textarea
              placeholder="Hábitos, preferências, comportamentos importantes…"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
            />
          </div>

          <button type="submit" className="btn-primary">
            {isEditing ? 'Atualizar paciente' : 'Salvar paciente'}
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

export default FormularioPaciente;
