import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  RefreshCw, 
  Calculator, 
  BarChart3, 
  CheckCircle, 
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
  AlertTriangle
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
  fetchAuditReport
} from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [health, setHealth] = useState({ status: 'checking', token_valid: false });
  const [stats, setStats] = useState(null);

  // Ítems, filtros y ordenamiento
  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, paused
  const [sortBy, setSortBy] = useState('title'); // title, price, id, sku
  const [sortOrder, setSortOrder] = useState('asc'); // asc, desc
  const [editingItem, setEditingItem] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [updating, setUpdating] = useState(false);

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
    const h = await checkHealth();
    setHealth(h);
    if (h.token_valid) {
      const s = await fetchStats();
      setStats(s);
    }
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
      alert('✅ Reglas de categoría guardadas correctamente.');
    } catch (err) {
      alert(`❌ Error guardando reglas: ${err.message}`);
    } finally {
      setRulesSaving(false);
    }
  };

  const loadItems = async () => {
    setItemsLoading(true);
    const data = await fetchItems(50);
    setItems(data);
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
    } catch (err) {
      alert("Error calculando precio: " + err.message);
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
      setSyncStatus(`✓ Archivo '${selectedFile.name}' subido correctamente.`);
    } catch (err) {
      setSyncStatus(`❌ Error al subir CSV: ${err.message}`);
    }
  };

  const handleRunSync = async () => {
    try {
      const res = await executeSync(calcForm.margen_adicional_pct);
      setSyncStatus(`🚀 ${res.message}`);
    } catch (err) {
      setSyncStatus(`❌ Error disparando sincronización: ${err.message}`);
    }
  };

  const handleUpdateItem = async (e) => {
    e.preventDefault();
    if (!editingItem || !editPrice) return;
    setUpdating(true);
    try {
      await updateSingleItem(editingItem.id, {
        precio_mostrador: parseFloat(editPrice),
        category_id: editingItem.category_id || 'MLA3530',
        listing_type_id: 'gold_special',
        margen_adicional_pct: 0.0
      });
      alert(`✅ Publicación ${editingItem.id} actualizada correctamente.`);
      setEditingItem(null);
      setEditPrice('');
      loadItems();
    } catch (err) {
      alert(`❌ Error actualizando ítem: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const loadAuditReport = async () => {
    setAuditLoading(true);
    try {
      const data = await fetchAuditReport(tolerancePct);
      setAuditReport(data);
    } catch (err) {
      alert("Error ejecutando auditoría: " + err.message);
    } finally {
      setAuditLoading(false);
    }
  };

  const filteredItems = items
    .filter(item => {
      const matchSearch = 
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      let valA = a[sortBy] || '';
      let valB = b[sortBy] || '';

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="brand">
          <RefreshCw className="brand-icon" size={28} />
          <div>
            <div className="brand-title">Sincronizador MeLi</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Corralón Aconquija</div>
          </div>
        </div>

        <nav className="nav-menu">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={18} /> Dashboard
          </button>

          <button 
            className={`nav-item ${activeTab === 'items' ? 'active' : ''}`}
            onClick={() => setActiveTab('items')}
          >
            <PackageSearch size={18} /> Publicaciones
          </button>

          <button 
            className={`nav-item ${activeTab === 'sync' ? 'active' : ''}`}
            onClick={() => setActiveTab('sync')}
          >
            <UploadCloud size={18} /> Sincronizador ERP
          </button>

          <button 
            className={`nav-item ${activeTab === 'audit' ? 'active' : ''}`}
            onClick={() => { setActiveTab('audit'); if(!auditReport) loadAuditReport(); }}
          >
            <ShieldCheck size={18} /> Auditoría de Precios
          </button>

          <button 
            className={`nav-item ${activeTab === 'calculator' ? 'active' : ''}`}
            onClick={() => setActiveTab('calculator')}
          >
            <Calculator size={18} /> Calculadora MeLi
          </button>

          <button 
            className={`nav-item ${activeTab === 'rules' ? 'active' : ''}`}
            onClick={() => setActiveTab('rules')}
          >
            <SettingsIcon size={18} /> Reglas por Categoría
          </button>

          <button 
            className={`nav-item ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            <BarChart3 size={18} /> Estadísticas
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="page-header">
          <h1 className="page-title">
            {activeTab === 'dashboard' && 'Panel de Control Principal'}
            {activeTab === 'items' && 'Gestión e Inventario de Publicaciones'}
            {activeTab === 'sync' && 'Sincronizador Masivo ERP'}
            {activeTab === 'audit' && 'Auditoría de Precios y Neto a Recibir en Mano'}
            {activeTab === 'calculator' && 'Simulador de Precios y Margen'}
            {activeTab === 'stats' && 'Métricas de Publicaciones'}
          </h1>

          <div className={`status-badge ${health.token_valid ? '' : 'offline'}`}>
            {health.token_valid ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
            {health.token_valid ? `Conectado (${health.nickname})` : 'Backend u Token Offline'}
          </div>
        </header>

        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="cards-grid">
              <div className="card">
                <span className="card-title">Estado del Backend</span>
                <span className="card-value" style={{ color: health.status === 'online' ? '#10b981' : '#ef4444' }}>
                  {health.status.toUpperCase()}
                </span>
              </div>

              <div className="card">
                <span className="card-title">Cuenta Mercado Libre</span>
                <span className="card-value">{health.nickname || 'Sin Autenticar'}</span>
              </div>

              <div className="card">
                <span className="card-title">User ID MeLi</span>
                <span className="card-value">{health.user_id || 'N/A'}</span>
              </div>
            </div>

            {stats && (
              <div className="cards-grid">
                <div className="card">
                  <span className="card-title">Total Publicaciones</span>
                  <span className="card-value">{stats.total_publicaciones}</span>
                </div>
                <div className="card">
                  <span className="card-title">Publicaciones Activas</span>
                  <span className="card-value">{stats.publicaciones_activas}</span>
                </div>
                <div className="card">
                  <span className="card-title">Precio Promedio Venta</span>
                  <span className="card-value">${stats.precio_promedio.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PUBLICACIONES */}
        {activeTab === 'items' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Toolbar Superior Refactorizado */}
            <div className="toolbar-card">
              <div className="toolbar-controls">
                {/* Buscador */}
                <div className="search-input-wrapper">
                  <Search size={16} style={{ color: '#64748b' }} />
                  <input 
                    type="text" 
                    placeholder="Buscar por ID, SKU o título..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Separador Visual */}
                <div style={{ width: '1px', height: '24px', background: '#334155', margin: '0 4px' }}></div>

                {/* Filtro por Estado */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Filter size={14} style={{ color: '#94a3b8' }} />
                  <select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="custom-select"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="active">🟢 Solo Activas</option>
                    <option value="paused">🔴 Solo Pausadas</option>
                  </select>
                </div>

                {/* Selector de Orden */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ArrowUpDown size={14} style={{ color: '#94a3b8' }} />
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="custom-select"
                  >
                    <option value="title">Título</option>
                    <option value="price">Precio ML</option>
                    <option value="sku">SKU ERP</option>
                    <option value="id">ID MeLi</option>
                  </select>
                </div>

                {/* Botón de Dirección */}
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  title="Cambiar dirección de ordenamiento"
                >
                  {sortOrder === 'asc' ? '⬆️ Ascendente' : '⬇️ Descendente'}
                </button>
              </div>

              {/* Botón Refrescar */}
              <button className="btn-primary" onClick={loadItems} disabled={itemsLoading} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                <RefreshCw size={15} className={itemsLoading ? 'spin' : ''} /> 
                {itemsLoading ? 'Cargando...' : 'Refrescar Lista'}
              </button>
            </div>

            {/* Modal de edición */}
            {editingItem && (
              <div className="card" style={{ border: '1px solid #2563eb', background: '#1e293b' }}>
                <h3>Editar Precio: {editingItem.title} ({editingItem.id})</h3>
                <form onSubmit={handleUpdateItem} style={{ display: 'flex', gap: '15px', marginTop: '12px', alignItems: 'flex-end' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Nuevo Precio Mostrador ERP ($)</label>
                    <input 
                      type="number" 
                      value={editPrice} 
                      onChange={(e) => setEditPrice(e.target.value)} 
                      placeholder="Ej: 15000"
                      required
                    />
                  </div>
                  <button className="btn-primary" type="submit" disabled={updating}>
                    {updating ? 'Guardando...' : 'Aplicar Precio'}
                  </button>
                  <button type="button" className="btn-primary" style={{ background: '#475569' }} onClick={() => setEditingItem(null)}>
                    Cancelar
                  </button>
                </form>
              </div>
            )}

            <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                    <th style={{ padding: '14px 18px' }}>Imagen / ID</th>
                    <th style={{ padding: '14px 18px' }}>SKU ERP</th>
                    <th style={{ padding: '14px 18px' }}>Título de Publicación</th>
                    <th style={{ padding: '14px 18px' }}>Estado</th>
                    <th style={{ padding: '14px 18px' }}>Precio Mostrador</th>
                    <th style={{ padding: '14px 18px' }}>Precio ML Actual</th>
                    <th style={{ padding: '14px 18px' }}>Margen / Incremento</th>
                    <th style={{ padding: '14px 18px' }}>Última Actualización</th>
                    <th style={{ padding: '14px 18px', textAlign: 'right' }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map(item => {
                    const precioMostrador = item.precio_mostrador || Math.round(item.price * 0.70);
                    const incrementoPct = precioMostrador > 0 ? (((item.price - precioMostrador) / precioMostrador) * 100).toFixed(1) : '0.0';

                    // Formatear la fecha de última actualización
                    let fechaFormatted = 'N/A';
                    if (item.last_updated) {
                      try {
                        const d = new Date(item.last_updated);
                        fechaFormatted = d.toLocaleDateString('es-AR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        });
                      } catch (e) {
                        fechaFormatted = item.last_updated;
                      }
                    }

                    return (
                      <tr key={item.id} style={{ borderBottom: '1px solid #1e293b' }}>
                        <td style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {item.thumbnail ? (
                            <img src={item.thumbnail} alt="" style={{ width: 36, height: 36, borderRadius: 4, objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: 36, height: 36, background: '#334155', borderRadius: 4 }} />
                          )}
                          <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{item.id}</span>
                        </td>
                        <td style={{ padding: '12px 18px' }}>
                          <span style={{ 
                            background: '#0f172a', 
                            padding: '4px 8px', 
                            borderRadius: '6px', 
                            border: '1px solid #334155', 
                            fontFamily: 'monospace',
                            color: '#38bdf8' 
                          }}>
                            {item.sku || 'Sin SKU'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 18px', maxWidth: '280px' }}>
                          <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.title}
                          </div>
                        </td>
                        <td style={{ padding: '12px 18px' }}>
                          <span style={{ 
                            padding: '3px 8px', 
                            borderRadius: '12px', 
                            fontSize: '0.75rem', 
                            fontWeight: 600,
                            background: item.status === 'active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: item.status === 'active' ? '#10b981' : '#ef4444'
                          }}>
                            {item.status.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '12px 18px', color: '#94a3b8' }}>
                          ${precioMostrador.toLocaleString()}
                        </td>
                        <td style={{ padding: '12px 18px', fontWeight: 700, color: '#f8fafc' }}>
                          ${item.price.toLocaleString()}
                        </td>
                        <td style={{ padding: '12px 18px' }}>
                          <span style={{ 
                            color: '#10b981', 
                            fontWeight: 600, 
                            background: 'rgba(16, 185, 129, 0.1)', 
                            padding: '2px 8px', 
                            borderRadius: '6px' 
                          }}>
                            +{incrementoPct}%
                          </span>
                        </td>
                        <td style={{ padding: '12px 18px', fontSize: '0.8rem', color: '#94a3b8' }}>
                          {fechaFormatted}
                        </td>
                        <td style={{ padding: '12px 18px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button 
                              className="btn-primary" 
                              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                              onClick={() => { setEditingItem(item); setEditPrice(''); }}
                            >
                              <Edit3 size={14} /> Editar
                            </button>
                            {item.permalink && (
                              <a 
                                href={item.permalink} 
                                target="_blank" 
                                rel="noreferrer"
                                className="btn-primary"
                                style={{ background: '#334155', padding: '6px 10px' }}
                              >
                                <ExternalLink size={14} />
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: SINCRONIZADOR ERP */}
        {activeTab === 'sync' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px' }}>
            <div className="card">
              <h3 style={{ marginBottom: '15px' }}>Actualizar precios desde CSV</h3>
              
              <label className="dropzone">
                <UploadCloud size={40} style={{ color: '#2563eb', marginBottom: '10px' }} />
                <div>{file ? file.name : 'Haz clic o arrastra aquí tu archivo erp_precios.csv'}</div>
                <input type="file" accept=".csv" onChange={handleFileUpload} style={{ display: 'none' }} />
              </label>

              {syncStatus && (
                <div style={{ margin: '15px 0', padding: '12px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155' }}>
                  {syncStatus}
                </div>
              )}

              <button 
                className="btn-primary" 
                onClick={handleRunSync} 
                disabled={syncProgress.is_running}
                style={{ marginTop: '15px' }}
              >
                <Play size={16} /> {syncProgress.is_running ? 'Sincronización en proceso...' : 'Iniciar Sincronización en Background'}
              </button>
            </div>

            {/* Panel de Feedback y Progreso en Tiempo Real */}
            {(syncProgress.is_running || syncProgress.logs.length > 0) && (
              <div className="card" style={{ border: syncProgress.is_running ? '1px solid #2563eb' : '1px solid #334155' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <RefreshCw size={18} className={syncProgress.is_running ? 'spin' : ''} style={{ color: '#38bdf8' }} /> 
                    {syncProgress.is_running ? 'Sincronización Activa en Segundo Plano' : 'Último Reporte de Sincronización'}
                  </h3>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: syncProgress.is_running ? '#38bdf8' : '#10b981' }}>
                    {syncProgress.total > 0 ? `${Math.round((syncProgress.current / syncProgress.total) * 100)}% Completado` : 'Finalizado'}
                  </span>
                </div>

                {/* Barra de Progreso */}
                <div style={{ width: '100%', height: '8px', background: '#0f172a', borderRadius: '4px', overflow: 'hidden', marginBottom: '15px' }}>
                  <div style={{ 
                    height: '100%', 
                    width: syncProgress.total > 0 ? `${(syncProgress.current / syncProgress.total) * 100}%` : '0%', 
                    background: 'linear-gradient(90deg, #2563eb, #38bdf8)',
                    transition: 'width 0.3s ease' 
                  }} />
                </div>

                {/* Métricas de la Ejecución */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '15px' }}>
                  <div style={{ background: '#0f172a', padding: '10px 14px', borderRadius: '8px', border: '1px solid #334155' }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Procesados</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{syncProgress.current} / {syncProgress.total}</div>
                  </div>

                  <div style={{ background: '#0f172a', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                    <div style={{ fontSize: '0.75rem', color: '#10b981' }}>Exitosos</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#10b981' }}>{syncProgress.success_count}</div>
                  </div>

                  <div style={{ background: '#0f172a', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                    <div style={{ fontSize: '0.75rem', color: '#ef4444' }}>Fallidos</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ef4444' }}>{syncProgress.fail_count}</div>
                  </div>
                </div>

                {/* Console Terminal Log Output */}
                <div style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: '8px', padding: '12px', height: '180px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.8rem', color: '#cbd5e1' }}>
                  {syncProgress.logs.length > 0 ? (
                    syncProgress.logs.map((logLine, idx) => (
                      <div key={idx} style={{ padding: '3px 0', borderBottom: '1px dotted #1e293b' }}>
                        {logLine}
                      </div>
                    ))
                  ) : (
                    <div style={{ color: '#64748b' }}>Esperando ejecución...</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB AUDIT: AUDITORÍA DE PRECIOS */}
        {activeTab === 'audit' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="toolbar-card">
              <div className="toolbar-controls">
                <ShieldCheck size={20} style={{ color: '#38bdf8' }} />
                <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Tolerancia Aceptable (+/-):</span>
                <select 
                  value={tolerancePct} 
                  onChange={(e) => setTolerancePct(parseFloat(e.target.value))}
                  className="custom-select"
                >
                  <option value={2.0}>2% de tolerancia</option>
                  <option value={5.0}>5% de tolerancia (Recomendado)</option>
                  <option value={10.0}>10% de tolerancia</option>
                </select>
              </div>

              <button className="btn-primary" onClick={loadAuditReport} disabled={auditLoading}>
                <RefreshCw size={15} className={auditLoading ? 'spin' : ''} />
                {auditLoading ? 'Auditando...' : 'Re-analizar Precios'}
              </button>
            </div>

            {auditReport && (
              <>
                {/* Resumen de KPIs */}
                <div className="cards-grid">
                  <div className="card" style={{ borderLeft: '4px solid #38bdf8' }}>
                    <span className="card-title">Total Auditados</span>
                    <span className="card-value">{auditReport.total_auditados}</span>
                  </div>

                  <div className="card" style={{ borderLeft: '4px solid #10b981' }}>
                    <span className="card-title" style={{ color: '#10b981' }}>🟢 En Rango OK</span>
                    <span className="card-value" style={{ color: '#10b981' }}>{auditReport.en_rango_ok}</span>
                  </div>

                  <div className="card" style={{ borderLeft: '4px solid #ef4444' }}>
                    <span className="card-title" style={{ color: '#ef4444' }}>🔴 Recibe Menos que ERP</span>
                    <span className="card-value" style={{ color: '#ef4444' }}>{auditReport.recibe_menos}</span>
                  </div>

                  <div className="card" style={{ borderLeft: '4px solid #f59e0b' }}>
                    <span className="card-title" style={{ color: '#f59e0b' }}>🟡 Recibe Más que ERP</span>
                    <span className="card-value" style={{ color: '#f59e0b' }}>{auditReport.recibe_mas}</span>
                  </div>
                </div>

                {/* Tabla de Resultados de Auditoría */}
                <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                        <th style={{ padding: '14px 16px' }}>Publicación / SKU</th>
                        <th style={{ padding: '14px 16px' }}>Precio ML</th>
                        <th style={{ padding: '14px 16px' }}>Comisión % (Monto)</th>
                        <th style={{ padding: '14px 16px' }}>Costo Envío</th>
                        <th style={{ padding: '14px 16px', color: '#38bdf8' }}>Neto a Recibir en Mano</th>
                        <th style={{ padding: '14px 16px' }}>Mostrador ERP</th>
                        <th style={{ padding: '14px 16px' }}>Diferencia ($ / %)</th>
                        <th style={{ padding: '14px 16px' }}>Dictamen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditReport.items.map(item => {
                        let statusBadge = null;
                        if (item.status_evaluacion === 'OK') {
                          statusBadge = <span style={{ padding: '3px 10px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 600, fontSize: '0.75rem' }}>🟢 DENTRO DE RANGO</span>;
                        } else if (item.status_evaluacion === 'BAJO') {
                          statusBadge = <span style={{ padding: '3px 10px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', fontWeight: 600, fontSize: '0.75rem' }}>🔴 RECIBES MENOS</span>;
                        } else if (item.status_evaluacion === 'ALTO') {
                          statusBadge = <span style={{ padding: '3px 10px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', fontWeight: 600, fontSize: '0.75rem' }}>🟡 RECIBES MÁS</span>;
                        } else {
                          statusBadge = <span style={{ padding: '3px 10px', borderRadius: '12px', background: '#334155', color: '#94a3b8', fontWeight: 600, fontSize: '0.75rem' }}>⚪ SIN COINCIDENCIA</span>;
                        }

                        return (
                          <tr key={item.item_id} style={{ borderBottom: '1px solid #1e293b' }}>
                            <td style={{ padding: '12px 16px', maxWidth: '240px' }}>
                              <div style={{ fontWeight: 600, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>{item.item_id} | SKU: {item.sku}</div>
                            </td>

                            <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                              ${item.price_ml.toLocaleString()}
                            </td>

                            <td style={{ padding: '12px 16px', color: '#94a3b8' }}>
                              {item.comision_porcentaje}% (${item.comision_monto.toLocaleString()})
                            </td>

                            <td style={{ padding: '12px 16px', color: item.costo_envio > 0 ? '#f59e0b' : '#94a3b8' }}>
                              {item.costo_envio > 0 ? `$${item.costo_envio.toLocaleString()}` : 'Gratis / N/A'}
                            </td>

                            <td style={{ padding: '12px 16px', fontWeight: 700, color: '#38bdf8', fontSize: '0.95rem' }}>
                              ${item.neto_a_recibir.toLocaleString()}
                            </td>

                            <td style={{ padding: '12px 16px', color: '#94a3b8' }}>
                              {item.precio_mostrador_erp ? `$${item.precio_mostrador_erp.toLocaleString()}` : 'N/A'}
                            </td>

                            <td style={{ padding: '12px 16px' }}>
                              {item.precio_mostrador_erp ? (
                                <span style={{ color: item.diferencia_vs_mostrador >= 0 ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                                  {item.diferencia_vs_mostrador >= 0 ? '+' : ''}${item.diferencia_vs_mostrador.toLocaleString()} ({item.diferencia_pct}%)
                                </span>
                              ) : '-'}
                            </td>

                            <td style={{ padding: '12px 16px' }}>
                              {statusBadge}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 4: CALCULADORA */}
        {activeTab === 'calculator' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
            <form className="card" onSubmit={handleCalculate}>
              <h3>Parámetros de Entrada</h3>

              <div className="form-group">
                <label>Precio Mostrador ERP ($)</label>
                <input 
                  type="number" 
                  value={calcForm.precio_mostrador} 
                  onChange={(e) => setCalcForm({...calcForm, precio_mostrador: e.target.value})}
                  required 
                />
              </div>

              <div className="form-group">
                <label>Categoría Mercado Libre</label>
                <input 
                  type="text" 
                  value={calcForm.category_id} 
                  onChange={(e) => setCalcForm({...calcForm, category_id: e.target.value})}
                  required 
                />
              </div>

              <div className="form-group">
                <label>Tipo de Publicación</label>
                <select 
                  value={calcForm.listing_type_id} 
                  onChange={(e) => setCalcForm({...calcForm, listing_type_id: e.target.value})}
                >
                  <option value="gold_special">Clásica (gold_special)</option>
                  <option value="gold_pro">Premium (gold_pro)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Margen Adicional (%)</label>
                <input 
                  type="number" 
                  value={calcForm.margen_adicional_pct} 
                  onChange={(e) => setCalcForm({...calcForm, margen_adicional_pct: e.target.value})}
                />
              </div>

              <button className="btn-primary" type="submit" disabled={calcLoading}>
                {calcLoading ? 'Calculando...' : 'Calcular Precio Sugerido'}
              </button>
            </form>

            <div className="card">
              <h3>Desglose de Calculadora</h3>
              {calcResult ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>Neto Deseado: <strong>${calcResult.neto_deseado}</strong></div>
                  <div>Comisión MeLi (%): <strong>{calcResult.comision_porcentaje}%</strong></div>
                  <div>Cargo Fijo: <strong>${calcResult.cargo_fijo}</strong></div>
                  <div>Costo Envío Gratis: <strong>${calcResult.costo_envio}</strong></div>
                  <hr style={{ borderColor: '#334155', margin: '10px 0' }} />
                  <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#10b981' }}>
                    Precio Final Sugerido: ${calcResult.precio_final_meli}
                  </div>
                </div>
              ) : (
                <div style={{ color: '#94a3b8' }}>Ingresa los datos y presiona "Calcular".</div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: REGLAS POR CATEGORIA */}
        {activeTab === 'rules' && (
          <div className="card" style={{ maxWidth: '700px' }}>
            <h3>Configuración de Excepciones y Reglas de Categoría</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '20px' }}>
              Define qué categorías o productos (como <strong>Muebles</strong> y <strong>Carpintería de Aluminio</strong>) quedan excluidos de los ajustes de costo o descuentos automáticos por defecto.
            </p>

            <form onSubmit={handleSaveRules} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="form-group">
                <label>Descuento General ERP por Defecto (%)</label>
                <input 
                  type="number" 
                  value={rulesForm.general_discount_pct}
                  onChange={(e) => setRulesForm({...rulesForm, general_discount_pct: parseFloat(e.target.value) || 0})}
                />
              </div>

              <div className="form-group">
                <label>Bonificación / Descuento de Envíos Otorgado por MeLi (%)</label>
                <input 
                  type="number" 
                  value={rulesForm.shipping_discount_pct ?? 50.0}
                  onChange={(e) => setRulesForm({...rulesForm, shipping_discount_pct: parseFloat(e.target.value) || 0})}
                />
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Porcentaje de bonificación de envíos gratis en Mercado Envíos según tu reputación (por defecto 50%).
                </span>
              </div>

              <div className="form-group">
                <label>Palabras Clave Excluidas (separadas por comas)</label>
                <input 
                  type="text" 
                  value={rulesForm.excluded_keywords?.join(', ')} 
                  onChange={(e) => setRulesForm({...rulesForm, excluded_keywords: e.target.value.split(',').map(s => s.trim())})}
                  placeholder="Ej: mueble, muebles, aluminio, carpinteria"
                />
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Si el título de la publicación contiene alguna de estas palabras, NO se le aplicará el descuento masivo de mostrador.
                </span>
              </div>

              <div className="form-group">
                <label>IDs de Categorías Excluidas (separados por comas)</label>
                <input 
                  type="text" 
                  value={rulesForm.excluded_categories?.join(', ')} 
                  onChange={(e) => setRulesForm({...rulesForm, excluded_categories: e.target.value.split(',').map(s => s.trim())})}
                  placeholder="Ej: MLA378163, MLA1580"
                />
              </div>

              <div className="form-group">
                <label>Multiplicadores Manuales por Pack / Caja (Formato: SKU=Unidades)</label>
                <input 
                  type="text" 
                  value={Object.entries(rulesForm.pack_multipliers || {}).map(([k, v]) => `${k}=${v}`).join(', ')} 
                  onChange={(e) => {
                    const dict = {};
                    e.target.value.split(',').forEach(pair => {
                      const parts = pair.split('=').map(s => s.trim());
                      if (parts.length === 2 && parts[0] && !isNaN(parseInt(parts[1]))) {
                        dict[parts[0]] = parseInt(parts[1]);
                      }
                    });
                    setRulesForm({...rulesForm, pack_multipliers: dict});
                  }}
                  placeholder="Ej: 11129=14, 11125=6, MLA3126544086=14"
                />
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Sobrescribe manualmente la cantidad de unidades unitarias del ERP que contiene el pack (el sistema también detecta automáticamente si el título o MeLi indica "14 U.", "6 U." o "Pack x10").
                </span>
              </div>

              <button className="btn-primary" type="submit" disabled={rulesSaving}>
                <Save size={16} /> {rulesSaving ? 'Guardando Reglas...' : 'Guardar Reglas de Categoría'}
              </button>
            </form>
          </div>
        )}

        {/* TAB 6: ESTADISTICAS */}
        {activeTab === 'stats' && (
          <div className="card">
            <h3>Resumen Operativo de Publicaciones</h3>
            {stats ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                <p><strong>Cuenta:</strong> {stats.cuenta_usuario}</p>
                <p><strong>Publicaciones registradas:</strong> {stats.total_publicaciones}</p>
                <p><strong>Promedio general de lista:</strong> ${stats.precio_promedio}</p>
              </div>
            ) : (
              <p>Cargando estadísticas de Mercado Libre...</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
