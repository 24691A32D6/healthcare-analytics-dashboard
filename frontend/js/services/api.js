// Healthcare Analytics & Disease Prediction - Frontend API Service Client
const API_BASE = window.location.origin.includes('5000') 
  ? '' 
  : 'http://127.0.0.1:5000';

const api = {
  // System Health
  async getHealth() {
    const res = await fetch(`${API_BASE}/api/health`);
    return await res.json();
  },

  // Dashboard Analytics
  async getDashboard() {
    const res = await fetch(`${API_BASE}/api/analytics/dashboard`);
    return await res.json();
  },

  // Patients Management
  async getPatients(filters = {}) {
    const params = new URLSearchParams();
    if (filters.q) params.append('q', filters.q);
    if (filters.gender) params.append('gender', filters.gender);
    if (filters.diabetes_risk) params.append('diabetes_risk', filters.diabetes_risk);
    if (filters.heart_risk) params.append('heart_risk', filters.heart_risk);
    if (filters.bmi_category) params.append('bmi_category', filters.bmi_category);
    if (filters.sort_by) params.append('sort_by', filters.sort_by);
    if (filters.order) params.append('order', filters.order);

    const res = await fetch(`${API_BASE}/api/patients?${params.toString()}`);
    return await res.json();
  },

  async getPatient(id) {
    const res = await fetch(`${API_BASE}/api/patients/${id}`);
    return await res.json();
  },

  async createPatient(data) {
    const res = await fetch(`${API_BASE}/api/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  async updatePatient(id, data) {
    const res = await fetch(`${API_BASE}/api/patients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  async deletePatient(id) {
    const res = await fetch(`${API_BASE}/api/patients/${id}`, {
      method: 'DELETE'
    });
    return await res.json();
  },

  async addMedicalRecord(patientId, recordData) {
    const res = await fetch(`${API_BASE}/api/patients/${patientId}/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(recordData)
    });
    return await res.json();
  },

  // Exploratory Data Analysis & Plots
  async getEDA() {
    const res = await fetch(`${API_BASE}/api/analytics/eda`);
    return await res.json();
  },

  async getPlots() {
    const res = await fetch(`${API_BASE}/api/analytics/plots`);
    return await res.json();
  },

  // Machine Learning Prediction
  async getModelMetrics(disease) {
    const res = await fetch(`${API_BASE}/api/predict/metrics/${disease}`);
    return await res.json();
  },

  async predictDiabetes(data) {
    const res = await fetch(`${API_BASE}/api/predict/diabetes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  async predictHeart(data) {
    const res = await fetch(`${API_BASE}/api/predict/heart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  async getPredictionHistory() {
    const res = await fetch(`${API_BASE}/api/predict/history`);
    return await res.json();
  },

  // Datasets
  async getDatasets() {
    const res = await fetch(`${API_BASE}/api/datasets/list`);
    return await res.json();
  },

  async getDatasetPreview(id) {
    const res = await fetch(`${API_BASE}/api/datasets/preview/${id}`);
    return await res.json();
  },

  async uploadDataset(formData) {
    const res = await fetch(`${API_BASE}/api/datasets/upload`, {
      method: 'POST',
      body: formData
    });
    return await res.json();
  }
};

window.api = api;
