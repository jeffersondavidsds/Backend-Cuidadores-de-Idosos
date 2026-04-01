import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../contextos/DataContext';
import FormularioPaciente from '../componentes/pacientes/FormularioPaciente';
import FormularioAtividade from '../componentes/atividades/FormularioAtividade';
import {
  AUTONOMY_LABELS,
  AUTONOMY_DESCRIPTIONS,
  RISK_OPTIONS,
  MOBILITY_OPTIONS,
  COMMUNICATION_OPTIONS,
  ENV_OPTIONS,
  ENV_STATUS_LABELS,
  ACTIVITY_CONFIG
} from '../dados/mockData';
import './DetalhesPaciente.css';

const DetalhesPaciente = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getPatientById, deletePatient } = useData();
  const [patient, setPatient] = useState(null);
  const [activeTab, setActiveTab] = useState('perfil');
  const [showEditForm, setShowEditForm] = useState(false);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    const foundPatient = getPatientById(parseInt(id));
    if (foundPatient) {
      setPatient(foundPatient);
    } else {
      navigate('/pacientes');
    }
  }, [id, getPatientById, navigate]);

  if (!patient) {
    return <div>Carregando...</div>;
  }

  const patientRiskOptions = {
    ...RISK_OPTIONS,
    ...(patient.customRiskOptions || {})
  };

  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja remover este paciente?')) {
      deletePatient(patient.id);
      navigate('/pacientes');
    }
  };

  const getStatusInfo = () => {
    const statusMap = {
      alert: { class: 'tag-peach', label: '⚠️ Atenção' },
      critical: { class: 'tag-red', label: '🔴 Crítico' },
      stable: { class: 'tag-sage', label: '✅ Estável' }
    };
    return statusMap[patient.status] || statusMap.stable;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit' 
    }) + ' ' + date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getWeekBounds = (offset) => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) + (offset * 7));
    monday.setHours(0, 0, 0, 0);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    
    return { monday, sunday };
  };

  const renderPerfil = () => {
    const level = patient.autonomyLevel || 3;
    const statusInfo = getStatusInfo();

    return (
      <div className="tab-pane active">
        {/* Autonomia */}
        <div className="detail-section">
          <div className="detail-section-hd">
            <span>🧠 Nível de Autonomia</span>
          </div>
          <div className="autonomy-block">
            <div className="autonomy-label-row">
              <span className="autonomy-title">Nível {level} / 5</span>
              <span className={`aut-badge aut-${level}`}>{AUTONOMY_LABELS[level]}</span>
            </div>
            <div className="aut-track">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className={`aut-dot ${i <= level ? `aut-filled-${level}` : ''}`}></div>
              ))}
            </div>
            <div className="aut-desc">{AUTONOMY_DESCRIPTIONS[level]}</div>
          </div>
        </div>

        {/* Informações Gerais */}
        <div className="detail-section">
          <div className="detail-section-hd">
            <span>📋 Informações Gerais</span>
          </div>
          <div className="info-grid">
            <div className="info-cell full" style={{ marginBottom: '10px' }}>
              <span className={`tag ${statusInfo.class}`} style={{ marginRight: '10px' }}>{statusInfo.label}</span>
            </div>
            <div className="info-cell">
              <div className="ic-label">Idade</div>
              <div className="ic-val">{patient.age} anos</div>
            </div>
            <div className="info-cell">
              <div className="ic-label">Tipo sanguíneo</div>
              <div className="ic-val">{patient.blood || '—'}</div>
            </div>
            <div className="info-cell">
              <div className="ic-label">Biometria</div>
              <div className="ic-val">{patient.biometrics || '—'}</div>
            </div>
            <div className="info-cell">
              <div className="ic-label">Contato familiar</div>
              <div className="ic-val">{patient.contact || '—'}</div>
            </div>
            <div className="info-cell full">
              <div className="ic-label">Medicações</div>
              <div className="ic-val">{patient.meds || '—'}</div>
            </div>
            <div className="info-cell full">
              <div className="ic-label">Alergias</div>
              <div className="ic-val">{patient.allergies || 'Nenhuma conhecida'}</div>
            </div>
            {patient.notes && (
              <div className="info-cell full" style={{ borderBottom: 'none' }}>
                <div className="ic-label">Observações</div>
                <div className="ic-val soft">{patient.notes}</div>
              </div>
            )}
          </div>
        </div>

        {/* Detalhamento Clínico */}
        <div className="detail-section">
          <div className="detail-section-hd">
            <span>🩺 Detalhamento Clínico</span>
          </div>
          <div className="info-grid">
            <div className="info-cell full">
              <div className="ic-label">Diagnóstico principal</div>
              <div className="ic-val">{patient.diagnosis || '—'}</div>
            </div>
            <div className="info-cell full">
              <div className="ic-label">Condições secundárias</div>
              <div className="ic-val">{patient.conditions || '—'}</div>
            </div>
            <div className="info-cell full">
              <div className="ic-label">Dieta / Alimentação</div>
              <div className="ic-val">{patient.diet || '—'}</div>
            </div>
            <div className="info-cell">
              <div className="ic-label">Mobilidade</div>
              <div className="ic-val">{MOBILITY_OPTIONS[patient.mobility] || patient.mobility || '—'}</div>
            </div>
            <div className="info-cell">
              <div className="ic-label">Comunicação</div>
              <div className="ic-val">{COMMUNICATION_OPTIONS[patient.communication] || patient.communication || '—'}</div>
            </div>
            <div className="info-cell full" style={{ borderBottom: 'none' }}>
              <div className="ic-label">Padrão de sono</div>
              <div className="ic-val">{patient.sleep || '—'}</div>
            </div>
          </div>
        </div>

        {/* Fatores de Risco */}
        <div className="detail-section">
          <div className="detail-section-hd">
            <span>⚠️ Fatores de Risco</span>
          </div>
          <div className="risk-grid">
            {Object.entries(patientRiskOptions).map(([key, label]) => (
              <div 
                key={key} 
                className={`risk-badge ${(patient.risks || []).includes(key) ? 'risk-high' : 'risk-none'}`}
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Restrições Ambientais */}
        <div className="detail-section">
          <div className="detail-section-hd">
            <span>🌡️ Restrições Ambientais</span>
          </div>
          <div className="env-grid">
            {Object.entries(ENV_OPTIONS).map(([key, config]) => {
              const status = patient.env?.[key] || 'permitido';
              const statusClass = {
                permitido: 'env-allowed',
                moderado: 'env-caution',
                proibido: 'env-forbidden'
              }[status];
              
              return (
                <div key={key} className={`env-item ${statusClass}`}>
                  <div className="env-icon">{config.icon}</div>
                  <div className="env-name">{config.name}</div>
                  <div className="env-status">{ENV_STATUS_LABELS[status]}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Botões de ação */}
        <div className="btn-row">
          <button className="btn-edit" onClick={() => setShowEditForm(true)}>
            ✏️ Editar
          </button>
          <button className="btn-delete" onClick={handleDelete}>
            🗑️
          </button>
        </div>

        <button className="btn-add-activity" onClick={() => setShowActivityForm(true)}>
          + Registrar atividade
        </button>
      </div>
    );
  };

  const renderAtividades = () => {
    const sortedActivities = [...(patient.activities || [])].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    return (
      <div className="tab-pane active">
        <div className="recent-acts-list">
          {sortedActivities.length === 0 ? (
            <div className="week-empty">
              <div className="week-empty-icon">📋</div>
              Nenhuma atividade registrada ainda.
            </div>
          ) : (
            sortedActivities.map(activity => {
              const config = ACTIVITY_CONFIG[activity.type];
              return (
                <div key={activity.id} className="log-item">
                  <div className={`log-icon-wrap ${config.color}`}>
                    {config.icon}
                  </div>
                  <div className="log-text">
                    <strong>{activity.desc}</strong>
                    <small>{config.label}</small>
                  </div>
                  <div className="log-date">{formatDate(activity.date)}</div>
                </div>
              );
            })
          )}
        </div>
        <button 
          className="btn-add-activity" 
          style={{ marginTop: '8px' }}
          onClick={() => setShowActivityForm(true)}
        >
          + Registrar atividade
        </button>
      </div>
    );
  };

  const renderHistorico = () => {
    const { monday, sunday } = getWeekBounds(weekOffset);
    const weekActivities = (patient.activities || []).filter(activity => {
      const actDate = new Date(activity.date);
      return actDate >= monday && actDate <= sunday;
    });

    const formatWeekLabel = () => {
      if (weekOffset === 0) return 'Esta semana';
      if (weekOffset === -1) return 'Semana passada';
      return `${Math.abs(weekOffset)} semanas atrás`;
    };

    const formatDateRange = (mon, sun) => {
      return `${mon.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} – ${sun.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`;
    };

    // Agrupar por dia
    const groupedByDay = {};
    weekActivities.forEach(activity => {
      const dayKey = new Date(activity.date).toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit'
      });
      if (!groupedByDay[dayKey]) {
        groupedByDay[dayKey] = [];
      }
      groupedByDay[dayKey].push(activity);
    });

    // Ordenar dias
    const sortedDays = Object.keys(groupedByDay).sort((a, b) => {
      const dateA = groupedByDay[a][0].date;
      const dateB = groupedByDay[b][0].date;
      return new Date(dateB) - new Date(dateA);
    });

    return (
      <div className="tab-pane active">
        <div className="week-nav">
          <button 
            className="week-btn" 
            onClick={() => setWeekOffset(weekOffset - 1)}
          >
            ‹
          </button>
          <span className="week-label">
            {formatWeekLabel()}
            <span className="week-sub">{formatDateRange(monday, sunday)}</span>
          </span>
          <button 
            className="week-btn" 
            onClick={() => setWeekOffset(weekOffset + 1)}
            disabled={weekOffset >= 0}
          >
            ›
          </button>
        </div>

        <div className="week-content">
          {sortedDays.length === 0 ? (
            <div className="week-empty">
              <div className="week-empty-icon">📅</div>
              Nenhuma atividade neste período.
            </div>
          ) : (
            sortedDays.map(dayKey => (
              <div key={dayKey} className="week-day-group">
                <div className="week-day-hd">{dayKey}</div>
                {groupedByDay[dayKey]
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map(activity => {
                    const config = ACTIVITY_CONFIG[activity.type];
                    return (
                      <div key={activity.id} className="log-item">
                        <div className={`log-icon-wrap ${config.color}`}>
                          {config.icon}
                        </div>
                        <div className="log-text">
                          <strong>{activity.desc}</strong>
                          <small>{config.label}</small>
                        </div>
                        <div className="log-date">
                          {new Date(activity.date).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    );
                  })}
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="detail-overlay">
      {/* Header */}
      <div className="detail-header">
        <button className="detail-back" onClick={() => navigate('/pacientes')}>
          ←
        </button>
        <div className="detail-patient-hero">
          <div className="detail-avatar">{patient.emoji}</div>
          <div>
            <div className="detail-patient-name">{patient.name}</div>
            <div className="detail-patient-sub">
              {patient.age} anos · {patient.diagnosis}
            </div>
            <div className="detail-patient-status">
              <span className={`tag ${statusInfo.class}`} style={{ marginTop: '4px', display: 'inline-block' }}>
                {statusInfo.label}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="detail-tabs">
          <button
            className={`detail-tab ${activeTab === 'perfil' ? 'active' : ''}`}
            onClick={() => setActiveTab('perfil')}
          >
            📋 Perfil
          </button>
          <button
            className={`detail-tab ${activeTab === 'atividades' ? 'active' : ''}`}
            onClick={() => setActiveTab('atividades')}
          >
            📅 Atividades
          </button>
          <button
            className={`detail-tab ${activeTab === 'historico' ? 'active' : ''}`}
            onClick={() => setActiveTab('historico')}
          >
            📊 Histórico
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="detail-body">
        {activeTab === 'perfil' && renderPerfil()}
        {activeTab === 'atividades' && renderAtividades()}
        {activeTab === 'historico' && renderHistorico()}
      </div>

      {/* Modals */}
      {showEditForm && (
        <FormularioPaciente
          patientId={patient.id}
          onClose={() => setShowEditForm(false)}
          onSuccess={() => {
            setShowEditForm(false);
            // Recarregar paciente
            const updated = getPatientById(patient.id);
            setPatient(updated);
          }}
        />
      )}

      {showActivityForm && (
        <FormularioAtividade
          patientId={patient.id}
          patientName={patient.name}
          onClose={() => setShowActivityForm(false)}
          onSuccess={() => {
            setShowActivityForm(false);
            // Recarregar paciente
            const updated = getPatientById(patient.id);
            setPatient(updated);
          }}
        />
      )}
    </div>
  );
};

export default DetalhesPaciente;
