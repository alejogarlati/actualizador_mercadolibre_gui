import React, { useState } from 'react';
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
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
  Moon
} from 'lucide-react';

export default function Sidebar({
  selectedPlatform,
  activeTab,
  onSelectTab,
  onBackToHub,
  theme = 'light',
  onToggleTheme
}) {
  const isTN = selectedPlatform === 'tiendanube';
  const isDark = theme === 'dark';

  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed_mode') === 'true';
  });

  const toggleCollapsed = () => {
    setCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed_mode', String(next));
      return next;
    });
  };

  const navItems = isTN ? [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'items', label: 'Catálogo de Variantes', icon: Layers },
    { id: 'categories', label: 'Reglas por Categoría', icon: Percent },
    { id: 'audit', label: 'Auditoría de Precios', icon: ShieldCheck },
    { id: 'sync', label: 'Sincronizador ERP', icon: UploadCloud }
  ] : [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'items', label: 'Publicaciones', icon: PackageSearch },
    { id: 'sync', label: 'Sincronizador ERP', icon: UploadCloud },
    { id: 'audit', label: 'Auditoría de Precios', icon: ShieldCheck },
    { id: 'calculator', label: 'Calculadora & Simulador', icon: Calculator },
    { id: 'rules', label: 'Configuración', icon: SettingsIcon }
  ];

  return (
    <aside className={`${
      collapsed ? 'w-18' : 'w-64'
    } bg-white dark:bg-[#1c1c1a] border-r border-[#e5e3dc] dark:border-[#2d2d2a] flex flex-col p-3 shrink-0 justify-between select-none transition-all duration-200 z-20 overflow-hidden`}>
      <div className="flex flex-col gap-4">
        
        {/* CABECERA (EXPANDIDA / COLAPSADA) */}
        {collapsed ? (
          <div className="flex flex-col items-center gap-2 pb-3 border-b border-[#ece9df] dark:border-[#2d2d2a]">
            {/* Logo en modo colapsado */}
            <div 
              className="p-2 bg-[#141413] dark:bg-[#faf9f5] text-white dark:text-[#141413] rounded-xl shadow-xs flex items-center justify-center border border-[#141413] dark:border-[#faf9f5]"
              title={isTN ? 'Sync Tiendanube' : 'Sync Mercado Libre'}
            >
              {isTN ? <ShoppingBag className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
            </div>

            {/* Botón de expandir */}
            <button
              type="button"
              onClick={toggleCollapsed}
              className="p-2 rounded-xl text-[#73726c] dark:text-[#a3a199] hover:text-[#141413] dark:hover:text-[#faf9f5] hover:bg-[#f4f2eb] dark:hover:bg-[#262624] border border-[#e5e3dc] dark:border-[#363633] transition-colors cursor-pointer w-full flex items-center justify-center"
              title="Expandir barra lateral"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>

            {/* Botón cambiar canal */}
            <button
              type="button"
              onClick={onBackToHub}
              className="p-2 rounded-xl text-[#73726c] dark:text-[#a3a199] hover:text-[#141413] dark:hover:text-[#faf9f5] hover:bg-[#f4f2eb] dark:hover:bg-[#262624] border border-[#e5e3dc] dark:border-[#363633] transition-colors cursor-pointer w-full flex items-center justify-center"
              title="Cambiar de canal / Volver al inicio"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 pb-3 border-b border-[#ece9df] dark:border-[#2d2d2a]">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 bg-[#141413] dark:bg-[#faf9f5] text-white dark:text-[#141413] rounded-xl shadow-xs flex items-center justify-center border border-[#141413] dark:border-[#faf9f5] shrink-0">
                  {isTN ? <ShoppingBag className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <h1 className="font-black text-xs text-[#141413] dark:text-[#faf9f5] leading-tight tracking-tight truncate">
                    {isTN ? 'Sync Tiendanube' : 'Sync MeLi'}
                  </h1>
                  <p className="text-[9.5px] text-[#73726c] dark:text-[#a3a199] font-bold uppercase tracking-wider truncate">
                    Corralón Aconquija
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={toggleCollapsed}
                className="p-1.5 rounded-lg text-[#73726c] dark:text-[#a3a199] hover:text-[#141413] dark:hover:text-[#faf9f5] hover:bg-[#f4f2eb] dark:hover:bg-[#262624] border border-[#e5e3dc] dark:border-[#363633] transition-colors cursor-pointer shrink-0"
                title="Colapsar barra lateral"
              >
                <PanelLeftClose className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Botón Volver al Hub */}
            <button
              onClick={onBackToHub}
              className="flex items-center justify-center gap-2 w-full py-1.5 px-2 rounded-xl text-xs font-bold text-[#73726c] dark:text-[#a3a199] bg-[#faf9f5] dark:bg-[#262624] hover:bg-[#f2efe6] dark:hover:bg-[#30302d] hover:text-[#141413] dark:hover:text-[#faf9f5] border border-[#e5e3dc] dark:border-[#363633] transition-all cursor-pointer"
              title="Volver a la selección de canales"
            >
              <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Cambiar Canal</span>
            </button>
          </div>
        )}

        {/* MENÚ DE NAVEGACIÓN */}
        <nav className="flex flex-col gap-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  collapsed ? 'justify-center px-0 h-10 w-full' : ''
                } ${
                  isActive 
                    ? 'bg-[#141413] dark:bg-[#faf9f5] text-white dark:text-[#141413] shadow-xs' 
                    : 'text-[#73726c] dark:text-[#a3a199] hover:bg-[#faf9f5] dark:hover:bg-[#262624] hover:text-[#141413] dark:hover:text-[#faf9f5]'
                }`}
                title={item.label}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* FOOTER */}
      <div className={`pt-3 border-t border-[#ece9df] dark:border-[#2d2d2a] flex items-center gap-2 ${collapsed ? 'flex-col' : 'justify-between'}`}>
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className={`flex items-center justify-center gap-2 p-2 rounded-xl text-xs font-bold text-[#73726c] dark:text-[#a3a199] bg-[#faf9f5] dark:bg-[#262624] hover:bg-[#f2efe6] dark:hover:bg-[#30302d] hover:text-[#141413] dark:hover:text-[#faf9f5] border border-[#e5e3dc] dark:border-[#363633] transition-colors cursor-pointer ${
              collapsed ? 'w-full h-10' : 'p-2'
            }`}
            title={isDark ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400 shrink-0" /> : <Moon className="w-4 h-4 shrink-0" />}
          </button>
        )}

        {!isTN && (
          <button
            onClick={() => onSelectTab('rules')}
            className={`flex items-center justify-center gap-2 p-2 rounded-xl text-xs font-bold text-[#73726c] dark:text-[#a3a199] bg-[#faf9f5] dark:bg-[#262624] hover:bg-[#f2efe6] dark:hover:bg-[#30302d] hover:text-[#141413] dark:hover:text-[#faf9f5] border border-[#e5e3dc] dark:border-[#363633] transition-colors cursor-pointer ${
              collapsed ? 'w-full h-10' : 'flex-1'
            }`}
            title="Ajustes y Configuración"
          >
            <SettingsIcon className="w-4 h-4 shrink-0" />
            {!collapsed && <span className="truncate">Ajustes</span>}
          </button>
        )}

        <button
          onClick={onBackToHub}
          className={`p-2 rounded-xl text-[#73726c] dark:text-[#a3a199] hover:text-[#141413] dark:hover:text-[#faf9f5] hover:bg-[#faf9f5] dark:hover:bg-[#262624] border border-[#e5e3dc] dark:border-[#363633] transition-all cursor-pointer shrink-0 ${
            collapsed ? 'w-full h-10 flex items-center justify-center' : ''
          }`}
          title="Cambiar de plataforma / Salir"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
