import React from 'react';
import { 
  ShoppingBag, 
  RefreshCw, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Layers, 
  Calculator,
  UploadCloud,
  Package
} from 'lucide-react';

export default function PlatformSelectorScreen({ 
  onSelectPlatform, 
  meliHealth, 
  tnHealth 
}) {
  const meliConnected = meliHealth?.token_valid;
  const tnConnected = tnHealth?.status === 'online';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-slate-50 text-slate-900 p-6 font-sans">
      <div className="max-w-4xl w-full flex flex-col items-center gap-8">
        
        {/* Header & Branding */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="p-3.5 bg-red-600 text-white rounded-2xl shadow-xl shadow-red-200 flex items-center justify-center">
            <RefreshCw className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Sincronizador Multicanal
            </h1>
            <p className="text-sm font-semibold text-red-600 uppercase tracking-widest mt-0.5">
              Corralón Aconquija • Versión 0.3.0
            </p>
          </div>
          <p className="text-sm text-slate-500 max-w-md">
            Selecciona la plataforma sobre la que deseas trabajar. Podrás cambiar de canal en cualquier momento.
          </p>
        </div>

        {/* Tarjetas de Selección de Plataforma */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
          
          {/* Tarjeta Mercado Libre */}
          <div 
            onClick={() => onSelectPlatform('mercadolibre')}
            className="group bg-white rounded-2xl p-7 border-2 border-slate-200 hover:border-red-600 shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between gap-6 relative overflow-hidden"
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-red-50 text-red-600 rounded-xl group-hover:bg-red-600 group-hover:text-white transition-colors duration-200 shadow-sm">
                  <RefreshCw className="w-6 h-6" />
                </div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                  meliConnected 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${meliConnected ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                  {meliConnected ? 'Conectado' : 'Offline / Verificar'}
                </span>
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                  Mercado Libre
                </h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Gestión integral de publicaciones, simulador financiero de comisiones, auditoría de rentabilidad y sincronización ERP.
                </p>
              </div>

              <ul className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>
                  <span>Catálogo MeLi & Envíos Me2</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>
                  <span>Calculadora & Simulador Estratégico</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>
                  <span>Auditoría de Neto a Recibir vs Mostrador</span>
                </li>
              </ul>
            </div>

            <button 
              onClick={(e) => {
                e.stopPropagation();
                onSelectPlatform('mercadolibre');
              }}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm bg-red-600 text-white group-hover:bg-red-700 shadow-md shadow-red-200 transition-all"
            >
              <span>Abrir Mercado Libre</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Tarjeta Tiendanube */}
          <div 
            onClick={() => onSelectPlatform('tiendanube')}
            className="group bg-white rounded-2xl p-7 border-2 border-slate-200 hover:border-red-600 shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between gap-6 relative overflow-hidden"
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-red-50 text-red-600 rounded-xl group-hover:bg-red-600 group-hover:text-white transition-colors duration-200 shadow-sm">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                  tnConnected 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${tnConnected ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                  {tnConnected ? `Tienda #${tnHealth?.store_id || '8145042'}` : 'Offline / Configurar'}
                </span>
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                  Tiendanube (Nuvemshop)
                </h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Catálogo online con variantes (hasta 3 atributos), precios de lista y oferta, control de stock y sincronización masiva ERP.
                </p>
              </div>

              <ul className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>
                  <span>Matriz Dinámica de Variantes & Stock</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>
                  <span>Precios de Oferta & Precios Tachados</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>
                  <span>Sincronización Masiva por SKU desde ERP</span>
                </li>
              </ul>
            </div>

            <button 
              onClick={(e) => {
                e.stopPropagation();
                onSelectPlatform('tiendanube');
              }}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm bg-red-600 text-white group-hover:bg-red-700 shadow-md shadow-red-200 transition-all"
            >
              <span>Abrir Tiendanube</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>

        {/* Footer Info */}
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <span>Sistema Unificado Corralón Aconquija</span>
          <span>•</span>
          <span>Base Local SQLite</span>
          <span>•</span>
          <span>FastAPI REST Server</span>
        </div>

      </div>
    </div>
  );
}
