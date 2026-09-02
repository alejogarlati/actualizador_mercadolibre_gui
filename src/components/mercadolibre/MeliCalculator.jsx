import React, { useState } from 'react';
import { Calculator, Sparkles, CheckCircle2, DollarSign, Truck, Percent, ShieldCheck } from 'lucide-react';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { simulateAdvancedPrice } from '../../services/api';

export default function MeliCalculator({ onAddToast }) {
  const [calcForm, setCalcForm] = useState({
    precio_mostrador: 10000,
    category_id: 'MLA3530',
    listing_type_id: 'gold_special',
    margen_pct: 0.0,
    tax_rate_pct: 0.65,
    shipping_cost_override: '',
    reputation_discount_pct: 50.0,
    has_free_shipping: true
  });

  const [calcResult, setCalcResult] = useState(null);
  const [calcLoading, setCalcLoading] = useState(false);

  const handleCalculate = async (e) => {
    e.preventDefault();
    setCalcLoading(true);
    try {
      const payload = {
        precio_mostrador: parseFloat(calcForm.precio_mostrador) || 0,
        category_id: calcForm.category_id || 'MLA3530',
        listing_type_id: calcForm.listing_type_id || 'gold_special',
        margen_pct: parseFloat(calcForm.margen_pct) || 0.0,
        tax_rate_pct: parseFloat(calcForm.tax_rate_pct) || 0.65,
        reputation_discount_pct: parseFloat(calcForm.reputation_discount_pct) || 50.0,
        has_free_shipping: Boolean(calcForm.has_free_shipping),
        shipping_cost_override: calcForm.shipping_cost_override ? parseFloat(calcForm.shipping_cost_override) : null
      };
      const res = await simulateAdvancedPrice(payload);
      setCalcResult(res);
      if (onAddToast) {
        onAddToast('info', 'Simulación Completada', `Precio publicado sugerido: $${res.precio_publicado_sugerido?.toLocaleString()}`);
      }
    } catch (err) {
      if (onAddToast) {
        onAddToast('error', 'Error de Cálculo', err.message);
      }
    } finally {
      setCalcLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Formulario de Parámetros */}
      <Card
        title="Parámetros de Simulación"
        subtitle="Algoritmo Financiero v0.2.0 • Mercado Libre"
        icon={Calculator}
        className="lg:col-span-6"
      >
        <form onSubmit={handleCalculate} className="flex flex-col gap-4 text-xs">
          {/* Precio Base y Margen */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Precio Mostrador ERP ($)"
              type="number"
              step="0.01"
              required
              value={calcForm.precio_mostrador}
              onChange={(e) => setCalcForm({ ...calcForm, precio_mostrador: e.target.value })}
            />

            <Input
              label="Margen Neto Deseado (%)"
              type="number"
              step="0.1"
              placeholder="0.0%"
              value={calcForm.margen_pct}
              onChange={(e) => setCalcForm({ ...calcForm, margen_pct: e.target.value })}
            />
          </div>

          {/* Tipo de Publicación & Categoría */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Tipo de Publicación"
              value={calcForm.listing_type_id}
              onChange={(e) => setCalcForm({ ...calcForm, listing_type_id: e.target.value })}
              options={[
                { value: 'gold_special', label: 'Clásica (gold_special)' },
                { value: 'gold_pro', label: 'Premium (gold_pro)' }
              ]}
            />

            <Input
              label="Categoría MeLi (ID)"
              placeholder="Ej: MLA3530"
              value={calcForm.category_id}
              onChange={(e) => setCalcForm({ ...calcForm, category_id: e.target.value })}
            />
          </div>

          {/* Mercado Envíos */}
          <div className="p-4 bg-[#faf9f5] dark:bg-[#262624] border border-[#e5e3dc] dark:border-[#363633] rounded-2xl flex flex-col gap-3">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-[#141413] dark:text-[#faf9f5]">
              <input 
                type="checkbox"
                checked={calcForm.has_free_shipping}
                onChange={(e) => setCalcForm({ ...calcForm, has_free_shipping: e.target.checked })}
                className="w-4 h-4 rounded text-[#141413] dark:text-[#faf9f5] focus:ring-0 cursor-pointer"
              />
              <span>Incluye Envío Gratis (Mercado Envíos)</span>
            </label>

            {calcForm.has_free_shipping && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#ece9df] dark:border-[#363633]">
                <Input
                  label="Bonificación Reputación (%)"
                  type="number"
                  step="5"
                  value={calcForm.reputation_discount_pct}
                  onChange={(e) => setCalcForm({ ...calcForm, reputation_discount_pct: e.target.value })}
                />

                <Input
                  label="Tarifa Envío Manual ($) [Opcional]"
                  type="number"
                  step="50"
                  placeholder="Auto (Según peso)"
                  value={calcForm.shipping_cost_override}
                  onChange={(e) => setCalcForm({ ...calcForm, shipping_cost_override: e.target.value })}
                />
              </div>
            )}
          </div>

          {/* Impuestos / IIBB */}
          <Input
            label="Alícuota Impositiva Estimada / IIBB (%)"
            helperText="Porcentaje promedio de retenciones impositivas (0.65%)."
            type="number"
            step="0.05"
            value={calcForm.tax_rate_pct}
            onChange={(e) => setCalcForm({ ...calcForm, tax_rate_pct: e.target.value })}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            icon={Sparkles}
            loading={calcLoading}
            className="mt-2"
          >
            Calcular Precio Óptimo
          </Button>
        </form>
      </Card>

      {/* Radiografía Financiera */}
      <Card
        title="Radiografía Financiera Sugerida"
        subtitle="Desglose analítico de comisiones, fletes e impuestos"
        icon={DollarSign}
        badge={
          calcResult && (
            <Badge variant="success" size="sm">
              +{calcResult.margen_neto_real_pct}% Margen
            </Badge>
          )
        }
        className="lg:col-span-6"
      >
        {calcResult ? (
          <div className="flex flex-col gap-4 text-xs">
            {/* Resumen Principal */}
            <div className="p-4 bg-[#faf9f5] dark:bg-[#262624] border border-[#e5e3dc] dark:border-[#363633] rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10.5px] font-bold text-[#73726c] dark:text-[#a3a199] uppercase tracking-wider block">
                  Precio Publicado Sugerido
                </span>
                <span className="text-2xl font-black font-mono text-[#141413] dark:text-[#faf9f5]">
                  ${calcResult.precio_publicado_sugerido?.toLocaleString()}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10.5px] font-bold text-[#15803d] dark:text-[#4ade80] uppercase tracking-wider block">
                  Neto en Mano
                </span>
                <span className="text-2xl font-black font-mono text-[#15803d] dark:text-[#4ade80]">
                  ${calcResult.neto_real_obtenido?.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Desglose de Deducciones */}
            <div className="border border-[#e5e3dc] dark:border-[#2d2d2a] rounded-2xl divide-y divide-[#ece9df] dark:divide-[#2d2d2a] text-xs">
              <div className="p-3 flex justify-between items-center">
                <span className="text-[#73726c] dark:text-[#a3a199]">Costo Base / Mostrador ERP:</span>
                <span className="font-bold font-mono text-[#141413] dark:text-[#faf9f5]">${calcResult.costo_efectivo?.toLocaleString()}</span>
              </div>
              <div className="p-3 flex justify-between items-center">
                <span className="text-[#73726c] dark:text-[#a3a199]">Comisión Mercado Libre ({calcResult.comision_porcentaje}% + fija):</span>
                <span className="font-bold font-mono text-[#b91c1c] dark:text-[#f87171]">-${calcResult.comision_total_monto?.toLocaleString()}</span>
              </div>
              <div className="p-3 flex justify-between items-center">
                <span className="text-[#73726c] dark:text-[#a3a199]">Costo Envío Vendedor (Bonif. {calcResult.bonificacion_envio_pct}%):</span>
                <span className="font-bold font-mono text-[#b91c1c] dark:text-[#f87171]">-${calcResult.costo_envio_final?.toLocaleString()}</span>
              </div>
              <div className="p-3 flex justify-between items-center">
                <span className="text-[#73726c] dark:text-[#a3a199]">Impuestos / Percepciones ({calcResult.alicuota_impuestos_pct}%):</span>
                <span className="font-bold font-mono text-[#b91c1c] dark:text-[#f87171]">-${calcResult.impuestos_monto?.toLocaleString()}</span>
              </div>
            </div>

            <div className="p-3.5 bg-[#f0fdf4] dark:bg-[#14532d]/25 border border-[#bbf7d0] dark:border-[#15803d]/40 rounded-2xl text-[11px] text-[#14532d] dark:text-[#86efac] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#15803d] dark:text-[#4ade80] shrink-0" />
              <span>El precio calculado absorbe las comisiones y gastos garantizando el neto requerido.</span>
            </div>
          </div>
        ) : (
          <div className="py-16 text-center text-[#73726c] dark:text-[#a3a199] text-xs flex flex-col items-center gap-3">
            <Calculator className="w-10 h-10 text-[#9c998f] dark:text-[#73726c]" />
            <p className="max-w-xs">Configura los parámetros y presiona "Calcular Precio Óptimo" para ver el desglose exacto.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
