import React, { useState, useEffect } from 'react';

// UI Comunes
import ToastContainer from './components/ui/Toast';
import PlatformSelectorScreen from './components/common/PlatformSelectorScreen';
import Sidebar from './components/common/Sidebar';
import Header from './components/common/Header';

// Módulos Mercado Libre
import MeliDashboard from './components/mercadolibre/MeliDashboard';
import MeliCatalog from './components/mercadolibre/MeliCatalog';
import MeliSyncView from './components/mercadolibre/MeliSyncView';
import MeliAuditView from './components/mercadolibre/MeliAuditView';
import MeliCalculator from './components/mercadolibre/MeliCalculator';
import MeliSettingsView from './components/mercadolibre/MeliSettingsView';
import MeliItemModal from './components/mercadolibre/MeliItemModal';
import MeliAuditDetailModal from './components/mercadolibre/MeliAuditDetailModal';

// Módulos Tiendanube
import TiendaNubeDashboard from './components/tiendanube/TiendaNubeDashboard';
import TiendaNubeCatalog from './components/tiendanube/TiendaNubeCatalog';
import TiendaNubeCategoriesView from './components/tiendanube/TiendaNubeCategoriesView';
import TiendaNubeAuditView from './components/tiendanube/TiendaNubeAuditView';
import TiendaNubeSyncView from './components/tiendanube/TiendaNubeSyncView';
import TiendaNubeProductModal from './components/tiendanube/TiendaNubeProductModal';

// Servicios de API
import {
  checkHealth,
  fetchStats,
  fetchItems,
  refreshItemsCache,
  updateSingleItem,
  fetchRules,
  saveRules,
  fetchAnalyticsSummary,
  fetchAuditReport,
  executeSync,
  fetchSyncStatus,
  // Tiendanube
  checkTiendanubeHealth,
  fetchTiendanubeMetrics,
  fetchTiendanubeVariants,
  fetchTiendanubeCategories,
  fetchTiendanubeCategoriesTree,
  refreshTiendanubeCatalog,
  refreshTiendanubeCategories,
  saveTiendanubeCategoryDiscount,
  saveTiendanubeVariantOverride,
  batchUpdateTiendanubeVariantOverrides,
  batchUpdateTiendanubeVariantPrices,
  fetchTiendanubeItemDetail,
  createTiendanubeProduct,
  updateTiendanubeProduct,
  deleteTiendanubeProduct,
  fetchTiendanubeAudit,
  updateTiendanubeVariant,
  fixTiendanubeVariantsBatch
} from './services/api';

export default function App() {
  // 1. ESTADO DE PLATAFORMA ACTIVA
  const [selectedPlatform, setSelectedPlatform] = useState(() => {
    return localStorage.getItem('selected_platform') || null;
  });

  // 2. TEMA OSCURO / CLARO (DARK MODE)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('app_theme') || 'light';
  });

  useEffect(() => {
    localStorage.setItem('app_theme', theme);
    const isDark = theme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    document.body.classList.toggle('dark', isDark);
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // 3. ZOOM SYSTEM (Ctrl++, Ctrl+-, Ctrl+0)
  const [zoomLevel, setZoomLevel] = useState(() => {
    const saved = localStorage.getItem('app_zoom_level');
    return saved ? parseFloat(saved) : 1.0;
  });

  useEffect(() => {
    localStorage.setItem('app_zoom_level', String(zoomLevel));
    document.documentElement.style.zoom = `${zoomLevel}`;
  }, [zoomLevel]);

  useEffect(() => {
    const handleZoomKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '+' || e.key === '=' || e.key === 'Add') {
          e.preventDefault();
          setZoomLevel(prev => Math.min(Math.round((prev + 0.05) * 100) / 100, 1.8));
        } else if (e.key === '-' || e.key === '_' || e.key === 'Subtract') {
          e.preventDefault();
          setZoomLevel(prev => Math.max(Math.round((prev - 0.05) * 100) / 100, 0.7));
        } else if (e.key === '0' || e.key === 'NumPad0') {
          e.preventDefault();
          setZoomLevel(1.0);
        }
      }
    };
    window.addEventListener('keydown', handleZoomKeyDown);
    return () => window.removeEventListener('keydown', handleZoomKeyDown);
  }, []);

  // 4. TABS ACTIVOS
  const [activeTabMeli, setActiveTabMeli] = useState('dashboard');
  const [activeTabTN, setActiveTabTN] = useState('dashboard');

  // 5. TOASTS
  const [toasts, setToasts] = useState([]);
  const addToast = (type, title, message = '') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // 6. ESTADO MERCADO LIBRE
  const [meliHealth, setMeliHealth] = useState({ status: 'checking', token_valid: false });
  const [meliStats, setMeliStats] = useState(null);
  const [meliAnalytics, setMeliAnalytics] = useState(null);
  const [meliItems, setMeliItems] = useState([]);
  const [meliAuditReport, setMeliAuditReport] = useState(null);
  const [meliAuditTolerance, setMeliAuditTolerance] = useState(5.0);
  const [meliSyncProgress, setMeliSyncProgress] = useState(null);
  const [meliSettings, setMeliSettings] = useState({
    general_discount_pct: 30.0,
    shipping_discount_pct: 50.0,
    default_tax_rate_pct: 0.65,
    default_listing_type: 'gold_special',
    tolerance_pct: 5.0,
    excluded_categories: [],
    excluded_keywords: ['mueble', 'aluminio'],
    pack_multipliers: {}
  });

  const [meliLoadingCatalog, setMeliLoadingCatalog] = useState(false);
  const [meliLoadingAudit, setMeliLoadingAudit] = useState(false);
  const [meliSavingSettings, setMeliSavingSettings] = useState(false);
  const [meliLastUpdatedCatalog, setMeliLastUpdatedCatalog] = useState(null);
  const [meliLastUpdatedAudit, setMeliLastUpdatedAudit] = useState(null);

  // Modales Mercado Libre
  const [editingMeliItem, setEditingMeliItem] = useState(null);
  const [inspectingMeliAuditItem, setInspectingMeliAuditItem] = useState(null);
  const [updatingMeliItem, setUpdatingMeliItem] = useState(false);

  // 7. ESTADO TIENDANUBE
  const [tnHealth, setTnHealth] = useState({ status: 'checking' });
  const [tnMetrics, setTnMetrics] = useState(null);
  const [tnVariants, setTnVariants] = useState([]);
  const [tnCategories, setTnCategories] = useState([]);
  const [tnCategoriesTree, setTnCategoriesTree] = useState([]);
  const [tnAuditReport, setTnAuditReport] = useState(null);
  const [tnAuditTolerance, setTnAuditTolerance] = useState(2.0);

  const [tnLoadingCatalog, setTnLoadingCatalog] = useState(false);
  const [tnLoadingAudit, setTnLoadingAudit] = useState(false);
  const [tnLoadingCategories, setTnLoadingCategories] = useState(false);

  // Modales Tiendanube
  const [tnProductModalOpen, setTnProductModalOpen] = useState(false);
  const [tnEditingProduct, setTnEditingProduct] = useState(null);

  // Health refresh global
  const [healthRefreshing, setHealthRefreshing] = useState(false);

  // Sincronizar persistencia de plataforma
  useEffect(() => {
    if (selectedPlatform) {
      localStorage.setItem('selected_platform', selectedPlatform);
    } else {
      localStorage.removeItem('selected_platform');
    }
  }, [selectedPlatform]);

  // Carga inicial de Health Checks
  const loadHealthChecks = async () => {
    setHealthRefreshing(true);
    try {
      const [mH, tH] = await Promise.all([
        checkHealth(),
        checkTiendanubeHealth()
      ]);
      setMeliHealth(mH);
      setTnHealth(tH);
    } catch (e) {
      console.error(e);
    } finally {
      setHealthRefreshing(false);
    }
  };

  useEffect(() => {
    loadHealthChecks();
  }, []);

  // CARGA DE DATOS MERCADO LIBRE
  const loadMeliDashboardData = async () => {
    try {
      const [h, st, an] = await Promise.all([
        checkHealth(),
        fetchStats(),
        fetchAnalyticsSummary()
      ]);
      setMeliHealth(h || { status: 'offline', token_valid: false });
      if (st) setMeliStats(st);
      if (an) setMeliAnalytics(an);
    } catch (err) {
      console.error(err);
    }
  };

  const loadMeliCatalog = async (force = false) => {
    setMeliLoadingCatalog(true);
    try {
      let data = [];
      if (force) {
        data = await refreshItemsCache();
      } else {
        data = await fetchItems(200, false);
      }
      setMeliItems(Array.isArray(data) ? data : []);
      setMeliLastUpdatedCatalog(new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }));
      if (force) {
        addToast('success', 'Catálogo Actualizado', `${(data || []).length} publicaciones sincronizadas desde Mercado Libre.`);
      }
    } catch (err) {
      addToast('error', 'Error al Cargar Catálogo', err.message);
    } finally {
      setMeliLoadingCatalog(false);
    }
  };

  const loadMeliAudit = async (tolerance = meliAuditTolerance) => {
    setMeliLoadingAudit(true);
    try {
      const data = await fetchAuditReport(tolerance);
      setMeliAuditReport(data);
      setMeliLastUpdatedAudit(new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      addToast('error', 'Error en Auditoría', err.message);
    } finally {
      setMeliLoadingAudit(false);
    }
  };

  const loadMeliSettings = async () => {
    try {
      const rules = await fetchRules();
      if (rules && typeof rules === 'object') {
        setMeliSettings(prev => ({ ...prev, ...rules }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // CARGA DE DATOS TIENDANUBE
  const loadTnDashboardData = async () => {
    try {
      const [h, m] = await Promise.all([
        checkTiendanubeHealth(),
        fetchTiendanubeMetrics()
      ]);
      setTnHealth(h || { status: 'offline' });
      setTnMetrics(m);
    } catch (err) {
      console.error(err);
    }
  };

  const loadTnCatalog = async (force = false) => {
    setTnLoadingCatalog(true);
    try {
      if (force) {
        await refreshTiendanubeCatalog();
      }
      const [vars, cats] = await Promise.all([
        fetchTiendanubeVariants('', null, 500, 0),
        fetchTiendanubeCategories()
      ]);
      setTnVariants(Array.isArray(vars) ? vars : []);
      setTnCategories(Array.isArray(cats) ? cats : []);
      if (force) {
        addToast('success', 'Catálogo Tiendanube Actualizado', `${(vars || []).length} variantes sincronizadas.`);
      }
    } catch (err) {
      addToast('error', 'Error al Cargar Tiendanube', err.message);
    } finally {
      setTnLoadingCatalog(false);
    }
  };

  const loadTnCategories = async (force = false) => {
    setTnLoadingCategories(true);
    try {
      if (force) {
        await refreshTiendanubeCategories();
      }
      const tree = await fetchTiendanubeCategoriesTree();
      setTnCategoriesTree(Array.isArray(tree) ? tree : []);
    } catch (err) {
      addToast('error', 'Error al Cargar Categorías', err.message);
      setTnCategoriesTree([]);
    } finally {
      setTnLoadingCategories(false);
    }
  };

  const loadTnAudit = async (tolerance = tnAuditTolerance) => {
    setTnLoadingAudit(true);
    try {
      const rep = await fetchTiendanubeAudit(tolerance);
      setTnAuditReport(rep);
    } catch (err) {
      addToast('error', 'Error en Auditoría Tiendanube', err.message);
    } finally {
      setTnLoadingAudit(false);
    }
  };

  // Carga según selección y tab
  useEffect(() => {
    if (selectedPlatform === 'mercadolibre') {
      if (activeTabMeli === 'dashboard') loadMeliDashboardData();
      if (activeTabMeli === 'items' && meliItems.length === 0) loadMeliCatalog(false);
      if (activeTabMeli === 'audit' && !meliAuditReport) loadMeliAudit(meliAuditTolerance);
      if (activeTabMeli === 'rules') loadMeliSettings();
    } else if (selectedPlatform === 'tiendanube') {
      if (activeTabTN === 'dashboard') loadTnDashboardData();
      if (activeTabTN === 'items' && tnVariants.length === 0) loadTnCatalog(false);
      if (activeTabTN === 'categories' && tnCategoriesTree.length === 0) loadTnCategories(false);
      if (activeTabTN === 'audit' && !tnAuditReport) loadTnAudit(tnAuditTolerance);
    }
  }, [selectedPlatform, activeTabMeli, activeTabTN]);

  // Polling de Sincronización Mercado Libre
  useEffect(() => {
    let interval = null;
    if (selectedPlatform === 'mercadolibre') {
      interval = setInterval(async () => {
        const status = await fetchSyncStatus();
        if (status) {
          setMeliSyncProgress(status);
          if (status.is_running === false && status.finished_at && meliSyncProgress?.is_running) {
            addToast('success', 'Sincronización MeLi Finalizada', `Procesados ${status.success_count} ítems con éxito.`);
            loadMeliCatalog(false);
          }
        }
      }, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedPlatform, meliSyncProgress]);

  // HANDLERS MERCADO LIBRE
  const handleSaveMeliItem = async (itemId, payload) => {
    setUpdatingMeliItem(true);
    try {
      await updateSingleItem(itemId, payload);
      addToast('success', 'Publicación Actualizada', `Ítem ${itemId} modificado con éxito.`);
      setEditingMeliItem(null);
      loadMeliCatalog(false);
    } catch (err) {
      addToast('error', 'Error al Modificar Ítem', err.message);
    } finally {
      setUpdatingMeliItem(false);
    }
  };

  const handleSaveMeliSettings = async (e) => {
    if (e) e.preventDefault();
    setMeliSavingSettings(true);
    try {
      await saveRules(meliSettings);
      addToast('success', 'Configuración Guardada', 'Reglas y parámetros de Mercado Libre actualizados.');
    } catch (err) {
      addToast('error', 'Error al Guardar Reglas', err.message);
    } finally {
      setMeliSavingSettings(false);
    }
  };

  const handleRunMeliSync = async (margen = 0.0) => {
    try {
      await executeSync(margen);
      addToast('info', 'Sincronización Iniciada', 'Actualizando precios en Mercado Libre en segundo plano...');
    } catch (err) {
      addToast('error', 'Fallo al Iniciar Sincronización', err.message);
    }
  };

  // HANDLERS TIENDANUBE
  const handleSaveTnProduct = async (productPayload) => {
    try {
      if (tnEditingProduct?.id) {
        await updateTiendanubeProduct(tnEditingProduct.id, productPayload);
        addToast('success', 'Producto Actualizado', 'Los cambios se reflejaron en Tiendanube.');
      } else {
        await createTiendanubeProduct(productPayload);
        addToast('success', 'Producto Creado', 'Nuevo producto publicado en Tiendanube.');
      }
      setTnProductModalOpen(false);
      setTnEditingProduct(null);
      loadTnCatalog(false);
    } catch (err) {
      addToast('error', 'Error al Guardar Producto', err.message);
    }
  };

  const handleOpenEditTnProduct = async (productId) => {
    try {
      const detail = await fetchTiendanubeItemDetail(productId);
      setTnEditingProduct(detail);
      setTnProductModalOpen(true);
    } catch (err) {
      addToast('error', 'Error al Cargar Detalle', err.message);
    }
  };

  const handleDeleteTnProduct = async (productId) => {
    if (!window.confirm(`¿Estás seguro de eliminar el producto #${productId} de Tiendanube?`)) return;
    try {
      await deleteTiendanubeProduct(productId);
      addToast('success', 'Producto Eliminado', `Producto #${productId} removido.`);
      loadTnCatalog(false);
    } catch (err) {
      addToast('error', 'Error al Eliminar', err.message);
    }
  };

  const handleSaveTnCategoryDiscount = async (catId, discountPct) => {
    try {
      await saveTiendanubeCategoryDiscount(catId, discountPct);
      addToast('success', 'Descuento Guardado', `Categoría #${catId} establecida en ${discountPct}%.`);
      loadTnCategories(false);
    } catch (err) {
      addToast('error', 'Error al Guardar Descuento', err.message);
    }
  };

  const handleSaveTnVariantOverride = async (variantId, data) => {
    try {
      await saveTiendanubeVariantOverride(variantId, data);
      addToast('success', 'Variante Actualizada', 'Descuento individual modificado.');
      loadTnCatalog(false);
    } catch (err) {
      addToast('error', 'Error al Guardar Variante', err.message);
    }
  };

  const handleBatchUpdateTnOverrides = async (selectedList, discountPct) => {
    try {
      await batchUpdateTiendanubeVariantOverrides(selectedList, discountPct);
      addToast('success', 'Descuentos Masivos Aplicados', `${selectedList.length} variantes actualizadas.`);
      loadTnCatalog(false);
    } catch (err) {
      addToast('error', 'Error en Acción Masiva', err.message);
    }
  };

  const handleBatchUpdateTnPrices = async (selectedList, mode, value) => {
    try {
      await batchUpdateTiendanubeVariantPrices(selectedList, mode, value);
      addToast('success', 'Precios Masivos Actualizados', `${selectedList.length} variantes modificadas.`);
      loadTnCatalog(false);
    } catch (err) {
      addToast('error', 'Error en Actualización de Precios', err.message);
    }
  };

  const handleFixTnSinglePrice = async (productId, variantId, newPrice) => {
    try {
      await updateTiendanubeVariant(productId, variantId, { price: newPrice });
      addToast('success', 'Precio Corregido', `Variante #${variantId} actualizada a $${newPrice}.`);
      loadTnAudit(tnAuditTolerance);
    } catch (err) {
      addToast('error', 'Error al Corregir Precio', err.message);
    }
  };

  const handleFixTnBatchPrices = async (items) => {
    try {
      await fixTiendanubeVariantsBatch(items);
      addToast('success', 'Corrección Masiva Finalizada', `${items.length} variantes corregidas con éxito.`);
      loadTnAudit(tnAuditTolerance);
    } catch (err) {
      addToast('error', 'Error en Corrección Masiva', err.message);
    }
  };

  // SI NO HAY PLATAFORMA SELECCIONADA, MOSTRAR EL HUB INSTITUCIONAL
  if (!selectedPlatform) {
    return (
      <div className={theme === 'dark' ? 'dark' : ''}>
        <PlatformSelectorScreen
          onSelectPlatform={(p) => setSelectedPlatform(p)}
          meliHealth={meliHealth}
          tnHealth={tnHealth}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    );
  }

  const isTN = selectedPlatform === 'tiendanube';
  const currentActiveTab = isTN ? activeTabTN : activeTabMeli;
  const setCurrentActiveTab = isTN ? setActiveTabTN : setActiveTabMeli;

  return (
    <div className={`flex h-screen w-screen bg-[#faf9f5] dark:bg-[#141413] text-[#141413] dark:text-[#faf9f5] font-sans antialiased overflow-hidden ${theme === 'dark' ? 'dark' : ''}`}>
      
      {/* 1. SIDEBAR UNIFICADO & COLLAPSIBLE */}
      <Sidebar
        selectedPlatform={selectedPlatform}
        activeTab={currentActiveTab}
        onSelectTab={setCurrentActiveTab}
        onBackToHub={() => setSelectedPlatform(null)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* 2. ÁREA PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Contenido con Scroll */}
        <main className="flex-1 p-6 overflow-y-auto flex flex-col gap-6">
          
          {/* Header Unificado */}
          <Header
            selectedPlatform={selectedPlatform}
            activeTab={currentActiveTab}
            meliHealth={meliHealth}
            tnHealth={tnHealth}
            onRefreshHealth={loadHealthChecks}
            healthRefreshing={healthRefreshing}
            onOpenSettings={() => setCurrentActiveTab('rules')}
            onBackToHub={() => setSelectedPlatform(null)}
            theme={theme}
            onToggleTheme={toggleTheme}
          />

          {/* VISTAS DE MERCADO LIBRE */}
          {!isTN && (
            <>
              {activeTabMeli === 'dashboard' && (
                <MeliDashboard
                  health={meliHealth}
                  stats={meliStats}
                  analyticsData={meliAnalytics}
                  onNavigateToTab={setActiveTabMeli}
                  onRefreshHealth={loadMeliDashboardData}
                  refreshing={healthRefreshing}
                />
              )}

              {activeTabMeli === 'items' && (
                <MeliCatalog
                  items={meliItems}
                  loading={meliLoadingCatalog}
                  onRefresh={() => loadMeliCatalog(true)}
                  onOpenEdit={(item) => setEditingMeliItem(item)}
                  lastUpdated={meliLastUpdatedCatalog}
                />
              )}

              {activeTabMeli === 'sync' && (
                <MeliSyncView
                  onRunSync={handleRunMeliSync}
                  syncProgress={meliSyncProgress}
                  onAddToast={addToast}
                />
              )}

              {activeTabMeli === 'audit' && (
                <MeliAuditView
                  auditReport={meliAuditReport}
                  loading={meliLoadingAudit}
                  onRefresh={() => loadMeliAudit(meliAuditTolerance)}
                  tolerancePct={meliAuditTolerance}
                  onToleranceChange={(newTol) => {
                    setMeliAuditTolerance(newTol);
                    loadMeliAudit(newTol);
                  }}
                  onInspectItem={(item) => setInspectingMeliAuditItem(item)}
                  lastUpdated={meliLastUpdatedAudit}
                />
              )}

              {activeTabMeli === 'calculator' && (
                <MeliCalculator onAddToast={addToast} />
              )}

              {activeTabMeli === 'rules' && (
                <MeliSettingsView
                  settingsForm={meliSettings}
                  setSettingsForm={setMeliSettings}
                  onSaveSettings={handleSaveMeliSettings}
                  saving={meliSavingSettings}
                />
              )}
            </>
          )}

          {/* VISTAS DE TIENDANUBE */}
          {isTN && (
            <>
              {activeTabTN === 'dashboard' && (
                <TiendaNubeDashboard
                  health={tnHealth}
                  metrics={tnMetrics}
                  onRefreshCatalog={() => loadTnCatalog(true)}
                  onNavigateToSync={() => setActiveTabTN('sync')}
                  onOpenCreateModal={() => {
                    setTnEditingProduct(null);
                    setTnProductModalOpen(true);
                  }}
                  onNavigateToCatalog={() => setActiveTabTN('items')}
                  loading={tnLoadingCatalog}
                />
              )}

              {activeTabTN === 'items' && (
                <TiendaNubeCatalog
                  variants={tnVariants}
                  categories={tnCategories}
                  loading={tnLoadingCatalog}
                  onRefresh={() => loadTnCatalog(true)}
                  onOpenCreate={() => {
                    setTnEditingProduct(null);
                    setTnProductModalOpen(true);
                  }}
                  onOpenEdit={handleOpenEditTnProduct}
                  onDelete={handleDeleteTnProduct}
                  onSaveVariantOverride={handleSaveTnVariantOverride}
                  onBatchUpdateOverrides={handleBatchUpdateTnOverrides}
                  onBatchUpdatePrices={handleBatchUpdatePrices}
                />
              )}

              {activeTabTN === 'categories' && (
                <TiendaNubeCategoriesView
                  categoriesTree={tnCategoriesTree}
                  loading={tnLoadingCategories}
                  onRefresh={() => loadTnCategories(true)}
                  onSaveCategoryDiscount={handleSaveTnCategoryDiscount}
                />
              )}

              {activeTabTN === 'audit' && (
                <TiendaNubeAuditView
                  auditReport={tnAuditReport}
                  loading={tnLoadingAudit}
                  onRefresh={() => loadTnAudit(tnAuditTolerance)}
                  onFixPrice={handleFixTnSinglePrice}
                  onFixBatch={handleFixTnBatchPrices}
                  tolerancePct={tnAuditTolerance}
                  onToleranceChange={(newTol) => {
                    setTnAuditTolerance(newTol);
                    loadTnAudit(newTol);
                  }}
                />
              )}

              {activeTabTN === 'sync' && (
                <TiendaNubeSyncView
                  onAddToast={addToast}
                  onSyncFinished={() => {
                    loadTnCatalog(false);
                    loadTnDashboardData();
                  }}
                />
              )}
            </>
          )}

        </main>
      </div>

      {/* 3. MODALES MERCADO LIBRE */}
      <MeliItemModal
        isOpen={Boolean(editingMeliItem)}
        onClose={() => setEditingMeliItem(null)}
        item={editingMeliItem}
        onSave={handleSaveMeliItem}
        updating={updatingMeliItem}
      />

      <MeliAuditDetailModal
        isOpen={Boolean(inspectingMeliAuditItem)}
        onClose={() => setInspectingMeliAuditItem(null)}
        item={inspectingMeliAuditItem}
      />

      {/* 4. MODALES TIENDANUBE */}
      <TiendaNubeProductModal
        isOpen={tnProductModalOpen}
        onClose={() => {
          setTnProductModalOpen(false);
          setTnEditingProduct(null);
        }}
        onSave={handleSaveTnProduct}
        productData={tnEditingProduct}
        categories={tnCategories}
      />

      {/* 5. SISTEMA DE TOASTS FLOTANTES */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

    </div>
  );
}
