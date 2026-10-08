import React, { useState, useEffect } from 'react';
import { Edit3, RefreshCw, Folder, Package } from 'lucide-react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';

const parseMeliDimensions = (dimensionsStr) => {
  if (!dimensionsStr || typeof dimensionsStr !== 'string') {
    return { weight_kg: '', height_cm: '', width_cm: '', length_cm: '' };
  }
  const [dimsPart, weightPart] = dimensionsStr.split(',');
  let height_cm = '';
  let width_cm = '';
  let length_cm = '';
  let weight_kg = '';

  if (dimsPart) {
    const parts = dimsPart.split('x').map(p => p.trim());
    if (parts.length >= 3) {
      height_cm = parts[0] || '';
      width_cm = parts[1] || '';
      length_cm = parts[2] || '';
    }
  }

  if (weightPart) {
    const g = parseFloat(weightPart);
    if (!isNaN(g) && g > 0) {
      weight_kg = (g / 1000).toString();
    }
  }

  return { weight_kg, height_cm, width_cm, length_cm };
};

export default function MeliItemModal({
  isOpen,
  onClose,
  item,
  onSave,
  updating = false
}) {
  const [editForm, setEditForm] = useState({
    sku: '',
    title: '',
    precio_mostrador: '',
    price_ml: '',
    status: 'active',
    category_id: '',
    weight_kg: '',
    height_cm: '',
    width_cm: '',
    length_cm: ''
  });

  useEffect(() => {
    if (item) {
      const parsedDims = parseMeliDimensions(item.dimensions);
      setEditForm({
        sku: item.sku && item.sku !== 'N/A' && item.sku !== 'Sin SKU' ? item.sku : '',
        title: item.title || '',
        precio_mostrador: item.precio_mostrador || '',
        price_ml: item.price || '',
        status: item.status || 'active',
        category_id: item.category_id || 'MLA3530',
        weight_kg: item.weight_kg != null ? String(item.weight_kg) : parsedDims.weight_kg,
        height_cm: item.height_cm != null ? String(item.height_cm) : parsedDims.height_cm,
        width_cm: item.width_cm != null ? String(item.width_cm) : parsedDims.width_cm,
        length_cm: item.length_cm != null ? String(item.length_cm) : parsedDims.length_cm
      });
    }
  }, [item]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!item) return;

    const payload = {
      category_id: editForm.category_id || 'MLA3530',
      listing_type_id: 'gold_special',
      margen_adicional_pct: 0.0
    };

    if (editForm.sku) payload.sku = editForm.sku;
    if (editForm.title) payload.title = editForm.title;
    if (editForm.status) payload.status = editForm.status;
    if (editForm.precio_mostrador) payload.precio_mostrador = parseFloat(editForm.precio_mostrador);
    if (editForm.price_ml) payload.price_ml = parseFloat(editForm.price_ml);

    if (editForm.weight_kg !== '' && !isNaN(parseFloat(editForm.weight_kg))) {
      payload.weight_kg = parseFloat(editForm.weight_kg);
    }
    if (editForm.height_cm !== '' && !isNaN(parseFloat(editForm.height_cm))) {
      payload.height_cm = parseFloat(editForm.height_cm);
    }
    if (editForm.width_cm !== '' && !isNaN(parseFloat(editForm.width_cm))) {
      payload.width_cm = parseFloat(editForm.width_cm);
    }
    if (editForm.length_cm !== '' && !isNaN(parseFloat(editForm.length_cm))) {
      payload.length_cm = parseFloat(editForm.length_cm);
    }

    onSave(item.id, payload);
  };

  const h = parseFloat(editForm.height_cm) || 0;
  const w = parseFloat(editForm.width_cm) || 0;
  const l = parseFloat(editForm.length_cm) || 0;
  const volCm3 = (h > 0 && w > 0 && l > 0) ? Math.round(h * w * l) : 0;
  const volM3 = volCm3 > 0 ? (volCm3 / 1000000).toFixed(4) : null;

  if (!isOpen || !item) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Publicación Mercado Libre"
      subtitle={`ID: ${item.id}`}
      icon={Edit3}
      maxWidth="max-w-xl"
      footer={
        <>
          <Button variant="ghost" size="md" onClick={onClose} disabled={updating}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleSubmit}
            loading={updating}
            icon={RefreshCw}
          >
            Guardar Cambios
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
        {/* Thumbnail & Title Info */}
        <div className="bg-[#faf9f5] dark:bg-[#262624] p-3 rounded-2xl border border-[#e5e3dc] dark:border-[#363633] flex items-center gap-3">
          {item.thumbnail ? (
            <img src={item.thumbnail} alt="" className="w-12 h-12 rounded-xl object-cover border border-[#e5e3dc] dark:border-[#363633] shrink-0" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-[#f4f2eb] dark:bg-[#1c1c1a] border border-[#e5e3dc] dark:border-[#363633] shrink-0" />
          )}
          <div className="min-w-0">
            <div className="font-bold text-[#141413] dark:text-[#faf9f5] truncate tracking-tight">{item.title}</div>
            <div className="text-[10.5px] text-[#73726c] dark:text-[#a3a199] font-mono mt-0.5">ID: {item.id}</div>
          </div>
        </div>

        {/* SKU */}
        <Input
          label="SKU del Vendedor (ERP)"
          placeholder="Ej: SKU-10023"
          value={editForm.sku}
          onChange={(e) => setEditForm({ ...editForm, sku: e.target.value })}
        />

        {/* Título */}
        <Input
          label="Título de la Publicación"
          required
          value={editForm.title}
          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
        />

        {/* Precios */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Precio Mostrador ERP ($)"
            type="number"
            step="0.01"
            placeholder="Base de cálculo"
            value={editForm.precio_mostrador}
            onChange={(e) => setEditForm({ ...editForm, precio_mostrador: e.target.value })}
          />

          <Input
            label="Precio Directo ML ($)"
            type="number"
            step="0.01"
            placeholder="Publicado en ML"
            value={editForm.price_ml}
            onChange={(e) => setEditForm({ ...editForm, price_ml: e.target.value })}
          />
        </div>

        {/* Peso y Dimensiones de Envío */}
        <div className="bg-[#faf9f5] dark:bg-[#262624] p-3.5 rounded-2xl border border-[#e5e3dc] dark:border-[#363633] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-[#d97706] dark:text-[#f59e0b]" />
              <span className="font-bold text-[#141413] dark:text-[#faf9f5]">Peso y Dimensiones de Envío</span>
            </div>
            {volCm3 > 0 && (
              <span className="text-[10.5px] font-mono font-medium px-2 py-0.5 rounded-md bg-[#e5e3dc]/50 dark:bg-[#363633]/50 text-[#73726c] dark:text-[#a3a199]">
                {volCm3.toLocaleString()} cm³ ({volM3} m³)
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <Input
              label="Peso (kg)"
              type="number"
              step="0.001"
              min="0"
              placeholder="0.000"
              value={editForm.weight_kg}
              onChange={(e) => setEditForm({ ...editForm, weight_kg: e.target.value })}
            />
            <Input
              label="Alto (cm)"
              type="number"
              step="0.1"
              min="0"
              placeholder="0.0"
              value={editForm.height_cm}
              onChange={(e) => setEditForm({ ...editForm, height_cm: e.target.value })}
            />
            <Input
              label="Ancho (cm)"
              type="number"
              step="0.1"
              min="0"
              placeholder="0.0"
              value={editForm.width_cm}
              onChange={(e) => setEditForm({ ...editForm, width_cm: e.target.value })}
            />
            <Input
              label="Largo (cm)"
              type="number"
              step="0.1"
              min="0"
              placeholder="0.0"
              value={editForm.length_cm}
              onChange={(e) => setEditForm({ ...editForm, length_cm: e.target.value })}
            />
          </div>
          <p className="text-[10px] text-[#73726c] dark:text-[#a3a199] leading-tight">
            Requiere las 4 medidas para impactar en Mercado Libre Envíos. Si alguna falta, se conservan las existentes.
          </p>
        </div>

        {/* Estado y Categoría */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Estado de Publicación"
            value={editForm.status}
            onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
            options={[
              { value: 'active', label: 'Activa' },
              { value: 'paused', label: 'Pausada' }
            ]}
          />

          <div className="flex flex-col gap-1 w-full text-left">
            <label className="text-xs font-bold text-[#141413] dark:text-[#faf9f5] tracking-tight">
              Categoría MeLi
            </label>
            <div className="bg-[#faf9f5] dark:bg-[#262624] border border-[#e5e3dc] dark:border-[#363633] rounded-xl px-3 py-2.5 text-xs font-medium text-[#73726c] dark:text-[#a3a199] truncate flex items-center gap-1.5" title={item.category_name || editForm.category_id}>
              <Folder className="w-3.5 h-3.5 text-[#9c998f] dark:text-[#73726c] shrink-0" />
              <span className="truncate">{item.category_name || editForm.category_id}</span>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}
