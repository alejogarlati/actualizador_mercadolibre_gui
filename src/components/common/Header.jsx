import React from 'react';
import { RefreshCw, Settings as SettingsIcon, LogOut } from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

export default function Header({
  selectedPlatform,
  activeTab,
  meliHealth,
  tnHealth,
  onRefreshHealth,
  healthRefreshing = false,
  onOpenSettings,
  onBackToHub
}) {
  const isTN = selectedPlatform === 'tiendanube';

  const getTabTitle = () => {
    if (isTN) {
      switch (activeTab) {
        case 'items': return 'Catálogo de Variantes Tiendanube';
        case 'categories': return 'Reglas de Descuento por Categoría';
        case 'audit': return 'Auditoría de Precios ERP vs Tiendanube';
        case 'sync': return 'Sincronizador Masivo ERP';
        default: return 'Panel Tiendanube • Nuvemshop';
      }
    } else {
      switch (activeTab) {
        case 'dashboard': return 'Panel de Control & Analíticas';
        case 'items': return 'Inventario de Publicaciones';
        case 'sync': return 'Sincronizador Masivo desde ERP';
        case 'audit': return 'Auditoría de Neto a Recibir';
        case 'calculator': return 'Calculadora & Simulador Estratégico';
        case 'rules': return 'Configuración del Sistema';
        default: return 'Panel Mercado Libre';
      }
    }
  };

  const getTabSubtitle = () => {
    if (isTN) {
      return 'Gestión unificada de variantes, matriz de atributos y sincronización de precios ERP con Nuvemshop';
    }
    return 'Gestión automatizada de precios, márgenes y analíticas para Mercado Libre';
  };

  const isConnected = isTN ? tnHealth?.status === 'online' : meliHealth?.token_valid;

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#e5e3dc] gap-4 shrink-0">
      <div>
        <h2 className="text-xl font-bold text-[#141413] tracking-tight">
          {getTabTitle()}
        </h2>
        <p className="text-[11px] text-[#73726c] mt-0.5 font-medium">
          {getTabSubtitle()}
        </p>
      </div>

      {/* Badges de Conexión & Acciones */}
      <div className="flex items-center gap-2 self-end md:self-auto">
        <Badge variant={isConnected ? 'success' : 'error'} dot size="md">
          {isTN 
            ? (isConnected ? `Tienda #${tnHealth?.store_id || '8145042'}` : 'Tiendanube Desconectado')
            : (isConnected ? `Conectado (${meliHealth?.nickname || 'Vendedor'})` : 'Backend / Token Expirado')
          }
        </Badge>

        <Button
          variant="secondary"
          size="sm"
          onClick={onRefreshHealth}
          loading={healthRefreshing}
          icon={RefreshCw}
          title="Recomprobar conexión"
        >
          <span className="hidden sm:inline">Verificar</span>
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={onOpenSettings}
          icon={SettingsIcon}
          title="Configuración"
        >
          <span className="hidden sm:inline">Ajustes</span>
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={onBackToHub}
          icon={LogOut}
          title="Cambiar de canal / Inicio"
        />
      </div>
    </header>
  );
}
