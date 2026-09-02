import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Layers, 
  Save, 
  X 
} from 'lucide-react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Tabs from '../ui/Tabs';
import Button from '../ui/Button';

export default function TiendaNubeProductModal({ 
  isOpen, 
  onClose, 
  onSave, 
  productData = null, 
  categories = [] 
}) {
  const isEditing = Boolean(productData?.id);
  const [activeTab, setActiveTab] = useState('general');

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

  const tabs = [
    { id: 'general', label: 'Datos Generales & Precios' },
    { id: 'variants', label: 'Matriz de Variantes', count: variants.length }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Editar Producto #${productData.id}` : 'Crear Nuevo Producto en Tiendanube'}
      subtitle="Configura catálogo, variantes multilingües y stock integrado"
      icon={Layers}
      maxWidth="max-w-3xl"
      footer={
        <>
          <Button variant="ghost" size="md" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={Save}
            onClick={handleSubmit}
          >
            {isEditing ? 'Guardar Cambios' : 'Crear Producto'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        {/* Tab Selector */}
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="underline"
        />

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
          {activeTab === 'general' ? (
            <div className="flex flex-col gap-4">
              {/* Nombre */}
              <Input
                label="Nombre del Producto"
                required
                placeholder="Ej: Cemento Portland Holcim 50kg"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              {/* Marca & Categoría */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Marca"
                  placeholder="Ej: Holcim, Barbieri, Weber"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                />

                <Select
                  label="Categoría Principal"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  options={[
                    { value: '', label: 'Sin categoría principal' },
                    ...categories.map(c => ({ value: c.id, label: c.name }))
                  ]}
                />
              </div>

              {/* Descripción */}
              <div className="flex flex-col gap-1 w-full text-left">
                <label className="text-xs font-bold text-[#141413] tracking-tight">
                  Descripción / Ficha Técnica
                </label>
                <textarea
                  rows="3"
                  placeholder="Descripción del producto o características..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#faf9f5] focus:bg-white text-xs text-[#141413] p-3 rounded-xl border border-[#e5e3dc] focus:border-[#141413] focus:ring-1 focus:ring-[#141413] focus:outline-none font-medium"
                />
              </div>

              {/* Tags */}
              <Input
                label="Etiquetas (Separadas por comas)"
                placeholder="construccion, cemento, albañileria"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />

              {/* Switches */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <label className="flex items-center gap-3 p-3.5 bg-[#faf9f5] rounded-xl border border-[#e5e3dc] cursor-pointer hover:bg-[#f4f2eb] transition-colors">
                  <input
                    type="checkbox"
                    checked={freeShipping}
                    onChange={(e) => setFreeShipping(e.target.checked)}
                    className="w-4 h-4 rounded text-[#141413] focus:ring-0"
                  />
                  <div>
                    <span className="font-bold text-[#141413] block">Envío Gratis</span>
                    <span className="text-[10.5px] text-[#73726c]">Flete bonificado</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3.5 bg-[#faf9f5] rounded-xl border border-[#e5e3dc] cursor-pointer hover:bg-[#f4f2eb] transition-colors">
                  <input
                    type="checkbox"
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                    className="w-4 h-4 rounded text-[#141413] focus:ring-0"
                  />
                  <div>
                    <span className="font-bold text-[#141413] block">Publicado / Activo</span>
                    <span className="text-[10.5px] text-[#73726c]">Visible en la tienda online</span>
                  </div>
                </label>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {/* Atributos */}
              <div className="p-4 bg-[#faf9f5] rounded-2xl border border-[#e5e3dc] flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-[#141413]">Atributos del Producto</h4>
                    <p className="text-[10.5px] text-[#73726c]">Máximo 3 atributos (ej. Color, Medida, Espesor).</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addAttribute}
                    disabled={attributes.length >= 3}
                    icon={Plus}
                  >
                    Agregar ({attributes.length}/3)
                  </Button>
                </div>

                {attributes.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    {attributes.map((attr, aIdx) => (
                      <div key={aIdx} className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-[#e5e3dc] shadow-xs">
                        <input
                          type="text"
                          value={attr}
                          onChange={(e) => updateAttributeName(aIdx, e.target.value)}
                          placeholder={`Atributo #${aIdx+1}`}
                          className="bg-transparent text-[#141413] font-bold text-xs focus:outline-none w-full"
                        />
                        <button
                          type="button"
                          onClick={() => removeAttribute(aIdx)}
                          className="text-[#73726c] hover:text-[#b91c1c] p-0.5 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Matriz de Variantes */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[#141413]">Variantes ({variants.length})</h4>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={addVariant}
                    icon={Plus}
                  >
                    Agregar Variante
                  </Button>
                </div>

                <div className="flex flex-col gap-3">
                  {variants.map((v, vIdx) => (
                    <div key={vIdx} className="p-4 bg-[#faf9f5] rounded-2xl border border-[#e5e3dc] flex flex-col gap-3">
                      <div className="flex items-center justify-between pb-2 border-b border-[#ece9df]">
                        <span className="font-bold text-[#141413]">Variante #{vIdx + 1}</span>
                        {variants.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeVariant(vIdx)}
                            className="text-[#73726c] hover:text-[#b91c1c] p-1 rounded cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {attributes.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {attributes.map((attr, aIdx) => (
                            <Input
                              key={aIdx}
                              label={attr}
                              placeholder={`Ej: ${attr === 'Color' ? 'Rojo' : '50kg'}`}
                              value={v.values?.[aIdx] || ''}
                              onChange={(e) => updateVariantValue(vIdx, aIdx, e.target.value)}
                            />
                          ))}
                        </div>
                      )}

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        <Input
                          label="Precio Lista ($) *"
                          type="number"
                          step="0.01"
                          required
                          value={v.price}
                          onChange={(e) => updateVariantField(vIdx, 'price', e.target.value)}
                        />

                        <Input
                          label="Precio Oferta ($)"
                          type="number"
                          step="0.01"
                          placeholder="Opcional"
                          value={v.promotional_price}
                          onChange={(e) => updateVariantField(vIdx, 'promotional_price', e.target.value)}
                        />

                        <Input
                          label="Costo ERP ($)"
                          type="number"
                          step="0.01"
                          placeholder="Opcional"
                          value={v.cost}
                          onChange={(e) => updateVariantField(vIdx, 'cost', e.target.value)}
                        />

                        <Input
                          label="Stock"
                          type="number"
                          placeholder="Infinito"
                          value={v.stock}
                          onChange={(e) => updateVariantField(vIdx, 'stock', e.target.value)}
                        />

                        <Input
                          label="SKU"
                          placeholder="Ej: CEM-50"
                          value={v.sku}
                          onChange={(e) => updateVariantField(vIdx, 'sku', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </Modal>
  );
}
