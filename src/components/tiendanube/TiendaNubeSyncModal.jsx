import React, { useState, useEffect } from 'react';
import { 
  X, 
  UploadCloud, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Terminal, 
  Sliders, 
  DollarSign,
  FileSpreadsheet
} from 'lucide-react';
import { executeTiendanubeSync, fetchTiendanubeSyncStatus, uploadCSV } from '../../services/api';

export default function TiendaNubeSyncModal({ isOpen, onClose, onSyncFinished }) {
  const [marginPct, setMarginPct] = useState(25.0);
  const [syncPrices, setSyncPrices] = useState(true);
  const [syncStock, setSyncStock] = useState(true);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Sync Progress State
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    let interval = null;
    if (isOpen) {
      interval = setInterval(async () => {
        const status = await fetchTiendanubeSyncStatus();
        if (status) {
          setProgress(status);
          setIsRunning(status.is_running);
          if (!status.is_running && status.finished_at && isRunning) {
            if (onSyncFinished) onSyncFinished();
          }
        }
      }, 1500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, isRunning]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleStartSync = async () => {
    if (file) {
      setUploading(true);
      try {
        await uploadCSV(file);
      } catch (err) {
        alert(`Error al subir CSV: ${err.message}`);
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    try {
      setIsRunning(true);
      await executeTiendanubeSync({
        margin_pct: parseFloat(marginPct) || 0.0,
        sync_prices: syncPrices,
        sync_stock: syncStock
      });
    } catch (err) {
      alert(`Error al iniciar sincronización: ${err.message}`);
      setIsRunning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col my-8">
        {/* Header */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-red-50 text-red-600 border border-red-200">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Sincronización Masiva ERP → Tiendanube</h2>
              <p className="text-xs text-slate-500">Actualiza precios con margen comercial y existencias por SKU</p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isRunning}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          {/* Carga de Archivo */}
          <div>
            <label className="block text-slate-700 font-bold mb-1.5">Archivo de Precios ERP (CSV)</label>
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <FileSpreadsheet className="w-6 h-6 text-red-600 shrink-0" />
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                disabled={isRunning}
                className="w-full text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-red-600 file:text-white hover:file:bg-red-700 cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Si no seleccionas un archivo, se utilizará el <code className="text-red-600 font-mono">erp_precios.csv</code> por defecto en el servidor.
            </p>
          </div>

          {/* Margen Comercial */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-red-600" />
                <span className="font-bold text-slate-900">Margen Comercial sobre Costo</span>
              </div>
              <div className="flex items-center gap-1 font-mono font-black text-sm text-red-600 bg-white px-3 py-1 rounded-xl border border-slate-200 shadow-xs">
                <span>+{marginPct}%</span>
              </div>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              step="0.5"
              value={marginPct}
              onChange={(e) => setMarginPct(e.target.value)}
              disabled={isRunning}
              className="w-full accent-red-600 bg-slate-200 h-2 rounded-lg cursor-pointer"
            />
          </div>

          {/* Opciones de Sincronización */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-100/60 transition-colors">
              <input
                type="checkbox"
                checked={syncPrices}
                onChange={(e) => setSyncPrices(e.target.checked)}
                disabled={isRunning}
                className="w-4 h-4 rounded text-red-600 focus:ring-0 bg-white border-slate-300"
              />
              <div>
                <span className="font-bold text-slate-900 block">Actualizar Precios</span>
                <span className="text-[11px] text-slate-500">Aplica margen al costo base</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-100/60 transition-colors">
              <input
                type="checkbox"
                checked={syncStock}
                onChange={(e) => setSyncStock(e.target.checked)}
                disabled={isRunning}
                className="w-4 h-4 rounded text-red-600 focus:ring-0 bg-white border-slate-300"
              />
              <div>
                <span className="font-bold text-slate-900 block">Actualizar Stock</span>
                <span className="text-[11px] text-slate-500">Sincroniza existencias de depósito</span>
              </div>
            </label>
          </div>

          {/* Progreso y Contadores */}
          {progress && (
            <div className="space-y-3.5 p-5 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-800 flex items-center gap-2">
                  {isRunning && <RefreshCw className="w-4 h-4 animate-spin text-red-600" />}
                  <span>{isRunning ? `Sincronizando: ${progress.current_item || '...'}` : 'Sincronización Completada'}</span>
                </span>
                <span className="font-mono text-red-600">{progress.percentage || 0}%</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-red-600 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${progress.percentage || 0}%` }}
                />
              </div>

              {/* Counters */}
              <div className="grid grid-cols-3 gap-3 text-center pt-2">
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-emerald-600 font-mono font-black text-base">{progress.success_count || 0}</div>
                  <div className="text-[11px] text-slate-500 font-medium">Actualizados</div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-amber-600 font-mono font-black text-base">{progress.not_found_count || 0}</div>
                  <div className="text-[11px] text-slate-500 font-medium">No Encontrados</div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-red-600 font-mono font-black text-base">{progress.fail_count || 0}</div>
                  <div className="text-[11px] text-slate-500 font-medium">Errores</div>
                </div>
              </div>
            </div>
          )}

          {/* Consola de Auditoría */}
          {progress?.logs && progress.logs.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                <Terminal className="w-4 h-4 text-red-600" />
                <span>Registro de Operaciones</span>
              </div>
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 max-h-40 overflow-y-auto font-mono text-[11px] space-y-1 text-slate-200">
                {progress.logs.map((log, idx) => (
                  <div key={idx} className={
                    log.includes('[OK]') ? 'text-emerald-400' : 
                    log.includes('[FALLO]') || log.includes('[ERROR]') ? 'text-red-400 font-bold' : 
                    log.includes('[NO ENCONTRADO]') ? 'text-amber-400' : 'text-slate-300'
                  }>
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            Rate Limiter: Leaky Bucket (2 req/s)
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={isRunning}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60 disabled:opacity-40"
            >
              Cerrar
            </button>

            <button
              onClick={handleStartSync}
              disabled={isRunning || uploading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-200 disabled:opacity-40 transition-all"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sincronizando...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Iniciar Sincronización</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
