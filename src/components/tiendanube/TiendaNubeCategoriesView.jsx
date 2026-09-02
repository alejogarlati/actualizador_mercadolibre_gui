import React, { useState } from 'react';
import { 
  FolderTree, 
  Search, 
  RefreshCw, 
  Save, 
  Percent, 
  Folder, 
  ChevronRight, 
  Zap,
  Tag
} from 'lucide-react';
import Card from '../ui/Card';
import Toolbar from '../ui/Toolbar';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

export default function TiendaNubeCategoriesView({ 
  categoriesTree = [], 
  loading = false, 
  onRefresh, 
  onSaveCategoryDiscount 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [discounts, setDiscounts] = useState({});
  const [savingId, setSavingId] = useState(null);

  const getDiscountValue = (cat) => {
    if (!cat) return 0;
    if (discounts[cat.id] !== undefined) {
      return discounts[cat.id];
    }
    return cat.discount_pct || 0;
  };

  const handleDiscountChange = (catId, value) => {
    setDiscounts(prev => ({ ...prev, [catId]: value }));
  };

  const handleSave = async (cat) => {
    if (!cat || !cat.id) return;
    const val = discounts[cat.id] !== undefined ? parseFloat(discounts[cat.id]) || 0 : (cat.discount_pct || 0);
    setSavingId(cat.id);
    try {
      if (onSaveCategoryDiscount) {
        await onSaveCategoryDiscount(cat.id, val);
      }
    } finally {
      setSavingId(null);
    }
  };

  const search = (searchTerm || '').trim().toLowerCase();
  const treeList = Array.isArray(categoriesTree) ? categoriesTree : [];

  const filteredTree = treeList.filter(cat => {
    if (!cat) return false;
    const parentName = (cat.name || '').toLowerCase();
    const matchParent = !search || parentName.includes(search);
    const subcats = Array.isArray(cat.subcategories) ? cat.subcategories : [];
    const matchSub = search && subcats.some(s => s && (s.name || '').toLowerCase().includes(search));
    return matchParent || matchSub;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Banner Explicativo */}
      <Card
        title="Reglas de Precios por Categorías y Sub-Categorías"
        subtitle="Motor Jerárquico de Descuentos para Tiendanube"
        icon={FolderTree}
        badge={<Badge variant="outline" size="sm">Prioridad en Cascada</Badge>}
      >
        <div className="flex flex-col gap-2 text-xs text-[#73726c] dark:text-[#a3a199]">
          <p className="leading-relaxed">
            El sistema toma el <strong>costo de mostrador ERP</strong> de cada variante y le aplica el <strong>factor de descuento</strong> de su categoría asignada.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-[11px] pt-1">
            <span>
              <strong className="text-[#141413] dark:text-[#faf9f5]">1. Sobreescritura Variante:</strong> Prioridad máxima (si fue configurada individualmente).
            </span>
            <span>
              <strong className="text-[#141413] dark:text-[#faf9f5]">2. Sub-Categoría:</strong> Aplica si tiene un descuento explícito.
            </span>
            <span>
              <strong className="text-[#141413] dark:text-[#faf9f5]">3. Categoría Padre:</strong> Se hereda automáticamente a todas las subcategorías en 0%.
            </span>
          </div>
        </div>
      </Card>

      {/* Toolbar y Buscador */}
      <Toolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar categoría o subcategoría..."
        totalItems={treeList.length}
        filteredCount={filteredTree.length}
        onRefresh={onRefresh}
        refreshing={loading}
        refreshTitle="Sincronizar Categorías"
      />

      {/* Lista de Categorías y Subcategorías */}
      <div className="bg-white dark:bg-[#1c1c1a] rounded-2xl border border-[#e5e3dc] dark:border-[#2d2d2a] shadow-card overflow-hidden flex flex-col divide-y divide-[#ece9df] dark:divide-[#2d2d2a]">
        {loading && treeList.length === 0 ? (
          <div className="p-16 text-center text-[#73726c] dark:text-[#a3a199] flex flex-col items-center gap-2">
            <RefreshCw className="w-7 h-7 animate-spin text-[#141413] dark:text-[#faf9f5]" />
            <p className="font-bold text-xs text-[#141413] dark:text-[#faf9f5]">Cargando árbol jerárquico de categorías...</p>
          </div>
        ) : filteredTree.length === 0 ? (
          <div className="p-16 text-center text-[#73726c] dark:text-[#a3a199] flex flex-col items-center gap-2">
            <Folder className="w-9 h-9 text-[#9c998f] dark:text-[#73726c]" />
            <p className="font-bold text-xs text-[#141413] dark:text-[#faf9f5]">No se encontraron categorías</p>
            <p className="text-[11px] text-[#73726c] dark:text-[#a3a199]">Prueba sincronizar desde Tiendanube con el botón superior.</p>
          </div>
        ) : (
          filteredTree.map(cat => {
            const currentDiscount = getDiscountValue(cat);
            const isSaving = savingId === cat.id;
            const subcats = Array.isArray(cat.subcategories) ? cat.subcategories : [];

            return (
              <div key={cat.id} className="p-4 flex flex-col gap-3 hover:bg-[#faf9f5]/50 dark:hover:bg-[#262624]/40 transition-colors">
                {/* Categoría Padre */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#faf9f5] dark:bg-[#262624] text-[#141413] dark:text-[#faf9f5] rounded-xl border border-[#e5e3dc] dark:border-[#363633] shrink-0">
                      <Folder className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#141413] dark:text-[#faf9f5] text-xs">{cat.name}</span>
                        <span className="text-[10px] font-mono text-[#73726c] dark:text-[#a3a199] bg-[#faf9f5] dark:bg-[#262624] border border-[#e5e3dc] dark:border-[#363633] px-1.5 py-0.2 rounded">
                          ID #{cat.id}
                        </span>
                        {subcats.length > 0 && (
                          <span className="text-[10px] font-semibold text-[#73726c] dark:text-[#a3a199] bg-[#f4f2eb] dark:bg-[#262624] px-2 py-0.2 rounded-full border border-[#e5e3dc] dark:border-[#363633]">
                            {subcats.length} sub-categorías
                          </span>
                        )}
                      </div>
                      <p className="text-[10.5px] text-[#73726c] dark:text-[#a3a199] mt-0.5">
                        Categoría Principal • Aplica a todas sus variantes e hijos por defecto
                      </p>
                    </div>
                  </div>

                  {/* Input de Descuento de Categoría Principal */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <div className="flex items-center gap-1 bg-[#faf9f5] dark:bg-[#262624] border border-[#e5e3dc] dark:border-[#363633] rounded-xl px-2.5 py-1 focus-within:border-[#141413] dark:focus-within:border-[#faf9f5] focus-within:bg-white dark:focus-within:bg-[#1c1c1a] transition-colors">
                      <span className="text-[11px] text-[#73726c] dark:text-[#a3a199] font-medium">Descuento:</span>
                      <input
                        type="number"
                        step="0.5"
                        value={currentDiscount}
                        onChange={(e) => handleDiscountChange(cat.id, e.target.value)}
                        className="w-14 bg-transparent text-xs font-bold font-mono text-[#141413] dark:text-[#faf9f5] outline-none text-right"
                      />
                      <span className="text-xs font-bold text-[#73726c] dark:text-[#a3a199]">%</span>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleSave(cat)}
                      loading={isSaving}
                      icon={Save}
                      title="Guardar descuento de categoría"
                    >
                      Guardar
                    </Button>
                  </div>
                </div>

                {/* Sub-Categorías Hijas */}
                {subcats.length > 0 && (
                  <div className="ml-4 sm:ml-10 pl-3 border-l-2 border-[#e5e3dc] dark:border-[#363633] space-y-1.5 pt-1">
                    {subcats.map(sub => {
                      const subDiscount = getDiscountValue(sub);
                      const isSubSaving = savingId === sub.id;
                      const isInherited = subDiscount === 0 && currentDiscount > 0;

                      return (
                        <div key={sub.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-[#faf9f5] dark:bg-[#232321] rounded-xl border border-[#e5e3dc] dark:border-[#363633] hover:bg-white dark:hover:bg-[#262624] transition-colors">
                          <div className="flex items-center gap-2">
                            <ChevronRight className="w-3.5 h-3.5 text-[#9c998f] dark:text-[#73726c] shrink-0" />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-xs text-[#141413] dark:text-[#faf9f5]">{sub.name}</span>
                                <span className="text-[10px] font-mono text-[#73726c] dark:text-[#a3a199]">#{sub.id}</span>
                              </div>
                              {isInherited && (
                                <span className="text-[10px] text-[#73726c] dark:text-[#a3a199] font-medium inline-flex items-center gap-1">
                                  <Zap className="w-3 h-3 text-[#141413] dark:text-[#faf9f5]" />
                                  <span>Hereda {currentDiscount}% de la categoría principal</span>
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 self-end sm:self-auto">
                            <div className="flex items-center gap-1 bg-white dark:bg-[#1c1c1a] border border-[#e5e3dc] dark:border-[#363633] rounded-lg px-2 py-0.5 focus-within:border-[#141413] dark:focus-within:border-[#faf9f5] transition-colors">
                              <input
                                type="number"
                                step="0.5"
                                placeholder={`0 (${currentDiscount}%)`}
                                value={subDiscount}
                                onChange={(e) => handleDiscountChange(sub.id, e.target.value)}
                                className="w-12 bg-transparent text-xs font-bold font-mono text-[#141413] dark:text-[#faf9f5] outline-none text-right"
                              />
                              <span className="text-xs font-bold text-[#73726c] dark:text-[#a3a199]">%</span>
                            </div>

                            <button
                              onClick={() => handleSave(sub)}
                              disabled={isSubSaving}
                              className="p-1.5 rounded-lg text-[#73726c] dark:text-[#a3a199] hover:text-[#141413] dark:hover:text-[#faf9f5] hover:bg-[#ece9df] dark:hover:bg-[#30302d] transition-colors cursor-pointer"
                              title="Guardar descuento específico de subcategoría"
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
