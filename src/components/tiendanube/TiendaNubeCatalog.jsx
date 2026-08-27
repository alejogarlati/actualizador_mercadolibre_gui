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
  ArrowRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  CheckSquare,
  Square,
  MinusSquare,
  Settings2,
  Check,
  X
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
  onSaveVariantOverride,
  onBatchUpdateOverrides,
  onBatchUpdatePrices
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [discountFilter, setDiscountFilter] = useState('all'); // 'all', 'custom', 'category'
  const [stockFilter, setStockFilter] = useState('all'); // 'all', 'in_stock', 'out_of_stock'
  const [costFilter, setCostFilter] = useState('all'); // 'all', 'with_cost', 'no_cost'

  // Ordenamiento por columna
  const [sortBy, setSortBy] = useState('product_name'); // 'product_name', 'sku', 'category_name', 'cost', 'applied_discount_pct', 'price', 'stock', 'status'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc', 'desc'

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25); // 15, 25, 50, 100, 'all'

  // Selección múltiple para acciones en lote
  const [selectedVariantIds, setSelectedVariantIds] = useState(new Set());
  const [batchProcessing, setBatchProcessing] = useState(false);

  // Modal de Descuento en Lote
  const [batchDiscountModalOpen, setBatchDiscountModalOpen] = useState(false);
  const [batchDiscountMode, setBatchDiscountMode] = useState('custom'); // 'custom', 'reset'
  const [batchDiscountPct, setBatchDiscountPct] = useState('15');

  // Modal de Precios en Lote
  const [batchPriceModalOpen, setBatchPriceModalOpen] = useState(false);
  const [batchPriceMode, setBatchPriceMode] = useState('percentage_adjust'); // 'percentage_adjust', 'discount_on_price', 'fixed_price'
  const [batchPriceValue, setBatchPriceValue] = useState('10');

  // Quick edit state (precio y stock)
  const [quickEditItem, setQuickEditItem] = useState(null);
  const [quickPrice, setQuickPrice] = useState('');
  const [quickPromoPrice, setQuickPromoPrice] = useState('');
  const [quickStock, setQuickStock] = useState('');

  // Variant discount override modal state
  const [overrideItem, setOverrideItem] = useState(null);
  const [overridePct, setOverridePct] = useState('');

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder(['cost', 'price', 'applied_discount_pct', 'stock'].includes(column) ? 'desc' : 'asc');
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setDiscountFilter('all');
    setStockFilter('all');
    setCostFilter('all');
    setSortBy('product_name');
    setSortOrder('asc');
  };

  const hasActiveFilters = searchTerm !== '' || statusFilter !== 'all' || categoryFilter !== 'all' || discountFilter !== 'all' || stockFilter !== 'all' || costFilter !== 'all';

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

  // 1. Filtrado de variantes
  const filteredVariants = useMemo(() => {
    return (variants || []).filter(item => {
      const matchSearch = 
        !searchTerm ||
        item.display_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.variant_str?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

      const matchStock =
        stockFilter === 'all' ||
        (stockFilter === 'in_stock' && (item.stock === null || item.stock > 0)) ||
        (stockFilter === 'out_of_stock' && item.stock !== null && item.stock <= 0);

      const matchCost =
        costFilter === 'all' ||
        (costFilter === 'with_cost' && item.cost !== null && item.cost !== undefined && item.cost > 0) ||
        (costFilter === 'no_cost' && (!item.cost || item.cost <= 0));

      return matchSearch && matchStatus && matchCat && matchDiscount && matchStock && matchCost;
    });
  }, [variants, searchTerm, statusFilter, categoryFilter, discountFilter, stockFilter, costFilter]);

  // 2. Ordenamiento multicriterio
  const sortedVariants = useMemo(() => {
    return [...filteredVariants].sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (sortBy === 'product_name') {
        valA = a.product_name || a.display_title || '';
        valB = b.product_name || b.display_title || '';
      } else if (sortBy === 'sku') {
        valA = a.sku || '';
        valB = b.sku || '';
      } else if (sortBy === 'category_name') {
        valA = a.category_name || '';
        valB = b.category_name || '';
      } else if (sortBy === 'cost') {
        valA = a.cost || 0;
        valB = b.cost || 0;
      } else if (sortBy === 'applied_discount_pct') {
        valA = a.applied_discount_pct !== undefined ? a.applied_discount_pct : 0;
        valB = b.applied_discount_pct !== undefined ? b.applied_discount_pct : 0;
      } else if (sortBy === 'price') {
        valA = a.price || 0;
        valB = b.price || 0;
      } else if (sortBy === 'stock') {
        valA = a.stock !== null && a.stock !== undefined ? a.stock : 999999;
        valB = b.stock !== null && b.stock !== undefined ? b.stock : 999999;
      } else if (sortBy === 'status') {
        valA = a.status || '';
        valB = b.status || '';
      }

      if (typeof valA === 'string') {
        return sortOrder === 'asc' 
          ? valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' }) 
          : valB.localeCompare(valA, undefined, { numeric: true, sensitivity: 'base' });
      }
      return sortOrder === 'asc' ? (valA || 0) - (valB || 0) : (valB || 0) - (valA || 0);
    });
  }, [filteredVariants, sortBy, sortOrder]);

  // Reset page when filters or sorting change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, categoryFilter, discountFilter, stockFilter, costFilter, pageSize, sortBy, sortOrder]);

  // Cálculos de Paginación
  const effectivePageSize = pageSize === 'all' ? sortedVariants.length || 1 : pageSize;
  const totalPages = Math.max(1, Math.ceil(sortedVariants.length / effectivePageSize));
  
  const paginatedVariants = useMemo(() => {
    if (pageSize === 'all') return sortedVariants;
    const start = (currentPage - 1) * pageSize;
    return sortedVariants.slice(start, start + pageSize);
  }, [sortedVariants, currentPage, pageSize]);

  const startIdx = sortedVariants.length === 0 ? 0 : (currentPage - 1) * effectivePageSize + 1;
  const endIdx = pageSize === 'all' ? sortedVariants.length : Math.min(currentPage * pageSize, sortedVariants.length);

  // Selección múltiple para acciones en lote
  const selectedCount = selectedVariantIds.size;
  const isAllVisibleSelected = paginatedVariants.length > 0 && paginatedVariants.every(v => selectedVariantIds.has(v.variant_id));
  const isSomeVisibleSelected = paginatedVariants.some(v => selectedVariantIds.has(v.variant_id)) && !isAllVisibleSelected;

  const toggleSelectVariant = (variantId) => {
    setSelectedVariantIds(prev => {
      const next = new Set(prev);
      if (next.has(variantId)) next.delete(variantId);
      else next.add(variantId);
      return next;
    });
  };

  const toggleSelectVisible = () => {
    setSelectedVariantIds(prev => {
      const next = new Set(prev);
      if (isAllVisibleSelected) {
        paginatedVariants.forEach(v => next.delete(v.variant_id));
      } else {
        paginatedVariants.forEach(v => next.add(v.variant_id));
      }
      return next;
    });
  };

  const selectAllFiltered = () => {
    setSelectedVariantIds(new Set(sortedVariants.map(v => v.variant_id)));
  };

  const clearSelection = () => {
    setSelectedVariantIds(new Set());
  };

  const handleExecuteBatchDiscount = async () => {
    if (selectedVariantIds.size === 0 || !onBatchUpdateOverrides) return;
    setBatchProcessing(true);
    try {
      const items = sortedVariants
        .filter(v => selectedVariantIds.has(v.variant_id))
        .map(v => ({ product_id: v.product_id, variant_id: v.variant_id, sku: v.sku }));

      const pct = batchDiscountMode === 'custom' ? parseFloat(batchDiscountPct) : null;
      await onBatchUpdateOverrides(items, pct);
      setBatchDiscountModalOpen(false);
      clearSelection();
    } catch (err) {
      console.error('Error batch discount:', err);
    } finally {
      setBatchProcessing(false);
    }
  };

  const handleExecuteBatchPrice = async () => {
    if (selectedVariantIds.size === 0 || !onBatchUpdatePrices) return;
    setBatchProcessing(true);
    try {
      const items = sortedVariants
        .filter(v => selectedVariantIds.has(v.variant_id))
        .map(v => ({ product_id: v.product_id, variant_id: v.variant_id, sku: v.sku }));

      const val = parseFloat(batchPriceValue);
      await onBatchUpdatePrices(items, batchPriceMode, val);
      setBatchPriceModalOpen(false);
      clearSelection();
    } catch (err) {
      console.error('Error batch price:', err);
    } finally {
      setBatchProcessing(false);
    }
  };

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

  const renderSortIndicator = (column) => {
    if (sortBy === column) {
      return sortOrder === 'asc' ? (
        <ArrowUp className="w-3.5 h-3.5 text-red-600 inline ml-1 shrink-0" />
      ) : (
        <ArrowDown className="w-3.5 h-3.5 text-red-600 inline ml-1 shrink-0" />
      );
    }
    return (
      <ArrowUpDown className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity inline ml-1 shrink-0" />
    );
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Barra de Filtros, Búsqueda y Acciones */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex-1 flex flex-wrap items-center gap-2.5">
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
                className="bg-slate-50 text-slate-700 text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-red-500 max-w-[190px] truncate font-medium"
              >
                <option value="all">Todas las categorías</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            )}

            {/* Filtro por Tipo de Descuento */}
            <select
              value={discountFilter}
              onChange={(e) => setDiscountFilter(e.target.value)}
              className="bg-slate-50 text-slate-700 text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-red-500 font-medium"
            >
              <option value="all">Todos los factores</option>
              <option value="custom">Descuento Manual</option>
              <option value="category">Descuento Categoría</option>
            </select>

            {/* Filtro por Stock */}
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="bg-slate-50 text-slate-700 text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-red-500 font-medium"
            >
              <option value="all">Todo el stock</option>
              <option value="in_stock">Con Stock</option>
              <option value="out_of_stock">Sin Stock (Agotado)</option>
            </select>

            {/* Filtro por Costo ERP */}
            <select
              value={costFilter}
              onChange={(e) => setCostFilter(e.target.value)}
              className="bg-slate-50 text-slate-700 text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-red-500 font-medium"
            >
              <option value="all">Todos los costos</option>
              <option value="with_cost">Con Costo ERP</option>
              <option value="no_cost">Sin Costo ERP</option>
            </select>

            {/* Filtro por Estado */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 text-slate-700 text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-red-500 font-medium"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Publicados</option>
              <option value="hidden">Ocultos</option>
            </select>

            {/* Botón limpiar filtros */}
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
                title="Restablecer todos los filtros"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Limpiar</span>
              </button>
            )}
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center gap-2.5 shrink-0">
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
      </div>

      {/* Indicador de Resumen de Catálogo */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <div className="flex items-center gap-2">
          <span>Mostrando <strong className="text-slate-800">{startIdx} - {endIdx}</strong> de <strong className="text-slate-800">{sortedVariants.length}</strong> variantes</span>
          {sortBy && (
            <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-md font-medium">
              Orden: <strong className="text-slate-800 uppercase">{sortBy} ({sortOrder})</strong>
            </span>
          )}
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
            <option value="all">Todos ({sortedVariants.length})</option>
          </select>
        </div>
      </div>

      {/* TABLA DE VARIANTES INDEPENDIENTES */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-3 w-10 text-center select-none">
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={isAllVisibleSelected}
                      ref={el => { if (el) el.indeterminate = isSomeVisibleSelected; }}
                      onChange={toggleSelectVisible}
                      className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500 cursor-pointer"
                      title="Seleccionar todas las variantes visibles"
                    />
                  </div>
                </th>
                <th className="py-3.5 px-2 w-8 text-center select-none text-slate-400">#</th>
                <th 
                  onClick={() => handleSort('product_name')}
                  className="py-3.5 px-4 cursor-pointer select-none hover:bg-slate-100/80 transition-colors group"
                >
                  <div className="flex items-center gap-1">
                    <span className={sortBy === 'product_name' ? 'text-red-700 font-bold' : 'text-slate-600'}>Producto & Atributos</span>
                    {renderSortIndicator('product_name')}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('sku')}
                  className="py-3.5 px-4 cursor-pointer select-none hover:bg-slate-100/80 transition-colors group"
                >
                  <div className="flex items-center gap-1">
                    <span className={sortBy === 'sku' ? 'text-red-700 font-bold' : 'text-slate-600'}>SKU ERP</span>
                    {renderSortIndicator('sku')}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('category_name')}
                  className="py-3.5 px-4 cursor-pointer select-none hover:bg-slate-100/80 transition-colors group"
                >
                  <div className="flex items-center gap-1">
                    <span className={sortBy === 'category_name' ? 'text-red-700 font-bold' : 'text-slate-600'}>Categoría / Sub-Cat</span>
                    {renderSortIndicator('category_name')}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('cost')}
                  className="py-3.5 px-4 text-right cursor-pointer select-none hover:bg-slate-100/80 transition-colors group"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span className={sortBy === 'cost' ? 'text-red-700 font-bold' : 'text-slate-600'}>Costo Mostrador</span>
                    {renderSortIndicator('cost')}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('applied_discount_pct')}
                  className="py-3.5 px-4 text-center cursor-pointer select-none hover:bg-slate-100/80 transition-colors group"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span className={sortBy === 'applied_discount_pct' ? 'text-red-700 font-bold' : 'text-slate-600'}>Factor / Descuento</span>
                    {renderSortIndicator('applied_discount_pct')}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('price')}
                  className="py-3.5 px-4 text-right cursor-pointer select-none hover:bg-slate-100/80 transition-colors group"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span className={sortBy === 'price' ? 'text-red-700 font-bold' : 'text-slate-600'}>Precio Tienda</span>
                    {renderSortIndicator('price')}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('stock')}
                  className="py-3.5 px-4 text-center cursor-pointer select-none hover:bg-slate-100/80 transition-colors group"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span className={sortBy === 'stock' ? 'text-red-700 font-bold' : 'text-slate-600'}>Stock</span>
                    {renderSortIndicator('stock')}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('status')}
                  className="py-3.5 px-4 text-center cursor-pointer select-none hover:bg-slate-100/80 transition-colors group"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span className={sortBy === 'status' ? 'text-red-700 font-bold' : 'text-slate-600'}>Estado</span>
                    {renderSortIndicator('status')}
                  </div>
                </th>
                <th className="py-3.5 px-4 text-right select-none">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {loading && variants.length === 0 ? (
                <tr>
                  <td colSpan="11" className="py-16 text-center text-slate-500">
                    <RefreshCw className="w-7 h-7 animate-spin mx-auto mb-2 text-red-600" />
                    <span className="font-semibold">Cargando variantes de Tiendanube...</span>
                  </td>
                </tr>
              ) : paginatedVariants.length === 0 ? (
                <tr>
                  <td colSpan="11" className="py-16 text-center text-slate-500">
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
                  const isSelected = selectedVariantIds.has(item.variant_id);

                  return (
                    <tr 
                      key={`${item.product_id}-${item.variant_id}`} 
                      className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-red-50/40' : ''}`}
                    >
                      {/* Checkbox de Selección */}
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectVariant(item.variant_id)}
                          className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500 cursor-pointer"
                        />
                      </td>

                      {/* Número de fila */}
                      <td className="py-3 px-2 text-center text-slate-400 font-mono text-[10px]">
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
                              ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 shadow-2xs'
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
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
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

      {/* BARRA FLOTANTE DE ACCIONES EN LOTE */}
      {selectedCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-red-600 text-white shadow-2xl shadow-red-950/40 px-6 py-3.5 rounded-2xl border border-red-500/80 flex items-center gap-5 text-xs animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center gap-3 pr-4 border-r border-red-400/60">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-white text-red-600 font-black flex items-center justify-center text-[11px] shadow-sm">
                {selectedCount}
              </span>
              <span className="font-bold text-white">
                {selectedCount === 1 ? '1 variante seleccionada' : `${selectedCount} variantes seleccionadas`}
              </span>
            </div>

            {selectedCount < sortedVariants.length && (
              <button
                onClick={selectAllFiltered}
                className="text-white/80 hover:text-white underline text-[11px] cursor-pointer"
              >
                Seleccionar todas ({sortedVariants.length})
              </button>
            )}

            <button
              onClick={clearSelection}
              className="text-white/80 hover:text-white text-[11px] font-medium cursor-pointer ml-1 hover:underline"
            >
              Deseleccionar
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Botón Descuento en Lote */}
            <button
              onClick={() => setBatchDiscountModalOpen(true)}
              disabled={batchProcessing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold bg-white hover:bg-red-50 text-red-700 transition-all shadow-md shadow-red-950/20 cursor-pointer disabled:opacity-50"
            >
              <Percent className="w-3.5 h-3.5" />
              <span>Descuento en Lote</span>
            </button>

            {/* Botón Modificar Precios en Lote */}
            <button
              onClick={() => setBatchPriceModalOpen(true)}
              disabled={batchProcessing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold bg-white/15 hover:bg-white/25 text-white border border-white/40 transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Sliders className="w-3.5 h-3.5 text-white" />
              <span>Modificar Precios</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL DE DESCUENTO EN LOTE */}
      {batchDiscountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2 text-red-600 font-bold text-xs uppercase tracking-wider mb-0.5">
                  <Percent className="w-4 h-4" />
                  <span>Acción en Lote</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Descuento para {selectedCount} variantes
                </h3>
              </div>
              <button 
                onClick={() => setBatchDiscountModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <label className="block font-semibold text-slate-700">Elige la acción a aplicar:</label>

              <div className="space-y-2">
                <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  batchDiscountMode === 'custom' ? 'bg-red-50/60 border-red-300' : 'bg-slate-50 border-slate-200'
                }`}>
                  <input
                    type="radio"
                    name="batchDiscountMode"
                    value="custom"
                    checked={batchDiscountMode === 'custom'}
                    onChange={(e) => setBatchDiscountMode(e.target.value)}
                    className="mt-0.5 text-red-600 focus:ring-red-500"
                  />
                  <div className="flex-1">
                    <span className="font-bold text-slate-900 block">Fijar porcentaje de descuento personalizado</span>
                    <span className="text-slate-500 text-[11px] block mt-0.5">Sobreescribe el descuento de categoría por este valor discrecional.</span>
                    {batchDiscountMode === 'custom' && (
                      <div className="mt-2.5 flex items-center gap-2">
                        <div className="relative flex-1">
                          <input
                            type="number"
                            step="0.5"
                            value={batchDiscountPct}
                            onChange={(e) => setBatchDiscountPct(e.target.value)}
                            className="w-full bg-white text-slate-900 font-mono font-bold px-3 py-2 rounded-xl border border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 pr-7 text-xs"
                            placeholder="Ej: 15.0"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </label>

                <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  batchDiscountMode === 'reset' ? 'bg-red-50/60 border-red-300' : 'bg-slate-50 border-slate-200'
                }`}>
                  <input
                    type="radio"
                    name="batchDiscountMode"
                    value="reset"
                    checked={batchDiscountMode === 'reset'}
                    onChange={(e) => setBatchDiscountMode(e.target.value)}
                    className="mt-0.5 text-red-600 focus:ring-red-500"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">Restablecer a descuento de categoría</span>
                    <span className="text-slate-500 text-[11px] block mt-0.5">Elimina las sobreescrituras y vuelve a heredar la regla de categoría/subcategoría.</span>
                  </div>
                </label>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500">
                <strong className="text-slate-700">Nota:</strong> Se recalcularán los precios según el costo ERP de cada variante y se impactarán inmediatamente en Tiendanube y en la base local.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                onClick={() => setBatchDiscountModalOpen(false)}
                disabled={batchProcessing}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleExecuteBatchDiscount}
                disabled={batchProcessing || (batchDiscountMode === 'custom' && batchDiscountPct === '')}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-200 disabled:opacity-50 cursor-pointer"
              >
                {batchProcessing && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{batchProcessing ? 'Aplicando...' : `Aplicar a ${selectedCount} variantes`}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE PRECIOS EN LOTE */}
      {batchPriceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2 text-red-600 font-bold text-xs uppercase tracking-wider mb-0.5">
                  <Sliders className="w-4 h-4" />
                  <span>Acción en Lote</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Modificar Precios para {selectedCount} variantes
                </h3>
              </div>
              <button 
                onClick={() => setBatchPriceModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Tipo de ajuste de precio:</label>
                <select
                  value={batchPriceMode}
                  onChange={(e) => setBatchPriceMode(e.target.value)}
                  className="w-full bg-slate-50 text-slate-800 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-red-500 font-medium"
                >
                  <option value="percentage_adjust">Ajustar precio actual por porcentaje (+% / -%)</option>
                  <option value="discount_on_price">Aplicar descuento porcentual sobre precio (-%)</option>
                  <option value="fixed_price">Fijar precio de lista fijo ($)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {batchPriceMode === 'fixed_price' ? 'Precio fijo en pesos ($):' : 'Porcentaje de ajuste (%):'}
                </label>
                <div className="relative">
                  {batchPriceMode === 'fixed_price' && (
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
                  )}
                  <input
                    type="number"
                    step="0.01"
                    value={batchPriceValue}
                    onChange={(e) => setBatchPriceValue(e.target.value)}
                    className={`w-full bg-slate-50 text-slate-900 font-mono font-bold text-sm py-2.5 rounded-xl border border-slate-200 focus:border-red-500 focus:bg-white focus:outline-none ${
                      batchPriceMode === 'fixed_price' ? 'pl-8 pr-4' : 'px-3.5 pr-8'
                    }`}
                    placeholder={batchPriceMode === 'fixed_price' ? '15000.00' : '10'}
                  />
                  {batchPriceMode !== 'fixed_price' && (
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">%</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {batchPriceMode === 'percentage_adjust' && 'Ejemplo: 10 aumenta un 10%, -5 reduce un 5% sobre el precio de lista actual.'}
                  {batchPriceMode === 'discount_on_price' && 'Ejemplo: 20 aplica un 20% de descuento directo sobre el precio de lista actual.'}
                  {batchPriceMode === 'fixed_price' && 'Ejemplo: 25000 fija el precio exacto de lista en $25.000,00 para todas las variantes seleccionadas.'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                onClick={() => setBatchPriceModalOpen(false)}
                disabled={batchProcessing}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleExecuteBatchPrice}
                disabled={batchProcessing || batchPriceValue === '' || isNaN(parseFloat(batchPriceValue))}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-200 disabled:opacity-50 cursor-pointer"
              >
                {batchProcessing && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{batchProcessing ? 'Actualizando...' : `Actualizar ${selectedCount} variantes`}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
