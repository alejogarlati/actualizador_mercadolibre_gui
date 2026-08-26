import React, { useState } from 'react';
import { 
  FolderTree, 
  Search, 
  RefreshCw, 
  Save, 
  Percent, 
  Layers, 
  ChevronRight, 
  Info, 
  CheckCircle2, 
  AlertCircle,
  Folder,
  Tag
} from 'lucide-react';

export default function TiendaNubeCategoriesView({ 
  categoriesTree = [], 
  loading = false, 
  onRefresh, 
  onSaveCategoryDiscount 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [discounts, setDiscounts] = useState({});
  const [savingId, setSavingId] = useState(null);

  // Sincronizar estado local de inputs con categoriesTree si no han sido editados
  const getDiscountValue = (cat) => {
    if (discounts[cat.id] !== undefined) {
      return discounts[cat.id];
    }
    return cat.discount_pct || 0;
  };

  const handleDiscountChange = (catId, value) => {
    setDiscounts(prev => ({ ...prev, [catId]: value }));
  };

  const handleSave = async (cat) => {
    const val = discounts[cat.id] !== undefined ? parseFloat(discounts[cat.id]) || 0 : (cat.discount_pct || 0);
    setSavingId(cat.id);
    try {
      await onSaveCategoryDiscount(cat.id, val);
    } finally {
      setSavingId(null);
    }
  };

  // Filtrado de árbol
  const filteredTree = categoriesTree.filter(cat => {
    const matchParent = cat.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSub = cat.subcategories && cat.subcategories.some(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchParent || matchSub;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Banner Explicativo */}
      <div className="bg-gradient-to-r from-red-50 via-white to-slate-50 border border-red-100 rounded-3xl p-5 shadow-sm flex items-start gap-4">
        <div className="p-3 bg-red-600 text-white rounded-2xl shrink-0 shadow-md shadow-red-200">
          <FolderTree className="w-6 h-6" />
        </div>
        <div className="space-y-1 text-xs">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>Reglas de Precios por Categorías y Sub-Categorías</span>
            <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-md text-[10px] font-bold">Motor Jerárquico</span>
          </h3>
          <p className="text-slate-600 leading-relaxed">
            El sistema toma el <strong>costo de mostrador ERP</strong> de cada variante y le aplica el <strong>factor de descuento</strong> de su categoría asignada.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
            <span className="flex items-center gap-1.5">
              <strong className="text-slate-700">1. Sobreescritura Variante:</strong> Prioridad máxima (si fue configurada individualmente).
            </span>
            <span className="flex items-center gap-1.5">
              <strong className="text-slate-700">2. Sub-Categoría:</strong> Aplica si tiene un descuento explícito.
            </span>
            <span className="flex items-center gap-1.5">
              <strong className="text-slate-700">3. Categoría Padre:</strong> Se hereda automáticamente a todas las subcategorías en 0%.
            </span>
          </div>
        </div>
      </div>

      {/* Toolbar y Buscador */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar categoría o sub-categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 text-slate-900 text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-red-500 focus:bg-white transition-colors"
          />
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-red-600' : 'text-slate-500'}`} />
          <span>Sincronizar Categorías desde Tiendanube</span>
        </button>
      </div>

      {/* Lista de Categorías y Subcategorías */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col divide-y divide-slate-100">
        {loading && categoriesTree.length === 0 ? (
          <div className="p-16 text-center text-slate-500">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-red-600" />
            <p className="font-semibold text-sm">Cargando árbol jerárquico de categorías...</p>
          </div>
        ) : filteredTree.length === 0 ? (
          <div className="p-16 text-center text-slate-500">
            <Folder className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="font-bold text-slate-700">No se encontraron categorías</p>
            <p className="text-xs text-slate-400 mt-1">Prueba sincronizar desde Tiendanube con el botón superior.</p>
          </div>
        ) : (
          filteredTree.map(cat => {
            const currentDiscount = getDiscountValue(cat);
            const isSaving = savingId === cat.id;
            const subcats = cat.subcategories || [];

            return (
              <div key={cat.id} className="p-5 flex flex-col gap-4 hover:bg-slate-50/40 transition-colors">
                {/* Categoría Padre */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-red-50 text-red-600 rounded-xl border border-red-100 shrink-0">
                      <Folder className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{cat.name}</span>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                          ID #{cat.id}
                        </span>
                        {subcats.length > 0 && (
                          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            {subcats.length} sub-categorías
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Categoría Principal • Aplica a todas sus variantes e hijos por defecto
                      </p>
                    </div>
                  </div>

                  {/* Input de Descuento de Categoría Principal */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus-within:border-red-500 focus-within:bg-white transition-colors">
                      <span className="text-xs text-slate-500 font-medium">Descuento:</span>
                      <input
                        type="number"
                        step="0.5"
                        value={currentDiscount}
                        onChange={(e) => handleDiscountChange(cat.id, e.target.value)}
                        className="w-16 bg-transparent text-sm font-bold font-mono text-slate-900 outline-none text-right"
                      />
                      <span className="text-xs font-bold text-slate-500">%</span>
                    </div>

                    <button
                      onClick={() => handleSave(cat)}
                      disabled={isSaving}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors shadow-sm disabled:opacity-50"
                      title="Guardar descuento de categoría"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSaving ? '...' : 'Guardar'}</span>
                    </button>
                  </div>
                </div>

                {/* Sub-Categorías Hijas */}
                {subcats.length > 0 && (
                  <div className="ml-4 sm:ml-12 pl-4 border-l-2 border-slate-200 space-y-2 pt-1">
                    {subcats.map(sub => {
                      const subDiscount = getDiscountValue(sub);
                      const isSubSaving = savingId === sub.id;
                      const isInherited = subDiscount === 0 && currentDiscount > 0;

                      return (
                        <div key={sub.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 hover:bg-white transition-colors">
                          <div className="flex items-center gap-2.5">
                            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-xs text-slate-800">{sub.name}</span>
                                <span className="text-[10px] font-mono text-slate-400">#{sub.id}</span>
                              </div>
                              {isInherited && (
                                <span className="text-[10px] text-amber-700 font-medium">
                                  ⚡ Hereda {currentDiscount}% de la categoría padre
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-auto">
                            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1 focus-within:border-red-500 transition-colors">
                              <input
                                type="number"
                                step="0.5"
                                placeholder={`0 (${currentDiscount}%)`}
                                value={subDiscount}
                                onChange={(e) => handleDiscountChange(sub.id, e.target.value)}
                                className="w-14 bg-transparent text-xs font-bold font-mono text-slate-900 outline-none text-right"
                              />
                              <span className="text-xs font-bold text-slate-400">%</span>
                            </div>

                            <button
                              onClick={() => handleSave(sub)}
                              disabled={isSubSaving}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors"
                              title="Guardar descuento específico de sub-categoría"
                            >
                              <Save className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
