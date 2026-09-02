import React from 'react';
import { 
  LayoutDashboard, 
  RefreshCw, 
  Layers, 
  Percent, 
  ShieldCheck, 
  UploadCloud, 
  PackageSearch, 
  Calculator, 
  Settings as SettingsIcon, 
  ArrowLeft, 
  ShoppingBag, 
  LogOut 
} from 'lucide-react';

export default function Sidebar({
  selectedPlatform,
  activeTab,
  onSelectTab,
  onBackToHub,
  onOpenSyncModal
}) {
  const isTN = selectedPlatform === 'tiendanube';

  return (
    <aside className="w-68 bg-white border-r border-[#e5e3dc] flex flex-col p-4 shrink-0 justify-between select-none">
      <div className="flex flex-col gap-5">
        
        {/* BOTÓN VOLVER AL HUB */}
        <button
          onClick={onBackToHub}
          className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl text-xs font-bold text-[#73726c] bg-[#faf9f5] hover:bg-[#f2efe6] hover:text-[#141413] border border-[#e5e3dc] transition-all cursor-pointer"
          title="Volver a la selección de canales"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Cambiar de Canal</span>
        </button>

        {/* LOGO & BRAND */}
        <div className="flex items-center gap-3 pb-3 border-b border-[#ece9df]">
          <div className="p-2 bg-[#141413] text-white rounded-xl shadow-xs flex items-center justify-center border border-[#141413]">
            {isTN ? <ShoppingBag className="w-5 h-5" /> : <RefreshCw className="w-5 h-5" />}
          </div>
          <div>
            <h1 className="font-black text-sm text-[#141413] leading-tight tracking-tight">
              {isTN ? 'Sync Tiendanube' : 'Sync MeLi'}
            </h1>
            <p className="text-[10px] text-[#73726c] font-bold uppercase tracking-wider">
              {isTN ? 'Nuvemshop • Corralón' : 'Mercado Libre • Corralón'}
            </p>
          </div>
        </div>

        {/* MENÚ DE SECCIONES UNIFICADO */}
        <nav className="flex flex-col gap-1">
          {isTN ? (
            <>
              <button 
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  activeTab === 'dashboard' 
                    ? 'bg-[#141413] text-white shadow-xs' 
                    : 'text-[#73726c] hover:bg-[#faf9f5] hover:text-[#141413]'
                }`}
                onClick={() => onSelectTab('dashboard')}
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                <span>Dashboard</span>
              </button>

              <button 
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  activeTab === 'items' 
                    ? 'bg-[#141413] text-white shadow-xs' 
                    : 'text-[#73726c] hover:bg-[#faf9f5] hover:text-[#141413]'
                }`}
                onClick={() => onSelectTab('items')}
              >
                <Layers className="w-4 h-4 shrink-0" />
                <span>Catálogo de Variantes</span>
              </button>

              <button 
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  activeTab === 'categories' 
                    ? 'bg-[#141413] text-white shadow-xs' 
                    : 'text-[#73726c] hover:bg-[#faf9f5] hover:text-[#141413]'
                }`}
                onClick={() => onSelectTab('categories')}
              >
                <Percent className="w-4 h-4 shrink-0" />
                <span>Reglas por Categoría</span>
              </button>

              <button 
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  activeTab === 'audit' 
                    ? 'bg-[#141413] text-white shadow-xs' 
                    : 'text-[#73726c] hover:bg-[#faf9f5] hover:text-[#141413]'
                }`}
                onClick={() => onSelectTab('audit')}
              >
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Auditoría de Precios</span>
              </button>

              <button 
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  activeTab === 'sync' 
                    ? 'bg-[#141413] text-white shadow-xs' 
                    : 'text-[#73726c] hover:bg-[#faf9f5] hover:text-[#141413]'
                }`}
                onClick={() => onOpenSyncModal ? onOpenSyncModal() : onSelectTab('sync')}
              >
                <UploadCloud className="w-4 h-4 shrink-0" />
                <span>Sincronizador ERP</span>
              </button>
            </>
          ) : (
            <>
              <button 
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  activeTab === 'dashboard' 
                    ? 'bg-[#141413] text-white shadow-xs' 
                    : 'text-[#73726c] hover:bg-[#faf9f5] hover:text-[#141413]'
                }`}
                onClick={() => onSelectTab('dashboard')}
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                <span>Dashboard</span>
              </button>

              <button 
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  activeTab === 'items' 
                    ? 'bg-[#141413] text-white shadow-xs' 
                    : 'text-[#73726c] hover:bg-[#faf9f5] hover:text-[#141413]'
                }`}
                onClick={() => onSelectTab('items')}
              >
                <PackageSearch className="w-4 h-4 shrink-0" />
                <span>Publicaciones</span>
              </button>

              <button 
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  activeTab === 'sync' 
                    ? 'bg-[#141413] text-white shadow-xs' 
                    : 'text-[#73726c] hover:bg-[#faf9f5] hover:text-[#141413]'
                }`}
                onClick={() => onSelectTab('sync')}
              >
                <UploadCloud className="w-4 h-4 shrink-0" />
                <span>Sincronizador ERP</span>
              </button>

              <button 
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  activeTab === 'audit' 
                    ? 'bg-[#141413] text-white shadow-xs' 
                    : 'text-[#73726c] hover:bg-[#faf9f5] hover:text-[#141413]'
                }`}
                onClick={() => onSelectTab('audit')}
              >
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Auditoría de Precios</span>
              </button>

              <button 
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  activeTab === 'calculator' 
                    ? 'bg-[#141413] text-white shadow-xs' 
                    : 'text-[#73726c] hover:bg-[#faf9f5] hover:text-[#141413]'
                }`}
                onClick={() => onSelectTab('calculator')}
              >
                <Calculator className="w-4 h-4 shrink-0" />
                <span>Calculadora & Simulador</span>
              </button>

              <button 
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  activeTab === 'rules' 
                    ? 'bg-[#141413] text-white shadow-xs' 
                    : 'text-[#73726c] hover:bg-[#faf9f5] hover:text-[#141413]'
                }`}
                onClick={() => onSelectTab('rules')}
              >
                <SettingsIcon className="w-4 h-4 shrink-0" />
                <span>Configuración</span>
              </button>
            </>
          )}
        </nav>
      </div>

      {/* FOOTER */}
      <div className="pt-3 border-t border-[#ece9df] flex items-center justify-between gap-2">
        <button
          onClick={() => onSelectTab('rules')}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[#73726c] bg-[#faf9f5] hover:bg-[#f2efe6] hover:text-[#141413] border border-[#e5e3dc] transition-colors cursor-pointer"
          title="Configuración general"
        >
          <SettingsIcon className="w-3.5 h-3.5" />
          <span>Ajustes</span>
        </button>

        <button
          onClick={onBackToHub}
          className="p-2 rounded-xl text-[#73726c] hover:text-[#141413] hover:bg-[#faf9f5] border border-[#e5e3dc] transition-all cursor-pointer shrink-0"
          title="Cambiar de plataforma / Salir"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}
