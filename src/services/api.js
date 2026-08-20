import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export const checkHealth = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/health`);
    return res.data;
  } catch (err) {
    return { status: 'offline', token_valid: false, error: err.message };
  }
};

export const fetchStats = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/stats`);
    return res.data;
  } catch (err) {
    return null;
  }
};

export const calculatePrice = async (data) => {
  const res = await axios.post(`${API_BASE_URL}/calculate`, data);
  return res.data;
};

export const uploadCSV = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await axios.post(`${API_BASE_URL}/sync/upload-csv`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const executeSync = async (margenPct = 0.0) => {
  const res = await axios.post(`${API_BASE_URL}/sync/execute`, { margen_adicional_pct: margenPct });
  return res.data;
};

export const fetchSyncStatus = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/sync/status`);
    return res.data;
  } catch (err) {
    return null;
  }
};

export const fetchItems = async (limit = 50, forceRefresh = false) => {
  try {
    const url = forceRefresh 
      ? `${API_BASE_URL}/items?limit=${limit}&force_refresh=true`
      : `${API_BASE_URL}/items?limit=${limit}`;
    const res = await axios.get(url);
    return res.data;
  } catch (err) {
    return [];
  }
};

export const refreshItemsCache = async () => {
  try {
    const res = await axios.post(`${API_BASE_URL}/items/refresh`);
    return res.data;
  } catch (err) {
    return [];
  }
};

export const updateSingleItem = async (itemId, data) => {
  const res = await axios.post(`${API_BASE_URL}/items/${itemId}/update`, data);
  return res.data;
};

export const fetchRules = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/config/settings`);
    return res.data;
  } catch (err) {
    return { 
      general_discount_pct: 30.0, 
      shipping_discount_pct: 50.0,
      default_tax_rate_pct: 0.65,
      default_listing_type: 'gold_special',
      tolerance_pct: 5.0,
      excluded_categories: [], 
      excluded_keywords: ['mueble', 'aluminio'],
      pack_multipliers: {},
      custom_multipliers: {}
    };
  }
};

export const saveRules = async (settings) => {
  const res = await axios.post(`${API_BASE_URL}/config/settings`, settings);
  return res.data;
};

export const fetchAppSettings = fetchRules;
export const saveAppSettings = saveRules;

export const fetchAnalyticsSummary = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/analytics/summary`);
    return res.data;
  } catch (err) {
    return null;
  }
};

export const simulateAdvancedPrice = async (data) => {
  const res = await axios.post(`${API_BASE_URL}/calculator/simulate`, data);
  return res.data;
};

export const fetchAuditReport = async (tolerancePct = 5.0) => {
  const res = await axios.get(`${API_BASE_URL}/audit?tolerance_pct=${tolerancePct}`);
  return res.data;
};

export const fetchLogs = async (lines = 30) => {
  try {
    const res = await axios.get(`${API_BASE_URL}/logs?lines=${lines}`);
    return res.data.logs || [];
  } catch (err) {
    return ['⚠️ No se pudo conectar al servidor de logs.'];
  }
};


