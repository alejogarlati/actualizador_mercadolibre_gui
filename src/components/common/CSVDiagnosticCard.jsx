import React from 'react';
import { 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  RefreshCw, 
  Box, 
  Tag, 
  Package 
} from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { downloadCSVTemplate } from '../../services/api';

export default function CSVDiagnosticCard({ preview, onRefresh, loading = false }) {
  const hasRows = preview && preview.total_rows > 0;
  const allMeasured = hasRows && preview.missing_dimensions === 0;

  return (
    <Card
      title="Diagnóstico de Archivo ERP (Cubicaje & Precios)"
      subtitle={hasRows 
        ? `Archivo activo: ${preview.filename || 'erp_precios.csv'} • Delimitador: [ ${preview.delimiter || ';'} ]` 
        : 'Sube un archivo para auditar precios, stock y cubicaje'}
      icon={FileSpreadsheet}
      badge={
        hasRows ? (
          <Badge variant={allMeasured ? 'success' : preview.with_dimensions > 0 ? 'warning' : 'neutral'} size="sm" dot>
            {allMeasured ? '100% Cubicados' : `${preview.with_dimensions} de ${preview.total_rows} con medidas`}
          </Badge>
        ) : (
          <Badge variant="outline" size="sm">Sin archivo</Badge>
        )
      }
    >
      <div className="flex flex-col gap-4 text-xs">
        {hasRows ? (
          <>
            {/* Grid de KPIs de Diagnóstico */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Total Filas */}
              <div className="p-3 bg-[#faf9f5] dark:bg-[#262624] rounded-xl border border-[#e5e3dc] dark:border-[#363633]">
                <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-[#73726c] dark:text-[#a3a199] truncate">
                  <Tag className="w-3 h-3 text-[#141413] dark:text-[#faf9f5]" />
                  <span>Total Filas</span>
                </div>
                <div className="text-base font-black font-mono text-[#141413] dark:text-[#faf9f5] mt-1">
                  {preview.total_rows}
                </div>
              </div>

              {/* Con Precio */}
              <div className="p-3 bg-[#f0fdf4] dark:bg-[#14532d]/20 rounded-xl border border-[#bbf7d0] dark:border-[#15803d]/40">
                <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-[#14532d] dark:text-[#86efac] truncate">
                  <CheckCircle2 className="w-3 h-3 text-[#15803d] dark:text-[#4ade80]" />
                  <span>Con Precio</span>
                </div>
                <div className="text-base font-black font-mono text-[#15803d] dark:text-[#4ade80] mt-1">
                  {preview.with_price}
                </div>
              </div>

              {/* Con Stock */}
              <div className="p-3 bg-[#eff6ff] dark:bg-[#1e3a8a]/20 rounded-xl border border-[#bfdbfe] dark:border-[#1d4ed8]/40">
                <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-[#1e3a8a] dark:text-[#93c5fd] truncate">
                  <Package className="w-3 h-3 text-[#1d4ed8] dark:text-[#60a5fa]" />
                  <span>Con Stock</span>
                </div>
                <div className="text-base font-black font-mono text-[#1d4ed8] dark:text-[#60a5fa] mt-1">
                  {preview.with_stock}
                </div>
              </div>

              {/* Con Medidas Completas (4 > 0) */}
              <div className="p-3 bg-[#fefce8] dark:bg-[#713f12]/20 rounded-xl border border-[#fef08a] dark:border-[#ca8a04]/40">
                <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-[#854d0e] dark:text-[#fde047] truncate">
                  <Box className="w-3 h-3 text-[#ca8a04] dark:text-[#facc15]" />
                  <span>Cubicaje Completo</span>
                </div>
                <div className="text-base font-black font-mono text-[#ca8a04] dark:text-[#facc15] mt-1">
                  {preview.with_dimensions}
                </div>
              </div>
            </div>

            {/* Banner de Aviso de Política No Destructiva */}
            {preview.missing_dimensions > 0 ? (
              <div className="p-3 bg-[#fffbeb] dark:bg-[#78350f]/20 rounded-xl border border-[#fde68a] dark:border-[#b45309]/30 flex items-start gap-2.5 text-[#78350f] dark:text-[#fde047]">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#b45309] dark:text-[#facc15]" />
                <div className="flex flex-col gap-0.5 leading-snug">
                  <span className="font-bold">
                    {preview.missing_dimensions} {preview.missing_dimensions === 1 ? 'artículo tiene' : 'artículos tienen'} cubicaje pendiente o incompleto
                  </span>
                  <span className="text-[11px] text-[#92400e] dark:text-[#fde68a]/90">
                    Política no destructiva: Se preservarán sus medidas existentes en la plataforma sin modificarlas ni generar errores de carga.
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-[#f0fdf4] dark:bg-[#14532d]/20 rounded-xl border border-[#bbf7d0] dark:border-[#15803d]/30 flex items-center gap-2 text-[#14532d] dark:text-[#86efac]">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#15803d] dark:text-[#4ade80]" />
                <span className="font-medium text-[11px]">
                  Todos los artículos poseen las 4 dimensiones obligatorias (peso, alto, ancho y largo &gt; 0).
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="p-4 bg-[#faf9f5] dark:bg-[#262624] rounded-xl border border-[#e5e3dc] dark:border-[#363633] text-center text-[#73726c] dark:text-[#a3a199]">
            Aún no se ha cargado una planilla erp_precios.csv o está vacía.
          </div>
        )}

        {/* Botonera de Plantilla y Refresco */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#ece9df] dark:border-[#2d2d2a]">
          <button
            type="button"
            onClick={downloadCSVTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-[#141413] dark:text-[#faf9f5] bg-white dark:bg-[#1c1c1a] border border-[#e5e3dc] dark:border-[#363633] rounded-xl hover:bg-[#f4f2eb] dark:hover:bg-[#2c2c29] cursor-pointer transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-[#73726c] dark:text-[#a3a199]" />
            <span>Descargar Plantilla CSV</span>
          </button>

          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={onRefresh}
              loading={loading}
              className="text-[11px]"
            >
              Auditar Archivo
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
