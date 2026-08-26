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

// =============================================================================
// SERVICIOS TIENDANUBE (NUVEMSHOP)
// =============================================================================

export const checkTiendanubeHealth = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/tiendanube/health`);
    return res.data;
  } catch (err) {
    return { status: 'offline', configured: false, detail: err.message };
  }
};

export const fetchTiendanubeMetrics = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/tiendanube/metrics`);
    return res.data;
  } catch (err) {
    return { total_products: 0, active_products: 0, out_of_stock: 0, total_valuation: 0 };
  }
};

export const fetchTiendanubeItems = async (search = '', categoryId = null, limit = null, offset = 0) => {
  try {
    const params = {};
    if (limit !== null && limit !== undefined) params.limit = limit;
    if (offset) params.offset = offset;
    if (search) params.search = search;
    if (categoryId) params.category_id = categoryId;
    const res = await axios.get(`${API_BASE_URL}/tiendanube/items`, { params });
    return res.data.items || [];
  } catch (err) {
    return [];
  }
};

export const fetchTiendanubeItemDetail = async (productId) => {
  const res = await axios.get(`${API_BASE_URL}/tiendanube/items/${productId}`);
  return res.data;
};

export const refreshTiendanubeCatalog = async () => {
  const res = await axios.post(`${API_BASE_URL}/tiendanube/items/refresh`);
  return res.data;
};

export const createTiendanubeProduct = async (productData) => {
  const res = await axios.post(`${API_BASE_URL}/tiendanube/items/create`, productData);
  return res.data;
};

export const updateTiendanubeProduct = async (productId, productData) => {
  const res = await axios.put(`${API_BASE_URL}/tiendanube/items/${productId}`, productData);
  return res.data;
};

export const deleteTiendanubeProduct = async (productId) => {
  const res = await axios.delete(`${API_BASE_URL}/tiendanube/items/${productId}`);
  return res.data;
};

export const updateTiendanubeVariant = async (productId, variantId, variantData) => {
  const res = await axios.put(`${API_BASE_URL}/tiendanube/items/${productId}/variants/${variantId}`, variantData);
  return res.data;
};

export const updateTiendanubeStock = async (productId, stockData) => {
  const res = await axios.post(`${API_BASE_URL}/tiendanube/items/${productId}/stock`, stockData);
  return res.data;
};

export const fetchTiendanubeCategories = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/tiendanube/categories`);
    return res.data;
  } catch (err) {
    return [];
  }
};

export const fetchTiendanubeVariants = async (search = '', categoryId = null, limit = null, offset = 0) => {
  try {
    const params = {};
    if (limit !== null && limit !== undefined) params.limit = limit;
    if (offset) params.offset = offset;
    if (search) params.search = search;
    if (categoryId) params.category_id = categoryId;
    const res = await axios.get(`${API_BASE_URL}/tiendanube/variants`, { params });
    return res.data.variants || [];
  } catch (err) {
    return [];
  }
};

export const saveTiendanubeVariantOverride = async (variantId, data) => {
  const res = await axios.post(`${API_BASE_URL}/tiendanube/variants/${variantId}/override`, data);
  return res.data;
};

export const fetchTiendanubeCategoriesTree = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/tiendanube/categories/tree`);
    return res.data || [];
  } catch (err) {
    return [];
  }
};

export const refreshTiendanubeCategories = async () => {
  const res = await axios.post(`${API_BASE_URL}/tiendanube/categories/refresh`);
  return res.data;
};

export const saveTiendanubeCategoryDiscount = async (categoryId, discountPct) => {
  const res = await axios.post(`${API_BASE_URL}/tiendanube/categories/${categoryId}/discount`, {
    discount_pct: discountPct
  });
  return res.data;
};

export const fetchTiendanubeAudit = async (tolerancePct = 2.0) => {
  try {
    const res = await axios.get(`${API_BASE_URL}/tiendanube/audit?tolerance_pct=${tolerancePct}`);
    return res.data;
  } catch (err) {
    return { tolerance_pct: tolerancePct, total_variants: 0, count_ok: 0, count_diff: 0, count_no_erp: 0, items: [] };
  }
};

export const fixTiendanubeVariantsBatch = async (items) => {
  const res = await axios.post(`${API_BASE_URL}/tiendanube/audit/fix-batch`, {
    items: items
  });
  return res.data;
};

export const executeTiendanubeSync = async (params = {}) => {
  const res = await axios.post(`${API_BASE_URL}/tiendanube/sync/execute`, params);
  return res.data;
};

export const fetchTiendanubeSyncStatus = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/tiendanube/sync/status`);
    return res.data;
  } catch (err) {
    return null;
  }
};

export const fetchTiendanubeSyncHistory = async (limit = 50) => {
  try {
    const res = await axios.get(`${API_BASE_URL}/tiendanube/sync/history?limit=${limit}`);
    return res.data;
  } catch (err) {
    return [];
  }
};




