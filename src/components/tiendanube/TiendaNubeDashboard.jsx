import React from 'react';
import { 
  ShoppingBag, 
  CheckCircle2, 
  AlertTriangle, 
  Package, 
  DollarSign, 
  RefreshCw, 
  UploadCloud, 
  Plus, 
  Layers
} from 'lucide-react';
import KpiCard from '../ui/KpiCard';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

export default function TiendaNubeDashboard({ 
  health, 
  metrics, 
  onRefreshCatalog, 
  onNavigateToSync, 
  onOpenCreateModal, 
  onNavigateToCatalog,
  loading = false 
}) {
  const isOnline = health?.status === 'online';

  return (
    <div className="flex flex-col gap-6">
      {/* Banner de Estado de Conexión */}
      <Card
        title={health?.store_name || 'Tienda Nuvemshop'}
        subtitle={`ID de Tienda: #${health?.store_id || '8145042'} • API REST v1 Oficial • Catálogo en SQLite`}
        icon={ShoppingBag}
        badge={
          <Badge variant={isOnline ? 'success' : 'error'} dot size="sm">
            {isOnline ? 'Conectado a la API' : 'Desconectado'}
          </Badge>
        }
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={onRefreshCatalog}
              loading={loading}
              icon={RefreshCw}
            >
              Refrescar Catálogo
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={onOpenCreateModal}
              icon={Plus}
            >
              Nuevo Producto
            </Button>
          </div>
        }
      >
        <p className="text-xs text-[#73726c] leading-relaxed">
          Catálogo sincronizado localmente para consultas instantáneas y actualizaciones masivas con rate limit inteligente (*Leaky Bucket*).
        </p>
      </Card>

      {/* Tarjetas KPI de Inventario */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Productos */}
        <KpiCard
          title="Total Productos"
          value={metrics?.total_products || 0}
          subtitle="Sincronizados en base local"
          icon={Package}
          onClick={onNavigateToCatalog}
        />

        {/* Productos Activos */}
        <KpiCard
          title="Publicados / Activos"
          value={metrics?.active_products || 0}
          subtitle="Visibles en la tienda online"
          icon={CheckCircle2}
          colorScheme="success"
        />

        {/* Sin Stock */}
        <KpiCard
          title="Sin Stock (Agotados)"
          value={metrics?.out_of_stock || 0}
          subtitle="Requieren reposición"
          icon={AlertTriangle}
          colorScheme={metrics?.out_of_stock > 0 ? 'error' : 'default'}
        />

        {/* Valuación Inventario */}
        <KpiCard
          title="Valuación Inventario"
          value={`$${(metrics?.total_valuation || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`}
          subtitle="Valor total según stock activo"
          icon={DollarSign}
        />
      </div>

      {/* Accesos Rápidos y Operatoria */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sincronización Masiva */}
        <Card
          title="Sincronización Masiva ERP"
          subtitle="Actualiza precios de lista, ofertas y existencias desde CSV"
          icon={UploadCloud}
          footer={
            <>
              <span className="text-[11px] text-[#73726c] font-mono">Rate Limit: 2 req/s</span>
              <Button
                variant="primary"
                size="sm"
                icon={UploadCloud}
                onClick={onNavigateToSync}
              >
                Abrir Sincronizador ERP
              </Button>
            </>
          }
        >
          <p className="text-xs text-[#73726c] dark:text-[#a3a199] leading-relaxed">
            Cruza los códigos SKU de <code className="bg-[#faf9f5] dark:bg-[#262624] border border-[#e5e3dc] dark:border-[#363633] px-1.5 py-0.5 rounded text-[#141413] dark:text-[#faf9f5] font-mono">erp_precios.csv</code> con el catálogo de Tiendanube, aplicando márgenes porcentuales y actualizando las variantes en segundo plano.
          </p>
        </Card>

        {/* Explorador de Catálogo */}
        <Card
          title="Explorador de Catálogo y Variantes"
          subtitle="Control visual de artículos, precios tachados y atributos"
          icon={Layers}
          footer={
            <>
              <span className="text-[11px] text-[#73726c] font-mono">Multilingüe (ES)</span>
              <Button
                variant="secondary"
                size="sm"
                icon={Package}
                onClick={onNavigateToCatalog}
              >
                Ver Catálogo Completo
              </Button>
            </>
          }
        >
          <p className="text-xs text-[#73726c] leading-relaxed">
            Consulta las publicaciones de Tiendanube con búsqueda por SKU, edición rápida de precios y stock, y constructor de variantes con combinaciones de atributos.
          </p>
        </Card>
      </div>
    </div>
  );
}
