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

const SORT_ACCESSORS = {
  product_name: (item) => item.product_name || item.display_title || '',
  sku: (item) => item.sku || '',
  category_name: (item) => item.category_name || '',
  cost: (item) => item.cost || 0,
  applied_discount_pct: (item) => (item.applied_discount_pct !== undefined ? item.applied_discount_pct : 0),
  price: (item) => item.price || 0,
  stock: (item) => (item.stock !== null && item.stock !== undefined ? item.stock : 999999),
  status: (item) => item.status || ''
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
  const [batchActionModal, setBatchActionModal] = useState({ open: false, type: null });
  const [batchDiscountValue, setBatchDiscountValue] = useState('');
  const [batchPriceMode, setBatchPriceMode] = useState('percentage');
  const [batchPriceValue, setBatchPriceValue] = useState('');
  const [isSubmittingBatch, setIsSubmittingBatch] = useState(false);

  // 1. Filtrado multicriterio
  const filteredVariants = useMemo(() => {
    return variants.filter(v => {
      const matchSearch = 
        (v.product_name && v.product_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (v.display_title && v.display_title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (v.sku && v.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (v.barcode && v.barcode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (v.variant_str && v.variant_str.toLowerCase().includes(searchTerm.toLowerCase())) ||
        String(v.product_id).includes(searchTerm) ||
        String(v.variant_id).includes(searchTerm);

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
        matchStock = v.stock === null || v.stock > 0;
      } else if (stockFilter === 'out_of_stock') {
        matchStock = v.stock !== null && v.stock <= 0;
      }

      let matchCost = true;
      if (costFilter === 'with_cost') {
        matchCost = Boolean(v.cost && v.cost > 0);
      } else if (costFilter === 'no_cost') {
        matchCost = !v.cost || v.cost <= 0;
      }

      return matchSearch && matchStatus && matchCategory && matchDiscount && matchStock && matchCost;
    });
  }, [variants, searchTerm, statusFilter, categoryFilter, discountFilter, stockFilter, costFilter]);

  // 2. Ordenamiento multicriterio
  const sortedVariants = useMemo(() => {
    const accessor = SORT_ACCESSORS[sortBy] || ((item) => item[sortBy] ?? '');
    const direction = sortOrder === 'asc' ? 1 : -1;

    return [...filteredVariants].sort((a, b) => {
      const valA = accessor(a);
      const valB = accessor(b);

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
    setSelectedVariantsMap(prev => {
      const next = { ...prev };
      if (next[item.variant_id]) {
        delete next[item.variant_id];
      } else {
        next[item.variant_id] = {
          product_id: item.product_id,
          variant_id: item.variant_id,
          sku: item.sku,
          price: item.price,
          cost: item.cost
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
            product_id: i.product_id,
            variant_id: i.variant_id,
            sku: i.sku,
            price: i.price,
            cost: i.cost
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
          className="w-4 h-4 rounded text-[#141413] focus:ring-0 cursor-pointer"
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
        totalItems={variants.length}
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
            <div className="flex items-center gap-1.5 bg-[#faf9f5] border border-[#e5e3dc] rounded-xl px-2.5 py-1.5 text-xs">
              <Tag className="w-3.5 h-3.5 text-[#73726c]" />
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs font-bold text-[#141413] outline-none cursor-pointer max-w-[140px] truncate"
              >
                <option value="all">Todas las categorías</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Filtro Descuento */}
            <div className="flex items-center gap-1.5 bg-[#faf9f5] border border-[#e5e3dc] rounded-xl px-2.5 py-1.5 text-xs">
              <Percent className="w-3.5 h-3.5 text-[#73726c]" />
              <select
                value={discountFilter}
                onChange={(e) => {
                  setDiscountFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs font-bold text-[#141413] outline-none cursor-pointer"
              >
                <option value="all">Todos los descuentos</option>
                <option value="custom">Personalizado (Manual)</option>
                <option value="category">Por Categoría</option>
                <option value="none">Sin Descuento (0%)</option>
              </select>
            </div>

            {/* Filtro Stock */}
            <div className="flex items-center gap-1.5 bg-[#faf9f5] border border-[#e5e3dc] rounded-xl px-2.5 py-1.5 text-xs">
              <select
                value={stockFilter}
                onChange={(e) => {
                  setStockFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs font-bold text-[#141413] outline-none cursor-pointer"
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
          const isSelected = !!selectedVariantsMap[v.variant_id];
          const isEditingThisDiscount = editingDiscountVariantId === v.variant_id;

          return (
            <tr
              key={`${v.product_id}-${v.variant_id}`}
              className={`hover:bg-[#faf9f5] transition-colors ${
                isSelected ? 'bg-[#faf9f5] font-medium' : ''
              }`}
            >
              {/* Checkbox */}
              <td className="py-2.5 px-3.5 text-center">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleToggleSelect(v)}
                  className="w-4 h-4 rounded text-[#141413] focus:ring-0 cursor-pointer"
                />
              </td>

              {/* Producto / Variante */}
              <td className="py-2.5 px-3.5">
                <div className="font-bold text-[#141413] truncate tracking-tight" title={v.product_name || v.display_title}>
                  {v.product_name || v.display_title}
                </div>
                <div className="flex items-center gap-2 text-[10.5px] text-[#73726c] font-mono mt-0.5 truncate">
                  {v.variant_str && (
                    <span className="text-[#141413] font-bold bg-[#faf9f5] border border-[#e5e3dc] px-1.5 py-0.2 rounded truncate">
                      {v.variant_str}
                    </span>
                  )}
                  <span className="shrink-0">ID: #{v.variant_id}</span>
                </div>
              </td>

              {/* SKU */}
              <td className="py-2.5 px-3.5 font-mono text-[#73726c]">
                <span className="bg-[#faf9f5] border border-[#e5e3dc] px-2 py-0.5 rounded text-[11px] font-semibold text-[#141413] block truncate">
                  {v.sku || 'Sin SKU'}
                </span>
              </td>

              {/* Categoría */}
              <td className="py-2.5 px-3.5 text-[#73726c]" title={v.category_name}>
                <span className="bg-[#faf9f5] border border-[#e5e3dc] px-2 py-0.5 rounded text-[11px] truncate block">
                  {v.category_name || 'Sin Categoría'}
                </span>
              </td>

              {/* Costo ERP */}
              <td className="py-2.5 px-3.5 text-right font-mono font-medium text-[#73726c]">
                {v.cost ? `$${v.cost.toLocaleString('es-AR', { minimumFractionDigits: 2 })}` : '-'}
              </td>

              {/* Descuento (Editable en Popover/Inline) */}
              <td className="py-2.5 px-3.5 text-center relative">
                {isEditingThisDiscount ? (
                  <div className="absolute z-30 left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 bg-white border border-[#141413] rounded-xl p-2.5 shadow-elevated flex flex-col gap-2 min-w-[200px]">
                    <div className="flex items-center justify-between text-[11px] font-bold text-[#141413]">
                      <span>Descuento Variante</span>
                      <button onClick={() => setEditingDiscountVariantId(null)} className="text-[#73726c] hover:text-[#141413]">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1 bg-[#faf9f5] border border-[#e5e3dc] rounded-lg px-2 py-1">
                      <input
                        type="number"
                        step="0.5"
                        placeholder="Heredar (Auto)"
                        value={discountInputValue}
                        onChange={(e) => setDiscountInputValue(e.target.value)}
                        className="w-full bg-transparent text-xs font-mono font-bold text-[#141413] outline-none text-right"
                      />
                      <span className="text-xs font-bold text-[#73726c]">%</span>
                    </div>

                    <label className="flex items-center gap-1.5 text-[10px] text-[#73726c] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={discountPushToApi}
                        onChange={(e) => setDiscountPushToApi(e.target.checked)}
                        className="w-3.5 h-3.5 rounded text-[#141413]"
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
                    className="group/btn inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-[11px] font-bold border border-[#e5e3dc] bg-[#faf9f5] hover:bg-white hover:border-[#141413] transition-all cursor-pointer"
                    title="Editar factor de descuento para esta variante"
                  >
                    <span>
                      {v.applied_discount_pct !== null && v.applied_discount_pct !== undefined
                        ? (v.applied_discount_pct > 0 ? `-${v.applied_discount_pct}%` : `${v.applied_discount_pct}%`)
                        : 'Auto'
                      }
                    </span>
                    <span className="text-[9px] text-[#73726c] font-normal">
                      ({v.discount_origin === 'custom' ? 'Manual' : 'Cat'})
                    </span>
                    <Edit3 className="w-2.5 h-2.5 text-[#9c998f] opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                  </button>
                )}
              </td>

              {/* Precio Tienda */}
              <td className="py-2.5 px-3.5 text-right font-mono font-bold text-[#141413]">
                ${(v.price || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </td>

              {/* Stock */}
              <td className="py-2.5 px-3.5 text-center font-mono">
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  v.stock !== null && v.stock <= 0
                    ? 'bg-[#fef2f2] text-[#b91c1c] border border-[#fecaca]'
                    : 'bg-[#faf9f5] text-[#141413] border border-[#e5e3dc]'
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
                    onClick={() => onOpenEdit(v.product_id)}
                    className="p-1.5 text-[#73726c] hover:text-[#141413] hover:bg-[#faf9f5] rounded-lg border border-transparent hover:border-[#e5e3dc] transition-all cursor-pointer"
                    title="Editar producto y variantes"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onDelete(v.product_id)}
                    className="p-1.5 text-[#73726c] hover:text-[#b91c1c] hover:bg-red-50 rounded-lg border border-transparent hover:border-[#fecaca] transition-all cursor-pointer"
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
              {selectedCount} {selectedCount === 1 ? 'variante' : 'variantes'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={Percent}
              onClick={() => setBatchActionModal({ open: true, type: 'discount' })}
            >
              Ajustar Descuento
            </Button>

            <Button
              variant="secondary"
              size="sm"
              icon={DollarSign}
              onClick={() => setBatchActionModal({ open: true, type: 'price' })}
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
    </div>
  );
}
