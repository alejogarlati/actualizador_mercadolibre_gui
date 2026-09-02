import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  TrendingDown, 
  TrendingUp, 
  HelpCircle, 
  Clock, 
  Filter, 
  SlidersHorizontal,
  DollarSign,
  Truck,
  ExternalLink
} from 'lucide-react';
import KpiCard from '../ui/KpiCard';
import Toolbar from '../ui/Toolbar';
import Table from '../ui/Table';
import Pagination from '../ui/Pagination';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

export default function MeliAuditView({
  auditReport,
  loading = false,
  onRefresh,
  tolerancePct = 5.0,
  onToleranceChange,
  onInspectItem,
  lastUpdated = null
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [skuFilter, setSkuFilter] = useState('all');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const rawItems = auditReport?.items || [];

  // Evaluación y KPIs dinámicos en vivo según la tolerancia seleccionada
  const dynamicAuditItems = useMemo(() => {
    return rawItems.map(item => {
      let evalStatus = "SIN_ERP";
      if (item.precio_mostrador_erp && item.precio_mostrador_erp > 0) {
        if (Math.abs(item.diferencia_pct) <= tolerancePct) {
          evalStatus = "OK";
        } else if (item.neto_a_recibir < item.precio_mostrador_erp) {
          evalStatus = "BAJO";
        } else {
          evalStatus = "ALTO";
        }
      }
      return {
        ...item,
        status_evaluacion: evalStatus
      };
    });
  }, [rawItems, tolerancePct]);

  const dynamicCounts = useMemo(() => {
    return {
      total: dynamicAuditItems.length,
      ok: dynamicAuditItems.filter(i => i.status_evaluacion === 'OK').length,
      bajo: dynamicAuditItems.filter(i => i.status_evaluacion === 'BAJO').length,
      alto: dynamicAuditItems.filter(i => i.status_evaluacion === 'ALTO').length,
      sin_erp: dynamicAuditItems.filter(i => i.status_evaluacion === 'SIN_ERP').length,
    };
  }, [dynamicAuditItems]);

  const filteredItems = useMemo(() => {
    return dynamicAuditItems.filter(item => {
      const matchSearch = 
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.item_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'all' || item.status_evaluacion === statusFilter;

      const hasSku = item.sku && item.sku !== 'Sin SKU' && item.sku !== 'N/A' && item.sku.trim() !== '';
      const matchSku = skuFilter === 'all' || (skuFilter === 'with_sku' ? hasSku : !hasSku);

      return matchSearch && matchStatus && matchSku;
    });
  }, [dynamicAuditItems, searchTerm, statusFilter, skuFilter]);

  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredItems, sortBy, sortOrder]);

  const handleSort = (columnKey) => {
    if (sortBy === columnKey) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(columnKey);
      setSortOrder('asc');
    }
  };

  const effectivePageSize = pageSize === 'all' ? sortedItems.length || 1 : pageSize;
  const totalPages = Math.max(1, Math.ceil(sortedItems.length / effectivePageSize));
  const paginatedItems = useMemo(() => {
    if (pageSize === 'all') return sortedItems;
    const start = (currentPage - 1) * pageSize;
    return sortedItems.slice(start, start + pageSize);
  }, [sortedItems, currentPage, pageSize]);

  const columns = [
    { key: 'title', label: 'Publicación & SKU', sortable: true },
    { key: 'price_ml', label: 'Precio ML', width: '130px', align: 'right', sortable: true },
    { key: 'comision_porcentaje', label: 'Comisión %', width: '100px', align: 'center', sortable: true },
    { key: 'neto_a_recibir', label: 'Neto Recibido', width: '130px', align: 'right', sortable: true },
    { key: 'precio_mostrador_erp', label: 'ERP Mostrador', width: '130px', align: 'right', sortable: true },
    { key: 'status_evaluacion', label: 'Dictamen', width: '120px', align: 'center', sortable: true }
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* KPI Cards de Auditoría */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Auditados */}
        <KpiCard
          title="Total Auditados"
          value={dynamicCounts.total}
          subtitle="Publicaciones evaluadas"
          icon={ShieldCheck}
        />

        {/* En Rango OK */}
        <KpiCard
          title="En Rango Rentable"
          value={dynamicCounts.ok}
          subtitle="Margen neto equilibrado"
          icon={CheckCircle2}
          colorScheme="success"
          active={statusFilter === 'OK'}
          onClick={() => {
            setStatusFilter(statusFilter === 'OK' ? 'all' : 'OK');
            setCurrentPage(1);
          }}
        />

        {/* Margen Bajo ERP */}
        <KpiCard
          title="Margen Bajo ERP"
          value={dynamicCounts.bajo}
          subtitle="Neto menor a costo mostrador"
          icon={TrendingDown}
          colorScheme="error"
          active={statusFilter === 'BAJO'}
          onClick={() => {
            setStatusFilter(statusFilter === 'BAJO' ? 'all' : 'BAJO');
            setCurrentPage(1);
          }}
        />

        {/* Margen Alto ERP */}
        <KpiCard
          title="Margen Alto ERP"
          value={dynamicCounts.alto}
          subtitle="Neto superior al costo"
          icon={TrendingUp}
          active={statusFilter === 'ALTO'}
          onClick={() => {
            setStatusFilter(statusFilter === 'ALTO' ? 'all' : 'ALTO');
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Toolbar & Controles */}
      <Toolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar en auditoría por SKU, ID o título..."
        totalItems={dynamicCounts.total}
        filteredCount={filteredItems.length}
        onRefresh={onRefresh}
        refreshing={loading}
        refreshTitle="Ejecutar Auditoría"
        filters={
          <>
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
                <option value="OK">En Rango OK</option>
                <option value="BAJO">Recibe Menos que ERP</option>
                <option value="ALTO">Recibe Más que ERP</option>
                <option value="SIN_ERP">Sin Coincidencia ERP</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-[#faf9f5] border border-[#e5e3dc] rounded-xl px-2.5 py-1.5 text-xs">
              <select
                value={skuFilter}
                onChange={(e) => {
                  setSkuFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs font-bold text-[#141413] outline-none cursor-pointer"
              >
                <option value="all">SKU: Todos</option>
                <option value="with_sku">Con SKU</option>
                <option value="no_sku">Sin SKU (N/A)</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-[#faf9f5] border border-[#e5e3dc] rounded-xl px-2.5 py-1.5 text-xs">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#73726c]" />
              <span className="text-[#73726c] font-medium">Tolerancia:</span>
              <select
                value={tolerancePct}
                onChange={(e) => onToleranceChange(parseFloat(e.target.value))}
                className="bg-transparent text-xs font-bold text-[#141413] outline-none cursor-pointer"
              >
                <option value={2.0}>±2%</option>
                <option value={5.0}>±5% (Recomendado)</option>
                <option value={10.0}>±10%</option>
              </select>
            </div>
          </>
        }
        actions={
          lastUpdated && (
            <div className="hidden xl:flex items-center gap-1.5 text-[11px] text-[#73726c] bg-[#faf9f5] border border-[#e5e3dc] px-2.5 py-1.5 rounded-xl font-mono">
              <Clock className="w-3.5 h-3.5 text-[#9c998f]" />
              <span>Aud: {lastUpdated}</span>
            </div>
          )
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
        emptyMessage="No hay publicaciones en la auditoría"
        emptySubMessage="Presiona 'Ejecutar Auditoría' para evaluar el catálogo completo."
        renderRow={(item) => {
          return (
            <tr
              key={item.item_id}
              onClick={() => onInspectItem(item)}
              className="hover:bg-[#faf9f5] cursor-pointer transition-colors group"
              title="Haz clic para ver el desglose detallado de costos"
            >
              <td className="py-2.5 px-3.5 max-w-xs">
                <div className="font-bold text-[#141413] truncate tracking-tight">
                  {item.title}
                </div>
                <div className="text-[10px] text-[#73726c] font-mono mt-0.5">
                  SKU: <strong className="text-[#141413]">{item.sku || 'N/A'}</strong> | ID: {item.item_id}
                </div>
              </td>

              <td className="py-2.5 px-3.5 text-right font-mono font-bold text-[#141413]">
                ${item.price_ml?.toLocaleString()}
              </td>

              <td className="py-2.5 px-3.5 text-center font-mono text-[#73726c]">
                {item.comision_porcentaje}%
              </td>

              <td className="py-2.5 px-3.5 text-right font-mono font-bold text-[#15803d]">
                ${item.neto_a_recibir?.toLocaleString()}
              </td>

              <td className="py-2.5 px-3.5 text-right font-mono font-medium text-[#73726c]">
                {item.precio_mostrador_erp ? `$${item.precio_mostrador_erp.toLocaleString()}` : 'N/A'}
              </td>

              <td className="py-2.5 px-3.5 text-center">
                <Badge
                  variant={
                    item.status_evaluacion === 'OK' ? 'success' :
                    item.status_evaluacion === 'BAJO' ? 'error' :
                    item.status_evaluacion === 'ALTO' ? 'neutral' : 'outline'
                  }
                  dot
                  size="sm"
                >
                  {item.status_evaluacion === 'OK' ? 'EN RANGO' :
                   item.status_evaluacion === 'BAJO' ? 'RECIBE MENOS' :
                   item.status_evaluacion === 'ALTO' ? 'RECIBE MÁS' : 'SIN ERP'}
                </Badge>
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
    </div>
  );
}
