import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Plus, 
  RefreshCw, 
  Tag, 
  Layers, 
  Save, 
  Percent, 
  ArrowUpDown,
  Zap,
  Sliders,
  DollarSign,
  Settings2,
  Check,
  X
} from 'lucide-react';
import Toolbar from '../ui/Toolbar';
import Table from '../ui/Table';
import Pagination from '../ui/Pagination';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';

const SORT_ACCESSORS = {
  product_name: (item) => String(item.product_name || item.display_title || ''),
  sku: (item) => String(item.sku || ''),
  category_name: (item) => String(item.category_name || ''),
  cost: (item) => Number(item.cost) || 0,
  applied_discount_pct: (item) => (item.applied_discount_pct !== undefined && item.applied_discount_pct !== null ? Number(item.applied_discount_pct) : 0),
  price: (item) => Number(item.price) || 0,
  stock: (item) => (item.stock !== null && item.stock !== undefined ? Number(item.stock) : 999999),
  status: (item) => String(item.status || '')
};

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
  const [discountFilter, setDiscountFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [costFilter, setCostFilter] = useState('all');
  const [sortBy, setSortBy] = useState('product_name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Estado para Edición Rápida de Descuento de Variante Individual
  const [editingDiscountVariantId, setEditingDiscountVariantId] = useState(null);
  const [discountInputValue, setDiscountInputValue] = useState('');
  const [discountPushToApi, setDiscountPushToApi] = useState(false);
  const [isSavingDiscount, setIsSavingDiscount] = useState(false);

  // Selección múltiple
  const [selectedVariantsMap, setSelectedVariantsMap] = useState({});

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Modal para Acciones Masivas
  const [batchActionModal, setBatchActionModal] = useState({ open: false, type: null }); // 'discount' | 'price'
  const [batchDiscountValue, setBatchDiscountValue] = useState('');
  const [batchPriceMode, setBatchPriceMode] = useState('percentage');
  const [batchPriceValue, setBatchPriceValue] = useState('');
  const [isSubmittingBatch, setIsSubmittingBatch] = useState(false);

  const rawVariants = Array.isArray(variants) ? variants : [];
  const rawCategories = Array.isArray(categories) ? categories : [];

  // 1. Filtrado multicriterio
  const filteredVariants = useMemo(() => {
    const search = (searchTerm || '').trim().toLowerCase();
    return rawVariants.filter(v => {
      if (!v) return false;
      const productName = String(v.product_name || v.display_title || '').toLowerCase();
      const displayTitle = String(v.display_title || '').toLowerCase();
      const sku = String(v.sku || '').toLowerCase();
      const barcode = String(v.barcode || '').toLowerCase();
      const variantStr = String(v.variant_str || '').toLowerCase();
      const prodId = String(v.product_id || '');
      const varId = String(v.variant_id || '');

      const matchSearch = 
        !search ||
        productName.includes(search) ||
        displayTitle.includes(search) ||
        sku.includes(search) ||
        barcode.includes(search) ||
        variantStr.includes(search) ||
        prodId.includes(search) ||
        varId.includes(search);

      const matchStatus = statusFilter === 'all' || v.status === statusFilter;
      const matchCategory = categoryFilter === 'all' || String(v.category_id) === String(categoryFilter);

      let matchDiscount = true;
      if (discountFilter === 'custom') {
        matchDiscount = v.discount_origin === 'custom' && v.applied_discount_pct !== null && v.applied_discount_pct !== undefined;
      } else if (discountFilter === 'category') {
        matchDiscount = v.discount_origin === 'category';
      } else if (discountFilter === 'none') {
        matchDiscount = !v.applied_discount_pct;
      }

      let matchStock = true;
      if (stockFilter === 'in_stock') {
        matchStock = v.stock === null || v.stock === undefined || Number(v.stock) > 0;
      } else if (stockFilter === 'out_of_stock') {
        matchStock = v.stock !== null && v.stock !== undefined && Number(v.stock) <= 0;
      }

      let matchCost = true;
      const costNum = Number(v.cost) || 0;
      if (costFilter === 'with_cost') {
        matchCost = costNum > 0;
      } else if (costFilter === 'no_cost') {
        matchCost = costNum <= 0;
      }

      return matchSearch && matchStatus && matchCategory && matchDiscount && matchStock && matchCost;
    });
  }, [rawVariants, searchTerm, statusFilter, categoryFilter, discountFilter, stockFilter, costFilter]);

  // 2. Ordenamiento multicriterio
  const sortedVariants = useMemo(() => {
    const accessor = SORT_ACCESSORS[sortBy] || ((item) => item[sortBy] ?? '');
    const direction = sortOrder === 'asc' ? 1 : -1;

    return [...filteredVariants].sort((a, b) => {
      const valA = a ? accessor(a) : '';
      const valB = b ? accessor(b) : '';

      if (typeof valA === 'string' && typeof valB === 'string') {
        return valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' }) * direction;
      }
      return ((Number(valA) || 0) - (Number(valB) || 0)) * direction;
    });
  }, [filteredVariants, sortBy, sortOrder]);

  const handleSort = (columnKey) => {
    if (sortBy === columnKey) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(columnKey);
      setSortOrder('asc');
    }
  };

  const effectivePageSize = pageSize === 'all' ? sortedVariants.length || 1 : pageSize;
  const totalPages = Math.max(1, Math.ceil(sortedVariants.length / effectivePageSize));
  const paginatedVariants = useMemo(() => {
    if (pageSize === 'all') return sortedVariants;
    const start = (currentPage - 1) * pageSize;
    return sortedVariants.slice(start, start + pageSize);
  }, [sortedVariants, currentPage, pageSize]);

  // Manejo de Selección
  const selectedList = Object.values(selectedVariantsMap);
  const selectedCount = selectedList.length;

  const handleToggleSelect = (item) => {
    if (!item) return;
    setSelectedVariantsMap(prev => {
      const next = { ...prev };
      if (next[item.variant_id]) {
        delete next[item.variant_id];
      } else {
        next[item.variant_id] = {
          product_id: parseInt(item.product_id),
          variant_id: parseInt(item.variant_id),
          sku: item.sku || '',
          price: parseFloat(item.price) || 0.0,
          cost: parseFloat(item.cost) || 0.0
        };
      }
      return next;
    });
  };

  const handleSelectAllPage = () => {
    const allSelected = paginatedVariants.length > 0 && paginatedVariants.every(i => selectedVariantsMap[i.variant_id]);
    setSelectedVariantsMap(prev => {
      const next = { ...prev };
      if (allSelected) {
        paginatedVariants.forEach(i => delete next[i.variant_id]);
      } else {
        paginatedVariants.forEach(i => {
          next[i.variant_id] = {
            product_id: parseInt(i.product_id),
            variant_id: parseInt(i.variant_id),
            sku: i.sku || '',
            price: parseFloat(i.price) || 0.0,
            cost: parseFloat(i.cost) || 0.0
          };
        });
      }
      return next;
    });
  };

  const handleClearSelection = () => {
    setSelectedVariantsMap({});
  };

  // Guardar Descuento Individual
  const handleOpenDiscountEdit = (v) => {
    setEditingDiscountVariantId(v.variant_id);
    setDiscountInputValue(v.applied_discount_pct !== null && v.applied_discount_pct !== undefined ? String(v.applied_discount_pct) : '');
    setDiscountPushToApi(false);
  };

  const handleSaveIndividualDiscount = async (variantId) => {
    setIsSavingDiscount(true);
    try {
      const customPct = discountInputValue === '' ? null : parseFloat(discountInputValue);
      if (onSaveVariantOverride) {
        await onSaveVariantOverride(variantId, {
          custom_discount_pct: customPct,
          push_to_api: discountPushToApi
        });
      }
      setEditingDiscountVariantId(null);
    } finally {
      setIsSavingDiscount(false);
    }
  };

  // Ejecutar Acción Masiva
  const handleExecuteBatchAction = async () => {
    if (selectedCount === 0) return;
    setIsSubmittingBatch(true);
    try {
      if (batchActionModal.type === 'discount' && onBatchUpdateOverrides) {
        const val = batchDiscountValue === '' ? null : parseFloat(batchDiscountValue);
        await onBatchUpdateOverrides(selectedList, val);
      } else if (batchActionModal.type === 'price' && onBatchUpdatePrices) {
        const val = parseFloat(batchPriceValue) || 0;
        await onBatchUpdatePrices(selectedList, batchPriceMode, val);
      }
      setBatchActionModal({ open: false, type: null });
      setSelectedVariantsMap({});
      if (onRefresh) onRefresh();
    } finally {
      setIsSubmittingBatch(false);
    }
  };

  const isAllPageSelected = paginatedVariants.length > 0 && paginatedVariants.every(i => selectedVariantsMap[i.variant_id]);

  const columns = [
    {
      key: 'select',
      label: 'Sel',
      width: 48,
      minWidth: 40,
      align: 'center',
      renderHeader: () => (
        <input
          type="checkbox"
          checked={isAllPageSelected}
          onChange={handleSelectAllPage}
          disabled={paginatedVariants.length === 0}
          className="w-4 h-4 rounded text-[#141413] dark:text-[#faf9f5] focus:ring-0 cursor-pointer"
        />
      )
    },
    { key: 'product_name', label: 'Producto / Variante', width: 320, minWidth: 180, sortable: true },
    { key: 'sku', label: 'SKU ERP', width: 140, minWidth: 90, sortable: true },
    { key: 'category_name', label: 'Categoría', width: 220, minWidth: 120, sortable: true },
    { key: 'cost', label: 'Costo ERP', width: 120, minWidth: 90, align: 'right', sortable: true },
    { key: 'applied_discount_pct', label: 'Descuento', width: 130, minWidth: 95, align: 'center', sortable: true },
    { key: 'price', label: 'Precio Tienda', width: 130, minWidth: 95, align: 'right', sortable: true },
    { key: 'stock', label: 'Stock', width: 95, minWidth: 70, align: 'center', sortable: true },
    { key: 'status', label: 'Estado', width: 95, minWidth: 75, align: 'center', sortable: true },
    { key: 'actions', label: 'Acciones', width: 85, minWidth: 60, align: 'right' }
  ];

  return (
    <div className="flex flex-col gap-4 relative pb-20">
      {/* Toolbar Principal */}
      <Toolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar por producto, SKU, variante o ID..."
        totalItems={rawVariants.length}
        filteredCount={filteredVariants.length}
        onRefresh={onRefresh}
        refreshing={loading}
        refreshTitle="Refrescar Catálogo"
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenCreate}
            icon={Plus}
          >
            Nuevo Producto
          </Button>
        }
        filters={
          <>
            {/* Filtro Categoría */}
            <div className="flex items-center gap-1.5 bg-[#faf9f5] dark:bg-[#262624] border border-[#e5e3dc] dark:border-[#363633] rounded-xl px-2.5 py-1.5 text-xs">
              <Tag className="w-3.5 h-3.5 text-[#73726c] dark:text-[#a3a199]" />
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs font-bold text-[#141413] dark:text-[#faf9f5] outline-none cursor-pointer max-w-[140px] truncate"
              >
                <option value="all">Todas las categorías</option>
                {rawCategories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Filtro Descuento */}
            <div className="flex items-center gap-1.5 bg-[#faf9f5] dark:bg-[#262624] border border-[#e5e3dc] dark:border-[#363633] rounded-xl px-2.5 py-1.5 text-xs">
              <Percent className="w-3.5 h-3.5 text-[#73726c] dark:text-[#a3a199]" />
              <select
                value={discountFilter}
                onChange={(e) => {
                  setDiscountFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs font-bold text-[#141413] dark:text-[#faf9f5] outline-none cursor-pointer"
              >
                <option value="all">Todos los descuentos</option>
                <option value="custom">Personalizado (Manual)</option>
                <option value="category">Por Categoría</option>
                <option value="none">Sin Descuento (0%)</option>
              </select>
            </div>

            {/* Filtro Stock */}
            <div className="flex items-center gap-1.5 bg-[#faf9f5] dark:bg-[#262624] border border-[#e5e3dc] dark:border-[#363633] rounded-xl px-2.5 py-1.5 text-xs">
              <select
                value={stockFilter}
                onChange={(e) => {
                  setStockFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs font-bold text-[#141413] dark:text-[#faf9f5] outline-none cursor-pointer"
              >
                <option value="all">Stock: Todos</option>
                <option value="in_stock">Con Stock</option>
                <option value="out_of_stock">Sin Stock (Agotados)</option>
              </select>
            </div>
          </>
        }
      />

      {/* Tabla de Variantes */}
      <Table
        columns={columns}
        data={paginatedVariants}
        loading={loading}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        emptyMessage="No se encontraron variantes"
        emptySubMessage="Intenta cambiar los filtros o sincronizar el catálogo desde Tiendanube."
        renderRow={(v) => {
          const isSelected = Boolean(selectedVariantsMap[v.variant_id]);
          const isEditingThisDiscount = editingDiscountVariantId === v.variant_id;
          const costVal = Number(v.cost) || 0;
          const priceVal = Number(v.price) || 0;

          return (
            <tr
              key={`${v.product_id}-${v.variant_id}`}
              className={`hover:bg-[#faf9f5] dark:hover:bg-[#262624] transition-colors ${
                isSelected ? 'bg-[#faf9f5] dark:bg-[#232321] font-medium' : ''
              }`}
            >
              {/* Checkbox */}
              <td className="py-2.5 px-3.5 text-center">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleToggleSelect(v)}
                  className="w-4 h-4 rounded text-[#141413] dark:text-[#faf9f5] focus:ring-0 cursor-pointer"
                />
              </td>

              {/* Producto / Variante */}
              <td className="py-2.5 px-3.5">
                <div className="font-bold text-[#141413] dark:text-[#faf9f5] truncate tracking-tight" title={v.product_name || v.display_title}>
                  {v.product_name || v.display_title || 'Sin Nombre'}
                </div>
                <div className="flex items-center gap-2 text-[10.5px] text-[#73726c] dark:text-[#a3a199] font-mono mt-0.5 truncate">
                  {v.variant_str && (
                    <span className="text-[#141413] dark:text-[#faf9f5] font-bold bg-[#faf9f5] dark:bg-[#262624] border border-[#e5e3dc] dark:border-[#363633] px-1.5 py-0.2 rounded truncate">
                      {v.variant_str}
                    </span>
                  )}
                  <span className="shrink-0">ID: #{v.variant_id}</span>
                </div>
              </td>

              {/* SKU */}
              <td className="py-2.5 px-3.5 font-mono text-[#73726c] dark:text-[#a3a199]">
                <span className="bg-[#faf9f5] dark:bg-[#262624] border border-[#e5e3dc] dark:border-[#363633] px-2 py-0.5 rounded text-[11px] font-semibold text-[#141413] dark:text-[#faf9f5] block truncate">
                  {v.sku || 'Sin SKU'}
                </span>
              </td>

              {/* Categoría */}
              <td className="py-2.5 px-3.5 text-[#73726c] dark:text-[#a3a199]" title={v.category_name}>
                <span className="bg-[#faf9f5] dark:bg-[#262624] border border-[#e5e3dc] dark:border-[#363633] px-2 py-0.5 rounded text-[11px] truncate block">
                  {v.category_name || 'Sin Categoría'}
                </span>
              </td>

              {/* Costo ERP */}
              <td className="py-2.5 px-3.5 text-right font-mono font-medium text-[#73726c] dark:text-[#a3a199]">
                {costVal > 0 ? `$${costVal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}` : '-'}
              </td>

              {/* Descuento (Editable en Popover/Inline) */}
              <td className="py-2.5 px-3.5 text-center relative">
                {isEditingThisDiscount ? (
                  <div className="absolute z-30 left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 bg-white dark:bg-[#1c1c1a] border border-[#141413] dark:border-[#faf9f5] rounded-xl p-2.5 shadow-elevated flex flex-col gap-2 min-w-[200px]">
                    <div className="flex items-center justify-between text-[11px] font-bold text-[#141413] dark:text-[#faf9f5]">
                      <span>Descuento Variante</span>
                      <button onClick={() => setEditingDiscountVariantId(null)} className="text-[#73726c] dark:text-[#a3a199] hover:text-[#141413] dark:hover:text-[#faf9f5]">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1 bg-[#faf9f5] dark:bg-[#262624] border border-[#e5e3dc] dark:border-[#363633] rounded-lg px-2 py-1">
                      <input
                        type="number"
                        step="0.5"
                        placeholder="Heredar (Auto)"
                        value={discountInputValue}
                        onChange={(e) => setDiscountInputValue(e.target.value)}
                        className="w-full bg-transparent text-xs font-mono font-bold text-[#141413] dark:text-[#faf9f5] outline-none text-right"
                      />
                      <span className="text-xs font-bold text-[#73726c] dark:text-[#a3a199]">%</span>
                    </div>

                    <label className="flex items-center gap-1.5 text-[10px] text-[#73726c] dark:text-[#a3a199] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={discountPushToApi}
                        onChange={(e) => setDiscountPushToApi(e.target.checked)}
                        className="w-3.5 h-3.5 rounded text-[#141413] dark:text-[#faf9f5]"
                      />
                      <span>Actualizar precio en API</span>
                    </label>

                    <div className="flex items-center gap-1.5 pt-1">
                      <Button
                        variant="primary"
                        size="sm"
                        fullWidth
                        loading={isSavingDiscount}
                        onClick={() => handleSaveIndividualDiscount(v.variant_id)}
                      >
                        Guardar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => handleOpenDiscountEdit(v)}
                    className="group/btn inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-[11px] font-bold border border-[#e5e3dc] dark:border-[#363633] bg-[#faf9f5] dark:bg-[#262624] hover:bg-white dark:hover:bg-[#1c1c1a] hover:border-[#141413] dark:hover:border-[#faf9f5] transition-all cursor-pointer"
                    title="Editar factor de descuento para esta variante"
                  >
                    <span>
                      {v.applied_discount_pct !== null && v.applied_discount_pct !== undefined
                        ? (Number(v.applied_discount_pct) > 0 ? `-${v.applied_discount_pct}%` : `${v.applied_discount_pct}%`)
                        : 'Auto'
                      }
                    </span>
                    <span className="text-[9px] text-[#73726c] dark:text-[#a3a199] font-normal">
                      ({v.discount_origin === 'custom' ? 'Manual' : 'Cat'})
                    </span>
                    <Edit3 className="w-2.5 h-2.5 text-[#9c998f] opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                  </button>
                )}
              </td>

              {/* Precio Tienda */}
              <td className="py-2.5 px-3.5 text-right font-mono font-bold text-[#141413] dark:text-[#faf9f5]">
                ${priceVal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </td>

              {/* Stock */}
              <td className="py-2.5 px-3.5 text-center font-mono">
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  v.stock !== null && v.stock !== undefined && Number(v.stock) <= 0
                    ? 'bg-[#fef2f2] dark:bg-[#7f1d1d]/25 text-[#b91c1c] dark:text-[#fca5a5] border border-[#fecaca] dark:border-[#b91c1c]/40'
                    : 'bg-[#faf9f5] dark:bg-[#262624] text-[#141413] dark:text-[#faf9f5] border border-[#e5e3dc] dark:border-[#363633]'
                }`}>
                  {v.stock !== null && v.stock !== undefined ? v.stock : '∞'}
                </span>
              </td>

              {/* Estado */}
              <td className="py-2.5 px-3.5 text-center">
                <Badge variant={v.status === 'active' ? 'success' : 'neutral'} dot size="sm">
                  {v.status === 'active' ? 'ACTIVO' : 'PAUSADO'}
                </Badge>
              </td>

              {/* Acciones */}
              <td className="py-2.5 px-3.5 text-right">
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => onOpenEdit && onOpenEdit(v.product_id)}
                    className="p-1.5 text-[#73726c] dark:text-[#a3a199] hover:text-[#141413] dark:hover:text-[#faf9f5] hover:bg-[#faf9f5] dark:hover:bg-[#262624] rounded-lg border border-transparent hover:border-[#e5e3dc] dark:hover:border-[#363633] transition-all cursor-pointer"
                    title="Editar producto y variantes"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onDelete && onDelete(v.product_id)}
                    className="p-1.5 text-[#73726c] dark:text-[#a3a199] hover:text-[#b91c1c] dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg border border-transparent hover:border-[#fecaca] dark:hover:border-red-900/50 transition-all cursor-pointer"
                    title="Eliminar producto de Tiendanube"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          );
        }}
      />

      {/* Paginación */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={sortedVariants.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setCurrentPage(1);
        }}
      />

      {/* Barra Flotante de Acciones en Lote */}
      {selectedCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#141413] text-white shadow-elevated px-5 py-3 rounded-2xl border border-[#141413] flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 select-none">
          <div className="flex items-center gap-2 pr-4 border-r border-white/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-bold">
              {selectedCount} {selectedCount === 1 ? 'variante seleccionada' : 'variantes seleccionadas'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={Percent}
              onClick={() => {
                setBatchDiscountValue('');
                setBatchActionModal({ open: true, type: 'discount' });
              }}
            >
              Ajustar Descuento
            </Button>

            <Button
              variant="secondary"
              size="sm"
              icon={DollarSign}
              onClick={() => {
                setBatchPriceValue('');
                setBatchActionModal({ open: true, type: 'price' });
              }}
            >
              Modificar Precio
            </Button>

            <button
              onClick={handleClearSelection}
              className="px-2.5 py-1.5 text-xs text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              Limpiar
            </button>
          </div>
        </div>
      )}

      {/* MODAL DE ACCIONES MASIVAS */}
      <Modal
        isOpen={batchActionModal.open}
        onClose={() => setBatchActionModal({ open: false, type: null })}
        title={
          batchActionModal.type === 'discount' 
            ? `Ajustar Descuento en Lote (${selectedCount} variantes)`
            : `Modificar Precio en Lote (${selectedCount} variantes)`
        }
        subtitle="Aplica cambios masivos simultáneamente sobre los ítems seleccionados"
        icon={batchActionModal.type === 'discount' ? Percent : DollarSign}
        maxWidth="max-w-md"
        footer={
          <>
            <Button
              variant="ghost"
              size="md"
              onClick={() => setBatchActionModal({ open: false, type: null })}
              disabled={isSubmittingBatch}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleExecuteBatchAction}
              loading={isSubmittingBatch}
            >
              Aplicar a {selectedCount} variantes
            </Button>
          </>
        }
      >
        {batchActionModal.type === 'discount' ? (
          <div className="flex flex-col gap-4 text-xs">
            <p className="text-[#73726c] dark:text-[#a3a199] leading-relaxed">
              Ingresa el porcentaje de descuento personalizado para las variantes seleccionadas. Si lo dejas vacío, se restablecerá a <strong>Automático (Heredado de la categoría)</strong>.
            </p>

            <Input
              label="Porcentaje de Descuento (%)"
              type="number"
              step="0.5"
              placeholder="Ej: 15 (o vacío para heredar de categoría)"
              value={batchDiscountValue}
              onChange={(e) => setBatchDiscountValue(e.target.value)}
              suffix="%"
            />
          </div>
        ) : (
          <div className="flex flex-col gap-4 text-xs">
            <Select
              label="Modo de Actualización de Precio"
              value={batchPriceMode}
              onChange={(e) => setBatchPriceMode(e.target.value)}
              options={[
                { value: 'percentage', label: 'Porcentaje sobre precio actual (%)' },
                { value: 'fixed_add', label: 'Monto fijo a sumar o restar ($)' },
                { value: 'fixed_set', label: 'Precio final fijo exacto ($)' }
              ]}
            />

            <Input
              label={
                batchPriceMode === 'percentage' ? 'Variación Porcentual (%)' :
                batchPriceMode === 'fixed_add' ? 'Monto a Sumar / Restar ($)' :
                'Nuevo Precio Fijo ($)'
              }
              type="number"
              step={batchPriceMode === 'percentage' ? '0.5' : '10'}
              placeholder={batchPriceMode === 'percentage' ? 'Ej: 10 o -5' : 'Ej: 5000'}
              value={batchPriceValue}
              onChange={(e) => setBatchPriceValue(e.target.value)}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
