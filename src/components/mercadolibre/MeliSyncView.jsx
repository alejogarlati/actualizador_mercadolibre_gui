import React, { useState } from 'react';
import { 
  UploadCloud, 
  Play, 
  RefreshCw, 
  Terminal, 
  Sliders, 
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { uploadCSV } from '../../services/api';

export default function MeliSyncView({ 
  onRunSync, 
  syncProgress, 
  onAddToast 
}) {
  const [margenAdicional, setMargenAdicional] = useState(0.0);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');

  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setUploading(true);
    try {
      await uploadCSV(selectedFile);
      setSyncStatus(`Archivo '${selectedFile.name}' cargado correctamente.`);
      if (onAddToast) {
        onAddToast('success', 'Archivo CSV Cargado', `Planilla '${selectedFile.name}' lista para procesar.`);
      }
    } catch (err) {
      setSyncStatus(`Error al subir CSV: ${err.message}`);
      if (onAddToast) {
        onAddToast('error', 'Error al Subir Planilla', err.message);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleStartSync = () => {
    if (onRunSync) {
      onRunSync(parseFloat(margenAdicional) || 0.0);
    }
  };

  const isRunning = syncProgress?.is_running;
  const percentage = syncProgress?.percentage || 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Columna Izquierda: Carga de Archivo & Parámetros */}
      <div className="lg:col-span-5 flex flex-col gap-5">
        <Card
          title="Cargar Planilla de Precios (CSV)"
          subtitle="Exportación ERP con códigos SKU y costos de mostrador"
          icon={UploadCloud}
          badge={<Badge variant="outline" size="sm">Mercado Libre</Badge>}
        >
          <div className="flex flex-col gap-4 text-xs">
            <label className="border-2 border-dashed border-[#e5e3dc] dark:border-[#363633] hover:border-[#141413] dark:hover:border-[#faf9f5] bg-[#faf9f5] dark:bg-[#262624] hover:bg-[#f4f2eb] dark:hover:bg-[#2e2e2b] rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all text-center gap-2 select-none">
              <FileSpreadsheet className="w-8 h-8 text-[#141413] dark:text-[#faf9f5]" />
              <div className="text-xs font-bold text-[#141413] dark:text-[#faf9f5]">
                {file ? file.name : 'Haz clic o arrastra tu archivo erp_precios.csv'}
              </div>
              <p className="text-[11px] text-[#73726c] dark:text-[#a3a199]">
                Archivos .csv delimitados por comas o punto y coma
              </p>
              <input 
                type="file" 
                accept=".csv" 
                onChange={handleFileUpload} 
                className="hidden" 
                disabled={isRunning || uploading} 
              />
            </label>

            {syncStatus && (
              <div className="p-3 bg-[#faf9f5] dark:bg-[#262624] text-[#141413] dark:text-[#faf9f5] font-mono text-xs rounded-xl border border-[#e5e3dc] dark:border-[#363633]">
                {syncStatus}
              </div>
            )}

            {/* Margen / Variación Global */}
            <div className="p-4 bg-[#faf9f5] dark:bg-[#262624] rounded-xl border border-[#e5e3dc] dark:border-[#363633] flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#141413] dark:text-[#faf9f5] block">Margen de Ajuste Global Temporal</span>
                  <span className="text-[10.5px] text-[#73726c] dark:text-[#a3a199]">Aplica variación sobre el precio de lista final</span>
                </div>
                <div className="font-mono font-bold text-xs text-[#141413] dark:text-[#faf9f5] bg-white dark:bg-[#1c1c1a] px-2.5 py-1 rounded-lg border border-[#e5e3dc] dark:border-[#363633]">
                  {margenAdicional > 0 ? `+${margenAdicional}%` : `${margenAdicional}%`}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="-30"
                  max="30"
                  step="0.5"
                  value={margenAdicional}
                  onChange={(e) => setMargenAdicional(parseFloat(e.target.value))}
                  disabled={isRunning}
                  className="w-full accent-[#141413] dark:accent-[#faf9f5] bg-[#e5e3dc] dark:bg-[#363633] h-2 rounded-lg cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => setMargenAdicional(0.0)}
                  className="px-2 py-1 text-[11px] font-semibold text-[#73726c] dark:text-[#a3a199] bg-white dark:bg-[#1c1c1a] border border-[#e5e3dc] dark:border-[#363633] rounded-lg hover:bg-[#f2efe6] dark:hover:bg-[#2c2c29] cursor-pointer"
                >
                  0%
                </button>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              icon={Play}
              onClick={handleStartSync}
              loading={isRunning || uploading}
              className="mt-1"
            >
              {isRunning ? 'Sincronización en Proceso...' : 'Iniciar Sincronización en Mercado Libre'}
            </Button>
          </div>
        </Card>
      </div>

      {/* Columna Derecha: Estado de Sincronización en Tiempo Real */}
      <div className="lg:col-span-7 flex flex-col gap-5">
        <Card
          title={isRunning ? 'Sincronización Activa en Segundo Plano' : 'Reporte de Sincronización'}
          subtitle="Procesamiento asíncrono seguro con rate limiting oficial"
          icon={RefreshCw}
          badge={
            <Badge variant={isRunning ? 'warning' : syncProgress?.finished_at ? 'success' : 'neutral'} size="sm" dot>
              {isRunning ? 'En curso' : syncProgress?.finished_at ? 'Completado' : 'Listo para iniciar'}
            </Badge>
          }
        >
          <div className="flex flex-col gap-4 text-xs">
            {/* Barra de Progreso */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-[#73726c] dark:text-[#a3a199] truncate pr-2">
                  {isRunning ? `Procesando: ${syncProgress?.current_item || '...'}` : syncProgress?.finished_at ? 'Sincronización finalizada' : 'Esperando inicio de proceso'}
                </span>
                <span className="font-mono text-[#141413] dark:text-[#faf9f5] shrink-0">{percentage}%</span>
              </div>
              <div className="w-full bg-[#f4f2eb] dark:bg-[#262624] rounded-full h-2.5 overflow-hidden border border-[#e5e3dc] dark:border-[#363633]">
                <div 
                  className="bg-[#141413] dark:bg-[#faf9f5] h-full transition-all duration-300 rounded-full" 
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>

            {/* KPIs de Progreso */}
            <div className="grid grid-cols-4 gap-2.5">
              <div className="p-3 bg-[#faf9f5] dark:bg-[#262624] rounded-xl border border-[#e5e3dc] dark:border-[#363633]">
                <div className="text-[10px] text-[#73726c] dark:text-[#a3a199] font-bold truncate">Procesados</div>
                <div className="text-base font-black font-mono text-[#141413] dark:text-[#faf9f5] mt-0.5">
                  {syncProgress?.current || 0}
                </div>
              </div>

              <div className="p-3 bg-[#f0fdf4] dark:bg-[#14532d]/25 rounded-xl border border-[#bbf7d0] dark:border-[#15803d]/40">
                <div className="text-[10px] text-[#14532d] dark:text-[#86efac] font-bold truncate">Exitosos</div>
                <div className="text-base font-black font-mono text-[#15803d] dark:text-[#4ade80] mt-0.5">
                  {syncProgress?.success_count || 0}
                </div>
              </div>

              <div className="p-3 bg-[#fffbeb] dark:bg-[#78350f]/25 rounded-xl border border-[#fde68a] dark:border-[#b45309]/40">
                <div className="text-[10px] text-[#78350f] dark:text-[#fde047] font-bold truncate">No Encontrados</div>
                <div className="text-base font-black font-mono text-[#b45309] dark:text-[#facc15] mt-0.5">
                  {syncProgress?.not_found_count || 0}
                </div>
              </div>

              <div className="p-3 bg-[#fef2f2] dark:bg-[#7f1d1d]/25 rounded-xl border border-[#fecaca] dark:border-[#b91c1c]/40">
                <div className="text-[10px] text-[#7f1d1d] dark:text-[#fca5a5] font-bold truncate">Fallidos</div>
                <div className="text-base font-black font-mono text-[#b91c1c] dark:text-[#f87171] mt-0.5">
                  {syncProgress?.fail_count || 0}
                </div>
              </div>
            </div>

            {/* Consola de Logs */}
            <div className="flex flex-col gap-2 pt-2 border-t border-[#ece9df] dark:border-[#2d2d2a]">
              <div className="flex items-center justify-between text-[11px] font-bold text-[#73726c] dark:text-[#a3a199] uppercase tracking-wider">
                <div className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-[#141413] dark:text-[#faf9f5]" />
                  <span>Consola de Operaciones en Vivo</span>
                </div>
                <span className="font-mono font-normal lowercase text-[10px] text-[#9c998f] dark:text-[#73726c]">
                  meli-api: ok
                </span>
              </div>
              <div className="bg-[#141413] dark:bg-[#0c0c0b] p-4 rounded-xl border border-[#141413] dark:border-[#2d2d2a] h-64 overflow-y-auto font-mono text-[11px] space-y-1 text-[#faf9f5]">
                {(!syncProgress?.logs || syncProgress.logs.length === 0) ? (
                  <div className="text-[#73726c] italic">
                    Sin eventos registrados aún. Inicia la sincronización para ver el registro en vivo.
                  </div>
                ) : (
                  syncProgress.logs.map((log, idx) => (
                    <div key={idx} className={
                      log.includes('[OK]') ? 'text-[#86efac]' : 
                      log.includes('[FALLO]') || log.includes('[ERROR]') ? 'text-[#fca5a5] font-bold' : 
                      log.includes('[NO ENCONTRADO]') ? 'text-[#fde68a]' : 'text-[#dcd8cd]'
                    }>
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
