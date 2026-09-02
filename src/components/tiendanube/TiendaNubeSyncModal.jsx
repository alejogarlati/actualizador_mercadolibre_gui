import React, { useState, useEffect } from 'react';
import { 
  UploadCloud, 
  Play, 
  RefreshCw, 
  Terminal, 
  Sliders, 
  FileSpreadsheet 
} from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { executeTiendanubeSync, fetchTiendanubeSyncStatus, uploadCSV } from '../../services/api';

export default function TiendaNubeSyncModal({ isOpen, onClose, onSyncFinished }) {
  const [marginPct, setMarginPct] = useState(0.0);
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sincronización Masiva ERP → Tiendanube"
      subtitle="Actualiza precios con margen comercial y existencias por SKU"
      icon={UploadCloud}
      maxWidth="max-w-2xl"
      footer={
        <>
          <span className="text-[11px] text-[#73726c] font-mono mr-auto">
            Rate Limiter: Leaky Bucket (2 req/s)
          </span>

          <Button variant="ghost" size="md" onClick={onClose} disabled={isRunning}>
            Cerrar
          </Button>

          <Button
            variant="primary"
            size="md"
            icon={Play}
            onClick={handleStartSync}
            loading={isRunning || uploading}
          >
            {isRunning ? 'Sincronizando...' : 'Iniciar Sincronización'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4 text-xs">
        {/* Carga de Archivo */}
        <div className="flex flex-col gap-1.5">
          <label className="font-bold text-[#141413]">Archivo de Precios ERP (CSV)</label>
          <div className="flex items-center gap-3 p-3.5 bg-[#faf9f5] rounded-xl border border-[#e5e3dc]">
            <FileSpreadsheet className="w-5 h-5 text-[#141413] shrink-0" />
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={isRunning}
              className="w-full text-xs text-[#73726c] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#141413] file:text-white hover:file:bg-[#262624] cursor-pointer"
            />
          </div>
          <p className="text-[10.5px] text-[#73726c]">
            Si no seleccionas un archivo, se utilizará el <code className="text-[#141413] font-mono">erp_precios.csv</code> por defecto en el servidor.
          </p>
        </div>

        {/* Banner de Reglas */}
        <div className="p-3.5 bg-[#faf9f5] border border-[#e5e3dc] rounded-xl flex flex-col gap-1 text-xs text-[#73726c]">
          <div className="flex items-center gap-1.5 font-bold text-[#141413]">
            <Sliders className="w-3.5 h-3.5 text-[#141413]" />
            <span>Motor de Reglas y Descuentos Activo</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            El sincronizador leerá los costos del CSV y aplicará automáticamente el <strong>descuento de la categoría</strong> asignada o el <strong>descuento personalizado de la variante</strong> si existe.
          </p>
        </div>

        {/* Fallback de Margen General */}
        <div className="p-4 bg-[#faf9f5] rounded-xl border border-[#e5e3dc] flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-[#141413] block">Factor / Margen por Defecto (Fallback)</span>
              <span className="text-[10.5px] text-[#73726c]">Solo aplica a productos sin categoría ni descuento asignado</span>
            </div>
            <div className="font-mono font-bold text-xs text-[#141413] bg-white px-2.5 py-1 rounded-lg border border-[#e5e3dc]">
              {marginPct > 0 ? `+${marginPct}% recargo` : marginPct < 0 ? `${marginPct}% desc.` : '0% (Costo Base)'}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="range"
              min="-50"
              max="50"
              step="0.5"
              value={marginPct}
              onChange={(e) => setMarginPct(parseFloat(e.target.value))}
              disabled={isRunning}
              className="w-full accent-[#141413] bg-[#e5e3dc] h-2 rounded-lg cursor-pointer"
            />
            <button
              type="button"
              onClick={() => setMarginPct(0.0)}
              className="px-2 py-1 text-[11px] font-semibold text-[#73726c] bg-white border border-[#e5e3dc] rounded-lg hover:bg-[#f2efe6] cursor-pointer"
            >
              Reset 0%
            </button>
          </div>
        </div>

        {/* Checkboxes de Sincronización */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex items-center gap-3 p-3.5 bg-[#faf9f5] rounded-xl border border-[#e5e3dc] cursor-pointer hover:bg-[#f4f2eb] transition-colors">
            <input
              type="checkbox"
              checked={syncPrices}
              onChange={(e) => setSyncPrices(e.target.checked)}
              disabled={isRunning}
              className="w-4 h-4 rounded text-[#141413] focus:ring-0"
            />
            <div>
              <span className="font-bold text-[#141413] block">Actualizar Precios</span>
              <span className="text-[10.5px] text-[#73726c]">Aplica margen al costo base</span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3.5 bg-[#faf9f5] rounded-xl border border-[#e5e3dc] cursor-pointer hover:bg-[#f4f2eb] transition-colors">
            <input
              type="checkbox"
              checked={syncStock}
              onChange={(e) => setSyncStock(e.target.checked)}
              disabled={isRunning}
              className="w-4 h-4 rounded text-[#141413] focus:ring-0"
            />
            <div>
              <span className="font-bold text-[#141413] block">Actualizar Stock</span>
              <span className="text-[10.5px] text-[#73726c]">Sincroniza existencias</span>
            </div>
          </label>
        </div>

        {/* Progreso */}
        {progress && (
          <div className="flex flex-col gap-3 p-4 bg-[#faf9f5] rounded-xl border border-[#e5e3dc]">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-[#141413] flex items-center gap-2">
                {isRunning && <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#141413]" />}
                <span>{isRunning ? `Sincronizando: ${progress.current_item || '...'}` : 'Sincronización Completada'}</span>
              </span>
              <span className="font-mono text-[#141413]">{progress.percentage || 0}%</span>
            </div>

            <div className="w-full bg-[#e5e3dc] h-2 rounded-full overflow-hidden">
              <div 
                className="bg-[#141413] h-full transition-all duration-300 rounded-full"
                style={{ width: `${progress.percentage || 0}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2.5 text-center pt-1">
              <div className="bg-white p-2.5 rounded-lg border border-[#e5e3dc]">
                <div className="text-[#15803d] font-mono font-black text-sm">{progress.success_count || 0}</div>
                <div className="text-[10px] text-[#73726c] font-medium">Actualizados</div>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-[#e5e3dc]">
                <div className="text-[#141413] font-mono font-black text-sm">{progress.not_found_count || 0}</div>
                <div className="text-[10px] text-[#73726c] font-medium">No Encontrados</div>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-[#e5e3dc]">
                <div className="text-[#b91c1c] font-mono font-black text-sm">{progress.fail_count || 0}</div>
                <div className="text-[10px] text-[#73726c] font-medium">Errores</div>
              </div>
            </div>
          </div>
        )}

        {/* Logs */}
        {progress?.logs && progress.logs.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-[#73726c] uppercase tracking-wider">
              <Terminal className="w-3.5 h-3.5 text-[#141413]" />
              <span>Registro de Operaciones</span>
            </div>
            <div className="bg-[#141413] p-3 rounded-xl border border-[#141413] max-h-36 overflow-y-auto font-mono text-[10.5px] space-y-1 text-[#faf9f5]">
              {progress.logs.map((log, idx) => (
                <div key={idx} className={
                  log.includes('[OK]') ? 'text-[#86efac]' : 
                  log.includes('[FALLO]') || log.includes('[ERROR]') ? 'text-[#fca5a5] font-bold' : 
                  'text-[#dcd8cd]'
                }>
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
