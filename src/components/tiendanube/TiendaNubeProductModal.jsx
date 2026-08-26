import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Plus, 
  Trash2, 
  Layers, 
  Info, 
  Tag, 
  DollarSign, 
  Truck, 
  Check, 
  AlertCircle 
} from 'lucide-react';

export default function TiendaNubeProductModal({ 
  isOpen, 
  onClose, 
  onSave, 
  productData = null, 
  categories = [] 
}) {
  const isEditing = Boolean(productData?.id);
  const [activeTab, setActiveTab] = useState('general'); // 'general', 'variants'

  // Form General State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [brand, setBrand] = useState('');
  const [tags, setTags] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [freeShipping, setFreeShipping] = useState(false);
  const [published, setPublished] = useState(true);

  // Atributos (hasta 3)
  const [attributes, setAttributes] = useState([]);

  // Variantes
  const [variants, setVariants] = useState([
    {
      price: '',
      promotional_price: '',
      cost: '',
      stock: '',
      sku: '',
      barcode: '',
      values: []
    }
  ]);

  useEffect(() => {
    if (productData) {
      setName(productData.name || '');
      setDescription(productData.description || '');
      setBrand(productData.brand || '');
      setTags(productData.tags || '');
      setCategoryId(productData.category_id || '');
      setFreeShipping(Boolean(productData.free_shipping));
      setPublished(productData.status !== 'hidden');

      if (productData.attributes && Array.isArray(productData.attributes)) {
        setAttributes(productData.attributes.map(a => a.es || Object.values(a)[0]));
      } else {
        setAttributes([]);
      }

      if (productData.variants && productData.variants.length > 0) {
        setVariants(productData.variants.map(v => ({
          id: v.id,
          price: v.price || '',
          promotional_price: v.promotional_price || '',
          cost: v.cost || '',
          stock: v.stock !== null && v.stock !== undefined ? v.stock : '',
          sku: v.sku || '',
          barcode: v.barcode || '',
          values: (v.values || []).map(val => val.es || Object.values(val)[0])
        })));
      } else {
        setVariants([
          {
            price: productData.price || '',
            promotional_price: productData.promotional_price || '',
            cost: productData.cost || '',
            stock: productData.stock || '',
            sku: productData.sku || '',
            barcode: '',
            values: []
          }
        ]);
      }
    } else {
      setName('');
      setDescription('');
      setBrand('');
      setTags('');
      setCategoryId('');
      setFreeShipping(false);
      setPublished(true);
      setAttributes([]);
      setVariants([
        {
          price: '',
          promotional_price: '',
          cost: '',
          stock: '',
          sku: '',
          barcode: '',
          values: []
        }
      ]);
    }
  }, [productData, isOpen]);

  const addAttribute = () => {
    if (attributes.length >= 3) return;
    const newAttrName = `Atributo ${attributes.length + 1}`;
    setAttributes([...attributes, newAttrName]);

    setVariants(prev => prev.map(v => ({
      ...v,
      values: [...(v.values || []), '']
    })));
  };

  const removeAttribute = (index) => {
    const updatedAttrs = attributes.filter((_, i) => i !== index);
    setAttributes(updatedAttrs);

    setVariants(prev => prev.map(v => ({
      ...v,
      values: (v.values || []).filter((_, i) => i !== index)
    })));
  };

  const updateAttributeName = (index, value) => {
    const updated = [...attributes];
    updated[index] = value;
    setAttributes(updated);
  };

  const addVariant = () => {
    const baseVariant = variants[0] || {};
    setVariants([
      ...variants,
      {
        price: baseVariant.price || '',
        promotional_price: '',
        cost: baseVariant.cost || '',
        stock: '',
        sku: '',
        barcode: '',
        values: attributes.map(() => '')
      }
    ]);
  };

  const removeVariant = (index) => {
    if (variants.length <= 1) return;
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariantField = (index, field, value) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const updateVariantValue = (varIndex, attrIndex, value) => {
    const updated = [...variants];
    const newValues = [...(updated[varIndex].values || [])];
    newValues[attrIndex] = value;
    updated[varIndex].values = newValues;
    setVariants(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('El nombre del producto es obligatorio.');
      return;
    }

    const formattedVariants = variants.map(v => {
      const payload = {
        price: parseFloat(v.price) || 0.0,
        sku: v.sku ? v.sku.trim() : null,
        barcode: v.barcode ? v.barcode.trim() : null
      };

      if (v.id) payload.id = v.id;
      if (v.promotional_price) payload.promotional_price = parseFloat(v.promotional_price);
      if (v.cost) payload.cost = parseFloat(v.cost);
      if (v.stock !== '' && v.stock !== null && v.stock !== undefined) {
        payload.stock = parseInt(v.stock);
      }

      if (attributes.length > 0) {
        payload.values = (v.values || []).map(val => ({ es: val.trim() || 'Estándar' }));
      }

      return payload;
    });

    const payload = {
      name: { es: name.trim() },
      description: description.trim() ? { es: description.trim() } : {},
      brand: brand.trim() || null,
      tags: tags.trim(),
      published,
      free_shipping: freeShipping,
      categories: categoryId ? [parseInt(categoryId)] : [],
      attributes: attributes.map(a => ({ es: a.trim() })),
      variants: formattedVariants
    };

    onSave(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col my-8 max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-red-50 text-red-600 border border-red-200">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {isEditing ? `Editar Producto #${productData.id}` : 'Crear Nuevo Producto en Tiendanube'}
              </h2>
              <p className="text-xs text-slate-500">
                Configura catálogo, variantes multilingües y stock integrado
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="px-6 pt-3 bg-slate-50/50 border-b border-slate-200 flex gap-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`pb-2.5 border-b-2 transition-colors ${
              activeTab === 'general'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Datos Generales & Precios
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('variants')}
            className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'variants'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Matriz de Variantes</span>
            <span className="px-2 py-0.2 rounded-full bg-slate-200 text-[10px] font-mono font-bold text-slate-700">
              {variants.length}
            </span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs">
          {activeTab === 'general' ? (
            <div className="space-y-4">
              {/* Nombre */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Nombre del Producto <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Cemento Portland Holcim 50kg"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 px-4 py-2.5 rounded-xl border border-slate-200 focus:border-red-500 focus:bg-white focus:outline-none font-medium"
                />
              </div>

              {/* Marca & Categoría */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Marca</label>
                  <input
                    type="text"
                    placeholder="Ej: Holcim, Barbieri, Weber"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 px-4 py-2.5 rounded-xl border border-slate-200 focus:border-red-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Categoría</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-slate-50 text-slate-800 px-4 py-2.5 rounded-xl border border-slate-200 focus:border-red-500 focus:bg-white focus:outline-none"
                  >
                    <option value="">Sin categoría principal</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Descripción / Ficha Técnica</label>
                <textarea
                  rows="3"
                  placeholder="Descripción del producto o características..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 px-4 py-2.5 rounded-xl border border-slate-200 focus:border-red-500 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Etiquetas (Separadas por comas)</label>
                <input
                  type="text"
                  placeholder="construccion, cemento, albañileria"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 px-4 py-2.5 rounded-xl border border-slate-200 focus:border-red-500 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Switches */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100/60 transition-colors">
                  <input
                    type="checkbox"
                    checked={freeShipping}
                    onChange={(e) => setFreeShipping(e.target.checked)}
                    className="w-4 h-4 rounded text-red-600 focus:ring-0 bg-white border-slate-300"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">Envío Gratis</span>
                    <span className="text-[11px] text-slate-500">Marcar este producto con flete bonificado</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100/60 transition-colors">
                  <input
                    type="checkbox"
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                    className="w-4 h-4 rounded text-red-600 focus:ring-0 bg-white border-slate-300"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">Publicado / Activo</span>
                    <span className="text-[11px] text-slate-500">Visible inmediatamente en la tienda online</span>
                  </div>
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Atributos del Producto */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900">Atributos del Producto</h4>
                    <p className="text-[11px] text-slate-500">Tiendanube permite un máximo de 3 atributos (ej. Color, Medida, Espesor).</p>
                  </div>
                  <button
                    type="button"
                    onClick={addAttribute}
                    disabled={attributes.length >= 3}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 text-red-600 border border-slate-200 shadow-xs disabled:opacity-40"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar Atributo ({attributes.length}/3)</span>
                  </button>
                </div>

                {attributes.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    {attributes.map((attr, aIdx) => (
                      <div key={aIdx} className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
                        <input
                          type="text"
                          value={attr}
                          onChange={(e) => updateAttributeName(aIdx, e.target.value)}
                          placeholder={`Atributo #${aIdx+1}`}
                          className="bg-transparent text-slate-900 font-bold text-xs focus:outline-none w-full"
                        />
                        <button
                          type="button"
                          onClick={() => removeAttribute(aIdx)}
                          className="text-slate-400 hover:text-red-600 p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Matriz de Variantes */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900">Variantes ({variants.length})</h4>
                  <button
                    type="button"
                    onClick={addVariant}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-200"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar Variante</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {variants.map((v, vIdx) => (
                    <div key={vIdx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <span className="font-bold text-slate-900">Variante #{vIdx + 1}</span>
                        {variants.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeVariant(vIdx)}
                            className="text-slate-400 hover:text-red-600 p-1 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {attributes.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {attributes.map((attr, aIdx) => (
                            <div key={aIdx}>
                              <label className="block text-[11px] text-red-600 font-bold mb-1">{attr}</label>
                              <input
                                type="text"
                                placeholder={`Ej: ${attr === 'Color' ? 'Rojo' : '50kg'}`}
                                value={v.values?.[aIdx] || ''}
                                onChange={(e) => updateVariantValue(vIdx, aIdx, e.target.value)}
                                className="w-full bg-white text-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 focus:border-red-500 focus:outline-none font-medium"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        <div>
                          <label className="block text-[11px] text-slate-600 font-medium mb-1">Precio Lista ($) *</label>
                          <input
                            type="number"
                            step="0.01"
                            required
                            value={v.price}
                            onChange={(e) => updateVariantField(vIdx, 'price', e.target.value)}
                            className="w-full bg-white text-slate-900 font-mono font-bold px-3.5 py-2 rounded-xl border border-slate-200 focus:border-red-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-600 font-medium mb-1">Precio Oferta ($)</label>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="Opcional"
                            value={v.promotional_price}
                            onChange={(e) => updateVariantField(vIdx, 'promotional_price', e.target.value)}
                            className="w-full bg-white text-emerald-600 font-mono font-bold px-3.5 py-2 rounded-xl border border-slate-200 focus:border-red-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-600 font-medium mb-1">Costo ERP ($)</label>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="Opcional"
                            value={v.cost}
                            onChange={(e) => updateVariantField(vIdx, 'cost', e.target.value)}
                            className="w-full bg-white text-slate-600 font-mono font-medium px-3.5 py-2 rounded-xl border border-slate-200 focus:border-red-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-600 font-medium mb-1">Stock (Unidades)</label>
                          <input
                            type="number"
                            placeholder="Infinito"
                            value={v.stock}
                            onChange={(e) => updateVariantField(vIdx, 'stock', e.target.value)}
                            className="w-full bg-white text-slate-900 font-mono font-bold px-3.5 py-2 rounded-xl border border-slate-200 focus:border-red-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-600 font-medium mb-1">SKU</label>
                          <input
                            type="text"
                            placeholder="Ej: CEM-HOL-50"
                            value={v.sku}
                            onChange={(e) => updateVariantField(vIdx, 'sku', e.target.value)}
                            className="w-full bg-white text-slate-800 font-mono px-3.5 py-2 rounded-xl border border-slate-200 focus:border-red-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-200"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'Guardar Cambios' : 'Crear Producto'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
