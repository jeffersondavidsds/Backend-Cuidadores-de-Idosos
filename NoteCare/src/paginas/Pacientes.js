import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contextos/DataContext';
import FormularioPaciente from '../componentes/pacientes/FormularioPaciente';
import './Pacientes.css';

const Pacientes = () => {
  const navigate = useNavigate();
  const { patients } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);

  const filteredPatients = patients.filter(patient => {
    // Filtro de busca
    const matchesSearch = !searchTerm || 
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.diagnosis || '').toLowerCase().includes(searchTerm.toLowerCase());

    // Filtros de status
    let matchesFilter = true;
    if (filter === 'alert') {
      matchesFilter = patient.status === 'alert' || patient.status === 'critical';
    } else if (filter === 'stable') {
      matchesFilter = patient.status === 'stable';
    } else if (filter === 'med') {
      matchesFilter = !!patient.meds;
    }

    return matchesSearch && matchesFilter;
  });

  const getStatusDot = (status) => {
    const classes = { alert: 'dot-yellow', critical: 'dot-red', stable: 'dot-green' };
    return classes[status] || 'dot-green';
  };

  const getStatusLabel = (status) => {
    const labels = { alert: 'Atenção', critical: 'Crítico', stable: 'Estável' };
    return labels[status] || 'Estável';
  };

  return (
    <div className="pacientes-page fade-in">
      <div className="section-title" style={{ marginBottom: '16px' }}>
        <span>Meus Pacientes</span>
        <span style={{ 
          fontFamily: 'Nunito', 
          fontSize: '13px', 
          color: 'var(--text-soft)', 
          fontWeight: '500' 
        }}>
          {filteredPatients.length} paciente(s)
        </span>
      </div>

      {/* Busca */}
      <div className="search-wrap">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Buscar paciente…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Filtros */}
      <div className="filter-chips">
        <div 
          className={`chip ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Todos
        </div>
        <div 
          className={`chip ${filter === 'alert' ? 'active' : ''}`}
          onClick={() => setFilter('alert')}
        >
          ⚠️ Atenção
        </div>
        <div 
          className={`chip ${filter === 'stable' ? 'active' : ''}`}
          onClick={() => setFilter('stable')}
        >
          ✅ Estáveis
        </div>
        <div 
          className={`chip ${filter === 'med' ? 'active' : ''}`}
          onClick={() => setFilter('med')}
        >
          💊 Medicação
        </div>
      </div>

      {/* Lista de Pacientes */}
      <div className="patients-list">
        {filteredPatients.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <p>Nenhum paciente encontrado.</p>
          </div>
        ) : (
          filteredPatients.map(patient => (
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
          ))
        )}
      </div>

      {/* Botão FAB */}
      <button className="fab" onClick={() => setShowForm(true)}>
        +
      </button>

      {/* Formulário */}
      {showForm && (
        <FormularioPaciente
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default Pacientes;
