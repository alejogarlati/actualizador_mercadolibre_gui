import React from 'react';
import { RefreshCw, ShoppingBag } from 'lucide-react';

export default function PlatformSwitcher({ selectedPlatform, onSelectPlatform }) {
  return (
    <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-2xs">
      <button
        onClick={() => onSelectPlatform('mercadolibre')}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
          selectedPlatform === 'mercadolibre'
            ? 'bg-white text-red-600 shadow-xs border border-slate-200'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
        }`}
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>Mercado Libre</span>
      </button>

      <button
        onClick={() => onSelectPlatform('tiendanube')}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
          selectedPlatform === 'tiendanube'
            ? 'bg-white text-red-600 shadow-xs border border-slate-200'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
        }`}
      >
        <ShoppingBag className="w-3.5 h-3.5" />
        <span>Tiendanube</span>
      </button>
    </div>
  );
}
