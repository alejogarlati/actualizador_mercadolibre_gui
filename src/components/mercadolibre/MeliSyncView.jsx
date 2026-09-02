import React, { useState } from 'react';
import { 
  UploadCloud, 
  Play, 
  FileSpreadsheet, 
  RefreshCw, 
  Terminal, 
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
  const [file, setFile] = useState(null);
  const [syncStatus, setSyncStatus] = useState('');
  const [uploading, setUploading] = useState(false);

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

  const isRunning = syncProgress?.is_running;
  const percentage = syncProgress?.total > 0 ? Math.round((syncProgress.current / syncProgress.total) * 100) : 0;

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Carga de Archivo */}
      <Card
        title="Cargar Planilla de Precios (CSV)"
        subtitle="Exportación ERP con columnas id/sku y precio_mostrador"
        icon={UploadCloud}
      >
        <div className="flex flex-col gap-4 text-xs">
          <label className="border-2 border-dashed border-[#e5e3dc] hover:border-[#141413] bg-[#faf9f5] hover:bg-[#f4f2eb] rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all text-center gap-2 select-none">
            <FileSpreadsheet className="w-9 h-9 text-[#141413]" />
            <div className="text-xs font-bold text-[#141413]">
              {file ? file.name : 'Haz clic o arrastra tu archivo erp_precios.csv'}
            </div>
            <p className="text-[11px] text-[#73726c]">
              Archivos .csv delimitados por comas o punto y coma
            </p>
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" disabled={isRunning || uploading} />
          </label>

          {syncStatus && (
            <div className="p-3 bg-[#faf9f5] text-[#141413] font-mono text-xs rounded-xl border border-[#e5e3dc]">
              {syncStatus}
            </div>
          )}

          <Button
            variant="primary"
            size="lg"
            fullWidth
            icon={Play}
            onClick={onRunSync}
            loading={isRunning || uploading}
          >
            {isRunning ? 'Sincronización en proceso...' : 'Iniciar Sincronización en Mercado Libre'}
          </Button>
        </div>
      </Card>

      {/* Feedback y Barra de Progreso */}
      {(isRunning || (syncProgress?.logs && syncProgress.logs.length > 0)) && (
        <Card
          title={isRunning ? 'Sincronización Activa en Segundo Plano' : 'Reporte de Última Sincronización'}
          subtitle="Procesamiento asíncrono con control de tasa de peticiones"
          icon={RefreshCw}
          badge={
            <Badge variant={isRunning ? 'warning' : 'success'} size="sm" dot>
              {isRunning ? 'En curso' : 'Completado'}
            </Badge>
          }
        >
          <div className="flex flex-col gap-4 text-xs">
            {/* Barra de Progreso */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-[#73726c]">
                  {isRunning ? `Procesando: ${syncProgress?.current_item || '...'}` : 'Sincronización finalizada'}
                </span>
                <span className="font-mono text-[#141413]">{percentage}%</span>
              </div>
              <div className="w-full bg-[#f4f2eb] rounded-full h-2 overflow-hidden border border-[#e5e3dc]">
                <div 
                  className="bg-[#141413] h-full transition-all duration-300 rounded-full" 
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>

            {/* KPIs de Progreso */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-[#faf9f5] rounded-xl border border-[#e5e3dc]">
                <div className="text-[10.5px] text-[#73726c] font-bold">Procesados</div>
                <div className="text-base font-black font-mono text-[#141413] mt-0.5">
                  {syncProgress?.current || 0} / {syncProgress?.total || 0}
                </div>
              </div>

              <div className="p-3 bg-[#f0fdf4] rounded-xl border border-[#bbf7d0]">
                <div className="text-[10.5px] text-[#14532d] font-bold">Exitosos</div>
                <div className="text-base font-black font-mono text-[#15803d] mt-0.5">
                  {syncProgress?.success_count || 0}
                </div>
              </div>

              <div className="p-3 bg-[#fef2f2] rounded-xl border border-[#fecaca]">
                <div className="text-[10.5px] text-[#7f1d1d] font-bold">Fallidos</div>
                <div className="text-base font-black font-mono text-[#b91c1c] mt-0.5">
                  {syncProgress?.fail_count || 0}
                </div>
              </div>
            </div>

            {/* Consola de Logs */}
            {syncProgress?.logs && syncProgress.logs.length > 0 && (
              <div className="flex flex-col gap-2 pt-2 border-t border-[#ece9df]">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#73726c] uppercase tracking-wider">
                  <Terminal className="w-3.5 h-3.5 text-[#141413]" />
                  <span>Registro de Operaciones</span>
                </div>
                <div className="bg-[#141413] p-4 rounded-xl border border-[#141413] max-h-48 overflow-y-auto font-mono text-[11px] space-y-1 text-[#faf9f5]">
                  {syncProgress.logs.map((log, idx) => (
                    <div key={idx} className={
                      log.includes('[OK]') ? 'text-[#86efac]' : 
                      log.includes('[FALLO]') || log.includes('[ERROR]') ? 'text-[#fca5a5] font-bold' : 
                      log.includes('[NO ENCONTRADO]') ? 'text-[#dcd8cd]' : 'text-[#dcd8cd]'
                    }>
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
