import React from 'react';
import { 
  BarChart3, 
  Award, 
  PackageSearch, 
  DollarSign, 
  Truck, 
  AlertTriangle, 
  CheckCircle2, 
  UploadCloud, 
  RefreshCw,
  Calculator,
  ShieldCheck,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import KpiCard from '../ui/KpiCard';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

export default function MeliDashboard({
  health,
  stats,
  analyticsData,
  onNavigateToTab,
  onRefreshHealth,
  refreshing = false
}) {
  const isConnected = health?.token_valid;

  return (
    <div className="flex flex-col gap-6">
      {/* KPI Cards Superiores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Backend Status */}
        <KpiCard
          title="Estado Backend"
          value={health.status ? health.status.toUpperCase() : 'CHECKING'}
          subtitle={`Cuenta: ${health.nickname || 'Sin Autenticar'}`}
          icon={RefreshCw}
          colorScheme={isConnected ? 'success' : 'error'}
          badge={
            <Badge variant={isConnected ? 'success' : 'error'} dot size="sm">
              {isConnected ? 'API Online' : 'Desconectado'}
            </Badge>
          }
        />

        {/* Reputación */}
        <KpiCard
          title="Reputación MeLi"
          value={
            analyticsData?.reputation_level 
              ? analyticsData.reputation_level.replace('_', ' ').toUpperCase() 
              : (stats?.reputacion_nivel?.toUpperCase() || 'VERDE')
          }
          subtitle={analyticsData?.power_seller_status ? `MercadoLíder ${analyticsData.power_seller_status}` : 'Vendedor Confiable'}
          icon={Award}
          colorScheme="success"
        />

        {/* Publicaciones Activas */}
        <KpiCard
          title="Publicaciones Activas"
          value={analyticsData?.total_active_listings ?? stats?.publicaciones_activas ?? '0'}
          subtitle={`Pausadas: ${analyticsData?.total_paused_listings ?? stats?.publicaciones_pausadas ?? 0}`}
          icon={PackageSearch}
          onClick={() => onNavigateToTab('items')}
        />

        {/* Valuación Catálogo */}
        <KpiCard
          title="Valuación Catálogo"
          value={`$${(analyticsData?.total_inventory_valuation ?? stats?.valor_total_inventario ?? 0).toLocaleString('es-AR')}`}
          subtitle={`Promedio: $${(analyticsData?.average_price ?? stats?.precio_promedio ?? 0).toLocaleString('es-AR')}`}
          icon={DollarSign}
        />
      </div>

      {/* Sección Rendimiento, Envíos y Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Métricas de Rendimiento */}
        <Card
          title="Métricas de Rendimiento y Reputación"
          subtitle="Historial y estadísticas de ventas de Mercado Libre"
          icon={BarChart3}
          badge={<Badge variant="outline" size="sm">Período 365 días</Badge>}
          className="lg:col-span-2"
        >
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-[#faf9f5] border border-[#e5e3dc] rounded-2xl">
                <span className="text-[11px] font-bold text-[#73726c] block">Ventas Completadas</span>
                <span className="text-xl font-black font-mono text-[#141413] mt-1 block">
                  {analyticsData?.sales_completed ?? 0}
                </span>
                <span className="text-[10px] text-[#73726c]">Transacciones exitosas</span>
              </div>

              <div className="p-3.5 bg-[#faf9f5] border border-[#e5e3dc] rounded-2xl">
                <span className="text-[11px] font-bold text-[#73726c] block">Tasa de Reclamos</span>
                <span className={`text-xl font-black font-mono mt-1 block ${
                  (analyticsData?.claims_rate ?? 0) <= 2.0 ? 'text-[#15803d]' : 'text-[#b91c1c]'
                }`}>
                  {analyticsData?.claims_rate ?? 0.0}%
                </span>
                <span className="text-[10px] text-[#73726c]">Objetivo: &lt; 2.0%</span>
              </div>

              <div className="p-3.5 bg-[#faf9f5] border border-[#e5e3dc] rounded-2xl">
                <span className="text-[11px] font-bold text-[#73726c] block">Envíos con Demora</span>
                <span className={`text-xl font-black font-mono mt-1 block ${
                  (analyticsData?.delayed_handling_rate ?? 0) <= 15.0 ? 'text-[#15803d]' : 'text-[#141413]'
                }`}>
                  {analyticsData?.delayed_handling_rate ?? 0.0}%
                </span>
                <span className="text-[10px] text-[#73726c]">Despacho a tiempo</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-[#15803d]" />
                <div>
                  <span className="font-bold text-xs text-[#14532d] block">Cobertura de Envío Gratis Me2</span>
                  <span className="text-[11px] text-[#166534]">Publicaciones con Mercado Envíos bonificado</span>
                </div>
              </div>
              <span className="text-xl font-black font-mono text-[#15803d]">
                {analyticsData?.free_shipping_pct ?? stats?.porcentaje_envio_gratis ?? 0}%
              </span>
            </div>
          </div>
        </Card>

        {/* Panel de Alertas Operativas */}
        <Card
          title="Alertas Operativas"
          subtitle="Estado del catálogo y sincronización"
          icon={AlertTriangle}
          badge={
            <Badge variant={analyticsData?.alerts_count > 0 ? 'error' : 'success'} size="sm">
              {analyticsData?.alerts_count ?? 0}
            </Badge>
          }
        >
          <div className="flex flex-col gap-2.5 overflow-y-auto max-h-56">
            {(!analyticsData?.alerts || analyticsData.alerts.length === 0) ? (
              <div className="py-8 text-center text-[#73726c] text-xs flex flex-col items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-[#15803d]" />
                <span>Todo en orden. No hay alertas críticas en la cuenta.</span>
              </div>
            ) : (
              analyticsData.alerts.map((al, idx) => (
                <div 
                  key={idx} 
                  className={`p-3 rounded-xl border text-xs flex flex-col gap-0.5 ${
                    al.type === 'danger' 
                      ? 'bg-[#fef2f2] border-[#fecaca] text-[#7f1d1d]' 
                      : 'bg-[#faf9f5] border-[#e5e3dc] text-[#141413]'
                  }`}
                >
                  <span className="font-bold">{al.title}</span>
                  <p className="text-[11px] opacity-90">{al.message}</p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Accesos Rápidos Operativos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          title="Sincronizador ERP"
          subtitle="Actualización masiva de precios desde CSV"
          icon={UploadCloud}
          footer={
            <Button variant="primary" size="sm" fullWidth onClick={() => onNavigateToTab('sync')}>
              Abrir Sincronizador
            </Button>
          }
        >
          <p className="text-xs text-[#73726c] leading-relaxed">
            Sube el archivo <code className="bg-[#faf9f5] px-1.5 py-0.5 rounded border border-[#e5e3dc] font-mono text-[#141413]">erp_precios.csv</code> y actualiza automáticamente los precios en Mercado Libre con bypass de error 400.
          </p>
        </Card>

        <Card
          title="Auditoría Financiera"
          subtitle="Control de neto en mano vs costo ERP"
          icon={ShieldCheck}
          footer={
            <Button variant="secondary" size="sm" fullWidth onClick={() => onNavigateToTab('audit')}>
              Revisar Auditoría
            </Button>
          }
        >
          <p className="text-xs text-[#73726c] leading-relaxed">
            Detecta desviaciones donde las comisiones e impuestos de Mercado Libre reduzcan el margen neto por debajo del precio mostrador del ERP.
          </p>
        </Card>

        <Card
          title="Simulador de Precios"
          subtitle="Cálculo exacto con comisiones y envíos"
          icon={Calculator}
          footer={
            <Button variant="secondary" size="sm" fullWidth onClick={() => onNavigateToTab('calculator')}>
              Simular Precio
            </Button>
          }
        >
          <p className="text-xs text-[#73726c] leading-relaxed">
            Calcula el precio publicado ideal ingresando costo base, categoría MeLi, IIBB y bonificación de Mercado Envíos.
          </p>
        </Card>
      </div>
    </div>
  );
}
