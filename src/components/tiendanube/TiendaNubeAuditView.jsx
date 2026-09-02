import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Search, 
  RefreshCw, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle,
  Zap,
  SlidersHorizontal
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
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('diff_amount');
  const [sortOrder, setSortOrder] = useState('desc');

  // Selección múltiple
  const [selectedMap, setSelectedMap] = useState({});
  const [fixingId, setFixingId] = useState(null);
  const [isBatchFixing, setIsBatchFixing] = useState(false);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const rawItems = auditReport?.items || [];

  // Filtrado
  const filteredItems = useMemo(() => {
    return rawItems.filter(item => {
      const matchSearch = 
        item.display_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(item.variant_id).includes(searchTerm);

      const matchStatus = 
        statusFilter === 'all' || 
        item.audit_status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [rawItems, searchTerm, statusFilter]);

  // Ordenamiento
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (sortBy === 'diff_amount' || sortBy === 'diff_pct') {
        valA = Math.abs(valA || 0);
        valB = Math.abs(valB || 0);
      }

      if (typeof valA === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortOrder === 'asc' ? (valA || 0) - (valB || 0) : (valB || 0) - (valA || 0);
    });
  }, [filteredItems, sortBy, sortOrder]);

  const effectivePageSize = pageSize === 'all' ? sortedItems.length || 1 : pageSize;
  const totalPages = Math.max(1, Math.ceil(sortedItems.length / effectivePageSize));
  const paginatedItems = useMemo(() => {
    if (pageSize === 'all') return sortedItems;
    const start = (currentPage - 1) * pageSize;
    return sortedItems.slice(start, start + pageSize);
  }, [sortedItems, currentPage, pageSize]);

  const selectedList = Object.values(selectedMap);
  const selectedCount = selectedList.length;

  const handleToggleSelect = (item) => {
    if (!item.expected_price) return;
    setSelectedMap(prev => {
      const next = { ...prev };
      if (next[item.variant_id]) {
        delete next[item.variant_id];
      } else {
        next[item.variant_id] = {
          product_id: item.product_id,
          variant_id: item.variant_id,
          new_price: item.expected_price,
          sku: item.sku,
          display_title: item.display_title
        };
      }
      return next;
    });
  };

  const handleSelectAllPage = () => {
    const selectable = paginatedItems.filter(i => i.expected_price && i.audit_status === 'DIFERENCIA');
    const allSelected = selectable.length > 0 && selectable.every(i => selectedMap[i.variant_id]);

    setSelectedMap(prev => {
      const next = { ...prev };
      if (allSelected) {
        selectable.forEach(i => delete next[i.variant_id]);
      } else {
        selectable.forEach(i => {
          next[i.variant_id] = {
            product_id: i.product_id,
            variant_id: i.variant_id,
            new_price: i.expected_price,
            sku: i.sku,
            display_title: i.display_title
          };
        });
      }
      return next;
    });
  };

  const handleSelectAllDiffs = () => {
    const diffs = rawItems.filter(i => i.audit_status === 'DIFERENCIA' && i.expected_price);
    const map = {};
    diffs.forEach(i => {
      map[i.variant_id] = {
        product_id: i.product_id,
        variant_id: i.variant_id,
        new_price: i.expected_price,
        sku: i.sku,
        display_title: i.display_title
      };
    });
    setSelectedMap(map);
  };

  const handleClearSelection = () => {
    setSelectedMap({});
  };

  const handleSingleFix = async (item) => {
    setFixingId(item.variant_id);
    try {
      if (onFixPrice) {
        await onFixPrice(item.product_id, item.variant_id, item.expected_price);
      }
      setSelectedMap(prev => {
        const next = { ...prev };
        delete next[item.variant_id];
        return next;
      });
    } finally {
      setFixingId(null);
    }
  };

  const handleExecuteBatchFix = async () => {
    if (selectedList.length === 0) return;
    setIsBatchFixing(true);
    try {
      if (onFixBatch) {
        await onFixBatch(selectedList);
      } else if (onFixPrice) {
        for (const it of selectedList) {
          await onFixPrice(it.product_id, it.variant_id, it.new_price);
        }
      }
      setSelectedMap({});
    } finally {
      setIsBatchFixing(false);
    }
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const pageDiffs = paginatedItems.filter(i => i.expected_price && i.audit_status === 'DIFERENCIA');
  const isAllPageSelected = pageDiffs.length > 0 && pageDiffs.every(i => selectedMap[i.variant_id]);

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
          disabled={pageDiffs.length === 0}
          className="w-4 h-4 rounded text-[#141413] focus:ring-0 cursor-pointer"
        />
      )
    },
    { key: 'display_title', label: 'Variante & SKU', width: 320, minWidth: 180, sortable: true },
    { key: 'category_name', label: 'Categoría', width: 200, minWidth: 120, sortable: true },
    { key: 'cost', label: 'Costo Mostrador', width: 125, minWidth: 90, align: 'right', sortable: true },
    { key: 'applied_discount_pct', label: 'Factor Aplicado', width: 120, minWidth: 90, align: 'center' },
    { key: 'expected_price', label: 'Precio Esperado', width: 125, minWidth: 90, align: 'right', sortable: true },
    { key: 'price', label: 'Precio Tienda', width: 125, minWidth: 90, align: 'right', sortable: true },
    { key: 'diff_amount', label: 'Diferencia', width: 110, minWidth: 85, align: 'right', sortable: true },
    { key: 'audit_status', label: 'Dictamen', width: 115, minWidth: 85, align: 'center', sortable: true },
    { key: 'action', label: 'Acción', width: 95, minWidth: 70, align: 'right' }
  ];

  return (
    <div className="flex flex-col gap-6 relative pb-20">
      {/* Tarjetas KPI de Auditoría */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Variantes Auditadas */}
        <KpiCard
          title="Variantes Auditadas"
          value={auditReport?.total_variants || 0}
          subtitle="Catálogo completo de Nuvemshop"
          icon={ShieldCheck}
        />

        {/* Precios Correctos */}
        <KpiCard
          title="Precios Correctos (OK)"
          value={auditReport?.count_ok || 0}
          subtitle="Sincronizados con el costo ERP"
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
          title="Con Diferencia de Precio"
          value={auditReport?.count_diff || 0}
          subtitle="Requieren actualización"
          icon={AlertCircle}
          colorScheme="error"
          active={statusFilter === 'DIFERENCIA'}
          onClick={() => {
            setStatusFilter(statusFilter === 'DIFERENCIA' ? 'all' : 'DIFERENCIA');
            setCurrentPage(1);
          }}
        />

        {/* Sin Costo ERP */}
        <KpiCard
          title="Sin Costo ERP"
          value={auditReport?.count_no_erp || 0}
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
            <div className="flex items-center gap-1.5 bg-[#faf9f5] border border-[#e5e3dc] rounded-xl px-2.5 py-1.5 text-xs">
              <Filter className="w-3.5 h-3.5 text-[#73726c]" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs font-bold text-[#141413] outline-none cursor-pointer"
              >
                <option value="all">Todos los dictámenes</option>
                <option value="DIFERENCIA">Solo Diferencias</option>
                <option value="OK">Solo Sincronizados (OK)</option>
                <option value="SIN_ERP">Sin Costo ERP</option>
              </select>
            </div>

            {/* Selector de Tolerancia */}
            <div className="flex items-center gap-1.5 bg-[#faf9f5] border border-[#e5e3dc] rounded-xl px-2.5 py-1.5 text-xs">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#73726c]" />
              <span className="text-[#73726c] font-medium">Tolerancia:</span>
              <select
                value={tolerancePct}
                onChange={(e) => onToleranceChange(parseFloat(e.target.value))}
                className="bg-transparent text-xs font-bold text-[#141413] outline-none cursor-pointer"
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
          const isSelected = !!selectedMap[item.variant_id];
          const isRowFixing = fixingId === item.variant_id || (isBatchFixing && isSelected);

          return (
            <tr
              key={`${item.product_id}-${item.variant_id}`}
              className={`hover:bg-[#faf9f5] transition-colors ${
                isSelected ? 'bg-[#faf9f5] font-medium' : ''
              }`}
            >
              {/* Checkbox */}
              <td className="py-2.5 px-3.5 text-center">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleToggleSelect(item)}
                  disabled={!item.expected_price || isRowFixing}
                  className="w-4 h-4 rounded text-[#141413] focus:ring-0 cursor-pointer disabled:opacity-30"
                />
              </td>

              {/* Variante & SKU */}
              <td className="py-2.5 px-3.5">
                <div className="font-bold text-[#141413] truncate tracking-tight" title={item.product_name}>
                  {item.product_name}
                </div>
                <div className="flex items-center gap-2 text-[10.5px] text-[#73726c] font-mono mt-0.5 truncate">
                  {item.variant_str && (
                    <span className="text-[#141413] font-bold bg-[#faf9f5] border border-[#e5e3dc] px-1.5 py-0.2 rounded truncate">
                      {item.variant_str}
                    </span>
                  )}
                  <span>SKU: <strong className="text-[#141413]">{item.sku || 'N/A'}</strong></span>
                </div>
              </td>

              {/* Categoría */}
              <td className="py-2.5 px-3.5 text-[#73726c]" title={item.category_name}>
                <span className="bg-[#faf9f5] border border-[#e5e3dc] px-2 py-0.5 rounded text-[11px] truncate block">
                  {item.category_name}
                </span>
              </td>

              {/* Costo Mostrador */}
              <td className="py-2.5 px-3.5 text-right font-mono font-medium text-[#73726c]">
                {item.cost ? `$${item.cost.toLocaleString('es-AR', { minimumFractionDigits: 2 })}` : '-'}
              </td>

              {/* Factor Aplicado */}
              <td className="py-2.5 px-3.5 text-center">
                <span className="px-2 py-0.5 rounded-md font-mono text-[11px] font-bold border border-[#e5e3dc] bg-[#faf9f5]">
                  {item.applied_discount_pct > 0 ? `-${item.applied_discount_pct}%` : `${item.applied_discount_pct}%`}
                  <span className="text-[9px] font-normal text-[#73726c] ml-1">
                    ({item.discount_origin === 'custom' ? 'Manual' : 'Cat'})
                  </span>
                </span>
              </td>

              {/* Precio Esperado */}
              <td className="py-2.5 px-3.5 text-right font-mono font-bold text-[#141413]">
                {item.expected_price ? `$${item.expected_price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}` : '-'}
              </td>

              {/* Precio Tienda */}
              <td className="py-2.5 px-3.5 text-right font-mono font-bold text-[#141413]">
                ${(item.price || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </td>

              {/* Diferencia */}
              <td className="py-2.5 px-3.5 text-right font-mono">
                {item.expected_price ? (
                  <div className={`font-bold ${isOk ? 'text-[#15803d]' : 'text-[#b91c1c]'}`}>
                    {item.diff_amount > 0 ? `+$${item.diff_amount.toLocaleString('es-AR')}` : item.diff_amount < 0 ? `-$${Math.abs(item.diff_amount).toLocaleString('es-AR')}` : '$0'}
                    <div className="text-[10px] opacity-80">{item.diff_pct > 0 ? `+${item.diff_pct}%` : `${item.diff_pct}%`}</div>
                  </div>
                ) : (
                  <span className="text-[#9c998f]">-</span>
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
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#141413] text-white shadow-elevated px-5 py-3 rounded-2xl border border-[#141413] flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 select-none">
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
              {isBatchFixing ? 'Aplicando...' : `Corregir ${selectedCount} productos`}
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
