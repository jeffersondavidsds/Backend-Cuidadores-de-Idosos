import React, { useState } from 'react';
import { useData } from '../contextos/DataContext';
import { ACTIVITY_CONFIG } from '../dados/mockData';
import './Atividades.css';

const Atividades = () => {
  const { getAllActivities } = useData();
  const [filter, setFilter] = useState('all');

  const allActivities = getAllActivities();

  const filteredActivities = filter === 'all' 
    ? allActivities 
    : allActivities.filter(activity => activity.type === filter);

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

  return (
    <div className="atividades-page fade-in">
      <div className="section-title" style={{ marginBottom: '16px' }}>
        Todas as Atividades
      </div>

      {/* Filtros */}
      <div className="filter-chips">
        <div 
          className={`chip ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Todas
        </div>
        <div 
          className={`chip ${filter === 'med' ? 'active' : ''}`}
          onClick={() => setFilter('med')}
        >
          💊 Med.
        </div>
        <div 
          className={`chip ${filter === 'meal' ? 'active' : ''}`}
          onClick={() => setFilter('meal')}
        >
          🍽️ Aliment.
        </div>
        <div 
          className={`chip ${filter === 'hygiene' ? 'active' : ''}`}
          onClick={() => setFilter('hygiene')}
        >
          🛁 Higiene
        </div>
        <div 
          className={`chip ${filter === 'check' ? 'active' : ''}`}
          onClick={() => setFilter('check')}
        >
          🩺 Aval.
        </div>
      </div>

      {/* Lista de Atividades */}
      <div className="all-activities-list">
        {filteredActivities.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <p>Nenhuma atividade encontrada.</p>
          </div>
        ) : (
          filteredActivities.map(activity => {
            const config = ACTIVITY_CONFIG[activity.type];
            return (
              <div key={`${activity.patientId}-${activity.id}`} className="log-item">
                <div className={`log-icon-wrap ${config.color}`}>
                  {config.icon}
                </div>
                <div className="log-text">
                  <strong>{activity.desc}</strong>
                  <small>{activity.patientName} · {config.label}</small>
                </div>
                <div className="log-date">{formatDate(activity.date)}</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Atividades;
