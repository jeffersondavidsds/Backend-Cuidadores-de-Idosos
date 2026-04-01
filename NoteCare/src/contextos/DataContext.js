import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { apiService } from '../services/apiService';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData deve ser usado dentro de DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getToken, isAuthenticated } = useAuth();

  const loadPatients = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await apiService.getPatients(token);
      if (response.success) {
        setPatients(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  // Carregar pacientes quando autenticado
  useEffect(() => {
    if (isAuthenticated && getToken()) {
      loadPatients();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, getToken, loadPatients]);

  const addPatient = async (patientData) => {
    try {
      const token = getToken();
      const response = await apiService.createPatient(patientData, token);

      if (response.success) {
        await loadPatients();
        return { success: true, patientId: response.patientId };
      }

      return { success: false, error: response.error };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updatePatient = async (patientId, updatedData) => {
    try {
      const token = getToken();
      const response = await apiService.updatePatient(patientId, updatedData, token);

      if (response.success) {
        await loadPatients();
        return { success: true };
      }

      return { success: false, error: response.error };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const deletePatient = async (patientId) => {
    try {
      const token = getToken();
      const response = await apiService.deletePatient(patientId, token);

      if (response.success) {
        await loadPatients();
        return { success: true };
      }

      return { success: false, error: response.error };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const getPatientById = async (patientId) => {
    try {
      const token = getToken();
      const response = await apiService.getPatient(patientId, token);

      if (response.success) {
        return response.data;
      }

      return null;
    } catch (error) {
      console.error('Erro ao buscar paciente:', error);
      return null;
    }
  };

  // ============================================
  // ATIVIDADES
  // ============================================

  const addActivity = async (patientId, activityData) => {
    try {
      const token = getToken();
      const formattedData = {
        type: activityData.type,
        desc: activityData.desc || activityData.description,
        date: activityData.date || new Date().toISOString()
      };

      const response = await apiService.createActivity(patientId, formattedData, token);

      if (response.success) {
        return { success: true, activityId: response.activityId };
      }

      return { success: false, error: response.error };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updateActivity = async (patientId, activityId, updatedData) => {
    try {
      const token = getToken();
      const formattedData = {
        type: updatedData.type,
        desc: updatedData.desc || updatedData.description,
        date: updatedData.date
      };

      const response = await apiService.updateActivity(patientId, activityId, formattedData, token);

      if (response.success) {
        return { success: true };
      }

      return { success: false, error: response.error };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const deleteActivity = async (patientId, activityId) => {
    try {
      const token = getToken();
      const response = await apiService.deleteActivity(patientId, activityId, token);

      if (response.success) {
        return { success: true };
      }

      return { success: false, error: response.error };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    patients,
    loading,
    addPatient,
    updatePatient,
    deletePatient,
    getPatientById,
    addActivity,
    updateActivity,
    deleteActivity,
    refreshPatients: loadPatients
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};