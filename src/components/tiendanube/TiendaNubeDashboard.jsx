import React from 'react';
import { 
  ShoppingBag, 
  CheckCircle2, 
  AlertCircle, 
  Package, 
  Layers, 
  DollarSign, 
  RefreshCw, 
  UploadCloud, 
  Plus, 
  ExternalLink,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

export default function TiendaNubeDashboard({ 
  health, 
  metrics, 
  onRefreshCatalog, 
  onOpenSync, 
  onOpenCreateModal, 
  onNavigateToCatalog,
  loading 
}) {
  const isOnline = health?.status === 'online';

  return (
    <div className="space-y-6">
      {/* Banner de Estado de Conexión de Tienda */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-900 to-blue-950/40 p-5 rounded-2xl border border-gray-800 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl border ${isOnline ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
            <ShoppingBag className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">
                {health?.store_name || 'Tienda Nuvemshop'}
              </h2>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                isOnline ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></span>
                {isOnline ? 'Online / Conectado' : 'Desconectado'}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              ID de Tienda: <span className="text-gray-300 font-mono font-medium">#{health?.store_id || '8145042'}</span> • API REST v1 Oficial
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={onRefreshCatalog}
            disabled={loading}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-400' : ''}`} />
            <span>Refrescar Catálogo</span>
          </button>

          <button
            onClick={onOpenCreateModal}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      {/* Tarjetas KPI de Rendimiento e Inventario */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Productos */}
        <div className="bg-gray-900 p-5 rounded-2xl border border-gray-800/80 shadow-md">
          <div className="flex items-center justify-between text-gray-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Total Productos</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {metrics?.total_products || 0}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-2">
            <span>Sincronizados en caché local</span>
          </div>
        </div>

        {/* Productos Activos */}
        <div className="bg-gray-900 p-5 rounded-2xl border border-gray-800/80 shadow-md">
          <div className="flex items-center justify-between text-gray-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Publicados / Activos</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {metrics?.active_products || 0}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-2">
            <span>Visibles para los clientes en la tienda</span>
          </div>
        </div>

        {/* Productos Sin Stock */}
        <div className="bg-gray-900 p-5 rounded-2xl border border-gray-800/80 shadow-md">
          <div className="flex items-center justify-between text-gray-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Sin Stock (Agotados)</span>
            <div className={`p-2 rounded-lg ${metrics?.out_of_stock > 0 ? 'bg-amber-500/10 text-amber-400' : 'bg-gray-800 text-gray-400'}`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-black font-mono ${metrics?.out_of_stock > 0 ? 'text-amber-400' : 'text-gray-300'}`}>
            {metrics?.out_of_stock || 0}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-2">
            <span>Requieren reposición de depósito</span>
          </div>
        </div>

        {/* Valuación de Inventario */}
        <div className="bg-gray-900 p-5 rounded-2xl border border-gray-800/80 shadow-md">
          <div className="flex items-center justify-between text-gray-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Valuación Inventario</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-400 font-mono">
            ${(metrics?.total_valuation || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-2">
            <span>Monto total según stock y precio activo</span>
          </div>
        </div>
      </div>

      {/* Accesos Rápidos y Panel Operativo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card Sincronización Masiva ERP */}
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Sincronización Masiva ERP</h3>
                <p className="text-xs text-gray-400">Actualiza precios de lista, ofertas y stock de mostrador desde CSV</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3 leading-relaxed">
              Carga tu archivo <code className="bg-gray-800 px-1.5 py-0.5 rounded text-blue-300 font-mono">erp_precios.csv</code> para cruzar por SKU con Tiendanube, aplicando márgenes porcentuales y actualizando las variantes en segundo plano.
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-gray-800/80 flex items-center justify-between">
            <span className="text-xs text-gray-500 font-mono">Rate Limit: 2 req/s Leaky Bucket</span>
            <button
              onClick={onOpenSync}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 transition-all"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Sincronizar Ahora</span>
            </button>
          </div>
        </div>

        {/* Card Gestión de Catálogo */}
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Explorador de Catálogo y Variantes</h3>
                <p className="text-xs text-gray-400">Control visual de artículos, precios tachados y hasta 3 atributos</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3 leading-relaxed">
              Visualiza tus publicaciones de Tiendanube con búsqueda por SKU, edición rápida en línea de precios y stock, y constructor de variantes con combinaciones de color, medidas y espesor.
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-gray-800/80 flex items-center justify-between">
            <span className="text-xs text-gray-500 font-mono">Soporte Multilingüe (ES)</span>
            <button
              onClick={onNavigateToCatalog}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition-all"
            >
              <Package className="w-4 h-4" />
              <span>Ver Catálogo Completo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
