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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-gray-900 border border-gray-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col my-8">
        {/* Header */}
        <div className="p-5 bg-gray-950/70 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Sincronización Masiva ERP → Tiendanube</h2>
              <p className="text-xs text-gray-400">Actualiza precios con margen y existencias por SKU</p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isRunning}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          {/* Carga de Archivo */}
          <div>
            <label className="block text-gray-300 font-medium mb-1.5">Archivo de Precios ERP (CSV)</label>
            <div className="flex items-center gap-3 p-3 bg-gray-950 rounded-xl border border-gray-800">
              <FileSpreadsheet className="w-5 h-5 text-blue-400 shrink-0" />
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                disabled={isRunning}
                className="w-full text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-800 file:text-gray-200 hover:file:bg-gray-700 cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              Si no seleccionas un archivo, se utilizará el <code className="text-gray-400">erp_precios.csv</code> por defecto en el servidor.
            </p>
          </div>

          {/* Margen Comercial */}
          <div className="p-4 bg-gray-950 rounded-xl border border-gray-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-400" />
                <span className="font-semibold text-gray-200">Margen Comercial sobre Costo</span>
              </div>
              <div className="flex items-center gap-1 font-mono font-bold text-sm text-blue-400 bg-gray-900 px-2.5 py-1 rounded-lg border border-gray-800">
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
              className="w-full accent-blue-500 bg-gray-800 h-2 rounded-lg cursor-pointer"
            />
          </div>

          {/* Opciones de Sync */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex items-center gap-3 p-3 bg-gray-950 rounded-xl border border-gray-800 cursor-pointer">
              <input
                type="checkbox"
                checked={syncPrices}
                onChange={(e) => setSyncPrices(e.target.checked)}
                disabled={isRunning}
                className="w-4 h-4 rounded text-blue-600 focus:ring-0 bg-gray-900 border-gray-700"
              />
              <div>
                <span className="font-semibold text-gray-200 block">Actualizar Precios</span>
                <span className="text-[11px] text-gray-500">Aplica margen al costo base</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-gray-950 rounded-xl border border-gray-800 cursor-pointer">
              <input
                type="checkbox"
                checked={syncStock}
                onChange={(e) => setSyncStock(e.target.checked)}
                disabled={isRunning}
                className="w-4 h-4 rounded text-blue-600 focus:ring-0 bg-gray-900 border-gray-700"
              />
              <div>
                <span className="font-semibold text-gray-200 block">Actualizar Stock</span>
                <span className="text-[11px] text-gray-500">Sincroniza existencias de depósito</span>
              </div>
            </label>
          </div>

          {/* Barra de Progreso y Métricas de Ejecución */}
          {progress && (
            <div className="space-y-3 p-4 bg-gray-950 rounded-xl border border-gray-800">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-gray-300 flex items-center gap-2">
                  {isRunning && <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />}
                  <span>{isRunning ? `Sincronizando: ${progress.current_item || '...'}` : 'Sincronización Completada'}</span>
                </span>
                <span className="font-mono text-blue-400">{progress.percentage || 0}%</span>
              </div>

              {/* Progress Track */}
              <div className="w-full bg-gray-900 h-2.5 rounded-full overflow-hidden border border-gray-800">
                <div 
                  className="bg-blue-600 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${progress.percentage || 0}%` }}
                />
              </div>

              {/* Counters */}
              <div className="grid grid-cols-3 gap-2 text-center pt-2">
                <div className="bg-gray-900/80 p-2 rounded-lg border border-gray-800">
                  <div className="text-emerald-400 font-mono font-bold text-sm">{progress.success_count || 0}</div>
                  <div className="text-[10px] text-gray-400">Actualizados</div>
                </div>
                <div className="bg-gray-900/80 p-2 rounded-lg border border-gray-800">
                  <div className="text-amber-400 font-mono font-bold text-sm">{progress.not_found_count || 0}</div>
                  <div className="text-[10px] text-gray-400">No Encontrados</div>
                </div>
                <div className="bg-gray-900/80 p-2 rounded-lg border border-gray-800">
                  <div className="text-red-400 font-mono font-bold text-sm">{progress.fail_count || 0}</div>
                  <div className="text-[10px] text-gray-400">Errores</div>
                </div>
              </div>
            </div>
          )}

          {/* Consola de Logs */}
          {progress?.logs && progress.logs.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                <Terminal className="w-3.5 h-3.5" />
                <span>Registro de Operaciones</span>
              </div>
              <div className="bg-gray-950 p-3 rounded-xl border border-gray-800 max-h-36 overflow-y-auto font-mono text-[11px] space-y-1 text-gray-300">
                {progress.logs.map((log, idx) => (
                  <div key={idx} className={log.includes('[OK]') ? 'text-emerald-400' : log.includes('[FALLO]') || log.includes('[ERROR]') ? 'text-red-400' : log.includes('[NO ENCONTRADO]') ? 'text-amber-400' : 'text-gray-400'}>
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 bg-gray-950/70 border-t border-gray-800 flex items-center justify-between">
          <span className="text-[11px] text-gray-500 font-mono">
            Rate Limiter: 40 req burst, 2 req/s leak
          </span>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              disabled={isRunning}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-gray-200 hover:bg-gray-800 disabled:opacity-40"
            >
              Cerrar
            </button>

            <button
              onClick={handleStartSync}
              disabled={isRunning || uploading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 disabled:opacity-40 transition-all"
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
