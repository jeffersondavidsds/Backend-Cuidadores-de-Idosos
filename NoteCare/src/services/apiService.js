export const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://backend-cuidadores-de-idosos.onrender.com';

export const apiService = {
  async request(endpoint, method = 'GET', data = null, token = null) {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = { method, headers };
    if (data) options.body = JSON.stringify(data);

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro na requisição');
      }

      return result;
    } catch (error) {
      throw error;
    }
  },

  async register(name, email, password, registration) {
    return this.request('/auth/register', 'POST', { name, email, password, registration });
  },

  async login(email, password) {
    return this.request('/auth/login', 'POST', { email, password });
  },

  async verifyOTP(userId, otpCode) {
    return this.request('/auth/verify-otp', 'POST', { userId, otpCode });
  },

  async getPatients(token) {
    return this.request('/api/patients', 'GET', null, token);
  },

  async getPatient(id, token) {
    return this.request(`/api/patients/${id}`, 'GET', null, token);
  },

  async createPatient(patientData, token) {
    return this.request('/api/patients', 'POST', patientData, token);
  },

  async updatePatient(id, data, token) {
    return this.request(`/api/patients/${id}`, 'PUT', data, token);
  },

  async deletePatient(id, token) {
    return this.request(`/api/patients/${id}`, 'DELETE', null, token);
  },

  async createActivity(patientId, data, token) {
    return this.request(`/api/patients/${patientId}/activities`, 'POST', data, token);
  },

  async updateActivity(patientId, activityId, data, token) {
    return this.request(`/api/patients/${patientId}/activities/${activityId}`, 'PUT', data, token);
  },

  async deleteActivity(patientId, activityId, token) {
    return this.request(`/api/patients/${patientId}/activities/${activityId}`, 'DELETE', null, token);
  }
};