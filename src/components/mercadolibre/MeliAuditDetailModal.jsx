import React from 'react';
import { 
  ShieldCheck, 
  DollarSign, 
  Truck, 
  ExternalLink 
} from 'lucide-react';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

export default function MeliAuditDetailModal({
  isOpen,
  onClose,
  item
}) {
  if (!isOpen || !item) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={item.title}
      subtitle={`SKU: ${item.sku || 'N/A'} • ID: ${item.item_id}`}
      icon={ShieldCheck}
      maxWidth="max-w-xl"
      footer={
        <>
          {item.permalink && (
            <a 
              href={item.permalink} 
              target="_blank" 
              rel="noreferrer"
              className="mr-auto inline-flex items-center gap-1.5 text-xs text-[#141413] dark:text-[#faf9f5] hover:underline font-bold"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Ver en Mercado Libre</span>
            </a>
          )}
          <Button variant="primary" size="md" onClick={onClose}>
            Cerrar Detalle
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5 text-xs">
        {/* Dictamen Badge */}
        <div className="flex items-center gap-2">
          <Badge
            variant={
              item.status_evaluacion === 'OK' ? 'success' :
              item.status_evaluacion === 'BAJO' ? 'error' :
              item.status_evaluacion === 'ALTO' ? 'neutral' : 'outline'
            }
            dot
            size="md"
          >
            {item.status_evaluacion === 'OK' ? 'En Rango Rentable' :
             item.status_evaluacion === 'BAJO' ? 'Margen por Debajo del ERP' :
             item.status_evaluacion === 'ALTO' ? 'Margen por Encima del ERP' : 'Sin Coincidencia ERP'}
          </Badge>
        </div>

        {/* Resumen de Impacto en Mano */}
        <div className="grid grid-cols-2 gap-3 bg-[#faf9f5] dark:bg-[#262624] border border-[#e5e3dc] dark:border-[#363633] rounded-2xl p-4">
          <div>
            <span className="text-[10.5px] font-bold text-[#73726c] dark:text-[#a3a199] uppercase tracking-wider block">
              Precio Publicado en ML
            </span>
            <span className="text-xl font-black font-mono text-[#141413] dark:text-[#faf9f5]">
              ${item.price_ml?.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10.5px] font-bold text-[#15803d] dark:text-[#4ade80] uppercase tracking-wider block">
              Neto Real Recibido
            </span>
            <span className="text-xl font-black font-mono text-[#15803d] dark:text-[#4ade80]">
              ${item.neto_a_recibir?.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Tabla de Deducciones y Costos */}
        <div className="flex flex-col gap-2">
          <h4 className="text-[11px] font-bold text-[#73726c] dark:text-[#a3a199] uppercase tracking-wider">
            Desglose de Deducciones y Cargos de Mercado Libre
          </h4>
          <div className="border border-[#e5e3dc] dark:border-[#363633] rounded-2xl divide-y divide-[#ece9df] dark:divide-[#2d2d2a] overflow-hidden">
            {/* Comisión */}
            <div className="p-3.5 flex items-center justify-between hover:bg-[#faf9f5]/50 dark:hover:bg-[#262624]/50 transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-[#f4f2eb] dark:bg-[#262624] text-[#141413] dark:text-[#faf9f5] rounded-lg border border-[#e5e3dc] dark:border-[#363633]">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-[#141413] dark:text-[#faf9f5] block">
                    Comisión de Mercado Libre ({item.comision_porcentaje}%)
                  </span>
                  <span className="text-[10px] text-[#73726c] dark:text-[#a3a199]">Porcentaje por categoría oficial</span>
                </div>
              </div>
              <span className="font-bold font-mono text-[#b91c1c] dark:text-[#f87171] text-sm">
                -${item.comision_monto?.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Envío */}
            <div className="p-3.5 flex items-center justify-between hover:bg-[#faf9f5]/50 dark:hover:bg-[#262624]/50 transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-[#f4f2eb] dark:bg-[#262624] text-[#141413] dark:text-[#faf9f5] rounded-lg border border-[#e5e3dc] dark:border-[#363633]">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-[#141413] dark:text-[#faf9f5] block">
                    Costo de Envío Gratis (Vendedor)
                  </span>
                  <span className="text-[10px] text-[#73726c] dark:text-[#a3a199]">Con bonificación de reputación aplicada</span>
                </div>
              </div>
              <span className="font-bold font-mono text-[#b91c1c] dark:text-[#f87171] text-sm">
                -${item.costo_envio?.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Impuestos */}
            <div className="p-3.5 flex items-center justify-between hover:bg-[#faf9f5]/50 dark:hover:bg-[#262624]/50 transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-[#f4f2eb] dark:bg-[#262624] text-[#141413] dark:text-[#faf9f5] rounded-lg border border-[#e5e3dc] dark:border-[#363633]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-[#141413] dark:text-[#faf9f5] block">
                    Impuestos y Retenciones (0.65%)
                  </span>
                  <span className="text-[10px] text-[#73726c] dark:text-[#a3a199]">IIBB / Percepciones estimadas</span>
                </div>
              </div>
              <span className="font-bold font-mono text-[#b91c1c] dark:text-[#f87171] text-sm">
                -${((item.price_ml || 0) * 0.0065).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {/* Cargo Fijo */}
            {item.cargo_fijo > 0 && (
              <div className="p-3.5 flex items-center justify-between hover:bg-[#faf9f5]/50 dark:hover:bg-[#262624]/50 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-[#f4f2eb] dark:bg-[#262624] text-[#141413] dark:text-[#faf9f5] rounded-lg border border-[#e5e3dc] dark:border-[#363633]">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-[#141413] dark:text-[#faf9f5] block">Cargo Fijo por Ítem</span>
                    <span className="text-[10px] text-[#73726c] dark:text-[#a3a199]">Para publicaciones de bajo monto</span>
                  </div>
                </div>
                <span className="font-bold font-mono text-[#b91c1c] dark:text-[#f87171] text-sm">
                  -${item.cargo_fijo?.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Comparativa contra ERP */}
        <div className="bg-[#faf9f5] dark:bg-[#262624] border border-[#e5e3dc] dark:border-[#363633] rounded-2xl p-4 flex flex-col gap-2.5">
          <span className="text-[11px] font-bold text-[#141413] dark:text-[#faf9f5] uppercase tracking-wider">
            Comparativa de Rentabilidad ERP
          </span>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#73726c] dark:text-[#a3a199] font-medium">Precio Mostrador ERP Esperado:</span>
            <span className="font-bold font-mono text-[#141413] dark:text-[#faf9f5]">
              ${item.precio_mostrador_erp ? item.precio_mostrador_erp.toLocaleString('es-AR', { minimumFractionDigits: 2 }) : 'N/A'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs pt-2 border-t border-[#ece9df] dark:border-[#363633]">
            <span className="text-[#73726c] dark:text-[#a3a199] font-medium">Diferencia Neta en Mano:</span>
            <div className="flex items-center gap-2 font-mono">
              <span className={`font-black text-sm ${
                item.diferencia_vs_mostrador >= 0 ? 'text-[#15803d] dark:text-[#4ade80]' : 'text-[#b91c1c] dark:text-[#f87171]'
              }`}>
                {item.diferencia_vs_mostrador >= 0 ? '+' : ''}${item.diferencia_vs_mostrador?.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </span>
              <Badge variant={item.diferencia_pct >= 0 ? 'success' : 'error'} size="sm">
                {item.diferencia_pct >= 0 ? '+' : ''}{item.diferencia_pct}%
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
