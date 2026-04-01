import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contextos/AuthContext';
import { useData } from '../contextos/DataContext';
import { ACTIVITY_CONFIG } from '../dados/mockData';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { patients, getStats, getAllActivities } = useData();
  const [greeting, setGreeting] = useState('');
  const [dateString, setDateString] = useState('');

  useEffect(() => {
    updateGreeting();
  }, []);

  const updateGreeting = () => {
    const now = new Date();
    const hours = now.getHours();
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    const dayName = days[now.getDay()];
    const date = now.getDate();
    const month = months[now.getMonth()];

    setDateString(`${dayName}, ${date} de ${month}`);

    if (hours < 12) {
      setGreeting('Bom dia');
    } else if (hours < 18) {
      setGreeting('Boa tarde');
    } else {
      setGreeting('Boa noite');
    }
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

  const stats = typeof getStats === 'function' ? getStats() : { totalPatients: 0, todayActivitiesCount: 0, pendingActivitiesCount: 0 };
  const allActivities = typeof getAllActivities === 'function' ? getAllActivities() : [];
  const recentActivities = allActivities.slice(0, 5);
  const recentPatients = (patients || []).slice(0, 2);

  const getStatusDot = (status) => {
    const classes = {
      alert: 'dot-yellow',
      critical: 'dot-red',
      stable: 'dot-green'
    };
    return classes[status] || 'dot-green';
  };

  const getStatusLabel = (status) => {
    const labels = {
      alert: 'Atenção',
      critical: 'Crítico',
      stable: 'Estável'
    };
    return labels[status] || 'Estável';
  };

  return (
    <div className="dashboard-page fade-in">
      {/* Card de saudação */}
      <div className="greeting-card">
        <div className="date-label">{dateString}</div>
        <h2>{greeting}, {user?.name?.split(' ')[0] || 'Cuidadora'}! 👋</h2>
        <p>
          Você tem <strong>{stats.totalPatients} paciente(s)</strong> ativos.
        </p>
      </div>

      {/* Estatísticas */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon">👴</div>
          <div className="stat-num">{stats.totalPatients}</div>
          <div className="stat-label">Pacientes</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-num">{stats.todayActivitiesCount}</div>
          <div className="stat-label">Feitas hoje</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💊</div>
          <div className="stat-num">{stats.pendingActivitiesCount}</div>
          <div className="stat-label">Pendentes</div>
        </div>
      </div>

      {/* Pacientes */}
      <div className="section-title">
        <span>Pacientes</span>
        <span className="see-all" onClick={() => navigate('/pacientes')}>
          Ver todos →
        </span>
      </div>

      <div className="patients-list">
        {recentPatients.map(patient => (
          <div
            key={patient.id}
            className="patient-card"
            onClick={() => navigate(`/pacientes/${patient.id}`)}
          >
            <div className="patient-avatar">{patient.emoji}</div>
            <div className="patient-info">
              <div className="patient-name">{patient.name}</div>
              <div className="patient-age">
                <span className={`status-dot ${getStatusDot(patient.status)}`}></span>
                {getStatusLabel(patient.status)} · {patient.age} anos · Aut. {patient.autonomyLevel}/5
              </div>
              <div className="patient-tags">
                {patient.tags?.map((tag, index) => (
                  <span key={index} className="tag tag-sage">{tag}</span>
                ))}
                <span className="tag tag-peach">{patient.activities?.length || 0} ativ.</span>
              </div>
            </div>
            <span className="patient-chevron">›</span>
          </div>
        ))}
      </div>

      {/* Atividades Recentes */}
      <div className="section-title" style={{ marginTop: '24px' }}>
        <span>Atividades Recentes</span>
      </div>

      <div className="activities-list">
        {recentActivities.map(activity => {
          const config = ACTIVITY_CONFIG[activity.type];
          return (
            <div key={activity.id} className="activity-item">
              <div className={`activity-icon ${config.color}`}>
                {config.icon}
              </div>
              <div className="activity-text">
                <strong>{activity.desc}</strong>
                <span>{activity.patientName} · {config.label}</span>
              </div>
              <div className="activity-time">{formatDate(activity.date)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
