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
  Truck
} from 'lucide-react';
import { 
  checkHealth, 
  fetchStats, 
  calculatePrice, 
  uploadCSV, 
  executeSync, 
  fetchSyncStatus,
  fetchItems, 
  updateSingleItem,
  fetchRules,
  saveRules,
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

  // Formulario Calculadora
  const [calcForm, setCalcForm] = useState({
    precio_mostrador: 10000,
    category_id: 'MLA3530',
    listing_type_id: 'gold_special',
    margen_adicional_pct: 0
  });
  const [calcResult, setCalcResult] = useState(null);
  const [calcLoading, setCalcLoading] = useState(false);

  // Sincronizador y Feedback en Vivo
  const [file, setFile] = useState(null);
  const [syncStatus, setSyncStatus] = useState('');
  const [syncProgress, setSyncProgress] = useState({ is_running: false, total: 0, current: 0, success_count: 0, fail_count: 0, logs: [] });

  // Reglas de Excepción por Categoría
  const [rulesForm, setRulesForm] = useState({ general_discount_pct: 30.0, excluded_categories: [], excluded_keywords: ['mueble', 'aluminio'] });
  const [rulesSaving, setRulesSaving] = useState(false);

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
    loadRules();
  }, []);

  useEffect(() => {
    if (activeTab === 'items') {
      loadItems();
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

  const loadRules = async () => {
    const data = await fetchRules();
    if (data) setRulesForm(data);
  };

  const handleSaveRules = async (e) => {
    e.preventDefault();
    setRulesSaving(true);
    try {
      await saveRules(rulesForm);
      addToast('success', 'Reglas Guardadas', 'Reglas por categoría y excepciones actualizadas.');
    } catch (err) {
      addToast('error', 'Error', `No se pudieron guardar las reglas: ${err.message}`);
    } finally {
      setRulesSaving(false);
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
      const res = await calculatePrice({
        ...calcForm,
        precio_mostrador: parseFloat(calcForm.precio_mostrador),
        margen_adicional_pct: parseFloat(calcForm.margen_adicional_pct)
      });
      setCalcResult(res);
      addToast('info', 'Cálculo Completado', `Precio final sugerido: $${res.precio_final_meli}`);
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

  const filteredAuditItems = (auditReport?.items || [])
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100 flex flex-col gap-4">
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
              <Calculator className="w-4 h-4" /> Calculadora MeLi
            </button>

            <button 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                activeTab === 'rules' ? 'bg-red-600 text-white shadow-md shadow-red-100 font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
              onClick={() => setActiveTab('rules')}
            >
              <SettingsIcon className="w-4 h-4" /> Reglas y Excepciones
            </button>
          </nav>
        </div>

        {/* WIDGET MINI CLI LOGS */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-inner flex flex-col">
          <div 
            className="bg-slate-950 px-3 py-2 flex items-center justify-between cursor-pointer border-b border-slate-800 select-none"
            onClick={() => setCliExpanded(!cliExpanded)}
          >
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Console Log</span>
            </div>
            <span className="text-[10px] text-slate-500">{cliExpanded ? '▼' : '▲'}</span>
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
              {activeTab === 'dashboard' && 'Panel de Control General'}
              {activeTab === 'items' && 'Inventario de Publicaciones'}
              {activeTab === 'sync' && 'Sincronizador Masivo desde ERP'}
              {activeTab === 'audit' && 'Auditoría de Neto a Recibir'}
              {activeTab === 'calculator' && 'Simulador de Comisiones'}
              {activeTab === 'rules' && 'Excepciones por Categoría'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">Gestión automatizada de precios e inventario para Mercado Libre</p>
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

        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estado API Backend</span>
                  <div className={`w-2.5 h-2.5 rounded-full ${health.status === 'online' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                </div>
                <span className={`text-2xl font-black ${health.status === 'online' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {health.status.toUpperCase()}
                </span>
                <p className="text-xs text-slate-500">Servidor REST en localhost:8000</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cuenta Mercado Libre</span>
                <span className="text-2xl font-black text-slate-900">{health.nickname || 'Sin Autenticar'}</span>
                <p className="text-xs text-slate-500">Seller ID: {health.user_id || 'N/A'}</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Publicaciones Activas</span>
                <span className="text-2xl font-black text-slate-900">{stats ? stats.publicaciones_activas : '---'}</span>
                <p className="text-xs text-slate-500">Total en catálogo: {stats ? stats.total_publicaciones : '---'}</p>
              </div>
            </div>

            {stats && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-red-600" /> Resumen de Precios en Lista
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                    <span className="text-xs font-medium text-slate-500">Precio Promedio de Venta</span>
                    <div className="text-xl font-bold text-slate-900 mt-1">${stats.precio_promedio?.toLocaleString()}</div>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                    <span className="text-xs font-medium text-slate-500">Total ítems en Inventario</span>
                    <div className="text-xl font-bold text-slate-900 mt-1">{stats.total_publicaciones} productos</div>
                  </div>
                </div>
              </div>
            )}
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
                        <th className="py-3.5 px-4 text-right">Acción</th>
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
                            <tr className={`hover:bg-slate-50/80 transition-colors ${isExpanded ? 'bg-slate-50/60' : ''}`}>
                              <td className="py-3 px-4 font-mono font-bold text-slate-900">
                                <div className="flex items-center gap-2">
                                  {hasVariations ? (
                                    <button 
                                      onClick={() => toggleVariations(item.id)}
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

                              <td className="py-3 px-4 max-w-xs truncate font-medium text-slate-900">
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
                                  <button 
                                    onClick={() => openEditModal(item)}
                                    className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1 shadow-sm"
                                  >
                                    <Edit3 className="w-3 h-3" /> Editar
                                  </button>
                                  {item.permalink && (
                                    <a 
                                      href={item.permalink} 
                                      target="_blank" 
                                      rel="noreferrer"
                                      className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
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
                        <th className="py-3.5 px-4 text-center">Desglose</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredAuditItems.map(item => (
                        <tr key={item.item_id} className="hover:bg-slate-50/80">
                          <td className="py-3 px-4 max-w-xs truncate font-medium text-slate-900">
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
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => setInspectingAuditItem(item)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 font-semibold text-xs transition-colors border border-slate-200 hover:border-red-200 shadow-sm"
                              title="Ver desglose detallado de costos"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-500 hover:text-red-600" />
                              <span>Detalle</span>
                            </button>
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

        {/* TAB 5: CALCULADORA */}
        {activeTab === 'calculator' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <form onSubmit={handleCalculate} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <h3 className="text-base font-bold text-slate-900">Simulador de Precio Mercado Libre</h3>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Precio Mostrador ERP ($)</label>
                <input 
                  type="number" 
                  value={calcForm.precio_mostrador} 
                  onChange={(e) => setCalcForm({...calcForm, precio_mostrador: e.target.value})}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-red-600"
                  required 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Tipo de Publicación</label>
                <select 
                  value={calcForm.listing_type_id} 
                  onChange={(e) => setCalcForm({...calcForm, listing_type_id: e.target.value})}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none"
                >
                  <option value="gold_special">Clásica (gold_special)</option>
                  <option value="gold_pro">Premium (gold_pro)</option>
                </select>
              </div>

              <button 
                type="submit" 
                disabled={calcLoading}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-colors shadow-sm mt-2 disabled:opacity-50"
              >
                {calcLoading ? 'Calculando...' : 'Calcular Precio Sugerido'}
              </button>
            </form>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-4">Desglose Calculado</h3>
                {calcResult ? (
                  <div className="flex flex-col gap-3 text-sm">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Comisión %:</span>
                      <span className="font-semibold">{calcResult.comision_porcentaje}%</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Cargo Fijo:</span>
                      <span className="font-semibold">${calcResult.cargo_fijo}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Costo Envío Gratis:</span>
                      <span className="font-semibold">${calcResult.costo_envio}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400">Ingresa el precio y presiona calcular.</div>
                )}
              </div>

              {calcResult && (
                <div className="pt-4 border-t border-slate-100 mt-4">
                  <span className="text-xs text-slate-500 font-medium">Precio Final Sugerido</span>
                  <div className="text-2xl font-black text-emerald-600 mt-0.5">${calcResult.precio_final_meli}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: REGLAS */}
        {activeTab === 'rules' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm max-w-xl flex flex-col gap-4">
            <h3 className="text-base font-bold text-slate-900">Excepciones por Categoría</h3>
            <form onSubmit={handleSaveRules} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Palabras Clave Excluidas (separadas por coma)</label>
                <input 
                  type="text" 
                  value={rulesForm.excluded_keywords?.join(', ')} 
                  onChange={(e) => setRulesForm({...rulesForm, excluded_keywords: e.target.value.split(',').map(s => s.trim())})}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none"
                />
              </div>

              <button 
                type="submit" 
                disabled={rulesSaving}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-colors shadow-sm disabled:opacity-50"
              >
                {rulesSaving ? 'Guardando...' : 'Guardar Reglas'}
              </button>
            </form>
          </div>
        )}

      </main>

      {/* MODAL EDITAR PUBLICACIÓN */}
      {editingItem && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
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
