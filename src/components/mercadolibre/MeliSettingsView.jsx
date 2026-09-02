import React, { useState } from 'react';
import { Settings as SettingsIcon, Save } from 'lucide-react';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Tabs from '../ui/Tabs';
import Button from '../ui/Button';

export default function MeliSettingsView({
  settingsForm,
  setSettingsForm,
  onSaveSettings,
  saving = false
}) {
  const [activeSubTab, setActiveSubTab] = useState('general');

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
                  value={settingsForm.general_discount_pct}
                  onChange={(e) => setSettingsForm({ ...settingsForm, general_discount_pct: parseFloat(e.target.value) || 0 })}
                />

                <Input
                  label="Bonificación Reputación ME2 (%)"
                  helperText="Descuento en fletes asumido por Mercado Libre (50%)."
                  type="number"
                  step="5"
                  required
                  value={settingsForm.shipping_discount_pct}
                  onChange={(e) => setSettingsForm({ ...settingsForm, shipping_discount_pct: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Alícuota Impositiva Base / IIBB (%)"
                  type="number"
                  step="0.05"
                  required
                  value={settingsForm.default_tax_rate_pct}
                  onChange={(e) => setSettingsForm({ ...settingsForm, default_tax_rate_pct: parseFloat(e.target.value) || 0 })}
                />

                <Input
                  label="Tolerancia de Auditoría por Defecto (%)"
                  type="number"
                  step="1"
                  required
                  value={settingsForm.tolerance_pct}
                  onChange={(e) => setSettingsForm({ ...settingsForm, tolerance_pct: parseFloat(e.target.value) || 0 })}
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
                value={settingsForm.excluded_keywords?.join(', ')}
                onChange={(e) => setSettingsForm({
                  ...settingsForm,
                  excluded_keywords: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                })}
              />

              <div className="flex flex-col gap-1 w-full text-left">
                <label className="text-xs font-bold text-[#141413] tracking-tight">
                  IDs de Categorías Excluidas (Separadas por coma)
                </label>
                <textarea
                  rows="3"
                  placeholder="MLA30088, MLA7141, MLA30069"
                  value={settingsForm.excluded_categories?.join(', ')}
                  onChange={(e) => setSettingsForm({
                    ...settingsForm,
                    excluded_categories: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  className="w-full bg-[#faf9f5] focus:bg-white text-xs text-[#141413] p-3 rounded-xl border border-[#e5e3dc] focus:border-[#141413] focus:ring-1 focus:ring-[#141413] focus:outline-none font-mono"
                />
              </div>
            </div>
          )}

          {activeSubTab === 'packs' && (
            <div className="flex flex-col gap-3 animate-in fade-in duration-150">
              <p className="text-xs text-[#73726c] leading-relaxed">
                Define multiplicadores fijos de unidades por pack para SKUs o IDs específicos donde una publicación contenga combos de productos.
              </p>
              <div className="p-4 bg-[#faf9f5] border border-[#e5e3dc] rounded-2xl text-xs text-[#141413] font-mono overflow-x-auto">
                <pre>{JSON.stringify(settingsForm.pack_multipliers || {}, null, 2)}</pre>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#ece9df] mt-2">
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
