import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  RefreshCw, 
  Zap, 
  Layers, 
  DollarSign, 
  Filter, 
  Check, 
  SlidersHorizontal,
  ChevronDown,
  ArrowRight
} from 'lucide-react';
import KpiCard from '../ui/KpiCard';
import Toolbar from '../ui/Toolbar';
import Table from '../ui/Table';
import Pagination from '../ui/Pagination';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

export default function TiendaNubeAuditView({
  auditReport,
  loading = false,
  onRefresh,
  onFixPrice,
  onFixBatch,
  tolerancePct = 2.0,
  onToleranceChange
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'DIFERENCIA' | 'OK' | 'SIN_ERP'
  const [selectedMap, setSelectedMap] = useState({});
  const [fixingId, setFixingId] = useState(null);
  const [isBatchFixing, setIsBatchFixing] = useState(false);
  const [sortBy, setSortBy] = useState('diff_amount');
  const [sortOrder, setSortOrder] = useState('desc');

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const rawItems = Array.isArray(auditReport) ? auditReport : (auditReport?.items || []);

  // 1. Filtrado
  const filteredItems = useMemo(() => {
    const search = (searchTerm || '').trim().toLowerCase();
    return rawItems.filter(item => {
      if (!item) return false;
      const prodName = String(item.product_name || item.display_title || '').toLowerCase();
      const sku = String(item.sku || '').toLowerCase();
      const catName = String(item.category_name || '').toLowerCase();
      const varId = String(item.variant_id || '');
      const prodId = String(item.product_id || '');

      const matchSearch = 
        !search ||
        prodName.includes(search) ||
        sku.includes(search) ||
        catName.includes(search) ||
        varId.includes(search) ||
        prodId.includes(search);

      const matchStatus = statusFilter === 'all' || item.audit_status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [rawItems, searchTerm, statusFilter]);

  // 2. Ordenamiento
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      let valA = a ? a[sortBy] : '';
      let valB = b ? b[sortBy] : '';

      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';

      if (typeof valA === 'string' && typeof valB === 'string') {
        return valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' }) * (sortOrder === 'asc' ? 1 : -1);
      }
      return ((Number(valA) || 0) - (Number(valB) || 0)) * (sortOrder === 'asc' ? 1 : -1);
    });
  }, [filteredItems, sortBy, sortOrder]);

  const handleSort = (columnKey) => {
    if (sortBy === columnKey) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(columnKey);
      setSortOrder('desc');
    }
  };

  const effectivePageSize = pageSize === 'all' ? sortedItems.length || 1 : pageSize;
  const totalPages = Math.max(1, Math.ceil(sortedItems.length / effectivePageSize));
  const paginatedItems = useMemo(() => {
    if (pageSize === 'all') return sortedItems;
    const start = (currentPage - 1) * pageSize;
    return sortedItems.slice(start, start + pageSize);
  }, [sortedItems, currentPage, pageSize]);

  // Selección múltiple
  const selectedList = Object.values(selectedMap);
  const selectedCount = selectedList.length;

  const handleToggleSelect = (item) => {
    if (!item) return;
    setSelectedMap(prev => {
      const next = { ...prev };
      if (next[item.variant_id]) {
        delete next[item.variant_id];
      } else {
        next[item.variant_id] = {
          product_id: parseInt(item.product_id),
          variant_id: parseInt(item.variant_id),
          sku: item.sku || '',
          current_price: parseFloat(item.price) || 0.0,
          expected_price: parseFloat(item.expected_price) || 0.0,
          new_price: parseFloat(item.expected_price) || 0.0
        };
      }
      return next;
    });
  };

  const handleSelectAllDiffs = () => {
    const diffs = rawItems.filter(i => i && i.audit_status === 'DIFERENCIA' && i.expected_price);
    const allSelected = diffs.length > 0 && diffs.every(d => selectedMap[d.variant_id]);

    setSelectedMap(prev => {
      const next = { ...prev };
      if (allSelected) {
        diffs.forEach(d => delete next[d.variant_id]);
      } else {
        diffs.forEach(d => {
          next[d.variant_id] = {
            product_id: parseInt(d.product_id),
            variant_id: parseInt(d.variant_id),
            sku: d.sku || '',
            current_price: parseFloat(d.price) || 0.0,
            expected_price: parseFloat(d.expected_price) || 0.0,
            new_price: parseFloat(d.expected_price) || 0.0
          };
        });
      }
      return next;
    });
  };

  const handleClearSelection = () => {
    setSelectedMap({});
  };

  const handleSingleFix = async (item) => {
    if (!onFixPrice || !item) return;
    setFixingId(item.variant_id);
    try {
      await onFixPrice(item.product_id, item.variant_id, item.expected_price);
    } finally {
      setFixingId(null);
    }
  };

  const handleExecuteBatchFix = async () => {
    if (!onFixBatch || selectedCount === 0) return;
    setIsBatchFixing(true);
    try {
      await onFixBatch(selectedList);
      setSelectedMap({});
    } finally {
      setIsBatchFixing(false);
    }
  };

  const isAllDiffsSelected = useMemo(() => {
    const diffs = paginatedItems.filter(i => i.audit_status === 'DIFERENCIA');
    return diffs.length > 0 && diffs.every(d => selectedMap[d.variant_id]);
  }, [paginatedItems, selectedMap]);

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
          checked={isAllDiffsSelected}
          onChange={handleSelectAllDiffs}
          className="w-4 h-4 rounded text-[#141413] dark:text-[#faf9f5] focus:ring-0 cursor-pointer"
          title="Seleccionar todas las diferencias"
        />
      )
    },
    { key: 'product_name', label: 'Variante & SKU', width: 340, minWidth: 180, sortable: true },
    { key: 'category_name', label: 'Categoría', width: 170, minWidth: 110, sortable: true },
    { key: 'cost', label: 'Costo ERP', width: 120, minWidth: 90, align: 'right', sortable: true },
    { key: 'applied_discount_pct', label: 'Factor Descuento', width: 130, minWidth: 95, align: 'center', sortable: true },
    { key: 'expected_price', label: 'Precio Esperado', width: 130, minWidth: 95, align: 'right', sortable: true },
    { key: 'price', label: 'Precio Tienda', width: 130, minWidth: 95, align: 'right', sortable: true },
    { key: 'diff_amount', label: 'Diferencia ($ / %)', width: 140, minWidth: 100, align: 'right', sortable: true },
    { key: 'audit_status', label: 'Dictamen', width: 110, minWidth: 80, align: 'center', sortable: true },
    { key: 'actions', label: 'Acción', width: 100, minWidth: 80, align: 'right' }
  ];

  return (
    <div className="flex flex-col gap-6 relative pb-20">
      {/* KPI Cards de Auditoría */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Evaluados */}
        <KpiCard
          title="Total Variantes"
          value={auditReport?.total_evaluated || rawItems.length || 0}
          subtitle="Variantes registradas en Tiendanube"
          icon={Layers}
        />

        {/* En Rango OK */}
        <KpiCard
          title="Sincronizados (OK)"
          value={auditReport?.count_ok || 0}
          subtitle="Coinciden con costo ERP y descuento"
          icon={CheckCircle2}
          colorScheme="success"
          active={statusFilter === 'OK'}
          onClick={() => {
            setStatusFilter(statusFilter === 'OK' ? 'all' : 'OK');
            setCurrentPage(1);
          }}
        />

        {/* Con Diferencia */}
        <KpiCard
          title="Con Diferencia"
          value={auditReport?.count_diff || 0}
          subtitle={`Discrepancia superior a ±${tolerancePct}%`}
          icon={AlertTriangle}
          colorScheme={auditReport?.count_diff > 0 ? 'error' : 'default'}
          active={statusFilter === 'DIFERENCIA'}
          onClick={() => {
            setStatusFilter(statusFilter === 'DIFERENCIA' ? 'all' : 'DIFERENCIA');
            setCurrentPage(1);
          }}
        />

        {/* Sin Costo ERP */}
        <KpiCard
          title="Sin Costo ERP"
          value={auditReport?.count_no_cost || 0}
          subtitle="SKU no encontrado en planilla"
          icon={HelpCircle}
          active={statusFilter === 'SIN_ERP'}
          onClick={() => {
            setStatusFilter(statusFilter === 'SIN_ERP' ? 'all' : 'SIN_ERP');
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Toolbar & Controles */}
      <Toolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar en auditoría por variante, SKU o categoría..."
        totalItems={rawItems.length}
        filteredCount={filteredItems.length}
        onRefresh={onRefresh}
        refreshing={loading || isBatchFixing}
        refreshTitle="Re-Auditar Todo"
        actions={
          auditReport?.count_diff > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAllDiffs}
            >
              Seleccionar Diferencias ({auditReport.count_diff})
            </Button>
          )
        }
        filters={
          <>
            {/* Filtro Dictamen */}
            <div className="flex items-center gap-1.5 bg-[#faf9f5] dark:bg-[#262624] border border-[#e5e3dc] dark:border-[#363633] rounded-xl px-2.5 py-1.5 text-xs">
              <Filter className="w-3.5 h-3.5 text-[#73726c] dark:text-[#a3a199]" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs font-bold text-[#141413] dark:text-[#faf9f5] outline-none cursor-pointer"
              >
                <option value="all">Todos los dictámenes</option>
                <option value="DIFERENCIA">Solo Diferencias</option>
                <option value="OK">Solo Sincronizados (OK)</option>
                <option value="SIN_ERP">Sin Costo ERP</option>
              </select>
            </div>

            {/* Selector de Tolerancia */}
            <div className="flex items-center gap-1.5 bg-[#faf9f5] dark:bg-[#262624] border border-[#e5e3dc] dark:border-[#363633] rounded-xl px-2.5 py-1.5 text-xs">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#73726c] dark:text-[#a3a199]" />
              <span className="text-[#73726c] dark:text-[#a3a199] font-medium">Tolerancia:</span>
              <select
                value={tolerancePct}
                onChange={(e) => onToleranceChange(parseFloat(e.target.value))}
                className="bg-transparent text-xs font-bold text-[#141413] dark:text-[#faf9f5] outline-none cursor-pointer"
              >
                <option value={0.5}>±0.5%</option>
                <option value={1.0}>±1.0%</option>
                <option value={2.0}>±2.0%</option>
                <option value={5.0}>±5.0%</option>
                <option value={10.0}>±10.0%</option>
              </select>
            </div>
          </>
        }
      />

      {/* Tabla de Auditoría */}
      <Table
        columns={columns}
        data={paginatedItems}
        loading={loading}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        emptyMessage="No hay variantes en la auditoría"
        emptySubMessage="Presiona 'Re-Auditar Todo' para calcular las discrepancias."
        renderRow={(item) => {
          const isOk = item.audit_status === 'OK';
          const isDiff = item.audit_status === 'DIFERENCIA';
          const isSelected = Boolean(selectedMap[item.variant_id]);
          const isRowFixing = fixingId === item.variant_id || (isBatchFixing && isSelected);
          const costVal = Number(item.cost) || 0;
          const priceVal = Number(item.price) || 0;
          const expectedVal = Number(item.expected_price) || 0;

          return (
            <tr
              key={`${item.product_id}-${item.variant_id}`}
              className={`hover:bg-[#faf9f5] dark:hover:bg-[#262624] transition-colors ${
                isSelected ? 'bg-[#faf9f5] dark:bg-[#232321] font-medium' : ''
              }`}
            >
              {/* Checkbox */}
              <td className="py-2.5 px-3.5 text-center">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleToggleSelect(item)}
                  disabled={!item.expected_price || isRowFixing}
                  className="w-4 h-4 rounded text-[#141413] dark:text-[#faf9f5] focus:ring-0 cursor-pointer disabled:opacity-30"
                />
              </td>

              {/* Variante & SKU */}
              <td className="py-2.5 px-3.5">
                <div className="font-bold text-[#141413] dark:text-[#faf9f5] truncate tracking-tight" title={item.product_name}>
                  {item.product_name || 'Sin Título'}
                </div>
                <div className="flex items-center gap-2 text-[10.5px] text-[#73726c] dark:text-[#a3a199] font-mono mt-0.5 truncate">
                  {item.variant_str && (
                    <span className="text-[#141413] dark:text-[#faf9f5] font-bold bg-[#faf9f5] dark:bg-[#262624] border border-[#e5e3dc] dark:border-[#363633] px-1.5 py-0.2 rounded truncate">
                      {item.variant_str}
                    </span>
                  )}
                  <span>SKU: <strong className="text-[#141413] dark:text-[#faf9f5]">{item.sku || 'N/A'}</strong></span>
                </div>
              </td>

              {/* Categoría */}
              <td className="py-2.5 px-3.5 text-[#73726c] dark:text-[#a3a199]" title={item.category_name}>
                <span className="bg-[#faf9f5] dark:bg-[#262624] border border-[#e5e3dc] dark:border-[#363633] px-2 py-0.5 rounded text-[11px] truncate block">
                  {item.category_name || 'Sin Categoría'}
                </span>
              </td>

              {/* Costo Mostrador */}
              <td className="py-2.5 px-3.5 text-right font-mono font-medium text-[#73726c] dark:text-[#a3a199]">
                {costVal > 0 ? `$${costVal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}` : '-'}
              </td>

              {/* Factor Aplicado */}
              <td className="py-2.5 px-3.5 text-center">
                <span className="px-2 py-0.5 rounded-md font-mono text-[11px] font-bold border border-[#e5e3dc] dark:border-[#363633] bg-[#faf9f5] dark:bg-[#262624] text-[#141413] dark:text-[#faf9f5]">
                  {Number(item.applied_discount_pct) > 0 ? `-${item.applied_discount_pct}%` : `${item.applied_discount_pct || 0}%`}
                  <span className="text-[9px] font-normal text-[#73726c] dark:text-[#a3a199] ml-1">
                    ({item.discount_origin === 'custom' ? 'Manual' : 'Cat'})
                  </span>
                </span>
              </td>

              {/* Precio Esperado */}
              <td className="py-2.5 px-3.5 text-right font-mono font-bold text-[#141413] dark:text-[#faf9f5]">
                {expectedVal > 0 ? `$${expectedVal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}` : '-'}
              </td>

              {/* Precio Tienda */}
              <td className="py-2.5 px-3.5 text-right font-mono font-bold text-[#141413] dark:text-[#faf9f5]">
                ${priceVal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </td>

              {/* Diferencia */}
              <td className="py-2.5 px-3.5 text-right font-mono">
                {item.expected_price ? (
                  <div className={`font-bold ${isOk ? 'text-[#15803d] dark:text-[#4ade80]' : 'text-[#b91c1c] dark:text-[#f87171]'}`}>
                    {Number(item.diff_amount) > 0 ? `+$${Number(item.diff_amount).toLocaleString('es-AR')}` : Number(item.diff_amount) < 0 ? `-$${Math.abs(Number(item.diff_amount)).toLocaleString('es-AR')}` : '$0'}
                    <div className="text-[10px] opacity-80">{Number(item.diff_pct) > 0 ? `+${item.diff_pct}%` : `${item.diff_pct}%`}</div>
                  </div>
                ) : (
                  <span className="text-[#9c998f] dark:text-[#73726c]">-</span>
                )}
              </td>

              {/* Dictamen */}
              <td className="py-2.5 px-3.5 text-center">
                <Badge
                  variant={isOk ? 'success' : isDiff ? 'error' : 'neutral'}
                  dot
                  size="sm"
                >
                  {isOk ? 'OK' : isDiff ? 'DIFERENCIA' : 'SIN ERP'}
                </Badge>
              </td>

              {/* Acción */}
              <td className="py-2.5 px-3.5 text-right">
                {isDiff && item.expected_price && (
                  <Button
                    variant="primary"
                    size="sm"
                    loading={isRowFixing}
                    icon={Zap}
                    onClick={() => handleSingleFix(item)}
                    title="Actualizar precio de esta variante en Tiendanube con el valor esperado"
                  >
                    Corregir
                  </Button>
                )}
              </td>
            </tr>
          );
        }}
      />

      {/* Paginación */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={sortedItems.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setCurrentPage(1);
        }}
      />

      {/* Barra Flotante de Corrección en Lote */}
      {selectedCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#141413] dark:bg-[#262624] text-white shadow-elevated px-5 py-3 rounded-2xl border border-[#141413] dark:border-[#363633] flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 select-none">
          <div className="flex items-center gap-2 pr-4 border-r border-white/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-bold">
              {selectedCount} {selectedCount === 1 ? 'variante con diferencia' : 'variantes con diferencia'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={Zap}
              loading={isBatchFixing}
              onClick={handleExecuteBatchFix}
            >
              {isBatchFixing ? 'Aplicando corrección...' : `Corregir ${selectedCount} productos`}
            </Button>

            <button
              onClick={handleClearSelection}
              disabled={isBatchFixing}
              className="px-2.5 py-1.5 text-xs text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              Deseleccionar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
