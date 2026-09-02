import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Search, 
  ExternalLink, 
  RefreshCw, 
  ChevronDown, 
  ChevronRight, 
  Filter, 
  Layers, 
  DollarSign, 
  Clock, 
  Folder 
} from 'lucide-react';
import Toolbar from '../ui/Toolbar';
import Table from '../ui/Table';
import Pagination from '../ui/Pagination';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

const SORT_ACCESSORS = {
  id: (item) => item.id || '',
  sku: (item) => item.sku || '',
  title: (item) => item.title || '',
  category_name: (item) => item.category_name || item.category_id || '',
  status: (item) => item.status || '',
  precio_mostrador: (item) => item.precio_mostrador || 0,
  price: (item) => item.price || 0,
  margen: (item) => {
    const mostrador = item.precio_mostrador || Math.round(item.price * 0.70);
    return mostrador > 0 ? ((item.price - mostrador) / mostrador) * 100 : 0;
  }
};

export default function MeliCatalog({
  items = [],
  loading = false,
  onRefresh,
  onOpenEdit,
  lastUpdated
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [shippingFilter, setShippingFilter] = useState('all');
  const [skuFilter, setSkuFilter] = useState('all');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  const [expandedItems, setExpandedItems] = useState({});

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const toggleVariations = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // 1. Filtrado
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchSearch = 
        (item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.id && item.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.category_name && item.category_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.variations && item.variations.some(v => 
          (v.seller_custom_field && v.seller_custom_field.toLowerCase().includes(searchTerm.toLowerCase())) ||
          String(v.id).includes(searchTerm)
        ));

      const matchStatus = statusFilter === 'all' || item.status === statusFilter;

      let matchShipping = true;
      if (shippingFilter === 'free') {
        matchShipping = Boolean(item.shipping?.free_shipping);
      } else if (shippingFilter === 'paid') {
        matchShipping = !item.shipping?.free_shipping;
      }

      let matchSku = true;
      if (skuFilter === 'with_sku') {
        matchSku = Boolean(item.sku);
      } else if (skuFilter === 'no_sku') {
        matchSku = !item.sku;
      }

      return matchSearch && matchStatus && matchShipping && matchSku;
    });
  }, [items, searchTerm, statusFilter, shippingFilter, skuFilter]);

  // 2. Ordenamiento
  const sortedItems = useMemo(() => {
    const accessor = SORT_ACCESSORS[sortBy] || ((item) => item[sortBy] ?? '');
    const direction = sortOrder === 'asc' ? 1 : -1;

    return [...filteredItems].sort((a, b) => {
      const valA = accessor(a);
      const valB = accessor(b);

      if (typeof valA === 'string' && typeof valB === 'string') {
        return valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' }) * direction;
      }
      return ((Number(valA) || 0) - (Number(valB) || 0)) * direction;
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
    { key: 'id', label: 'ID / Publicación', width: 175, minWidth: 120, sortable: true },
    { key: 'sku', label: 'SKU ERP', width: 140, minWidth: 90, sortable: true },
    { key: 'title', label: 'Título & Categoría', width: 340, minWidth: 180, sortable: true },
    { key: 'status', label: 'Estado', width: 100, minWidth: 75, align: 'center', sortable: true },
    { key: 'precio_mostrador', label: 'Costo ERP', width: 120, minWidth: 90, align: 'right', sortable: true },
    { key: 'price', label: 'Precio MeLi', width: 130, minWidth: 95, align: 'right', sortable: true },
    { key: 'margen', label: 'Margen (%)', width: 105, minWidth: 80, align: 'center', sortable: true },
    { key: 'actions', label: 'Acciones', width: 85, minWidth: 60, align: 'right' }
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar Principal */}
      <Toolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar por título, SKU, ID MeLi..."
        totalItems={items.length}
        filteredCount={filteredItems.length}
        onRefresh={onRefresh}
        refreshing={loading}
        refreshTitle="Refrescar Catálogo"
        filters={
          <>
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
                <option value="all">Estado: Todos</option>
                <option value="active">Activas</option>
                <option value="paused">Pausadas</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-[#faf9f5] dark:bg-[#262624] border border-[#e5e3dc] dark:border-[#363633] rounded-xl px-2.5 py-1.5 text-xs">
              <select
                value={shippingFilter}
                onChange={(e) => {
                  setShippingFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs font-bold text-[#141413] dark:text-[#faf9f5] outline-none cursor-pointer"
              >
                <option value="all">Envíos: Todos</option>
                <option value="free">Envío Gratis (Me2)</option>
                <option value="paid">Envío Pago / A cargo comprador</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-[#faf9f5] dark:bg-[#262624] border border-[#e5e3dc] dark:border-[#363633] rounded-xl px-2.5 py-1.5 text-xs">
              <select
                value={skuFilter}
                onChange={(e) => {
                  setSkuFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs font-bold text-[#141413] dark:text-[#faf9f5] outline-none cursor-pointer"
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
            <div className="hidden xl:flex items-center gap-1.5 text-[11px] text-[#73726c] dark:text-[#a3a199] bg-[#faf9f5] dark:bg-[#262624] border border-[#e5e3dc] dark:border-[#363633] px-2.5 py-1.5 rounded-xl font-mono">
              <Clock className="w-3.5 h-3.5 text-[#9c998f] dark:text-[#73726c]" />
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
                className={`hover:bg-[#faf9f5] dark:hover:bg-[#262624] cursor-pointer transition-colors group ${
                  isExpanded ? 'bg-[#faf9f5]/80 dark:bg-[#232321]' : ''
                }`}
              >
                {/* ID & Thumbnail */}
                <td className="py-2.5 px-3.5 font-mono font-bold text-[#141413] dark:text-[#faf9f5]">
                  <div className="flex items-center gap-2">
                    {hasVariations ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleVariations(item.id);
                        }}
                        className="p-1 hover:bg-[#ece9df] dark:hover:bg-[#30302d] rounded text-[#73726c] dark:text-[#a3a199] transition-colors cursor-pointer shrink-0"
                        title="Ver variaciones"
                      >
                        {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-[#141413] dark:text-[#faf9f5]" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      </button>
                    ) : (
                      <div className="w-5 shrink-0" />
                    )}

                    {item.thumbnail ? (
                      <img src={item.thumbnail} alt="" className="w-7 h-7 rounded-lg object-cover border border-[#e5e3dc] dark:border-[#363633] shrink-0" />
                    ) : (
                      <div className="w-7 h-7 rounded-lg bg-[#f4f2eb] dark:bg-[#262624] border border-[#e5e3dc] dark:border-[#363633] shrink-0" />
                    )}

                    <span className="truncate">{item.id}</span>
                  </div>
                </td>

                {/* SKU */}
                <td className="py-2.5 px-3.5 font-mono text-[#73726c] dark:text-[#a3a199]">
                  <span className="bg-[#faf9f5] dark:bg-[#262624] border border-[#e5e3dc] dark:border-[#363633] px-2 py-0.5 rounded text-[11px] font-semibold text-[#141413] dark:text-[#faf9f5] block truncate">
                    {item.sku || 'Sin SKU'}
                  </span>
                </td>

                {/* Title & Category */}
                <td className="py-2.5 px-3.5">
                  <div className="font-bold text-[#141413] dark:text-[#faf9f5] tracking-tight truncate" title={item.title}>
                    {item.title}
                  </div>
                  <div className="text-[10.5px] text-[#73726c] dark:text-[#a3a199] flex items-center gap-1 mt-0.5 truncate" title={item.category_name || item.category_id}>
                    <Folder className="w-3 h-3 text-[#9c998f] dark:text-[#73726c] shrink-0" />
                    <span className="truncate">{item.category_name || item.category_id}</span>
                  </div>
                </td>

                {/* Status */}
                <td className="py-2.5 px-3.5 text-center">
                  <Badge variant={item.status === 'active' ? 'success' : 'neutral'} dot size="sm">
                    {item.status === 'active' ? 'ACTIVA' : 'PAUSADA'}
                  </Badge>
                </td>

                {/* Precio Mostrador */}
                <td className="py-2.5 px-3.5 text-right font-mono font-medium text-[#73726c] dark:text-[#a3a199]">
                  ${precioMostrador.toLocaleString()}
                </td>

                {/* Precio ML */}
                <td className="py-2.5 px-3.5 text-right font-mono font-bold text-[#141413] dark:text-[#faf9f5]">
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
                        className="p-1.5 text-[#73726c] dark:text-[#a3a199] hover:text-[#141413] dark:hover:text-[#faf9f5] hover:bg-[#f4f2eb] dark:hover:bg-[#262624] rounded-lg border border-transparent hover:border-[#e5e3dc] dark:hover:border-[#363633] transition-all cursor-pointer"
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
                <tr className="bg-[#faf9f5]/90 dark:bg-[#232321] border-b border-[#e5e3dc] dark:border-[#2d2d2a]">
                  <td colSpan={columns.length} className="py-3 px-8">
                    <div className="bg-white dark:bg-[#1c1c1a] border border-[#e5e3dc] dark:border-[#2d2d2a] rounded-xl p-3 shadow-card space-y-2">
                      <div className="text-[11px] font-bold text-[#141413] dark:text-[#faf9f5] flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-[#73726c] dark:text-[#a3a199]" />
                        <span>Variaciones ({item.variations.length})</span>
                      </div>
                      <div className="divide-y divide-[#ece9df] dark:divide-[#2d2d2a]">
                        {item.variations.map((v) => (
                          <div key={v.id} className="py-1.5 flex items-center justify-between text-xs font-mono">
                            <div className="flex items-center gap-2 truncate">
                              <span className="bg-[#faf9f5] dark:bg-[#262624] border border-[#e5e3dc] dark:border-[#363633] px-2 py-0.5 rounded text-[11px] text-[#73726c] dark:text-[#a3a199]">
                                ID #{v.id}
                              </span>
                              <span className="font-bold text-[#141413] dark:text-[#faf9f5]">
                                SKU: {v.seller_custom_field || 'N/A'}
                              </span>
                              {v.attribute_combinations && v.attribute_combinations.length > 0 && (
                                <span className="text-[#73726c] dark:text-[#a3a199] text-[11px] truncate">
                                  ({v.attribute_combinations.map(a => `${a.name}: ${a.value_name}`).join(', ')})
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 shrink-0">
                              <span className="text-[#73726c] dark:text-[#a3a199]">Stock: <strong className="text-[#141413] dark:text-[#faf9f5]">{v.available_quantity}</strong></span>
                              <span className="font-bold text-[#141413] dark:text-[#faf9f5]">${v.price?.toLocaleString()}</span>
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
