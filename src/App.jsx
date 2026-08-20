import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  RefreshCw, 
  Calculator, 
  BarChart3, 
  CheckCircle2, 
  AlertCircle, 
  UploadCloud, 
  Play,
  PackageSearch,
  Search,
  ExternalLink,
  Edit3,
  Settings as SettingsIcon,
  Save,
  Filter,
  ArrowUpDown,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Terminal,
  X,
  Check,
  Info,
  PackageX,
  FileSpreadsheet,
  Zap,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  Eye,
  DollarSign,
  Truck,
  Percent,
  Sliders,
  Award,
  Layers,
  Sparkles,
  SlidersHorizontal,
  Tag
} from 'lucide-react';
import { 
  checkHealth, 
  fetchStats, 
  calculatePrice,
  simulateAdvancedPrice,
  fetchAnalyticsSummary,
  uploadCSV, 
  executeSync, 
  fetchSyncStatus,
  fetchItems, 
  updateSingleItem,
  fetchAppSettings,
  saveAppSettings,
  fetchAuditReport,
  fetchLogs
} from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [health, setHealth] = useState({ status: 'checking', token_valid: false });
  const [stats, setStats] = useState(null);

  // Sistema de Notificaciones Toast
  const [toasts, setToasts] = useState([]);
  const addToast = (type, title, message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Diálogo de Confirmación Masiva
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    onConfirm: null
  });

  // Ítems, filtros y ordenamiento
  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  const [expandedItems, setExpandedItems] = useState({});

  const toggleVariations = (itemId) => {
    setExpandedItems(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({
    sku: '',
    title: '',
    precio_mostrador: '',
    price_ml: '',
    status: 'active',
    category_id: ''
  });
  const [updating, setUpdating] = useState(false);

  const openEditModal = (item) => {
    setEditingItem(item);
    setEditForm({
      sku: item.sku && item.sku !== 'N/A' && item.sku !== 'Sin SKU' ? item.sku : '',
      title: item.title || '',
      precio_mostrador: item.precio_mostrador || '',
      price_ml: item.price || '',
      status: item.status || 'active',
      category_id: item.category_id || 'MLA3530'
    });
  };

  const handleUpdateItem = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    setUpdating(true);
    try {
      const payload = {
        category_id: editForm.category_id || 'MLA3530',
        listing_type_id: 'gold_special',
        margen_adicional_pct: 0.0
      };

      if (editForm.sku) payload.sku = editForm.sku;
      if (editForm.title) payload.title = editForm.title;
      if (editForm.status) payload.status = editForm.status;
      if (editForm.precio_mostrador) payload.precio_mostrador = parseFloat(editForm.precio_mostrador);
      if (editForm.price_ml) payload.price_ml = parseFloat(editForm.price_ml);

      await updateSingleItem(editingItem.id, payload);
      addToast('success', 'Publicación Actualizada', `Se guardaron los cambios en ${editingItem.id}.`);
      setEditingItem(null);
      loadItems();
    } catch (err) {
      addToast('error', 'Error de Actualización', `No se pudieron guardar los cambios: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  // Formulario Calculadora Avanzada v0.2.0
  const [calcForm, setCalcForm] = useState({
    precio_mostrador: 10000,
    category_id: 'MLA3530',
    listing_type_id: 'gold_special',
    margen_pct: 0.0,
    tax_rate_pct: 0.65,
    shipping_cost_override: '',
    reputation_discount_pct: 50.0,
    has_free_shipping: true
  });
  const [calcResult, setCalcResult] = useState(null);
  const [calcLoading, setCalcLoading] = useState(false);

  // Sincronizador y Feedback en Vivo
  const [file, setFile] = useState(null);
  const [syncStatus, setSyncStatus] = useState('');
  const [syncProgress, setSyncProgress] = useState({ is_running: false, total: 0, current: 0, success_count: 0, fail_count: 0, logs: [] });

  // Configuración General del Sistema v0.2.0
  const [settingsForm, setSettingsForm] = useState({
    general_discount_pct: 30.0,
    shipping_discount_pct: 50.0,
    default_tax_rate_pct: 0.65,
    default_listing_type: 'gold_special',
    tolerance_pct: 5.0,
    excluded_categories: ['MLA30088', 'MLA7141', 'MLA30069', 'MLA30038', 'MLA436380', 'MLA454690', 'MLA454704', 'MLA436382'],
    excluded_keywords: ['mueble', 'aluminio'],
    pack_multipliers: {},
    custom_multipliers: {}
  });
  const [settingsActiveSubTab, setSettingsActiveSubTab] = useState('general');
  const [settingsSaving, setSettingsSaving] = useState(false);

  // Analíticas Avanzadas de Mercado Libre
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Módulo de Auditoría de Neto a Recibir
  const [auditReport, setAuditReport] = useState(null);
  const [auditLoading, setAuditLoading] = useState(false);
  const [tolerancePct, setTolerancePct] = useState(5.0);
  const [inspectingAuditItem, setInspectingAuditItem] = useState(null);

  // Fechas y horas de última actualización persistentes
  const [itemsLastUpdated, setItemsLastUpdated] = useState(() => localStorage.getItem('meli_items_last_updated') || null);
  const [auditLastUpdated, setAuditLastUpdated] = useState(() => localStorage.getItem('meli_audit_last_updated') || null);

  const [healthRefreshing, setHealthRefreshing] = useState(false);
  const [backendLogs, setBackendLogs] = useState([]);
  const [cliExpanded, setCliExpanded] = useState(true);

  // Polling de logs del backend
  useEffect(() => {
    const loadLogs = async () => {
      const logs = await fetchLogs(40);
      setBackendLogs(logs);
    };
    loadLogs();
    const interval = setInterval(loadLogs, 3000);
    return () => clearInterval(interval);
  }, []);

  // Polling del progreso de sincronización
  useEffect(() => {
    const checkProgress = async () => {
      const prog = await fetchSyncStatus();
      if (prog) {
        setSyncProgress(prog);
      }
    };
    checkProgress();
    const interval = setInterval(checkProgress, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadHealthAndStats();
    loadAppSettingsData();
    loadAnalytics();
  }, []);

  useEffect(() => {
    if (activeTab === 'items') {
      loadItems();
    } else if (activeTab === 'dashboard') {
      loadAnalytics();
    }
  }, [activeTab]);

  const loadHealthAndStats = async () => {
    setHealthRefreshing(true);
    const h = await checkHealth();
    setHealth(h);
    if (h.token_valid) {
      const s = await fetchStats();
      setStats(s);
      addToast('success', 'Conexión Establecida', `Conectado como ${h.nickname || 'Vendedor'}`);
    } else {
      addToast('error', 'Error de Autenticación', 'No se pudo conectar con Mercado Libre o el Token expiró.');
    }
    setHealthRefreshing(false);
  };

  const loadAnalytics = async () => {
    setAnalyticsLoading(true);
    const an = await fetchAnalyticsSummary();
    if (an) setAnalyticsData(an);
    setAnalyticsLoading(false);
  };

  const loadAppSettingsData = async () => {
    const data = await fetchAppSettings();
    if (data) {
      setSettingsForm(prev => ({ ...prev, ...data }));
      if (data.tolerance_pct) setTolerancePct(data.tolerance_pct);
    }
  };

  const handleSaveSettings = async (e) => {
    if (e) e.preventDefault();
    setSettingsSaving(true);
    try {
      await saveAppSettings(settingsForm);
      addToast('success', 'Configuración Guardada', 'Preferencias del sistema y reglas actualizadas.');
    } catch (err) {
      addToast('error', 'Error', `No se pudo guardar la configuración: ${err.message}`);
    } finally {
      setSettingsSaving(false);
    }
  };

  const loadItems = async (forceRefresh = false) => {
    setItemsLoading(true);
    const data = await fetchItems(50, forceRefresh);
    setItems(data);
    
    // Obtener la fecha/hora más reciente de los ítems o la actual si se forzó el refresh
    const nowStr = new Date().toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'medium' });
    let mostRecent = nowStr;
    if (!forceRefresh && data && data.length > 0) {
      const itemWithUpdate = data.find(it => it.updated_at || it.last_updated);
      if (itemWithUpdate && itemWithUpdate.updated_at) {
        try {
          mostRecent = new Date(itemWithUpdate.updated_at).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'medium' });
        } catch {
          mostRecent = itemWithUpdate.updated_at;
        }
      }
    }
    setItemsLastUpdated(mostRecent);
    localStorage.setItem('meli_items_last_updated', mostRecent);
    setItemsLoading(false);
  };

  const handleCalculate = async (e) => {
    e.preventDefault();
    setCalcLoading(true);
    try {
      const payload = {
        precio_mostrador: parseFloat(calcForm.precio_mostrador),
        category_id: calcForm.category_id || 'MLA3530',
        listing_type_id: calcForm.listing_type_id || 'gold_special',
        margen_pct: parseFloat(calcForm.margen_pct) || 0.0,
        tax_rate_pct: parseFloat(calcForm.tax_rate_pct) || 0.65,
        reputation_discount_pct: parseFloat(calcForm.reputation_discount_pct) || 50.0,
        has_free_shipping: Boolean(calcForm.has_free_shipping),
        shipping_cost_override: calcForm.shipping_cost_override ? parseFloat(calcForm.shipping_cost_override) : null
      };
      const res = await simulateAdvancedPrice(payload);
      setCalcResult(res);
      addToast('info', 'Simulación Completada', `Precio publicado sugerido: $${res.precio_publicado_sugerido?.toLocaleString()}`);
    } catch (err) {
      addToast('error', 'Error de Cálculo', err.message);
    } finally {
      setCalcLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    try {
      const res = await uploadCSV(selectedFile);
      setSyncStatus(`✓ Archivo '${selectedFile.name}' cargado correctamente.`);
      addToast('success', 'Archivo CSV Cargado', `Planilla '${selectedFile.name}' lista para procesar.`);
    } catch (err) {
      setSyncStatus(`❌ Error al subir CSV: ${err.message}`);
      addToast('error', 'Error al Subir Planilla', err.message);
    }
  };

  const triggerSyncExecution = async () => {
    try {
      const res = await executeSync(calcForm.margen_adicional_pct);
      setSyncStatus(`🚀 ${res.message}`);
      addToast('info', 'Sincronización Iniciada', 'Procesando actualización de precios en segundo plano...');
    } catch (err) {
      setSyncStatus(`❌ Error al iniciar sincronización: ${err.message}`);
      addToast('error', 'Error de Ejecución', err.message);
    }
  };

  const handleRunSync = () => {
    setConfirmDialog({
      open: true,
      title: 'Confirmar Sincronización Masiva',
      message: '¿Estás seguro de iniciar la sincronización masiva de precios contra Mercado Libre? Se actualizarán todas las publicaciones coincidentes en la planilla.',
      onConfirm: triggerSyncExecution
    });
  };



  const loadAuditReport = async () => {
    setAuditLoading(true);
    try {
      const data = await fetchAuditReport(tolerancePct);
      if (data && data.total_auditados !== undefined) {
        setAuditReport(data);
        const auditTime = data.timestamp || new Date().toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'medium' });
        setAuditLastUpdated(auditTime);
        localStorage.setItem('meli_audit_last_updated', auditTime);
        addToast('info', 'Auditoría Finalizada', `Se auditaron ${data.total_auditados} publicaciones.`);
      } else {
        addToast('error', 'Error en Auditoría', 'El servidor no devolvió resultados válidos.');
      }
    } catch (err) {
      addToast('error', 'Error en Auditoría', err.response?.data?.detail || err.message);
    } finally {
      setAuditLoading(false);
    }
  };

  // Estado para la tabla de Publicaciones
  const [skuFilter, setSkuFilter] = useState('all'); // all, with_sku, no_sku

  // Estado para la tabla de Auditoría
  const [auditSearchTerm, setAuditSearchTerm] = useState('');
  const [auditStatusFilter, setAuditStatusFilter] = useState('all');
  const [auditSkuFilter, setAuditSkuFilter] = useState('all'); // all, with_sku, no_sku
  const [auditSortBy, setAuditSortBy] = useState('title');
  const [auditSortOrder, setAuditSortOrder] = useState('asc');

  const handleSortItems = (columnKey) => {
    if (sortBy === columnKey) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(columnKey);
      setSortOrder('asc');
    }
  };

  const handleSortAudit = (columnKey) => {
    if (auditSortBy === columnKey) {
      setAuditSortOrder(auditSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setAuditSortBy(columnKey);
      setAuditSortOrder('asc');
    }
  };

  const filteredItems = items
    .filter(item => {
      const matchSearch = 
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'all' || item.status === statusFilter;

      const hasSku = item.sku && item.sku !== 'Sin SKU' && item.sku !== 'N/A' && item.sku.trim() !== '';
      const matchSku = skuFilter === 'all' || (skuFilter === 'with_sku' ? hasSku : !hasSku);

      return matchSearch && matchStatus && matchSku;
    })
    .sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (sortBy === 'precio_mostrador') {
        valA = a.precio_mostrador || Math.round(a.price * 0.70);
        valB = b.precio_mostrador || Math.round(b.price * 0.70);
      } else if (sortBy === 'margen') {
        const pmA = a.precio_mostrador || Math.round(a.price * 0.70);
        const pmB = b.precio_mostrador || Math.round(b.price * 0.70);
        valA = pmA > 0 ? ((a.price - pmA) / pmA) : 0;
        valB = pmB > 0 ? ((b.price - pmB) / pmB) : 0;
      }

      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  // Evaluación y KPIs dinámicos en vivo según la tolerancia seleccionada
  const dynamicAuditItems = (auditReport?.items || []).map(item => {
    let evalStatus = "SIN_ERP";
    if (item.precio_mostrador_erp && item.precio_mostrador_erp > 0) {
      if (Math.abs(item.diferencia_pct) <= tolerancePct) {
        evalStatus = "OK";
      } else if (item.neto_a_recibir < item.precio_mostrador_erp) {
        evalStatus = "BAJO";
      } else {
        evalStatus = "ALTO";
      }
    }
    return {
      ...item,
      status_evaluacion: evalStatus
    };
  });

  const dynamicAuditCounts = {
    total: dynamicAuditItems.length,
    en_rango_ok: dynamicAuditItems.filter(i => i.status_evaluacion === 'OK').length,
    recibe_menos: dynamicAuditItems.filter(i => i.status_evaluacion === 'BAJO').length,
    recibe_mas: dynamicAuditItems.filter(i => i.status_evaluacion === 'ALTO').length,
    sin_erp: dynamicAuditItems.filter(i => i.status_evaluacion === 'SIN_ERP').length,
  };

  const filteredAuditItems = dynamicAuditItems
    .filter(item => {
      const matchSearch = 
        item.title?.toLowerCase().includes(auditSearchTerm.toLowerCase()) || 
        item.item_id?.toLowerCase().includes(auditSearchTerm.toLowerCase()) ||
        item.sku?.toLowerCase().includes(auditSearchTerm.toLowerCase());

      const matchStatus = auditStatusFilter === 'all' || item.status_evaluacion === auditStatusFilter;

      const hasSku = item.sku && item.sku !== 'Sin SKU' && item.sku !== 'N/A' && item.sku.trim() !== '';
      const matchSku = auditSkuFilter === 'all' || (auditSkuFilter === 'with_sku' ? hasSku : !hasSku);

      return matchSearch && matchStatus && matchSku;
    })
    .sort((a, b) => {
      let valA = a[auditSortBy];
      let valB = b[auditSortBy];

      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return auditSortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return auditSortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  return (
    <div className="flex h-screen w-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      
      {/* CONTENEDOR DE TOASTS FLOTANTES */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map(toast => (
          <div 
            key={toast.id} 
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border text-sm animate-in slide-in-from-top-2 duration-200 ${
              toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
              toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-900' :
              toast.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-900' :
              'bg-blue-50 border-blue-200 text-blue-900'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
              {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-blue-600" />}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold">{toast.title}</h4>
              <p className="text-xs mt-0.5 opacity-90">{toast.message}</p>
            </div>
            <button 
              onClick={() => removeToast(toast.id)} 
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded-lg hover:bg-slate-200/50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* DIÁLOGO MODAL DE CONFIRMACIÓN */}
      {confirmDialog.open && (
        <div 
          onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-150"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100 flex flex-col gap-4"
          >
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-3 bg-red-50 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{confirmDialog.title}</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{confirmDialog.message}</p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button 
                onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  confirmDialog.onConfirm && confirmDialog.onConfirm();
                  setConfirmDialog({ ...confirmDialog, open: false });
                }}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-sm transition-colors shadow-sm"
              >
                Confirmar Sincronización
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR NAVEGACIÓN */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col p-5 shrink-0 justify-between">
        <div className="flex flex-col gap-6">
          
          {/* LOGO & BRAND */}
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="p-2.5 bg-red-600 text-white rounded-xl shadow-md shadow-red-200">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 leading-tight">Sync MeLi</h1>
              <p className="text-xs text-slate-500 font-medium">Corralón Aconquija</p>
            </div>
          </div>

          {/* MENÚ DE SECCIONES */}
          <nav className="flex flex-col gap-1.5">
            <button 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                activeTab === 'dashboard' ? 'bg-red-600 text-white shadow-md shadow-red-100 font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
              onClick={() => setActiveTab('dashboard')}
            >
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </button>

            <button 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                activeTab === 'items' ? 'bg-red-600 text-white shadow-md shadow-red-100 font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
              onClick={() => setActiveTab('items')}
            >
              <PackageSearch className="w-4 h-4" /> Publicaciones
            </button>

            <button 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                activeTab === 'sync' ? 'bg-red-600 text-white shadow-md shadow-red-100 font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
              onClick={() => setActiveTab('sync')}
            >
              <UploadCloud className="w-4 h-4" /> Sincronizador ERP
            </button>

            <button 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                activeTab === 'audit' ? 'bg-red-600 text-white shadow-md shadow-red-100 font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
              onClick={() => { setActiveTab('audit'); if(!auditReport) loadAuditReport(); }}
            >
              <ShieldCheck className="w-4 h-4" /> Auditoría de Precios
            </button>

            <button 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                activeTab === 'calculator' ? 'bg-red-600 text-white shadow-md shadow-red-100 font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
              onClick={() => setActiveTab('calculator')}
            >
              <Calculator className="w-4 h-4" /> Calculadora & Simulador
            </button>

            <button 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                activeTab === 'rules' ? 'bg-red-600 text-white shadow-md shadow-red-100 font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
              onClick={() => setActiveTab('rules')}
            >
              <SettingsIcon className="w-4 h-4" /> Configuración
            </button>
          </nav>
        </div>

        {/* WIDGET MINI CLI LOGS */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-inner flex flex-col">
          <div className="flex items-center justify-between px-3 py-2 bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold text-slate-400">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Terminal className="w-3.5 h-3.5 text-red-500" />
              <span>Backend Logs</span>
            </div>
            <button 
              onClick={() => setCliExpanded(!cliExpanded)}
              className="text-slate-500 hover:text-slate-300 p-0.5"
              title={cliExpanded ? "Minimizar" : "Expandir"}
            >
              {cliExpanded ? "_" : "□"}
            </button>
          </div>

          {cliExpanded && (
            <div className="h-36 p-2 overflow-y-auto font-mono text-[10px] flex flex-col gap-1 bg-slate-950/80">
              {backendLogs.length === 0 ? (
                <div className="text-slate-600 italic">Esperando logs del backend...</div>
              ) : (
                backendLogs.map((log, idx) => (
                  <div key={idx} className={`leading-relaxed break-all ${
                    log.includes('ERROR') ? 'text-red-400' :
                    log.includes('OK') ? 'text-emerald-400' : 'text-slate-300'
                  }`}>
                    {log}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 flex flex-col p-8 overflow-y-auto bg-slate-50 gap-6">
        
        {/* PAGE HEADER & ESTADO DE AUTENTICACIÓN */}
        <header className="flex items-center justify-between pb-2 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {activeTab === 'dashboard' && 'Panel de Control & Analíticas'}
              {activeTab === 'items' && 'Inventario de Publicaciones'}
              {activeTab === 'sync' && 'Sincronizador Masivo desde ERP'}
              {activeTab === 'audit' && 'Auditoría de Neto a Recibir'}
              {activeTab === 'calculator' && 'Calculadora & Simulador Estratégico'}
              {activeTab === 'rules' && 'Configuración del Sistema'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">Gestión automatizada de precios, márgenes y analíticas para Mercado Libre</p>
          </div>

          {/* BADGE DE CONEXIÓN */}
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
              health.token_valid 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-red-50 text-red-700 border-red-200'
            }`}>
              {health.token_valid ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
              {health.token_valid ? `Conectado (${health.nickname})` : 'Backend / Token Expirado'}
            </div>

            <button
              onClick={loadHealthAndStats}
              disabled={healthRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm transition-colors disabled:opacity-50"
              title="Recomprobar conexión"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${healthRefreshing ? 'spinning' : ''}`} />
              {healthRefreshing ? 'Verificando...' : 'Reconectar'}
            </button>
          </div>
        </header>

        {/* BANNER SI ESTÁ OFFLINE */}
        {!health.token_valid && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-4 text-amber-900 shadow-sm">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm">Atención: Token o Backend Desconectado</h4>
              <p className="text-xs text-amber-800 mt-0.5">La sesión de Mercado Libre requiere reconexión o renovación de credenciales en el backend.</p>
            </div>
            <button 
              onClick={loadHealthAndStats}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold transition-colors"
            >
              Reintentar Conexión
            </button>
          </div>
        )}

        {/* TAB 1: DASHBOARD & ANALÍTICAS ME LI */}
        {activeTab === 'dashboard' && (
          <div className="flex flex-col gap-6">
            {/* KPI CARDS SUPERIORES */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Estado Backend</span>
                  <div className={`w-2.5 h-2.5 rounded-full ${health.status === 'online' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                </div>
                <span className={`text-xl font-black ${health.status === 'online' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {health.status.toUpperCase()}
                </span>
                <p className="text-xs text-slate-500 truncate">Cuenta: {health.nickname || 'Sin Autenticar'}</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Reputación MeLi</span>
                  <Award className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-emerald-600 uppercase">
                    {analyticsData?.reputation_level ? analyticsData.reputation_level.replace('_', ' ') : (stats?.reputacion_nivel || 'Verde')}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {analyticsData?.power_seller_status ? `MercadoLíder ${analyticsData.power_seller_status}` : 'Vendedor Confiable'}
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Publicaciones Activas</span>
                  <PackageSearch className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-xl font-black text-slate-900">
                  {analyticsData?.total_active_listings ?? stats?.publicaciones_activas ?? '---'}
                </span>
                <p className="text-xs text-slate-500">
                  Pausadas: {analyticsData?.total_paused_listings ?? stats?.publicaciones_pausadas ?? 0}
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Valuación Catálogo</span>
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-xl font-black text-slate-900">
                  ${(analyticsData?.total_inventory_valuation ?? stats?.valor_total_inventario ?? 0).toLocaleString('es-AR')}
                </span>
                <p className="text-xs text-slate-500">
                  Promedio: ${(analyticsData?.average_price ?? stats?.precio_promedio ?? 0).toLocaleString('es-AR')}
                </p>
              </div>
            </div>

            {/* SECCIÓN ANALÍTICAS DE VENTAS Y TRANSACCIONES */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-red-600" />
                    <h3 className="font-bold text-slate-900 text-sm">Métricas de Rendimiento y Reputación</h3>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">Período 365 días</span>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                    <span className="text-[11px] font-semibold text-slate-500 block">Ventas Completadas</span>
                    <span className="text-2xl font-black text-slate-900 mt-1 block">
                      {analyticsData?.sales_completed ?? 0}
                    </span>
                    <span className="text-[10px] text-slate-400">Transacciones exitosas</span>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                    <span className="text-[11px] font-semibold text-slate-500 block">Tasa de Reclamos</span>
                    <span className={`text-2xl font-black mt-1 block ${
                      (analyticsData?.claims_rate ?? 0) <= 2.0 ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {analyticsData?.claims_rate ?? 0.0}%
                    </span>
                    <span className="text-[10px] text-slate-400">Objetivo: &lt; 2.0%</span>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                    <span className="text-[11px] font-semibold text-slate-500 block">Envíos con Demora</span>
                    <span className={`text-2xl font-black mt-1 block ${
                      (analyticsData?.delayed_handling_rate ?? 0) <= 15.0 ? 'text-emerald-600' : 'text-amber-600'
                    }`}>
                      {analyticsData?.delayed_handling_rate ?? 0.0}%
                    </span>
                    <span className="text-[10px] text-slate-400">Despacho a tiempo</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Truck className="w-5 h-5 text-emerald-600" />
                    <div>
                      <span className="font-bold text-xs text-emerald-950 block">Cobertura de Envío Gratis Me2</span>
                      <span className="text-[11px] text-emerald-800">Publicaciones con Mercado Envíos bonificado</span>
                    </div>
                  </div>
                  <span className="text-xl font-black text-emerald-700">
                    {analyticsData?.free_shipping_pct ?? stats?.porcentaje_envio_gratis ?? 0}%
                  </span>
                </div>
              </div>

              {/* PANEL DE ALERTAS Y ACCIONES */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span>Alertas Operativas</span>
                  </div>
                  <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-bold">
                    {analyticsData?.alerts_count ?? 0}
                  </span>
                </div>

                <div className="flex flex-col gap-3 overflow-y-auto max-h-64">
                  {(!analyticsData?.alerts || analyticsData.alerts.length === 0) ? (
                    <div className="p-4 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                      <span>Todo en orden. No hay alertas críticas en la cuenta.</span>
                    </div>
                  ) : (
                    analyticsData.alerts.map((al, idx) => (
                      <div 
                        key={idx} 
                        className={`p-3.5 rounded-xl border text-xs flex flex-col gap-1 ${
                          al.type === 'danger' ? 'bg-red-50 border-red-200 text-red-900' :
                          al.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-900' :
                          'bg-blue-50 border-blue-200 text-blue-900'
                        }`}
                      >
                        <span className="font-bold">{al.title}</span>
                        <p className="text-[11px] opacity-90">{al.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PUBLICACIONES (INVENTARIO) */}
        {activeTab === 'items' && (
          <div className="flex flex-col gap-5">
            
            {/* TOOLBAR */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                
                {/* BUSCADOR */}
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-72 focus-within:border-red-600 transition-colors">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Buscar por ID, SKU o Título..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent border-none text-sm text-slate-900 outline-none w-full placeholder:text-slate-400"
                  />
                </div>

                {/* FILTRO ESTADO */}
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-3 py-2 outline-none hover:border-slate-300"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="active">🟢 Solo Activas</option>
                    <option value="paused">🔴 Solo Pausadas</option>
                  </select>
                </div>

                {/* FILTRO SKU PRESENTE / NA */}
                <div className="flex items-center gap-2">
                  <select 
                    value={skuFilter} 
                    onChange={(e) => setSkuFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-3 py-2 outline-none hover:border-slate-300"
                  >
                    <option value="all">SKU: Todos</option>
                    <option value="with_sku">✅ Con SKU asignado</option>
                    <option value="no_sku">⚠️ Sin SKU (N/A)</option>
                  </select>
                </div>

                {/* ORDENAR POR */}
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-slate-400" />
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-3 py-2 outline-none hover:border-slate-300"
                  >
                    <option value="title">Título</option>
                    <option value="price">Precio ML</option>
                    <option value="sku">SKU ERP</option>
                    <option value="id">ID MeLi</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {itemsLastUpdated && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100/80 border border-slate-200 px-3 py-1.5 rounded-xl font-medium" title="Fecha y hora de la última sincronización de publicaciones">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Últ. sinc.: <strong className="text-slate-700">{itemsLastUpdated}</strong></span>
                  </div>
                )}

                <button 
                  onClick={() => loadItems(true)} 
                  disabled={itemsLoading}
                  className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 shadow-sm"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${itemsLoading ? 'spinning' : ''}`} />
                  {itemsLoading ? 'Cargando...' : 'Refrescar Lista'}
                </button>
              </div>
            </div>

            {/* TABLA DE PUBLICACIONES */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              {itemsLoading ? (
                <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-3">
                  <RefreshCw className="w-8 h-8 spinning text-red-600" />
                  <p className="text-sm font-medium">Cargando publicaciones de Mercado Libre...</p>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-3 text-center">
                  <PackageX className="w-12 h-12 text-slate-300" />
                  <h4 className="text-base font-bold text-slate-700">No se encontraron publicaciones</h4>
                  <p className="text-xs text-slate-500 max-w-sm">No hay ítems que coincidan con la búsqueda o el filtro seleccionado.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider select-none">
                        <th className="py-3.5 px-4 cursor-pointer hover:bg-slate-100/80 transition-colors" onClick={() => handleSortItems('id')}>
                          <div className="flex items-center gap-1.5">
                            Ítem / ID {sortBy === 'id' && (sortOrder === 'asc' ? '▲' : '▼')}
                          </div>
                        </th>
                        <th className="py-3.5 px-4 cursor-pointer hover:bg-slate-100/80 transition-colors" onClick={() => handleSortItems('sku')}>
                          <div className="flex items-center gap-1.5">
                            SKU ERP {sortBy === 'sku' && (sortOrder === 'asc' ? '▲' : '▼')}
                          </div>
                        </th>
                        <th className="py-3.5 px-4 cursor-pointer hover:bg-slate-100/80 transition-colors" onClick={() => handleSortItems('title')}>
                          <div className="flex items-center gap-1.5">
                            Título {sortBy === 'title' && (sortOrder === 'asc' ? '▲' : '▼')}
                          </div>
                        </th>
                        <th className="py-3.5 px-4 cursor-pointer hover:bg-slate-100/80 transition-colors" onClick={() => handleSortItems('status')}>
                          <div className="flex items-center gap-1.5">
                            Estado {sortBy === 'status' && (sortOrder === 'asc' ? '▲' : '▼')}
                          </div>
                        </th>
                        <th className="py-3.5 px-4 cursor-pointer hover:bg-slate-100/80 transition-colors" onClick={() => handleSortItems('precio_mostrador')}>
                          <div className="flex items-center gap-1.5">
                            Precio Mostrador {sortBy === 'precio_mostrador' && (sortOrder === 'asc' ? '▲' : '▼')}
                          </div>
                        </th>
                        <th className="py-3.5 px-4 cursor-pointer hover:bg-slate-100/80 transition-colors" onClick={() => handleSortItems('price')}>
                          <div className="flex items-center gap-1.5">
                            Precio ML {sortBy === 'price' && (sortOrder === 'asc' ? '▲' : '▼')}
                          </div>
                        </th>
                        <th className="py-3.5 px-4 cursor-pointer hover:bg-slate-100/80 transition-colors" onClick={() => handleSortItems('margen')}>
                          <div className="flex items-center gap-1.5">
                            Margen {sortBy === 'margen' && (sortOrder === 'asc' ? '▲' : '▼')}
                          </div>
                        </th>
                        <th className="py-3.5 px-4 text-right">MeLi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredItems.map(item => {
                        const precioMostrador = item.precio_mostrador || Math.round(item.price * 0.70);
                        const incrementoPct = precioMostrador > 0 ? (((item.price - precioMostrador) / precioMostrador) * 100).toFixed(1) : '0.0';
                        const hasVariations = item.variations && item.variations.length > 0;
                        const isExpanded = expandedItems[item.id];

                        return (
                          <React.Fragment key={item.id}>
                            <tr 
                              onClick={() => openEditModal(item)}
                              className={`hover:bg-red-50/40 cursor-pointer transition-colors group ${isExpanded ? 'bg-slate-50/60' : ''}`}
                              title="Haz clic para modificar precios y datos de la publicación"
                            >
                              <td className="py-3 px-4 font-mono font-bold text-slate-900 group-hover:text-red-950">
                                <div className="flex items-center gap-2">
                                  {hasVariations ? (
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleVariations(item.id);
                                      }}
                                      className="p-1 hover:bg-slate-200 rounded-md text-slate-600 transition-colors"
                                      title="Ver variaciones"
                                    >
                                      {isExpanded ? <ChevronDown className="w-4 h-4 text-red-600" /> : <ChevronRight className="w-4 h-4" />}
                                    </button>
                                  ) : (
                                    <div className="w-6" />
                                  )}
                                  {item.thumbnail ? (
                                    <img src={item.thumbnail} alt="" className="w-8 h-8 rounded-lg object-cover border border-slate-200" />
                                  ) : (
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200" />
                                  )}
                                  <span>{item.id}</span>
                                </div>
                              </td>

                              <td className="py-3 px-4 font-mono font-medium text-slate-600">
                                <span className="bg-slate-100 px-2 py-1 rounded-md text-[11px] border border-slate-200">
                                  {item.sku || 'Sin SKU'}
                                </span>
                              </td>

                              <td className="py-3 px-4 max-w-xs truncate font-medium text-slate-900 group-hover:text-red-950">
                                <div>{item.title}</div>
                                <div className="text-[10px] text-slate-400 font-sans truncate" title={item.category_name || item.category_id}>
                                  📁 {item.category_name || item.category_id}
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                  item.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                                }`}>
                                  {item.status.toUpperCase()}
                                </span>
                              </td>

                              <td className="py-3 px-4 font-medium text-slate-500">
                                ${precioMostrador.toLocaleString()}
                              </td>

                              <td className="py-3 px-4 font-bold text-slate-900">
                                ${item.price.toLocaleString()}
                              </td>

                              <td className="py-3 px-4">
                                <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-md border border-emerald-200 text-[11px]">
                                  +{incrementoPct}%
                                </span>
                              </td>

                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {item.permalink && (
                                    <a 
                                      href={item.permalink} 
                                      target="_blank" 
                                      rel="noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="p-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 rounded-lg transition-colors border border-slate-200 hover:border-red-200"
                                      title="Abrir en Mercado Libre"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                  )}
                                </div>
                              </td>
                            </tr>

                            {/* FILAS DE VARIACIONES HIJAS (ACORDEÓN DESPLEGABLE) */}
                            {hasVariations && isExpanded && (
                              <tr className="bg-slate-50/90 border-b border-slate-200">
                                <td colSpan={8} className="py-3 px-8">
                                  <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
                                    <div className="text-[11px] font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                                      <span>🧩 Variaciones ({item.variations.length})</span>
                                    </div>
                                    <div className="divide-y divide-slate-100">
                                      {item.variations.map(varItem => (
                                        <div key={varItem.id} className="py-1.5 flex items-center justify-between text-xs font-mono">
                                          <div className="flex items-center gap-2">
                                            <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[10px] font-bold text-slate-600">
                                              SKU: {varItem.sku}
                                            </span>
                                            <span className="text-slate-800 font-sans font-medium text-[11px]">
                                              {varItem.attributes_text}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-3">
                                            <span className="text-[10px] text-slate-400 font-sans">ID Var: {varItem.id}</span>
                                            <span className="font-bold text-slate-900">${varItem.price.toLocaleString()}</span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: SINCRONIZADOR ERP */}
        {activeTab === 'sync' && (
          <div className="flex flex-col gap-6 max-w-3xl">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">Cargar Planilla de Precios (CSV)</h3>
                <p className="text-xs text-slate-500 mt-1">Sube la exportación del ERP con las columnas id/sku y precio_mostrador</p>
              </div>

              <label className="border-2 border-dashed border-slate-200 hover:border-red-500 bg-slate-50/50 hover:bg-slate-50 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors text-center gap-2">
                <FileSpreadsheet className="w-10 h-10 text-red-600" />
                <div className="text-sm font-semibold text-slate-700">
                  {file ? file.name : 'Haz clic o arrastra tu archivo erp_precios.csv'}
                </div>
                <p className="text-xs text-slate-400">Archivos .csv delimitados por comas</p>
                <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
              </label>

              {syncStatus && (
                <div className="p-3 bg-slate-900 text-slate-200 font-mono text-xs rounded-xl border border-slate-800">
                  {syncStatus}
                </div>
              )}

              <button 
                onClick={handleRunSync} 
                disabled={syncProgress.is_running}
                className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-md shadow-red-100 disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-white" />
                {syncProgress.is_running ? 'Sincronización en proceso...' : 'Iniciar Sincronización en Mercado Libre'}
              </button>
            </div>

            {/* FEEDBACK Y BARRA DE PROGRESO */}
            {(syncProgress.is_running || syncProgress.logs.length > 0) && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <RefreshCw className={`w-4 h-4 text-red-600 ${syncProgress.is_running ? 'spinning' : ''}`} />
                    {syncProgress.is_running ? 'Sincronización Activa en Segundo Plano' : 'Último Reporte de Sincronización'}
                  </h4>
                  <span className="text-xs font-bold text-slate-600">
                    {syncProgress.total > 0 ? `${Math.round((syncProgress.current / syncProgress.total) * 100)}% Completado` : 'Finalizado'}
                  </span>
                </div>

                {/* BARRA DE PROGRESO */}
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-red-600 h-full transition-all duration-300 rounded-full" 
                    style={{ width: syncProgress.total > 0 ? `${(syncProgress.current / syncProgress.total) * 100}%` : '0%' }}
                  />
                </div>

                {/* KPIS DE PROGRESO */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-[11px] text-slate-500 font-medium">Procesados</div>
                    <div className="text-base font-bold text-slate-900">{syncProgress.current} / {syncProgress.total}</div>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                    <div className="text-[11px] text-emerald-700 font-medium">Exitosos</div>
                    <div className="text-base font-bold text-emerald-700">{syncProgress.success_count}</div>
                  </div>
                  <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                    <div className="text-[11px] text-red-700 font-medium">Fallidos / Salteados</div>
                    <div className="text-base font-bold text-red-700">{syncProgress.fail_count}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: AUDITORÍA DE PRECIOS */}
        {activeTab === 'audit' && (
          <div className="flex flex-col gap-5">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                
                {/* BUSCADOR AUDITORIA */}
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-64 focus-within:border-red-600 transition-colors">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Buscar en auditoría..." 
                    value={auditSearchTerm}
                    onChange={(e) => setAuditSearchTerm(e.target.value)}
                    className="bg-transparent border-none text-sm text-slate-900 outline-none w-full placeholder:text-slate-400"
                  />
                </div>

                {/* FILTRO DE DICTAMEN */}
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <select 
                    value={auditStatusFilter} 
                    onChange={(e) => setAuditStatusFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-3 py-2 outline-none"
                  >
                    <option value="all">Todos los dictámenes</option>
                    <option value="OK">🟢 En Rango OK</option>
                    <option value="BAJO">🔴 Recibe Menos que ERP</option>
                    <option value="ALTO">🟡 Recibe Más que ERP</option>
                    <option value="SIN_ERP">⚪ Sin Coincidencia ERP</option>
                  </select>
                </div>

                {/* FILTRO SKU PRESENTE / NA EN AUDITORIA */}
                <div className="flex items-center gap-2">
                  <select 
                    value={auditSkuFilter} 
                    onChange={(e) => setAuditSkuFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-3 py-2 outline-none"
                  >
                    <option value="all">SKU: Todos</option>
                    <option value="with_sku">✅ Con SKU asignado</option>
                    <option value="no_sku">⚠️ Sin SKU (N/A)</option>
                  </select>
                </div>

                {/* TOLERANCIA */}
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-red-600" />
                  <select 
                    value={tolerancePct} 
                    onChange={(e) => setTolerancePct(parseFloat(e.target.value))}
                    className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-3 py-2 outline-none"
                  >
                    <option value={2.0}>2% Tolerancia</option>
                    <option value={5.0}>5% Tolerancia (Recomendado)</option>
                    <option value={10.0}>10% Tolerancia</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {auditLastUpdated && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100/80 border border-slate-200 px-3 py-1.5 rounded-xl font-medium" title="Fecha y hora de la última auditoría ejecutada">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Últ. aud.: <strong className="text-slate-700">{auditLastUpdated}</strong></span>
                  </div>
                )}

                <button 
                  onClick={loadAuditReport} 
                  disabled={auditLoading}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${auditLoading ? 'spinning' : ''}`} />
                  {auditLoading ? 'Auditando...' : 'Ejecutar Auditoría'}
                </button>
              </div>
            </div>

            {auditReport && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Auditados</span>
                    <span className="text-xl font-black text-slate-900">{dynamicAuditCounts.total}</span>
                  </div>
                  <div className="p-2.5 bg-slate-100 text-slate-600 rounded-xl">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">En Rango Rentable</span>
                    <span className="text-xl font-black text-emerald-600">{dynamicAuditCounts.en_rango_ok}</span>
                  </div>
                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider block">Margen Bajo ERP</span>
                    <span className="text-xl font-black text-red-600">{dynamicAuditCounts.recibe_menos}</span>
                  </div>
                  <div className="p-2.5 bg-red-50 text-red-600 rounded-xl border border-red-100">
                    <TrendingDown className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">Margen Alto ERP</span>
                    <span className="text-xl font-black text-amber-600">{dynamicAuditCounts.recibe_mas}</span>
                  </div>
                  <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
              </div>
            )}

            {auditReport && (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider select-none">
                        <th className="py-3.5 px-4 cursor-pointer hover:bg-slate-100/80 transition-colors" onClick={() => handleSortAudit('title')}>
                          <div className="flex items-center gap-1.5">
                            Publicación / SKU {auditSortBy === 'title' && (auditSortOrder === 'asc' ? '▲' : '▼')}
                          </div>
                        </th>
                        <th className="py-3.5 px-4 cursor-pointer hover:bg-slate-100/80 transition-colors" onClick={() => handleSortAudit('price_ml')}>
                          <div className="flex items-center gap-1.5">
                            Precio ML {auditSortBy === 'price_ml' && (auditSortOrder === 'asc' ? '▲' : '▼')}
                          </div>
                        </th>
                        <th className="py-3.5 px-4 cursor-pointer hover:bg-slate-100/80 transition-colors" onClick={() => handleSortAudit('comision_porcentaje')}>
                          <div className="flex items-center gap-1.5">
                            Comisión % {auditSortBy === 'comision_porcentaje' && (auditSortOrder === 'asc' ? '▲' : '▼')}
                          </div>
                        </th>
                        <th className="py-3.5 px-4 cursor-pointer hover:bg-slate-100/80 transition-colors" onClick={() => handleSortAudit('neto_a_recibir')}>
                          <div className="flex items-center gap-1.5">
                            Neto Recibido {auditSortBy === 'neto_a_recibir' && (auditSortOrder === 'asc' ? '▲' : '▼')}
                          </div>
                        </th>
                        <th className="py-3.5 px-4 cursor-pointer hover:bg-slate-100/80 transition-colors" onClick={() => handleSortAudit('precio_mostrador_erp')}>
                          <div className="flex items-center gap-1.5">
                            ERP Mostrador {auditSortBy === 'precio_mostrador_erp' && (auditSortOrder === 'asc' ? '▲' : '▼')}
                          </div>
                        </th>
                        <th className="py-3.5 px-4 cursor-pointer hover:bg-slate-100/80 transition-colors" onClick={() => handleSortAudit('status_evaluacion')}>
                          <div className="flex items-center gap-1.5">
                            Dictamen {auditSortBy === 'status_evaluacion' && (auditSortOrder === 'asc' ? '▲' : '▼')}
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredAuditItems.map(item => (
                        <tr 
                          key={item.item_id} 
                          onClick={() => setInspectingAuditItem(item)}
                          className="hover:bg-red-50/40 cursor-pointer transition-colors group"
                          title="Haz clic para ver el desglose detallado de costos"
                        >
                          <td className="py-3 px-4 max-w-xs truncate font-medium text-slate-900 group-hover:text-red-950">
                            <div>{item.title}</div>
                            <div className="text-[10px] text-slate-400 font-mono">SKU: {item.sku} | ID: {item.item_id}</div>
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900">${item.price_ml.toLocaleString()}</td>
                          <td className="py-3 px-4 text-slate-500">{item.comision_porcentaje}%</td>
                          <td className="py-3 px-4 font-bold text-emerald-600">${item.neto_a_recibir.toLocaleString()}</td>
                          <td className="py-3 px-4 text-slate-500">${item.precio_mostrador_erp ? item.precio_mostrador_erp.toLocaleString() : 'N/A'}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              item.status_evaluacion === 'OK' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              item.status_evaluacion === 'BAJO' ? 'bg-red-50 text-red-700 border border-red-200' :
                              item.status_evaluacion === 'ALTO' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                              'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}>
                              {item.status_evaluacion}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: CALCULADORA & SIMULADOR ESTRATÉGICO v0.2.0 */}
        {activeTab === 'calculator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <form onSubmit={handleCalculate} className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-red-600" />
                  <h3 className="font-bold text-slate-900 text-base">Parámetros de Simulación</h3>
                </div>
                <span className="text-xs text-slate-400 font-medium">Algoritmo Financiero v0.2.0</span>
              </div>
              
              {/* PRECIO BASE Y MARGEN */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700">Precio Mostrador ERP ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={calcForm.precio_mostrador} 
                    onChange={(e) => setCalcForm({...calcForm, precio_mostrador: e.target.value})}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 font-bold outline-none focus:border-red-600"
                    required 
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700">Margen Neto Deseado (%)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={calcForm.margen_pct} 
                    onChange={(e) => setCalcForm({...calcForm, margen_pct: e.target.value})}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 font-bold outline-none focus:border-red-600"
                    placeholder="0.0%"
                  />
                </div>
              </div>

              {/* TIPO DE PUBLICACION Y CATEGORIA */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700">Tipo de Publicación</label>
                  <select 
                    value={calcForm.listing_type_id} 
                    onChange={(e) => setCalcForm({...calcForm, listing_type_id: e.target.value})}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 outline-none"
                  >
                    <option value="gold_special">Clásica (gold_special)</option>
                    <option value="gold_pro">Premium (gold_pro)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700">Categoría MeLi (ID)</label>
                  <input 
                    type="text" 
                    value={calcForm.category_id} 
                    onChange={(e) => setCalcForm({...calcForm, category_id: e.target.value})}
                    placeholder="Ej: MLA3530"
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 outline-none focus:border-red-600"
                  />
                </div>
              </div>

              {/* ENVÍOS Y REPUTACIÓN */}
              <div className="p-4 bg-slate-50/80 border border-slate-200/60 rounded-2xl flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                    <input 
                      type="checkbox"
                      checked={calcForm.has_free_shipping}
                      onChange={(e) => setCalcForm({...calcForm, has_free_shipping: e.target.checked})}
                      className="w-4 h-4 text-red-600 rounded"
                    />
                    <span>Incluye Envío Gratis (Mercado Envíos)</span>
                  </label>
                </div>

                {calcForm.has_free_shipping && (
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/60">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-slate-600">Bonificación por Reputación (%)</label>
                      <input 
                        type="number"
                        step="5"
                        value={calcForm.reputation_discount_pct}
                        onChange={(e) => setCalcForm({...calcForm, reputation_discount_pct: e.target.value})}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 outline-none"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-slate-600">Tarifa Envío Manual ($) <span className="text-slate-400 font-normal">(Opcional)</span></label>
                      <input 
                        type="number"
                        step="50"
                        value={calcForm.shipping_cost_override}
                        onChange={(e) => setCalcForm({...calcForm, shipping_cost_override: e.target.value})}
                        placeholder="Auto (Según peso)"
                        className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* IMPUESTOS Y RETENCIONES */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Alícuota Impositiva Estimada / IIBB (%)</span>
                  <span className="text-[11px] text-slate-400 font-normal">Por defecto: 0.65%</span>
                </label>
                <input 
                  type="number" 
                  step="0.05"
                  value={calcForm.tax_rate_pct} 
                  onChange={(e) => setCalcForm({...calcForm, tax_rate_pct: e.target.value})}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-red-600"
                />
              </div>

              <button 
                type="submit" 
                disabled={calcLoading}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition-colors shadow-sm mt-1 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {calcLoading ? 'Simulando escenario...' : 'Calcular Precio Óptimo'}
              </button>
            </form>

            {/* PANEL DE RESULTADOS DE SIMULACIÓN */}
            <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <h3 className="text-base font-bold text-slate-900">Radiografía Financiera Sugerida</h3>
                  {calcResult && (
                    <span className="text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full">
                      Rentabilidad: +${calcResult.rentabilidad_monetaria?.toLocaleString()} ({calcResult.margen_neto_real_pct}%)
                    </span>
                  )}
                </div>

                {calcResult ? (
                  <div className="flex flex-col gap-3 text-xs">
                    <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Precio Final Sugerido ML</span>
                        <span className="text-2xl font-black text-slate-900">${calcResult.precio_publicado_sugerido?.toLocaleString()}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Neto Real en Mano</span>
                        <span className="text-2xl font-black text-emerald-600">${calcResult.neto_real_obtenido?.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="border border-slate-100 rounded-2xl divide-y divide-slate-100 mt-2">
                      <div className="p-3 flex justify-between items-center">
                        <span className="text-slate-600">Costo Base / Mostrador ERP:</span>
                        <span className="font-bold text-slate-900">${calcResult.costo_efectivo?.toLocaleString()}</span>
                      </div>
                      <div className="p-3 flex justify-between items-center">
                        <span className="text-slate-600">Comisión Mercado Libre ({calcResult.comision_porcentaje}% + fija):</span>
                        <span className="font-bold text-red-600">-${calcResult.comision_total_monto?.toLocaleString()}</span>
                      </div>
                      <div className="p-3 flex justify-between items-center">
                        <span className="text-slate-600">Costo Envío Vendedor (Bonif. {calcResult.bonificacion_envio_pct}%):</span>
                        <span className="font-bold text-red-600">-${calcResult.costo_envio_final?.toLocaleString()}</span>
                      </div>
                      <div className="p-3 flex justify-between items-center">
                        <span className="text-slate-600">Impuestos / Percepciones ({calcResult.alicuota_impuestos_pct}%):</span>
                        <span className="font-bold text-red-600">-${calcResult.impuestos_monto?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
                    <Calculator className="w-10 h-10 text-slate-300" />
                    <span>Configura las variables y presiona "Calcular Precio Óptimo" para ver el desglose exacto.</span>
                  </div>
                )}
              </div>

              {calcResult && (
                <div className="p-3.5 bg-emerald-50/70 border border-emerald-100 rounded-2xl text-[11px] text-emerald-950 flex items-center gap-2 mt-4">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>El precio publicado absorbe comisiones, impuestos y envíos garantizando el recupero del costo ERP.</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: CONFIGURACIÓN INTEGRAL v0.2.0 */}
        {activeTab === 'rules' && (
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col">
            {/* SUB-TABS HEADER */}
            <div className="flex border-b border-slate-200 bg-slate-50/60 p-2 gap-2">
              <button
                onClick={() => setSettingsActiveSubTab('general')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  settingsActiveSubTab === 'general' ? 'bg-white text-red-600 shadow-sm border border-slate-200' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Parámetros Generales
              </button>
              <button
                onClick={() => setSettingsActiveSubTab('exclusions')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  settingsActiveSubTab === 'exclusions' ? 'bg-white text-red-600 shadow-sm border border-slate-200' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Exclusiones (Keywords & Categorías)
              </button>
              <button
                onClick={() => setSettingsActiveSubTab('packs')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  settingsActiveSubTab === 'packs' ? 'bg-white text-red-600 shadow-sm border border-slate-200' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Multiplicadores de Pack
              </button>
            </div>

            {/* FORMULARIO DE CONFIGURACIÓN */}
            <form onSubmit={handleSaveSettings} className="p-6 flex flex-col gap-6 max-w-2xl">
              {settingsActiveSubTab === 'general' && (
                <div className="flex flex-col gap-4 animate-in fade-in duration-150">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700">Descuento General ERP Mostrador (%)</label>
                      <input 
                        type="number" 
                        step="0.5"
                        value={settingsForm.general_discount_pct} 
                        onChange={(e) => setSettingsForm({...settingsForm, general_discount_pct: parseFloat(e.target.value) || 0})}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-red-600"
                        required 
                      />
                      <span className="text-[10px] text-slate-400">Descuento aplicado habitualmente en el ERP (30%).</span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700">Bonificación Reputación Envíos ME2 (%)</label>
                      <input 
                        type="number" 
                        step="5"
                        value={settingsForm.shipping_discount_pct} 
                        onChange={(e) => setSettingsForm({...settingsForm, shipping_discount_pct: parseFloat(e.target.value) || 0})}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-red-600"
                        required 
                      />
                      <span className="text-[10px] text-slate-400">Descuento en fletes asumido por Mercado Libre (50%).</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700">Alícuota Impositiva Base / IIBB (%)</label>
                      <input 
                        type="number" 
                        step="0.05"
                        value={settingsForm.default_tax_rate_pct} 
                        onChange={(e) => setSettingsForm({...settingsForm, default_tax_rate_pct: parseFloat(e.target.value) || 0})}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-red-600"
                        required 
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700">Tolerancia de Auditoría por Defecto (%)</label>
                      <input 
                        type="number" 
                        step="1"
                        value={settingsForm.tolerance_pct} 
                        onChange={(e) => setSettingsForm({...settingsForm, tolerance_pct: parseFloat(e.target.value) || 0})}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-red-600"
                        required 
                      />
                    </div>
                  </div>
                </div>
              )}

              {settingsActiveSubTab === 'exclusions' && (
                <div className="flex flex-col gap-4 animate-in fade-in duration-150">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">Palabras Clave Excluidas (Separadas por coma)</label>
                    <input 
                      type="text" 
                      value={settingsForm.excluded_keywords?.join(', ')} 
                      onChange={(e) => setSettingsForm({...settingsForm, excluded_keywords: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none focus:border-red-600 font-mono text-xs"
                      placeholder="mueble, aluminio, chapa"
                    />
                    <span className="text-[10px] text-slate-400">Los productos que contengan estas palabras revertirán el descuento de mostrador (precio / 0.70).</span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">IDs de Categorías Excluidas (Separadas por coma)</label>
                    <textarea 
                      rows="3"
                      value={settingsForm.excluded_categories?.join(', ')} 
                      onChange={(e) => setSettingsForm({...settingsForm, excluded_categories: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 font-mono outline-none focus:border-red-600"
                      placeholder="MLA30088, MLA7141, MLA30069"
                    />
                  </div>
                </div>
              )}

              {settingsActiveSubTab === 'packs' && (
                <div className="flex flex-col gap-3 animate-in fade-in duration-150">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Define multiplicadores fijos de unidades por pack para SKUs o IDs específicos donde una publicación contenga combos de productos.
                  </p>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-400 font-mono">
                    {JSON.stringify(settingsForm.pack_multipliers || {}, null, 2)}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="submit" 
                  disabled={settingsSaving}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs transition-colors shadow-sm disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {settingsSaving ? 'Guardando preferencias...' : 'Guardar Configuración'}
                </button>
              </div>
            </form>
          </div>
        )}

      </main>

      {/* MODAL EDITAR PUBLICACIÓN */}
      {editingItem && (
        <div 
          onClick={() => setEditingItem(null)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2.5">
                <Edit3 className="w-5 h-5 text-red-500" />
                <h3 className="text-sm font-bold tracking-tight">Editar Publicación</h3>
              </div>
              <button 
                onClick={() => setEditingItem(null)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateItem} className="p-6 flex flex-col gap-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center gap-3">
                {editingItem.thumbnail ? (
                  <img src={editingItem.thumbnail} alt="" className="w-12 h-12 rounded-xl object-cover border border-slate-200" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-slate-200" />
                )}
                <div>
                  <div className="font-bold text-slate-900 line-clamp-1">{editingItem.title}</div>
                  <div className="text-[10px] text-slate-500 font-mono">ID: {editingItem.id}</div>
                </div>
              </div>

              {/* CAMPO SKU */}
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700">SKU del Vendedor (ERP)</label>
                <input 
                  type="text" 
                  value={editForm.sku} 
                  onChange={(e) => setEditForm({ ...editForm, sku: e.target.value })}
                  placeholder="Ej: SKU-10023"
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none focus:border-red-600"
                />
              </div>

              {/* CAMPO TITULO */}
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700">Título de la Publicación</label>
                <input 
                  type="text" 
                  value={editForm.title} 
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none focus:border-red-600"
                  required
                />
              </div>

              {/* CAMPOS PRECIOS */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-700">Precio Mostrador ERP ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={editForm.precio_mostrador} 
                    onChange={(e) => setEditForm({ ...editForm, precio_mostrador: e.target.value })}
                    placeholder="Base de cálculo"
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none focus:border-red-600 font-semibold"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-700">Precio Directo ML ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={editForm.price_ml} 
                    onChange={(e) => setEditForm({ ...editForm, price_ml: e.target.value })}
                    placeholder="Publicado en ML"
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none focus:border-red-600 font-semibold"
                  />
                </div>
              </div>

              {/* CAMPO ESTADO Y CATEGORIA */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-700">Estado de Publicación</label>
                  <select 
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none focus:border-red-600 font-medium"
                  >
                    <option value="active">🟢 Activa</option>
                    <option value="paused">🔴 Pausada</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-700">Categoría Mercado Libre</label>
                  <div className="bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 truncate" title={editingItem.category_name || editForm.category_id}>
                    📁 {editingItem.category_name || editForm.category_id}
                  </div>
                </div>
              </div>

              {/* BOTONES DE ACCIÓN */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-2">
                <button 
                  type="button" 
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={updating}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2 rounded-xl text-xs transition-colors shadow-sm disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${updating ? 'spinning' : ''}`} />
                  {updating ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DESGLOSE DE COSTOS DE AUDITORÍA */}
      {inspectingAuditItem && (
        <div 
          onClick={() => setInspectingAuditItem(null)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 flex flex-col gap-5 max-h-[90vh] overflow-y-auto"
          >
            {/* CABECERA */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="pr-4">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    inspectingAuditItem.status_evaluacion === 'OK' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    inspectingAuditItem.status_evaluacion === 'BAJO' ? 'bg-red-50 text-red-700 border border-red-200' :
                    inspectingAuditItem.status_evaluacion === 'ALTO' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                    'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    {inspectingAuditItem.status_evaluacion === 'OK' ? '🟢 En Rango Rentable' :
                     inspectingAuditItem.status_evaluacion === 'BAJO' ? '🔴 Margen por Debajo del ERP' :
                     inspectingAuditItem.status_evaluacion === 'ALTO' ? '🟡 Margen por Encima del ERP' : '⚪ Sin Coincidencia ERP'}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">SKU: {inspectingAuditItem.sku || 'N/A'}</span>
                </div>
                <h3 className="font-bold text-base text-slate-900 mt-1 leading-snug">{inspectingAuditItem.title}</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">ID: {inspectingAuditItem.item_id}</p>
              </div>
              <button 
                onClick={() => setInspectingAuditItem(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* RESUMEN DE IMPACTO EN MANO */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 border border-slate-100 rounded-2xl p-4">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Precio Publicado en ML</span>
                <span className="text-xl font-black text-slate-900">${inspectingAuditItem.price_ml.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">Neto Real Recibido</span>
                <span className="text-xl font-black text-emerald-600">${inspectingAuditItem.neto_a_recibir.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* TABLA DE DEDUCCIONES Y COSTOS */}
            <div className="flex flex-col gap-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Desglose de Deducciones y Cargos de Mercado Libre</h4>
              <div className="border border-slate-100 rounded-2xl divide-y divide-slate-100 text-xs overflow-hidden">
                
                {/* COMISION DE VENTA */}
                <div className="p-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 block">Comisión de Mercado Libre ({inspectingAuditItem.comision_porcentaje}%)</span>
                      <span className="text-[10px] text-slate-400">Porcentaje por categoría oficial</span>
                    </div>
                  </div>
                  <span className="font-bold text-red-600 text-sm">-${inspectingAuditItem.comision_monto.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                </div>

                {/* COSTO DE ENVIO GRATIS */}
                <div className="p-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 block">Costo de Envío Gratis (Vendedor)</span>
                      <span className="text-[10px] text-slate-400">Con bonificación de reputación aplicada</span>
                    </div>
                  </div>
                  <span className="font-bold text-red-600 text-sm">-${inspectingAuditItem.costo_envio.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                </div>

                {/* RETENCIONES IMPOSITIVAS ESTIMADAS */}
                <div className="p-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 block">Impuestos y Retenciones (0.65%)</span>
                      <span className="text-[10px] text-slate-400">IIBB / Percepciones estimadas de Mercado Libre</span>
                    </div>
                  </div>
                  <span className="font-bold text-red-600 text-sm">-${(inspectingAuditItem.price_ml * 0.0065).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>

                {/* CARGO FIJO SI APLICA */}
                {inspectingAuditItem.cargo_fijo > 0 && (
                  <div className="p-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-slate-100 text-slate-600 rounded-lg">
                        <DollarSign className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 block">Cargo Fijo por Ítem</span>
                        <span className="text-[10px] text-slate-400">Para publicaciones de bajo monto</span>
                      </div>
                    </div>
                    <span className="font-bold text-red-600 text-sm">-${inspectingAuditItem.cargo_fijo.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
              </div>
            </div>

            {/* COMPARATIVA CONTRA EL ERP */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col gap-2.5">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Comparativa de Rentabilidad ERP</span>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Precio Mostrador ERP Esperado:</span>
                <span className="font-bold text-slate-800">${inspectingAuditItem.precio_mostrador_erp ? inspectingAuditItem.precio_mostrador_erp.toLocaleString('es-AR', { minimumFractionDigits: 2 }) : 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/60">
                <span className="text-slate-500 font-medium">Diferencia Neta en Mano:</span>
                <div className="flex items-center gap-2">
                  <span className={`font-black text-sm ${
                    inspectingAuditItem.diferencia_vs_mostrador >= 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {inspectingAuditItem.diferencia_vs_mostrador >= 0 ? '+' : ''}${inspectingAuditItem.diferencia_vs_mostrador.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                    inspectingAuditItem.diferencia_pct >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {inspectingAuditItem.diferencia_pct >= 0 ? '+' : ''}{inspectingAuditItem.diferencia_pct}%
                  </span>
                </div>
              </div>
            </div>

            {/* ACCIONES DEL MODAL */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-1">
              {inspectingAuditItem.permalink ? (
                <a 
                  href={inspectingAuditItem.permalink} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-semibold hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ver en Mercado Libre</span>
                </a>
              ) : <div />}
              
              <button 
                onClick={() => setInspectingAuditItem(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors shadow-sm"
              >
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
