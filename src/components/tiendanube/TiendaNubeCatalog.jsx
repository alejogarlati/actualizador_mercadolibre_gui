import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Plus, 
  Edit3, 
  Trash2, 
  ChevronDown, 
  ChevronRight, 
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
  items, 
  categories, 
  loading, 
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

  // Quick edit modal / popover state
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

  // Filtrado
  const filteredItems = (items || []).filter(item => {
    const matchSearch = 
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(item.id).includes(searchTerm);

    const matchStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && item.status === 'active') ||
      (statusFilter === 'hidden' && item.status === 'hidden');

    const matchCat = 
      categoryFilter === 'all' || 
      String(item.category_id) === String(categoryFilter);

    return matchSearch && matchStatus && matchCat;
  });

  return (
    <div className="space-y-4">
      {/* Barra de Filtros y Acciones de Catálogo */}
      <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800 shadow-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex-1 flex flex-wrap items-center gap-3">
          {/* Buscador */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre, SKU, marca o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-950 text-gray-100 text-xs pl-9 pr-4 py-2.5 rounded-xl border border-gray-800 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Filtro por Estado */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-950 text-gray-200 text-xs px-3 py-2.5 rounded-xl border border-gray-800 focus:outline-none focus:border-blue-500"
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
              className="bg-gray-950 text-gray-200 text-xs px-3 py-2.5 rounded-xl border border-gray-800 focus:outline-none focus:border-blue-500"
            >
              <option value="all">Todas las categorías</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition-all disabled:opacity-50"
            title="Refrescar catálogo desde la API de Tiendanube"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-400' : ''}`} />
            <span className="hidden sm:inline">Refrescar</span>
          </button>

          <button
            onClick={onOpenCreate}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      {/* Tabla de Productos */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-950/70 border-b border-gray-800 text-gray-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 w-10"></th>
                <th className="py-3.5 px-4">Producto & Marca</th>
                <th className="py-3.5 px-4">SKU</th>
                <th className="py-3.5 px-4 text-right">Precio Lista</th>
                <th className="py-3.5 px-4 text-right">Oferta</th>
                <th className="py-3.5 px-4 text-right">Costo ERP</th>
                <th className="py-3.5 px-4 text-center">Stock</th>
                <th className="py-3.5 px-4 text-center">Estado</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-gray-200">
              {loading && items.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-gray-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-400" />
                    <span>Cargando catálogo de Tiendanube...</span>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-gray-500">
                    <Package className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                    <p className="text-sm font-medium text-gray-400">No se encontraron productos</p>
                    <p className="text-xs text-gray-500 mt-1">Prueba refrescar desde la API o modificar los filtros de búsqueda.</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => {
                  const hasVariants = item.variants && item.variants.length > 0;
                  const isExpanded = expandedRows[item.id];
                  const hasPromo = item.promotional_price && item.promotional_price > 0;

                  return (
                    <React.Fragment key={item.id}>
                      <tr className="hover:bg-gray-800/40 transition-colors">
                        {/* Expand Icon */}
                        <td className="py-3 px-4 text-center">
                          {hasVariants ? (
                            <button
                              onClick={() => toggleRow(item.id)}
                              className="p-1 rounded hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                            >
                              {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-blue-400" /> : <ChevronRight className="w-3.5 h-3.5" />}
                            </button>
                          ) : (
                            <span className="w-3.5 h-3.5 inline-block"></span>
                          )}
                        </td>

                        {/* Thumbnail & Title */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {item.thumbnail ? (
                              <img
                                src={item.thumbnail}
                                alt={item.name}
                                className="w-9 h-9 object-cover rounded-lg border border-gray-800 bg-gray-950"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-lg border border-gray-800 bg-gray-950 flex items-center justify-center text-gray-600">
                                <Package className="w-4 h-4" />
                              </div>
                            )}
                            <div>
                              <div className="font-semibold text-gray-100 flex items-center gap-2">
                                <span>{item.name}</span>
                                {item.free_shipping && (
                                  <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-1.5 py-0.2 rounded border border-emerald-500/20 font-medium">
                                    Envío Gratis
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5">
                                {item.brand && <span className="text-gray-300 font-medium">{item.brand}</span>}
                                {item.category_name && <span>• {item.category_name}</span>}
                                {hasVariants && <span className="text-blue-400">({item.variants.length} variantes)</span>}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* SKU */}
                        <td className="py-3 px-4 font-mono text-gray-300">
                          {item.sku || <span className="text-gray-600 italic">Sin SKU</span>}
                        </td>

                        {/* Precio Regular */}
                        <td className={`py-3 px-4 text-right font-mono font-semibold ${hasPromo ? 'line-through text-gray-500 text-[11px]' : 'text-gray-100'}`}>
                          ${(item.price || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </td>

                        {/* Precio Promocional */}
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                          {hasPromo ? `$${item.promotional_price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}` : '-'}
                        </td>

                        {/* Costo ERP */}
                        <td className="py-3 px-4 text-right font-mono text-gray-400">
                          {item.cost ? `$${item.cost.toLocaleString('es-AR', { minimumFractionDigits: 2 })}` : '-'}
                        </td>

                        {/* Stock */}
                        <td className="py-3 px-4 text-center">
                          {item.stock !== null && item.stock !== undefined ? (
                            item.stock > 0 ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                {item.stock} u.
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                                Agotado
                              </span>
                            )
                          ) : (
                            <span className="text-gray-500 text-[11px]">Ilimitado</span>
                          )}
                        </td>

                        {/* Estado */}
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            item.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-gray-800 text-gray-400 border border-gray-700'
                          }`}>
                            <span className={`w-1 h-1 rounded-full ${item.status === 'active' ? 'bg-emerald-400' : 'bg-gray-400'}`}></span>
                            {item.status === 'active' ? 'Publicado' : 'Oculto'}
                          </span>
                        </td>

                        {/* Acciones */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openQuickEdit(item)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-yellow-400 hover:bg-gray-800 transition-colors"
                              title="Ajuste rápido de precio y stock"
                            >
                              <Sliders className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onOpenEdit(item.id)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-gray-800 transition-colors"
                              title="Editar ficha completa y variantes"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDelete(item.id)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-colors"
                              title="Eliminar producto"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Acordeón de Variantes Hijas */}
                      {isExpanded && hasVariants && (
                        <tr className="bg-gray-950/80 border-b border-gray-800/80">
                          <td colSpan="9" className="py-3 px-8">
                            <div className="border-l-2 border-blue-500/40 pl-4 py-1 space-y-2">
                              <div className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Tag className="w-3 h-3" />
                                <span>Variantes del Producto (#{item.id})</span>
                              </div>
                              <div className="grid grid-cols-1 gap-1.5">
                                {item.variants.map((v, vIdx) => {
                                  const valuesStr = (v.values || []).map(val => val.es || Object.values(val)[0]).join(' / ');
                                  return (
                                    <div key={v.id || vIdx} className="flex items-center justify-between bg-gray-900/90 px-3 py-2 rounded-lg border border-gray-800 text-xs">
                                      <div className="flex items-center gap-3">
                                        <span className="font-semibold text-gray-200">
                                          {valuesStr || `Variante #${vIdx + 1}`}
                                        </span>
                                        {v.sku && (
                                          <span className="text-[11px] text-gray-400 font-mono">
                                            SKU: <span className="text-gray-300">{v.sku}</span>
                                          </span>
                                        )}
                                      </div>

                                      <div className="flex items-center gap-4 font-mono">
                                        <div className="text-right">
                                          <span className={`text-xs ${v.promotional_price ? 'line-through text-gray-500' : 'text-gray-200 font-semibold'}`}>
                                            ${parseFloat(v.price || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                          </span>
                                          {v.promotional_price && (
                                            <span className="text-xs text-emerald-400 font-bold ml-2">
                                              ${parseFloat(v.promotional_price).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                            </span>
                                          )}
                                        </div>

                                        <div className="text-right">
                                          {v.stock !== null && v.stock !== undefined ? (
                                            <span className={`text-xs px-2 py-0.5 rounded ${v.stock > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                              {v.stock} u.
                                            </span>
                                          ) : (
                                            <span className="text-gray-500 text-xs">Ilimitado</span>
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
      </div>

      {/* Modal / Diálogo de Ajuste Rápido */}
      {quickEditItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-gray-900 border border-gray-800 w-full max-w-sm rounded-2xl shadow-2xl p-5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white">Ajuste Rápido de Producto</h3>
              <p className="text-xs text-gray-400 truncate mt-0.5">{quickEditItem.name}</p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1">Precio de Lista ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={quickPrice}
                  onChange={(e) => setQuickPrice(e.target.value)}
                  className="w-full bg-gray-950 text-white font-mono px-3 py-2 rounded-xl border border-gray-800 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Precio Oferta / Promocional ($)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Opcional"
                  value={quickPromoPrice}
                  onChange={(e) => setQuickPromoPrice(e.target.value)}
                  className="w-full bg-gray-950 text-emerald-400 font-mono px-3 py-2 rounded-xl border border-gray-800 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Stock Disponible (Unidades)</label>
                <input
                  type="number"
                  value={quickStock}
                  onChange={(e) => setQuickStock(e.target.value)}
                  className="w-full bg-gray-950 text-white font-mono px-3 py-2 rounded-xl border border-gray-800 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-800">
              <button
                onClick={() => setQuickEditItem(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-gray-200 hover:bg-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveQuickEdit}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20"
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
