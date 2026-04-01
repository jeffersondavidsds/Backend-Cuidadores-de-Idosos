import React, { useState } from 'react';
import { useAuth } from '../contextos/AuthContext';
import { useData } from '../contextos/DataContext';
import { generatePatientReportPDF } from '../utils/reportPdf';
import './Perfil.css';

const Perfil = () => {
  const { user, logout, updateUser } = useAuth();
  const { patients } = useData();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || ''
  });

  const selectedPatient = patients.find((patient) => patient.id === selectedPatientId) || patients[0] || null;

  const displayToast = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2800);
  };

  const handleEditProfile = () => {
    setIsEditing(true);
    setEditData({
      name: user?.name || '',
      email: user?.email || '',
      role: user?.role || ''
    });
  };

  const handleSaveProfile = () => {
    updateUser(editData);
    setIsEditing(false);
    displayToast('✅ Perfil atualizado!');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({
      name: user?.name || '',
      email: user?.email || '',
      role: user?.role || ''
    });
  };

  const handleLogout = () => {
    if (window.confirm('Deseja sair da sua conta?')) {
      logout();
    }
  };

  const handleOpenReportModal = () => {
    if (!patients.length) {
      displayToast('⚠️ Cadastre um paciente antes de exportar o relatório.');
      return;
    }

    setSelectedPatientId((prev) => prev || patients[0].id);
    setShowReportModal(true);
  };

  const handleExportReport = () => {
    const patientToExport = patients.find((patient) => patient.id === selectedPatientId) || patients[0];

    if (!patientToExport) {
      displayToast('⚠️ Nenhum paciente disponível para exportação.');
      return;
    }

    try {
      generatePatientReportPDF({
        patient: patientToExport,
        caregiverName: user?.name || 'Cuidador(a) responsável'
      });
      setShowReportModal(false);
      displayToast(`📄 Relatório de ${patientToExport.name} exportado em PDF!`);
    } catch (error) {
      console.error(error);
      displayToast('❌ Não foi possível gerar o PDF agora.');
    }
  };

  return (
    <div className="perfil-page fade-in">
      {/* Hero Card */}
      <div className="profile-hero">
        <div className="profile-avatar-big">
          {user?.avatar || '👩‍⚕️'}
        </div>
        <div>
          {isEditing ? (
            <>
              <input
                type="text"
                className="profile-name-input"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                placeholder="Nome"
              />
              <input
                type="text"
                className="profile-role-input"
                value={editData.role}
                onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                placeholder="Função"
              />
            </>
          ) : (
            <>
              <div className="profile-name">{user?.name}</div>
              <div className="profile-role">{user?.role}</div>
              <div className="profile-reg">{user?.registration} · {user?.status}</div>
            </>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="edit-actions">
          <button className="btn-save-profile" onClick={handleSaveProfile}>
            ✅ Salvar
          </button>
          <button className="btn-cancel-profile" onClick={handleCancelEdit}>
            Cancelar
          </button>
        </div>
      )}

      {/* Configurações */}
      <div className="settings-list">
        <div className="settings-item" onClick={handleEditProfile}>
          <span className="settings-icon">👤</span>
          <span className="settings-label">Editar perfil</span>
          <span className="settings-arrow">›</span>
        </div>

        <div className="settings-item" onClick={() => displayToast('🔔 Configurar notificações')}>
          <span className="settings-icon">🔔</span>
          <span className="settings-label">Notificações</span>
          <span className="badge-new">Novo</span>
          <span className="settings-arrow">›</span>
        </div>

        <div className="settings-item" onClick={() => displayToast('🔒 Alterar senha')}>
          <span className="settings-icon">🔒</span>
          <span className="settings-label">Segurança e senha</span>
          <span className="settings-arrow">›</span>
        </div>

        <div className="settings-item" onClick={handleOpenReportModal}>
          <span className="settings-icon">📊</span>
          <span className="settings-label">Exportar relatório</span>
          <span className="settings-arrow">›</span>
        </div>

        <div className="settings-item" onClick={() => displayToast('💬 Suporte: (11) 9 9999-0000')}>
          <span className="settings-icon">💬</span>
          <span className="settings-label">Suporte</span>
          <span className="settings-arrow">›</span>
        </div>
      </div>

      {/* Sobre */}
      <div className="about-box">
        <div className="about-title">SOBRE</div>
        <div className="about-content">
          I'm Home Care v2.0<br />
          Desenvolvido com 💚 para cuidadores de idosos.
        </div>
      </div>

      {/* Logout */}
      <button className="btn-logout" onClick={handleLogout}>
        🚪 Sair da conta
      </button>

      {showReportModal && (
        <div className="report-modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="report-modal" onClick={(e) => e.stopPropagation()}>
            <div className="report-modal-header">
              <h3>📄 Exportar relatório em PDF</h3>
              <button type="button" className="report-close-btn" onClick={() => setShowReportModal(false)}>
                ✕
              </button>
            </div>

            <p className="report-modal-text">
              Selecione o paciente para gerar um relatório detalhado, pronto para compartilhar com o contratante.
            </p>

            <div className="report-patient-list">
              {patients.map((patient) => (
                <button
                  key={patient.id}
                  type="button"
                  className={`report-patient-card ${selectedPatient?.id === patient.id ? 'selected' : ''}`}
                  onClick={() => setSelectedPatientId(patient.id)}
                >
                  <div className="report-patient-avatar">{patient.emoji || '🧓'}</div>
                  <div className="report-patient-info">
                    <strong>{patient.name}</strong>
                    <span>{patient.age} anos · {patient.diagnosis || 'Sem diagnóstico informado'}</span>
                  </div>
                </button>
              ))}
            </div>

            {selectedPatient && (
              <div className="report-preview-box">
                <div className="report-preview-title">Prévia do relatório</div>
                <ul>
                  <li><strong>Paciente:</strong> {selectedPatient.name}</li>
                  <li><strong>Atividades registradas:</strong> {selectedPatient.activities?.length || 0}</li>
                  <li><strong>Riscos marcados:</strong> {selectedPatient.risks?.length || 0}</li>
                  <li><strong>Status:</strong> {selectedPatient.status || 'stable'}</li>
                </ul>
              </div>
            )}

            <div className="report-actions">
              <button type="button" className="btn-cancel-profile" onClick={() => setShowReportModal(false)}>
                Cancelar
              </button>
              <button type="button" className="btn-save-profile" onClick={handleExportReport}>
                📄 Gerar PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {showToast && (
        <div className="toast show">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default Perfil;
