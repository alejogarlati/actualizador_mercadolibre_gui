import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Plus, 
  Edit3, 
  Trash2, 
  ChevronLeft,
  ChevronRight, 
  ChevronsLeft,
  ChevronsRight,
  Tag, 
  Package, 
  CheckCircle2, 
  AlertCircle,
  AlertTriangle,
  Sliders,
  Percent,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function TiendaNubeCatalog({ 
  variants = [], 
  categories = [], 
  loading = false, 
  onRefresh, 
  onOpenCreate, 
  onOpenEdit, 
  onDelete,
  onQuickUpdate,
  onSaveVariantOverride 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [discountFilter, setDiscountFilter] = useState('all'); // 'all', 'custom', 'category'

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25); // 15, 25, 50, 100, 'all'

  // Quick edit state (precio y stock)
  const [quickEditItem, setQuickEditItem] = useState(null);
  const [quickPrice, setQuickPrice] = useState('');
  const [quickPromoPrice, setQuickPromoPrice] = useState('');
  const [quickStock, setQuickStock] = useState('');

  // Variant discount override modal state
  const [overrideItem, setOverrideItem] = useState(null);
  const [overridePct, setOverridePct] = useState('');

  const openQuickEdit = (item) => {
    setQuickEditItem(item);
    setQuickPrice(item.price || '');
    setQuickPromoPrice(item.promotional_price || '');
    setQuickStock(item.stock !== null && item.stock !== undefined ? item.stock : '');
  };

  const handleSaveQuickEdit = () => {
    if (!quickEditItem) return;
    onQuickUpdate(quickEditItem.product_id, {
      variant_id: quickEditItem.variant_id,
      price: quickPrice ? parseFloat(quickPrice) : undefined,
      promotional_price: quickPromoPrice ? parseFloat(quickPromoPrice) : null,
      stock: quickStock !== '' ? parseInt(quickStock) : undefined
    });
    setQuickEditItem(null);
  };

  const openOverrideModal = (item) => {
    setOverrideItem(item);
    setOverridePct(item.custom_discount_pct !== null && item.custom_discount_pct !== undefined ? item.custom_discount_pct : '');
  };

  const handleSaveOverride = () => {
    if (!overrideItem) return;
    const val = overridePct !== '' ? parseFloat(overridePct) : null;
    onSaveVariantOverride(overrideItem.variant_id, {
      product_id: overrideItem.product_id,
      sku: overrideItem.sku,
      custom_discount_pct: val
    });
    setOverrideItem(null);
  };

  // Filtrado de variantes
  const filteredVariants = useMemo(() => {
    return (variants || []).filter(item => {
      const matchSearch = 
        item.display_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(item.product_id).includes(searchTerm) ||
        String(item.variant_id).includes(searchTerm);

      const matchStatus = 
        statusFilter === 'all' || 
        (statusFilter === 'active' && item.status === 'active') ||
        (statusFilter === 'hidden' && item.status === 'hidden');

      const matchCat = 
        categoryFilter === 'all' || 
        String(item.category_id) === String(categoryFilter);

      const matchDiscount = 
        discountFilter === 'all' ||
        (discountFilter === 'custom' && item.discount_origin === 'custom') ||
        (discountFilter === 'category' && item.discount_origin === 'category');

      return matchSearch && matchStatus && matchCat && matchDiscount;
    });
  }, [variants, searchTerm, statusFilter, categoryFilter, discountFilter]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, categoryFilter, discountFilter, pageSize]);

  // Cálculos de Paginación
  const effectivePageSize = pageSize === 'all' ? filteredVariants.length || 1 : pageSize;
  const totalPages = Math.max(1, Math.ceil(filteredVariants.length / effectivePageSize));
  
  const paginatedVariants = useMemo(() => {
    if (pageSize === 'all') return filteredVariants;
    const start = (currentPage - 1) * pageSize;
    return filteredVariants.slice(start, start + pageSize);
  }, [filteredVariants, currentPage, pageSize]);

  const startIdx = filteredVariants.length === 0 ? 0 : (currentPage - 1) * effectivePageSize + 1;
  const endIdx = pageSize === 'all' ? filteredVariants.length : Math.min(currentPage * pageSize, filteredVariants.length);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, currentPage + 2);

      if (start === 1) end = Math.min(totalPages, maxVisible);
      if (end === totalPages) start = Math.max(1, totalPages - maxVisible + 1);

      for (let i = start; i <= end; i++) pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Barra de Filtros, Búsqueda y Acciones */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex-1 flex flex-wrap items-center gap-3">
          {/* Buscador */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar variante por SKU, nombre, medida, marca o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-red-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Filtro por Categoría */}
          {categories && categories.length > 0 && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-50 text-slate-700 text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-red-500 max-w-[200px] truncate"
            >
              <option value="all">Todas las categorías</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          )}

          {/* Filtro por Tipo de Descuento */}
          <div className="flex items-center gap-1.5">
            <Percent className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={discountFilter}
              onChange={(e) => setDiscountFilter(e.target.value)}
              className="bg-slate-50 text-slate-700 text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-red-500"
            >
              <option value="all">Todos los factores</option>
              <option value="custom">🎯 Descuento Personalizado (Variante)</option>
              <option value="category">📁 Descuento por Categoría</option>
            </select>
          </div>

          {/* Filtro por Estado */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 text-slate-700 text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-red-500"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="hidden">Ocultos</option>
            </select>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm transition-all disabled:opacity-50"
            title="Refrescar catálogo desde la API de Tiendanube"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-red-600' : 'text-slate-500'}`} />
            <span className="hidden sm:inline">Refrescar</span>
          </button>

          <button
            onClick={onOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-200 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      {/* Indicador de Resumen de Catálogo */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <div className="flex items-center gap-2">
          <span>Mostrando <strong className="text-slate-800">{startIdx} - {endIdx}</strong> de <strong className="text-slate-800">{filteredVariants.length}</strong> variantes independientes</span>
        </div>

        {/* Selector de cantidad por página rápido */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400">Por página:</span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
            className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 font-semibold focus:outline-none focus:border-red-500"
          >
            <option value={15}>15</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value="all">Todos ({filteredVariants.length})</option>
          </select>
        </div>
      </div>

      {/* TABLA DE VARIANTES INDEPENDIENTES */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 w-10 text-center">#</th>
                <th className="py-3.5 px-4">Producto & Atributos de Variante</th>
                <th className="py-3.5 px-4">SKU ERP</th>
                <th className="py-3.5 px-4">Categoría / Sub-Cat</th>
                <th className="py-3.5 px-4 text-right">Costo Mostrador</th>
                <th className="py-3.5 px-4 text-center">Factor / Descuento</th>
                <th className="py-3.5 px-4 text-right">Precio Tienda</th>
                <th className="py-3.5 px-4 text-center">Stock</th>
                <th className="py-3.5 px-4 text-center">Estado</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {loading && variants.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-16 text-center text-slate-500">
                    <RefreshCw className="w-7 h-7 animate-spin mx-auto mb-2 text-red-600" />
                    <span className="font-semibold">Cargando variantes de Tiendanube...</span>
                  </td>
                </tr>
              ) : paginatedVariants.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-16 text-center text-slate-500">
                    <Package className="w-10 h-10 mx-auto mb-2 text-slate-400" />
                    <p className="text-sm font-bold text-slate-700">No se encontraron variantes</p>
                    <p className="text-xs text-slate-400 mt-1">Prueba refrescar desde la API o modificar los filtros de búsqueda.</p>
                  </td>
                </tr>
              ) : (
                paginatedVariants.map((item, idx) => {
                  const hasPromo = item.promotional_price && item.promotional_price > 0;
                  const rowNumber = startIdx + idx;
                  const isCustom = item.discount_origin === 'custom';

                  return (
                    <tr key={`${item.product_id}-${item.variant_id}`} className="hover:bg-slate-50/80 transition-colors">
                      {/* Número de fila */}
                      <td className="py-3 px-4 text-center text-slate-400 font-mono text-[10px]">
                        {rowNumber}
                      </td>

                      {/* Thumbnail, Título y Variante */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {item.thumbnail ? (
                            <img
                              src={item.thumbnail}
                              alt={item.product_name}
                              className="w-10 h-10 object-cover rounded-xl border border-slate-200 bg-slate-50 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                              <Package className="w-4 h-4" />
                            </div>
                          )}
                          <div className="max-w-md">
                            <div className="font-semibold text-slate-900 flex items-center gap-1.5 flex-wrap">
                              <span>{item.product_name}</span>
                              {item.variant_str && (
                                <span className="bg-red-50 text-red-700 text-[11px] font-bold px-2 py-0.5 rounded-lg border border-red-200">
                                  {item.variant_str}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5 flex-wrap">
                              <span className="font-mono text-slate-400">Var #{item.variant_id}</span>
                              {item.brand && <span>• <strong className="text-slate-700">{item.brand}</strong></span>}
                              {item.free_shipping && (
                                <span className="bg-emerald-50 text-emerald-700 text-[10px] px-1.5 py-0.2 rounded border border-emerald-200 font-medium">
                                  Envío Gratis
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* SKU ERP */}
                      <td className="py-3 px-4 font-mono font-medium text-slate-700">
                        {item.sku ? (
                          <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                            {item.sku}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Sin SKU</span>
                        )}
                      </td>

                      {/* Categoría / Subcategoría */}
                      <td className="py-3 px-4 text-slate-600 max-w-[180px] truncate" title={item.category_name}>
                        <span className="bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg text-[11px] font-medium text-slate-700">
                          {item.category_name}
                        </span>
                      </td>

                      {/* Costo Mostrador ERP */}
                      <td className="py-3 px-4 text-right font-mono text-slate-600 font-medium">
                        {item.cost ? `$${item.cost.toLocaleString('es-AR', { minimumFractionDigits: 2 })}` : (
                          <span className="text-slate-400 italic">Sin ERP</span>
                        )}
                      </td>

                      {/* Factor / Descuento Aplicado */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => openOverrideModal(item)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold border transition-all cursor-pointer ${
                            isCustom
                              ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 shadow-2xs'
                              : item.applied_discount_pct !== 0
                              ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                              : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                          }`}
                          title="Haz clic para sobreescribir el descuento de esta variante"
                        >
                          <span>{item.applied_discount_pct > 0 ? `-${item.applied_discount_pct}%` : `${item.applied_discount_pct}%`}</span>
                          <span className="text-[9px] uppercase tracking-wide opacity-80">
                            ({isCustom ? 'Manual' : 'Cat'})
                          </span>
                          <Edit3 className="w-3 h-3 text-slate-400 hover:text-slate-600" />
                        </button>
                      </td>

                      {/* Precio Publicado en Tienda */}
                      <td className="py-3 px-4 text-right font-mono">
                        <div className={`font-semibold ${hasPromo ? 'line-through text-slate-400 text-[10px]' : 'text-slate-900'}`}>
                          ${(item.price || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </div>
                        {hasPromo && (
                          <div className="font-bold text-emerald-600">
                            ${item.promotional_price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                          </div>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="py-3 px-4 text-center">
                        {item.stock !== null && item.stock !== undefined ? (
                          item.stock > 0 ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {item.stock} u.
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-red-50 text-red-700 border border-red-200">
                              Agotado
                            </span>
                          )
                        ) : (
                          <span className="text-slate-400 text-[11px]">Ilimitado</span>
                        )}
                      </td>

                      {/* Estado */}
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                          item.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                          {item.status === 'active' ? 'Publicado' : 'Oculto'}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openOverrideModal(item)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                            title="Sobreescribir factor de descuento para esta variante"
                          >
                            <Percent className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openQuickEdit(item)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Ajuste rápido de precio y stock de la variante"
                          >
                            <Sliders className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onOpenEdit(item.product_id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            title="Editar ficha completa del producto padre"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDelete(item.product_id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Eliminar producto completo de Tiendanube"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Barra de Paginación Inferior */}
        {filteredVariants.length > 0 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="text-slate-500 font-medium">
              Página <strong className="text-slate-800">{currentPage}</strong> de <strong className="text-slate-800">{totalPages}</strong> ({filteredVariants.length} variantes individuales)
            </div>

            {/* Controles de Navegación de Páginas */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 disabled:opacity-40 disabled:hover:bg-white shadow-2xs transition-colors"
                title="Primera página"
              >
                <ChevronsLeft className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 disabled:opacity-40 disabled:hover:bg-white shadow-2xs transition-colors"
                title="Página anterior"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {/* Botones de Páginas Numéricas */}
              <div className="flex items-center gap-1 mx-1">
                {getPageNumbers().map(num => (
                  <button
                    key={num}
                    onClick={() => setCurrentPage(num)}
                    className={`min-w-[32px] h-8 px-2.5 rounded-xl text-xs font-bold transition-all ${
                      currentPage === num
                        ? 'bg-red-600 text-white shadow-md shadow-red-200'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 shadow-2xs'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 disabled:opacity-40 disabled:hover:bg-white shadow-2xs transition-colors"
                title="Página siguiente"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 disabled:opacity-40 disabled:hover:bg-white shadow-2xs transition-colors"
                title="Última página"
              >
                <ChevronsRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Sobreescritura de Descuento por Variante */}
      {overrideItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4">
            <div>
              <div className="flex items-center gap-2 text-red-600 font-bold text-xs uppercase tracking-wider mb-1">
                <Percent className="w-4 h-4" />
                <span>Descuento Discrecional por Variante</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">{overrideItem.display_title}</h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">SKU: {overrideItem.sku || 'Sin SKU'}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5 text-slate-600">
              <div className="flex justify-between">
                <span>Categoría asignada:</span>
                <strong className="text-slate-800">{overrideItem.category_name}</strong>
              </div>
              <div className="flex justify-between">
                <span>Descuento base de la Categoría:</span>
                <strong className="text-slate-800">{overrideItem.category_discount_pct}%</strong>
              </div>
              <div className="flex justify-between">
                <span>Costo mostrador ERP:</span>
                <strong className="text-slate-800 font-mono">${overrideItem.cost ? overrideItem.cost.toLocaleString('es-AR') : 'N/A'}</strong>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Descuento personalizado para esta variante (%):
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  placeholder={`Por defecto usa el de categoría (${overrideItem.category_discount_pct}%)`}
                  value={overridePct}
                  onChange={(e) => setOverridePct(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 font-mono font-bold text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-red-500 focus:bg-white focus:outline-none pr-8"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Dejalo vacío para restaurar el descuento heredado de la categoría ({overrideItem.category_discount_pct}%).
              </p>
            </div>

            {/* Simulación en vivo */}
            {overrideItem.cost && (
              <div className="p-3 bg-red-50/70 border border-red-100 rounded-xl text-xs flex items-center justify-between">
                <span className="text-red-950 font-medium">Nuevo precio estimado Tiendanube:</span>
                <strong className="text-red-700 font-mono text-sm">
                  ${(overrideItem.cost * (1 - ((overridePct !== '' ? parseFloat(overridePct) : overrideItem.category_discount_pct) / 100))).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </strong>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                onClick={() => setOverrideItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveOverride}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-200"
              >
                Guardar Descuento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Ajuste Rápido (Precio y Stock) */}
      {quickEditItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 w-full max-w-sm rounded-2xl shadow-2xl p-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Ajuste Rápido de Variante</h3>
              <p className="text-xs text-slate-500 truncate mt-0.5">{quickEditItem.display_title}</p>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Precio de Lista ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={quickPrice}
                  onChange={(e) => setQuickPrice(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 font-mono font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-red-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Precio Oferta / Promocional ($)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Opcional"
                  value={quickPromoPrice}
                  onChange={(e) => setQuickPromoPrice(e.target.value)}
                  className="w-full bg-slate-50 text-emerald-600 font-mono font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-red-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Stock Disponible (Unidades)</label>
                <input
                  type="number"
                  value={quickStock}
                  onChange={(e) => setQuickStock(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 font-mono font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-red-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                onClick={() => setQuickEditItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveQuickEdit}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-200"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
