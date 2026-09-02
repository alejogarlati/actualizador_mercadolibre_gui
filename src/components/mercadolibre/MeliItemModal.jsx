import React, { useState, useEffect } from 'react';
import { Edit3, RefreshCw, Folder } from 'lucide-react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';

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
    category_id: ''
  });

  useEffect(() => {
    if (item) {
      setEditForm({
        sku: item.sku && item.sku !== 'N/A' && item.sku !== 'Sin SKU' ? item.sku : '',
        title: item.title || '',
        precio_mostrador: item.precio_mostrador || '',
        price_ml: item.price || '',
        status: item.status || 'active',
        category_id: item.category_id || 'MLA3530'
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

    onSave(item.id, payload);
  };

  if (!isOpen || !item) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Publicación Mercado Libre"
      subtitle={`ID: ${item.id}`}
      icon={Edit3}
      maxWidth="max-w-lg"
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
