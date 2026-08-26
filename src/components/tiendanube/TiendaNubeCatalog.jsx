import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Plus, 
  Edit3, 
  Trash2, 
  ChevronDown, 
  ChevronRight, 
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Tag, 
  ExternalLink, 
  Package, 
  CheckCircle2, 
  AlertCircle,
  AlertTriangle,
  Sliders,
  DollarSign
} from 'lucide-react';

export default function TiendaNubeCatalog({ 
  items = [], 
  categories = [], 
  loading = false, 
  onRefresh, 
  onOpenCreate, 
  onOpenEdit, 
  onDelete,
  onQuickUpdate 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [expandedRows, setExpandedRows] = useState({});

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25); // 15, 25, 50, 100, 'all'

  // Quick edit state
  const [quickEditItem, setQuickEditItem] = useState(null);
  const [quickPrice, setQuickPrice] = useState('');
  const [quickPromoPrice, setQuickPromoPrice] = useState('');
  const [quickStock, setQuickStock] = useState('');

  const toggleRow = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const openQuickEdit = (item) => {
    setQuickEditItem(item);
    setQuickPrice(item.price || '');
    setQuickPromoPrice(item.promotional_price || '');
    setQuickStock(item.stock !== null && item.stock !== undefined ? item.stock : '');
  };

  const handleSaveQuickEdit = () => {
    if (!quickEditItem) return;
    onQuickUpdate(quickEditItem.id, {
      price: quickPrice ? parseFloat(quickPrice) : undefined,
      promotional_price: quickPromoPrice ? parseFloat(quickPromoPrice) : null,
      stock: quickStock !== '' ? parseInt(quickStock) : undefined
    });
    setQuickEditItem(null);
  };

  // Filtrado de items
  const filteredItems = useMemo(() => {
    return (items || []).filter(item => {
      const matchSearch = 
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(item.id).includes(searchTerm) ||
        (item.variants && item.variants.some(v => v.sku?.toLowerCase().includes(searchTerm.toLowerCase())));

      const matchStatus = 
        statusFilter === 'all' || 
        (statusFilter === 'active' && item.status === 'active') ||
        (statusFilter === 'hidden' && item.status === 'hidden');

      const matchCat = 
        categoryFilter === 'all' || 
        String(item.category_id) === String(categoryFilter);

      return matchSearch && matchStatus && matchCat;
    });
  }, [items, searchTerm, statusFilter, categoryFilter]);

  // Total de variantes de los items filtrados
  const totalVariantsCount = useMemo(() => {
    return filteredItems.reduce((acc, curr) => acc + (curr.variants?.length || 1), 0);
  }, [filteredItems]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, categoryFilter, pageSize]);

  // Cálculos de Paginación
  const effectivePageSize = pageSize === 'all' ? filteredItems.length || 1 : pageSize;
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / effectivePageSize));
  
  const paginatedItems = useMemo(() => {
    if (pageSize === 'all') return filteredItems;
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  const startIdx = filteredItems.length === 0 ? 0 : (currentPage - 1) * effectivePageSize + 1;
  const endIdx = pageSize === 'all' ? filteredItems.length : Math.min(currentPage * pageSize, filteredItems.length);

  // Helper para generar números de página con ventana inteligente
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
              placeholder="Buscar por nombre, SKU padre/variante, marca o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-red-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Filtro por Estado */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 text-slate-700 text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-red-500"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos / Publicados</option>
              <option value="hidden">Ocultos / Pausados</option>
            </select>
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
          <span>Mostrando <strong className="text-slate-800">{startIdx} - {endIdx}</strong> de <strong className="text-slate-800">{filteredItems.length}</strong> productos</span>
          <span className="text-slate-300">•</span>
          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-mono text-[11px] font-semibold">
            {totalVariantsCount} variantes / SKUs totales
          </span>
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
            <option value="all">Todos ({filteredItems.length})</option>
          </select>
        </div>
      </div>

      {/* Tabla de Catálogo */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 w-10 text-center">#</th>
                <th className="py-3.5 px-4">Producto & Marca</th>
                <th className="py-3.5 px-4">SKU Padre</th>
                <th className="py-3.5 px-4 text-right">Precio Lista</th>
                <th className="py-3.5 px-4 text-right">Oferta</th>
                <th className="py-3.5 px-4 text-right">Costo ERP</th>
                <th className="py-3.5 px-4 text-center">Stock</th>
                <th className="py-3.5 px-4 text-center">Estado</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {loading && items.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-16 text-center text-slate-500">
                    <RefreshCw className="w-7 h-7 animate-spin mx-auto mb-2 text-red-600" />
                    <span className="font-semibold">Cargando catálogo completo de Tiendanube...</span>
                  </td>
                </tr>
              ) : paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-16 text-center text-slate-500">
                    <Package className="w-10 h-10 mx-auto mb-2 text-slate-400" />
                    <p className="text-sm font-bold text-slate-700">No se encontraron productos</p>
                    <p className="text-xs text-slate-400 mt-1">Prueba refrescar desde la API o modificar los filtros de búsqueda.</p>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item, idx) => {
                  const hasVariants = item.variants && item.variants.length > 0;
                  const isExpanded = expandedRows[item.id];
                  const hasPromo = item.promotional_price && item.promotional_price > 0;
                  const rowNumber = startIdx + idx;

                  return (
                    <React.Fragment key={item.id}>
                      <tr className="hover:bg-slate-50/80 transition-colors">
                        {/* Expand Icon / Number */}
                        <td className="py-3 px-4 text-center">
                          {hasVariants ? (
                            <button
                              onClick={() => toggleRow(item.id)}
                              className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                              title={isExpanded ? 'Contraer variantes' : `Expandir ${item.variants.length} variantes`}
                            >
                              {isExpanded ? <ChevronDown className="w-4 h-4 text-red-600" /> : <ChevronRight className="w-4 h-4" />}
                            </button>
                          ) : (
                            <span className="text-slate-400 font-mono text-[10px]">{rowNumber}</span>
                          )}
                        </td>

                        {/* Thumbnail & Title */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {item.thumbnail ? (
                              <img
                                src={item.thumbnail}
                                alt={item.name}
                                className="w-10 h-10 object-cover rounded-xl border border-slate-200 bg-slate-50 shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                                <Package className="w-4 h-4" />
                              </div>
                            )}
                            <div className="max-w-md">
                              <div className="font-semibold text-slate-900 flex items-center gap-2 flex-wrap">
                                <span>{item.name}</span>
                                {item.free_shipping && (
                                  <span className="bg-emerald-50 text-emerald-700 text-[10px] px-1.5 py-0.2 rounded border border-emerald-200 font-medium">
                                    Envío Gratis
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5 flex-wrap">
                                <span className="font-mono text-slate-400">ID #{item.id}</span>
                                {item.brand && <span>• <strong className="text-slate-700">{item.brand}</strong></span>}
                                {item.category_name && <span>• {item.category_name}</span>}
                                {hasVariants && (
                                  <span className="text-red-600 font-semibold">
                                    ({item.variants.length} {item.variants.length === 1 ? 'variante' : 'variantes'})
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* SKU Padre */}
                        <td className="py-3 px-4 font-mono font-medium text-slate-700">
                          {item.sku || <span className="text-slate-400 italic">Sin SKU</span>}
                        </td>

                        {/* Precio Regular */}
                        <td className={`py-3 px-4 text-right font-mono font-semibold ${hasPromo ? 'line-through text-slate-400 text-[11px]' : 'text-slate-900'}`}>
                          ${(item.price || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </td>

                        {/* Precio Promocional */}
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                          {hasPromo ? `$${item.promotional_price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}` : '-'}
                        </td>

                        {/* Costo ERP */}
                        <td className="py-3 px-4 text-right font-mono text-slate-500">
                          {item.cost ? `$${item.cost.toLocaleString('es-AR', { minimumFractionDigits: 2 })}` : '-'}
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
                              onClick={() => openQuickEdit(item)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Ajuste rápido de precio y stock"
                            >
                              <Sliders className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onOpenEdit(item.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                              title="Editar ficha completa y variantes"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDelete(item.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Eliminar producto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Acordeón de Variantes Hijas */}
                      {isExpanded && hasVariants && (
                        <tr className="bg-slate-50/70 border-b border-slate-200">
                          <td colSpan="9" className="py-3.5 px-8">
                            <div className="border-l-2 border-red-600 pl-4 py-1 space-y-2">
                              <div className="text-[11px] font-bold text-red-600 uppercase tracking-wider flex items-center gap-1.5">
                                <Tag className="w-3.5 h-3.5" />
                                <span>Variantes del Producto (#{item.id}) - {item.variants.length} configuradas</span>
                              </div>
                              <div className="grid grid-cols-1 gap-2">
                                {item.variants.map((v, vIdx) => {
                                  const valuesStr = (v.values || []).map(val => val.es || Object.values(val)[0]).join(' / ');
                                  return (
                                    <div key={v.id || vIdx} className="flex items-center justify-between bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-2xs text-xs">
                                      <div className="flex items-center gap-3">
                                        <span className="font-bold text-slate-900">
                                          {valuesStr || `Variante #${vIdx + 1}`}
                                        </span>
                                        {v.sku && (
                                          <span className="text-[11px] text-slate-500 font-mono">
                                            SKU: <span className="text-slate-800 font-medium">{v.sku}</span>
                                          </span>
                                        )}
                                        {v.barcode && (
                                          <span className="text-[10px] text-slate-400 font-mono">
                                            EAN: {v.barcode}
                                          </span>
                                        )}
                                      </div>

                                      <div className="flex items-center gap-5 font-mono">
                                        <div className="text-right">
                                          <span className={`text-xs ${v.promotional_price ? 'line-through text-slate-400' : 'text-slate-900 font-bold'}`}>
                                            ${parseFloat(v.price || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                          </span>
                                          {v.promotional_price && (
                                            <span className="text-xs text-emerald-600 font-black ml-2">
                                              ${parseFloat(v.promotional_price).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                            </span>
                                          )}
                                        </div>

                                        <div className="text-right">
                                          {v.stock !== null && v.stock !== undefined ? (
                                            <span className={`text-xs px-2.5 py-0.5 rounded-md font-semibold border ${
                                              v.stock > 0 
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                                : 'bg-red-50 text-red-700 border-red-200'
                                            }`}>
                                              {v.stock} u.
                                            </span>
                                          ) : (
                                            <span className="text-slate-400 text-xs">Ilimitado</span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Barra de Paginación Inferior */}
        {filteredItems.length > 0 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="text-slate-500 font-medium">
              Página <strong className="text-slate-800">{currentPage}</strong> de <strong className="text-slate-800">{totalPages}</strong> ({filteredItems.length} productos totales)
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

      {/* Modal de Ajuste Rápido */}
      {quickEditItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 w-full max-w-sm rounded-2xl shadow-2xl p-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Ajuste Rápido de Producto</h3>
              <p className="text-xs text-slate-500 truncate mt-0.5">{quickEditItem.name}</p>
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
