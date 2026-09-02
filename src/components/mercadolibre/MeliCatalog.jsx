import React, { useState, useMemo } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  ExternalLink, 
  Folder, 
  Layers, 
  Clock, 
  Filter, 
  ArrowUpDown,
  Edit3
} from 'lucide-react';
import Toolbar from '../ui/Toolbar';
import Table from '../ui/Table';
import Pagination from '../ui/Pagination';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

export default function MeliCatalog({
  items = [],
  loading = false,
  onRefresh,
  onOpenEdit,
  lastUpdated = null
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [skuFilter, setSkuFilter] = useState('all');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  const [expandedItems, setExpandedItems] = useState({});

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const toggleVariations = (itemId) => {
    setExpandedItems(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const handleSort = (columnKey) => {
    if (sortBy === columnKey) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(columnKey);
      setSortOrder('asc');
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchSearch = 
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'all' || item.status === statusFilter;

      const hasSku = item.sku && item.sku !== 'Sin SKU' && item.sku !== 'N/A' && item.sku.trim() !== '';
      const matchSku = skuFilter === 'all' || (skuFilter === 'with_sku' ? hasSku : !hasSku);

      return matchSearch && matchStatus && matchSku;
    });
  }, [items, searchTerm, statusFilter, skuFilter]);

  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (sortBy === 'precio_mostrador') {
        valA = a.precio_mostrador || Math.round(a.price * 0.70);
        valB = b.precio_mostrador || Math.round(b.price * 0.70);
      } else if (sortBy === 'margen') {
        const pmA = a.precio_mostrador || Math.round(a.price * 0.70);
        const pmB = b.precio_mostrador || Math.round(b.price * 0.70);
        valA = pmA > 0 ? ((a.price - pmA) / pmA) : 0;
        valB = pmB > 0 ? ((b.price - pmB) / pmB) : 0;
      }

      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredItems, sortBy, sortOrder]);

  const effectivePageSize = pageSize === 'all' ? sortedItems.length || 1 : pageSize;
  const totalPages = Math.max(1, Math.ceil(sortedItems.length / effectivePageSize));
  const paginatedItems = useMemo(() => {
    if (pageSize === 'all') return sortedItems;
    const start = (currentPage - 1) * pageSize;
    return sortedItems.slice(start, start + pageSize);
  }, [sortedItems, currentPage, pageSize]);

  const columns = [
    { key: 'id', label: 'Ítem / ID', width: '160px', sortable: true },
    { key: 'sku', label: 'SKU ERP', width: '130px', sortable: true },
    { key: 'title', label: 'Título de la Publicación', sortable: true },
    { key: 'status', label: 'Estado', width: '90px', align: 'center', sortable: true },
    { key: 'precio_mostrador', label: 'Costo Mostrador', width: '130px', align: 'right', sortable: true },
    { key: 'price', label: 'Precio ML', width: '130px', align: 'right', sortable: true },
    { key: 'margen', label: 'Margen', width: '90px', align: 'center', sortable: true },
    { key: 'actions', label: 'Acción', width: '80px', align: 'right' }
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <Toolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar por ID, SKU o título..."
        totalItems={items.length}
        filteredCount={filteredItems.length}
        onRefresh={onRefresh}
        refreshing={loading}
        refreshTitle="Refrescar Lista"
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
                <option value="all">Todos los estados</option>
                <option value="active">Activas</option>
                <option value="paused">Pausadas</option>
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
                <option value="with_sku">Con SKU asignado</option>
                <option value="no_sku">Sin SKU (N/A)</option>
              </select>
            </div>
          </>
        }
        actions={
          lastUpdated && (
            <div className="hidden xl:flex items-center gap-1.5 text-[11px] text-[#73726c] bg-[#faf9f5] border border-[#e5e3dc] px-2.5 py-1.5 rounded-xl font-mono">
              <Clock className="w-3.5 h-3.5 text-[#9c998f]" />
              <span>Sinc: {lastUpdated}</span>
            </div>
          )
        }
      />

      {/* Tabla de Publicaciones */}
      <Table
        columns={columns}
        data={paginatedItems}
        loading={loading}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        emptyMessage="No se encontraron publicaciones"
        emptySubMessage="Intenta cambiar los términos de búsqueda o los filtros."
        renderRow={(item) => {
          const precioMostrador = item.precio_mostrador || Math.round(item.price * 0.70);
          const incrementoPct = precioMostrador > 0 ? (((item.price - precioMostrador) / precioMostrador) * 100).toFixed(1) : '0.0';
          const hasVariations = item.variations && item.variations.length > 0;
          const isExpanded = expandedItems[item.id];

          return (
            <React.Fragment key={item.id}>
              <tr
                onClick={() => onOpenEdit(item)}
                className={`hover:bg-[#faf9f5] cursor-pointer transition-colors group ${
                  isExpanded ? 'bg-[#faf9f5]/80' : ''
                }`}
              >
                {/* ID & Thumbnail */}
                <td className="py-2.5 px-3.5 font-mono font-bold text-[#141413]">
                  <div className="flex items-center gap-2">
                    {hasVariations ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleVariations(item.id);
                        }}
                        className="p-1 hover:bg-[#ece9df] rounded text-[#73726c] transition-colors cursor-pointer"
                        title="Ver variaciones"
                      >
                        {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-[#141413]" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      </button>
                    ) : (
                      <div className="w-5" />
                    )}

                    {item.thumbnail ? (
                      <img src={item.thumbnail} alt="" className="w-7 h-7 rounded-lg object-cover border border-[#e5e3dc]" />
                    ) : (
                      <div className="w-7 h-7 rounded-lg bg-[#f4f2eb] border border-[#e5e3dc]" />
                    )}

                    <span className="truncate">{item.id}</span>
                  </div>
                </td>

                {/* SKU */}
                <td className="py-2.5 px-3.5 font-mono text-[#73726c]">
                  <span className="bg-[#faf9f5] border border-[#e5e3dc] px-2 py-0.5 rounded text-[11px] font-semibold text-[#141413]">
                    {item.sku || 'Sin SKU'}
                  </span>
                </td>

                {/* Title */}
                <td className="py-2.5 px-3.5 max-w-xs">
                  <div className="font-bold text-[#141413] truncate tracking-tight">
                    {item.title}
                  </div>
                  <div className="text-[10px] text-[#73726c] flex items-center gap-1 mt-0.5 truncate" title={item.category_name || item.category_id}>
                    <Folder className="w-3 h-3 text-[#9c998f] shrink-0" />
                    <span>{item.category_name || item.category_id}</span>
                  </div>
                </td>

                {/* Status */}
                <td className="py-2.5 px-3.5 text-center">
                  <Badge variant={item.status === 'active' ? 'success' : 'neutral'} dot size="sm">
                    {item.status === 'active' ? 'ACTIVA' : 'PAUSADA'}
                  </Badge>
                </td>

                {/* Precio Mostrador */}
                <td className="py-2.5 px-3.5 text-right font-mono font-medium text-[#73726c]">
                  ${precioMostrador.toLocaleString()}
                </td>

                {/* Precio ML */}
                <td className="py-2.5 px-3.5 text-right font-mono font-bold text-[#141413]">
                  ${item.price.toLocaleString()}
                </td>

                {/* Margen */}
                <td className="py-2.5 px-3.5 text-center">
                  <Badge variant="neutral" size="sm">
                    +{incrementoPct}%
                  </Badge>
                </td>

                {/* Actions */}
                <td className="py-2.5 px-3.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {item.permalink && (
                      <a
                        href={item.permalink}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 text-[#73726c] hover:text-[#141413] hover:bg-[#f4f2eb] rounded-lg border border-transparent hover:border-[#e5e3dc] transition-all cursor-pointer"
                        title="Ver en Mercado Libre"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </td>
              </tr>

              {/* Variaciones desplegables */}
              {hasVariations && isExpanded && (
                <tr className="bg-[#faf9f5]/90 border-b border-[#e5e3dc]">
                  <td colSpan={columns.length} className="py-3 px-8">
                    <div className="bg-white border border-[#e5e3dc] rounded-xl p-3 shadow-card space-y-2">
                      <div className="text-[11px] font-bold text-[#141413] flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-[#73726c]" />
                        <span>Variaciones ({item.variations.length})</span>
                      </div>
                      <div className="divide-y divide-[#ece9df]">
                        {item.variations.map((v) => (
                          <div key={v.id} className="py-1.5 flex items-center justify-between text-xs font-mono">
                            <div className="flex items-center gap-2">
                              <span className="bg-[#faf9f5] border border-[#e5e3dc] px-2 py-0.5 rounded text-[11px] text-[#73726c]">
                                ID #{v.id}
                              </span>
                              <span className="font-bold text-[#141413]">
                                SKU: {v.seller_custom_field || 'N/A'}
                              </span>
                              {v.attribute_combinations && v.attribute_combinations.length > 0 && (
                                <span className="text-[#73726c] text-[11px]">
                                  ({v.attribute_combinations.map(a => `${a.name}: ${a.value_name}`).join(', ')})
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-[#73726c]">Stock: <strong className="text-[#141413]">{v.available_quantity}</strong></span>
                              <span className="font-bold text-[#141413]">${v.price?.toLocaleString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
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
