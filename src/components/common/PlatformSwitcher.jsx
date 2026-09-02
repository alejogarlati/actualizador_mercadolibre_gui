import React from 'react';
import { RefreshCw, ShoppingBag } from 'lucide-react';

export default function PlatformSwitcher({ selectedPlatform, onSelectPlatform }) {
  return (
    <div className="flex items-center bg-[#faf9f5] dark:bg-[#232321] p-1 rounded-xl border border-[#e5e3dc] dark:border-[#2d2d2a] shadow-2xs">
      <button
        onClick={() => onSelectPlatform('mercadolibre')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
          selectedPlatform === 'mercadolibre'
            ? 'bg-[#141413] dark:bg-[#faf9f5] text-white dark:text-[#141413] shadow-xs'
            : 'text-[#73726c] dark:text-[#a3a199] hover:text-[#141413] dark:hover:text-[#faf9f5] hover:bg-[#f2efe6] dark:hover:bg-[#2c2c29]'
        }`}
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>Mercado Libre</span>
      </button>

      <button
        onClick={() => onSelectPlatform('tiendanube')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
          selectedPlatform === 'tiendanube'
            ? 'bg-[#141413] dark:bg-[#faf9f5] text-white dark:text-[#141413] shadow-xs'
            : 'text-[#73726c] dark:text-[#a3a199] hover:text-[#141413] dark:hover:text-[#faf9f5] hover:bg-[#f2efe6] dark:hover:bg-[#2c2c29]'
        }`}
      >
        <ShoppingBag className="w-3.5 h-3.5" />
        <span>Tiendanube</span>
      </button>
    </div>
  );
}
