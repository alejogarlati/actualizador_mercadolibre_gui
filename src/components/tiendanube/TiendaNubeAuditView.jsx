import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShieldCheck, 
  Search, 
  RefreshCw, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  HelpCircle,
  TrendingDown, 
  TrendingUp, 
  Zap,
  ArrowUpDown,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

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
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'DIFERENCIA', 'OK', 'SIN_ERP'
  const [sortBy, setSortBy] = useState('diff_amount');
  const [sortOrder, setSortOrder] = useState('desc');

  // Selección múltiple
  const [selectedMap, setSelectedMap] = useState({}); // { [variant_id]: { product_id, variant_id, expected_price, sku, title } }
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

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, pageSize]);

  // Paginación
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

  const pageDiffs = paginatedItems.filter(i => i.expected_price && i.audit_status === 'DIFERENCIA');
  const isAllPageSelected = pageDiffs.length > 0 && pageDiffs.every(i => selectedMap[i.variant_id]);

  return (
    <div className="flex flex-col gap-6 relative pb-20">
      {/* TARJETAS KPI DE AUDITORÍA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Variantes */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Variantes Auditadas</span>
            <div className="text-2xl font-black text-slate-900 mt-1 font-mono">
              {auditReport?.total_variants || 0}
            </div>
          </div>
          <div className="p-3 bg-slate-100 text-slate-700 rounded-2xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Correctas OK */}
        <div 
          onClick={() => setStatusFilter(statusFilter === 'OK' ? 'all' : 'OK')}
          className={`p-5 rounded-3xl border shadow-sm flex items-center justify-between cursor-pointer transition-all ${
            statusFilter === 'OK' ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400' : 'bg-white border-slate-200 hover:border-emerald-200'
          }`}
        >
          <div>
            <span className="text-xs font-semibold text-emerald-700">Precios Correctos (OK)</span>
            <div className="text-2xl font-black text-emerald-700 mt-1 font-mono">
              {auditReport?.count_ok || 0}
            </div>
          </div>
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Desactualizadas / Con Diferencia */}
        <div 
          onClick={() => setStatusFilter(statusFilter === 'DIFERENCIA' ? 'all' : 'DIFERENCIA')}
          className={`p-5 rounded-3xl border shadow-sm flex items-center justify-between cursor-pointer transition-all ${
            statusFilter === 'DIFERENCIA' ? 'bg-red-50 border-red-300 ring-2 ring-red-400' : 'bg-white border-slate-200 hover:border-red-200'
          }`}
        >
          <div>
            <span className="text-xs font-semibold text-red-700">Con Diferencia de Precio</span>
            <div className="text-2xl font-black text-red-700 mt-1 font-mono">
              {auditReport?.count_diff || 0}
            </div>
          </div>
          <div className="p-3 bg-red-100 text-red-700 rounded-2xl">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Sin Costo ERP */}
        <div 
          onClick={() => setStatusFilter(statusFilter === 'SIN_ERP' ? 'all' : 'SIN_ERP')}
          className={`p-5 rounded-3xl border shadow-sm flex items-center justify-between cursor-pointer transition-all ${
            statusFilter === 'SIN_ERP' ? 'bg-slate-100 border-slate-300 ring-2 ring-slate-400' : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div>
            <span className="text-xs font-semibold text-slate-500">Sin Costo ERP</span>
            <div className="text-2xl font-black text-slate-700 mt-1 font-mono">
              {auditReport?.count_no_erp || 0}
            </div>
          </div>
          <div className="p-3 bg-slate-100 text-slate-500 rounded-2xl">
            <HelpCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* TOOLBAR, FILTROS Y TOLERANCIA */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex-1 flex flex-wrap items-center gap-3">
          {/* Buscador */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar en auditoría por variante, SKU o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-red-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Filtro por Dictamen */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 text-slate-700 text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-red-500"
            >
              <option value="all">Todos los dictámenes</option>
              <option value="DIFERENCIA">Solo Diferencias</option>
              <option value="OK">Solo Sincronizados (OK)</option>
              <option value="SIN_ERP">Sin Costo ERP</option>
            </select>
          </div>

          {/* Selector de Tolerancia */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-medium">Tolerancia:</span>
            <select
              value={tolerancePct}
              onChange={(e) => onToleranceChange(parseFloat(e.target.value))}
              className="bg-transparent font-bold text-slate-900 outline-none cursor-pointer"
            >
              <option value={0.5}>±0.5%</option>
              <option value={1.0}>±1.0%</option>
              <option value={2.0}>±2.0%</option>
              <option value={5.0}>±5.0%</option>
              <option value={10.0}>±10.0%</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {auditReport?.count_diff > 0 && (
            <button
              onClick={handleSelectAllDiffs}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors"
            >
              Seleccionar todas las diferencias ({auditReport.count_diff})
            </button>
          )}

          <button
            onClick={onRefresh}
            disabled={loading || isBatchFixing}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-red-600' : 'text-slate-500'}`} />
            <span>Re-Auditar Todo</span>
          </button>
        </div>
      </div>

      {/* TABLA DE AUDITORÍA DE VARIANTES */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllPageSelected}
                    onChange={handleSelectAllPage}
                    disabled={pageDiffs.length === 0}
                    className="w-4 h-4 rounded text-red-600 focus:ring-0 cursor-pointer disabled:opacity-30"
                    title="Seleccionar todas las diferencias de la página actual"
                  />
                </th>
                <th className="py-3.5 px-4 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('display_title')}>
                  <div className="flex items-center gap-1">
                    Variante & SKU {sortBy === 'display_title' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </div>
                </th>
                <th className="py-3.5 px-4 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('category_name')}>
                  <div className="flex items-center gap-1">
                    Categoría {sortBy === 'category_name' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </div>
                </th>
                <th className="py-3.5 px-4 text-right cursor-pointer hover:bg-slate-100" onClick={() => handleSort('cost')}>
                  <div className="flex items-center justify-end gap-1">
                    Costo Mostrador {sortBy === 'cost' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </div>
                </th>
                <th className="py-3.5 px-4 text-center">Factor Aplicado</th>
                <th className="py-3.5 px-4 text-right cursor-pointer hover:bg-slate-100" onClick={() => handleSort('expected_price')}>
                  <div className="flex items-center justify-end gap-1">
                    Precio Esperado {sortBy === 'expected_price' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </div>
                </th>
                <th className="py-3.5 px-4 text-right cursor-pointer hover:bg-slate-100" onClick={() => handleSort('price')}>
                  <div className="flex items-center justify-end gap-1">
                    Precio Tienda {sortBy === 'price' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </div>
                </th>
                <th className="py-3.5 px-4 text-right cursor-pointer hover:bg-slate-100" onClick={() => handleSort('diff_amount')}>
                  <div className="flex items-center justify-end gap-1">
                    Diferencia {sortBy === 'diff_amount' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </div>
                </th>
                <th className="py-3.5 px-4 text-center cursor-pointer hover:bg-slate-100" onClick={() => handleSort('audit_status')}>
                  <div className="flex items-center justify-center gap-1">
                    Dictamen {sortBy === 'audit_status' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </div>
                </th>
                <th className="py-3.5 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="10" className="py-16 text-center text-slate-500">
                    <RefreshCw className="w-7 h-7 animate-spin mx-auto mb-2 text-red-600" />
                    <span className="font-semibold">Calculando auditoría financiera de todas las variantes...</span>
                  </td>
                </tr>
              ) : paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-16 text-center text-slate-500">
                    <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500" />
                    <p className="text-sm font-bold text-slate-700">No hay variantes que coincidan con el filtro</p>
                  </td>
                </tr>
              ) : (
                paginatedItems.map(item => {
                  const isOk = item.audit_status === 'OK';
                  const isDiff = item.audit_status === 'DIFERENCIA';
                  const isSelected = !!selectedMap[item.variant_id];
                  const isRowFixing = fixingId === item.variant_id || (isBatchFixing && isSelected);

                  return (
                    <tr 
                      key={`${item.product_id}-${item.variant_id}`} 
                      className={`transition-colors ${
                        isSelected 
                          ? 'bg-red-50/50 hover:bg-red-50/80' 
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      {/* Checkbox de Selección */}
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(item)}
                          disabled={!item.expected_price || isRowFixing}
                          className="w-4 h-4 rounded text-red-600 focus:ring-0 cursor-pointer disabled:opacity-30"
                        />
                      </td>

                      {/* Variante & SKU */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-semibold text-slate-900 truncate">
                          {item.product_name}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mt-0.5">
                          {item.variant_str && (
                            <span className="text-red-700 font-bold bg-red-50 px-1.5 py-0.2 rounded border border-red-200">
                              {item.variant_str}
                            </span>
                          )}
                          <span>SKU: <strong className="text-slate-800">{item.sku || 'N/A'}</strong></span>
                        </div>
                      </td>

                      {/* Categoría */}
                      <td className="py-3 px-4 text-slate-600 max-w-[140px] truncate" title={item.category_name}>
                        <span className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-[11px]">
                          {item.category_name}
                        </span>
                      </td>

                      {/* Costo Mostrador */}
                      <td className="py-3 px-4 text-right font-mono font-medium text-slate-600">
                        {item.cost ? `$${item.cost.toLocaleString('es-AR', { minimumFractionDigits: 2 })}` : '-'}
                      </td>

                      {/* Factor Aplicado */}
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-bold border ${
                          item.discount_origin === 'custom' 
                            ? 'bg-red-50 text-red-700 border-red-200' 
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {item.applied_discount_pct > 0 ? `-${item.applied_discount_pct}%` : `${item.applied_discount_pct}%`}
                          <span className="text-[9px] font-normal ml-1">({item.discount_origin === 'custom' ? 'Manual' : 'Cat'})</span>
                        </span>
                      </td>

                      {/* Precio Esperado */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        {item.expected_price ? `$${item.expected_price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}` : '-'}
                      </td>

                      {/* Precio Publicado en Tienda */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        ${(item.price || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </td>

                      {/* Diferencia */}
                      <td className="py-3 px-4 text-right font-mono">
                        {item.expected_price ? (
                          <div className={`font-bold ${isOk ? 'text-emerald-600' : 'text-red-600'}`}>
                            {item.diff_amount > 0 ? `+$${item.diff_amount.toLocaleString('es-AR')}` : item.diff_amount < 0 ? `-$${Math.abs(item.diff_amount).toLocaleString('es-AR')}` : '$0'}
                            <div className="text-[10px] opacity-80">{item.diff_pct > 0 ? `+${item.diff_pct}%` : `${item.diff_pct}%`}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Dictamen */}
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          isOk ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          isDiff ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            isOk ? 'bg-emerald-500' : isDiff ? 'bg-red-500' : 'bg-slate-400'
                          }`} />
                          <span>{isOk ? 'OK' : isDiff ? 'DIFERENCIA' : 'SIN ERP'}</span>
                        </span>
                      </td>

                      {/* Acción */}
                      <td className="py-3 px-4 text-right">
                        {isDiff && item.expected_price && (
                          <button
                            onClick={() => handleSingleFix(item)}
                            disabled={isRowFixing}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-red-600 hover:bg-red-700 text-white shadow-xs transition-colors disabled:opacity-50"
                            title="Actualizar precio de esta variante en Tiendanube con el valor esperado"
                          >
                            {isRowFixing ? (
                              <RefreshCw className="w-3 h-3 animate-spin text-white" />
                            ) : (
                              <Zap className="w-3 h-3 fill-white" />
                            )}
                            <span>{isRowFixing ? 'Aplicando...' : 'Corregir'}</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Barra de Paginación */}
        {sortedItems.length > 0 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="text-slate-500 font-medium">
              Página <strong className="text-slate-800">{currentPage}</strong> de <strong className="text-slate-800">{totalPages}</strong> ({sortedItems.length} variantes)
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 disabled:opacity-40 disabled:hover:bg-white shadow-2xs transition-colors"
              >
                <ChevronsLeft className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 disabled:opacity-40 disabled:hover:bg-white shadow-2xs transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

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
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 disabled:opacity-40 disabled:hover:bg-white shadow-2xs transition-colors"
              >
                <ChevronsRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* BARRA FLOTANTE DE ACCIONES EN LOTE */}
      {selectedCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-red-600 text-white shadow-2xl shadow-red-950/40 px-6 py-3.5 rounded-2xl border border-red-500/80 flex items-center gap-5 transition-all animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-2 pr-4 border-r border-red-400/60">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
            <span className="text-xs font-bold font-mono text-white">
              {selectedCount} {selectedCount === 1 ? 'variante seleccionada' : 'variantes seleccionadas'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExecuteBatchFix}
              disabled={isBatchFixing}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white hover:bg-red-50 text-red-700 shadow-md shadow-red-950/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isBatchFixing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-red-600" />
              ) : (
                <Zap className="w-3.5 h-3.5 fill-red-600 text-red-600" />
              )}
              <span>{isBatchFixing ? 'Aplicando correcciones...' : `Corregir ${selectedCount} productos`}</span>
            </button>

            <button
              onClick={handleClearSelection}
              disabled={isBatchFixing}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              Deseleccionar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
