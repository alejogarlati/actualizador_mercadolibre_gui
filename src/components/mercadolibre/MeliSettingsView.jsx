import React, { useState } from 'react';
import { Settings as SettingsIcon, Save } from 'lucide-react';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Tabs from '../ui/Tabs';
import Button from '../ui/Button';

export default function MeliSettingsView({
  settingsForm = {},
  setSettingsForm,
  onSaveSettings,
  saving = false
}) {
  const [activeSubTab, setActiveSubTab] = useState('general');

  const form = settingsForm || {};

  const tabs = [
    { id: 'general', label: 'Parámetros Generales' },
    { id: 'exclusions', label: 'Exclusiones (Keywords & Categorías)' },
    { id: 'packs', label: 'Multiplicadores de Pack' }
  ];

  return (
    <Card
      title="Configuración Integral del Sistema"
      subtitle="Reglas comerciales, exclusiones y multiplicadores de Mercado Libre"
      icon={SettingsIcon}
      className="max-w-2xl"
    >
      <div className="flex flex-col gap-5">
        {/* Sub-Tabs */}
        <Tabs
          tabs={tabs}
          activeTab={activeSubTab}
          onChange={setActiveSubTab}
          variant="pills"
        />

        {/* Formulario */}
        <form onSubmit={onSaveSettings} className="flex flex-col gap-4 text-xs">
          {activeSubTab === 'general' && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Descuento General ERP Mostrador (%)"
                  helperText="Descuento base de mostrador en el ERP (30%)."
                  type="number"
                  step="0.5"
                  required
                  value={form.general_discount_pct ?? 30.0}
                  onChange={(e) => setSettingsForm({ ...form, general_discount_pct: parseFloat(e.target.value) || 0 })}
                />

                <Input
                  label="Bonificación Reputación ME2 (%)"
                  helperText="Descuento en fletes asumido por Mercado Libre (50%)."
                  type="number"
                  step="5"
                  required
                  value={form.shipping_discount_pct ?? 50.0}
                  onChange={(e) => setSettingsForm({ ...form, shipping_discount_pct: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Alícuota Impositiva Base / IIBB (%)"
                  type="number"
                  step="0.05"
                  required
                  value={form.default_tax_rate_pct ?? 0.65}
                  onChange={(e) => setSettingsForm({ ...form, default_tax_rate_pct: parseFloat(e.target.value) || 0 })}
                />

                <Input
                  label="Tolerancia de Auditoría por Defecto (%)"
                  type="number"
                  step="1"
                  required
                  value={form.tolerance_pct ?? 5.0}
                  onChange={(e) => setSettingsForm({ ...form, tolerance_pct: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
          )}

          {activeSubTab === 'exclusions' && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-150">
              <Input
                label="Palabras Clave Excluidas (Separadas por coma)"
                helperText="Los productos que contengan estas palabras revertirán el descuento de mostrador."
                placeholder="mueble, aluminio, chapa"
                value={form.excluded_keywords?.join(', ') || ''}
                onChange={(e) => setSettingsForm({
                  ...form,
                  excluded_keywords: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                })}
              />

              <div className="flex flex-col gap-1 w-full text-left">
                <label className="text-xs font-bold text-[#141413] dark:text-[#faf9f5] tracking-tight">
                  IDs de Categorías Excluidas (Separadas por coma)
                </label>
                <textarea
                  rows="3"
                  placeholder="MLA30088, MLA7141, MLA30069"
                  value={form.excluded_categories?.join(', ') || ''}
                  onChange={(e) => setSettingsForm({
                    ...form,
                    excluded_categories: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  className="w-full bg-[#faf9f5] dark:bg-[#262624] focus:bg-white dark:focus:bg-[#1c1c1a] text-xs text-[#141413] dark:text-[#faf9f5] p-3 rounded-xl border border-[#e5e3dc] dark:border-[#363633] focus:border-[#141413] dark:focus:border-[#faf9f5] focus:ring-1 focus:ring-[#141413] dark:focus:ring-[#faf9f5] focus:outline-none font-mono"
                />
              </div>
            </div>
          )}

          {activeSubTab === 'packs' && (
            <div className="flex flex-col gap-3 animate-in fade-in duration-150">
              <p className="text-xs text-[#73726c] dark:text-[#a3a199] leading-relaxed">
                Define multiplicadores fijos de unidades por pack para SKUs o IDs específicos donde una publicación contenga combos de productos.
              </p>
              <div className="p-4 bg-[#faf9f5] dark:bg-[#262624] border border-[#e5e3dc] dark:border-[#363633] rounded-2xl text-xs text-[#141413] dark:text-[#faf9f5] font-mono overflow-x-auto">
                <pre>{JSON.stringify(form.pack_multipliers || {}, null, 2)}</pre>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#ece9df] dark:border-[#2d2d2a] mt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={Save}
              loading={saving}
            >
              Guardar Configuración
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
}
