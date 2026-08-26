import React from 'react';
import { Zap, ShoppingBag } from 'lucide-react';

export default function PlatformSwitcher({ selectedPlatform, onSelectPlatform }) {
  return (
    <div className="flex items-center bg-gray-900 p-1 rounded-xl border border-gray-800 shadow-inner">
      <button
        onClick={() => onSelectPlatform('mercadolibre')}
        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
          selectedPlatform === 'mercadolibre'
            ? 'bg-yellow-400 text-gray-950 shadow-md scale-102'
            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
        }`}
      >
        <Zap className={`w-3.5 h-3.5 ${selectedPlatform === 'mercadolibre' ? 'text-gray-950 fill-current' : 'text-yellow-400'}`} />
        <span>Mercado Libre</span>
      </button>

      <button
        onClick={() => onSelectPlatform('tiendanube')}
        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
          selectedPlatform === 'tiendanube'
            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-102'
            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
        }`}
      >
        <ShoppingBag className={`w-3.5 h-3.5 ${selectedPlatform === 'tiendanube' ? 'text-white' : 'text-blue-400'}`} />
        <span>Tiendanube</span>
      </button>
    </div>
  );
}
