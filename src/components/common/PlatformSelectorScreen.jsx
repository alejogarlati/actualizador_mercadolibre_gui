import React from 'react';
import { 
  ShoppingBag, 
  RefreshCw, 
  ArrowRight, 
  Layers, 
  Calculator,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

export default function PlatformSelectorScreen({ 
  onSelectPlatform, 
  meliHealth, 
  tnHealth 
}) {
  const meliConnected = meliHealth?.token_valid;
  const tnConnected = tnHealth?.status === 'online';

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] w-screen bg-[#faf9f5] text-[#141413] p-6 font-sans">
      <div className="max-w-4xl w-full flex flex-col items-center gap-10">
        
        {/* Header & Branding */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="p-3.5 bg-[#141413] text-white rounded-2xl shadow-card flex items-center justify-center border border-[#141413]">
            <RefreshCw className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#141413] tracking-tight">
              Sincronizador Multicanal
            </h1>
            <p className="text-[11px] font-bold text-[#73726c] uppercase tracking-widest mt-1">
              Corralón Aconquija • Sistema Central de Precios
            </p>
          </div>
          <p className="text-xs text-[#73726c] max-w-md leading-relaxed">
            Selecciona el canal comercial sobre el que deseas operar. La arquitectura de datos y reglas se mantiene sincronizada con el ERP.
          </p>
        </div>

        {/* Tarjetas de Selección de Plataforma */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
          
          {/* Tarjeta Mercado Libre */}
          <div 
            onClick={() => onSelectPlatform('mercadolibre')}
            className="group bg-white rounded-2xl p-7 border border-[#e5e3dc] hover:border-[#141413] shadow-card hover:shadow-elevated transition-all duration-200 cursor-pointer flex flex-col justify-between gap-6"
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-[#f4f2eb] text-[#141413] rounded-xl border border-[#e5e3dc] group-hover:bg-[#141413] group-hover:text-white transition-colors duration-200">
                  <RefreshCw className="w-6 h-6" />
                </div>
                <Badge variant={meliConnected ? 'success' : 'neutral'} dot>
                  {meliConnected ? 'Conectado' : 'Offline / Verificar'}
                </Badge>
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#141413] tracking-tight">
                  Mercado Libre
                </h2>
                <p className="text-xs text-[#73726c] mt-1 leading-relaxed">
                  Gestión integral de publicaciones, simulador financiero de comisiones, auditoría de rentabilidad y sincronización ERP.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-[#73726c] border-t border-[#ece9df] pt-4 font-medium">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#141413]"></div>
                  <span>Catálogo MeLi & Envíos Me2</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#141413]"></div>
                  <span>Calculadora & Simulador Estratégico</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#141413]"></div>
                  <span>Auditoría de Neto a Recibir vs Mostrador</span>
                </li>
              </ul>
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              icon={ArrowRight}
              iconPosition="right"
              onClick={(e) => {
                e.stopPropagation();
                onSelectPlatform('mercadolibre');
              }}
            >
              Abrir Mercado Libre
            </Button>
          </div>

          {/* Tarjeta Tiendanube */}
          <div 
            onClick={() => onSelectPlatform('tiendanube')}
            className="group bg-white rounded-2xl p-7 border border-[#e5e3dc] hover:border-[#141413] shadow-card hover:shadow-elevated transition-all duration-200 cursor-pointer flex flex-col justify-between gap-6"
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-[#f4f2eb] text-[#141413] rounded-xl border border-[#e5e3dc] group-hover:bg-[#141413] group-hover:text-white transition-colors duration-200">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <Badge variant={tnConnected ? 'success' : 'neutral'} dot>
                  {tnConnected ? `Tienda #${tnHealth?.store_id || '8145042'}` : 'Offline / Configurar'}
                </Badge>
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#141413] tracking-tight">
                  Tiendanube (Nuvemshop)
                </h2>
                <p className="text-xs text-[#73726c] mt-1 leading-relaxed">
                  Catálogo online con variantes (hasta 3 atributos), precios de lista y oferta, control de stock y sincronización masiva ERP.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-[#73726c] border-t border-[#ece9df] pt-4 font-medium">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#141413]"></div>
                  <span>Matriz Dinámica de Variantes & Stock</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#141413]"></div>
                  <span>Reglas de Descuento por Categoría</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#141413]"></div>
                  <span>Sincronización Masiva por SKU desde ERP</span>
                </li>
              </ul>
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              icon={ArrowRight}
              iconPosition="right"
              onClick={(e) => {
                e.stopPropagation();
                onSelectPlatform('tiendanube');
              }}
            >
              Abrir Tiendanube
            </Button>
          </div>

        </div>

        {/* Footer Info */}
        <div className="text-[11px] text-[#9c998f] flex items-center gap-2 font-mono">
          <span>Corralón Aconquija</span>
          <span>•</span>
          <span>Base Local SQLite</span>
          <span>•</span>
          <span>FastAPI REST Server</span>
        </div>

      </div>
    </div>
  );
}
