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
    <div className="flex flex-col gap-6">
      {/* Banner de Estado de Conexión de Tienda */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`p-3.5 rounded-2xl border ${
            isOnline 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
              : 'bg-red-50 border-red-200 text-red-600'
          }`}>
            <ShoppingBag className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                {health?.store_name || 'Tienda Nuvemshop'}
              </h2>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                isOnline 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-red-50 text-red-700 border-red-200'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                {isOnline ? 'Conectado a la API' : 'Desconectado'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              ID de Tienda: <span className="text-slate-800 font-mono font-semibold">#{health?.store_id || '8145042'}</span> • API REST v1 Oficial • Catálogo en SQLite Local
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={onRefreshCatalog}
            disabled={loading}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-red-600' : 'text-slate-500'}`} />
            <span>Refrescar Catálogo</span>
          </button>

          <button
            onClick={onOpenCreateModal}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-200 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      {/* Tarjetas KPI de Rendimiento e Inventario */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Productos */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Productos</span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900 font-mono">
            {metrics?.total_products || 0}
          </span>
          <p className="text-xs text-slate-500">Sincronizados en base local</p>
        </div>

        {/* Productos Activos */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Publicados / Activos</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-emerald-600 font-mono">
            {metrics?.active_products || 0}
          </span>
          <p className="text-xs text-slate-500">Visibles en la tienda online</p>
        </div>

        {/* Productos Sin Stock */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sin Stock (Agotados)</span>
            <div className={`p-2 rounded-xl ${metrics?.out_of_stock > 0 ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-400'}`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <span className={`text-2xl font-black font-mono ${metrics?.out_of_stock > 0 ? 'text-red-600' : 'text-slate-700'}`}>
            {metrics?.out_of_stock || 0}
          </span>
          <p className="text-xs text-slate-500">Requieren reposición</p>
        </div>

        {/* Valuación de Inventario */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Valuación Inventario</span>
            <div className="p-2 rounded-xl bg-red-50 text-red-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900 font-mono">
            ${(metrics?.total_valuation || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </span>
          <p className="text-xs text-slate-500">Valor total según stock activo</p>
        </div>
      </div>

      {/* Accesos Rápidos y Panel Operativo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card Sincronización Masiva ERP */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Sincronización Masiva ERP</h3>
                <p className="text-xs text-slate-500">Actualiza precios de lista, ofertas y existencias desde CSV</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 mt-3 leading-relaxed">
              Cruza los códigos SKU de <code className="bg-slate-100 px-1.5 py-0.5 rounded text-red-600 font-mono">erp_precios.csv</code> con el catálogo de Tiendanube, aplicando márgenes porcentuales y actualizando las variantes en segundo plano con control de rate limit (*Leaky Bucket*).
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">Rate Limit: 2 req/s</span>
            <button
              onClick={onOpenSync}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-200 transition-all"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Sincronizar Ahora</span>
            </button>
          </div>
        </div>

        {/* Card Gestión de Catálogo */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-slate-100 text-slate-700 rounded-xl">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Explorador de Catálogo y Variantes</h3>
                <p className="text-xs text-slate-500">Control visual de artículos, precios tachados y hasta 3 atributos</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 mt-3 leading-relaxed">
              Consulta las publicaciones de Tiendanube con búsqueda por SKU, edición rápida de precios y stock, y constructor de variantes con combinaciones de color, medidas y espesor.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">Soporte Multilingüe (ES)</span>
            <button
              onClick={onNavigateToCatalog}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-sm"
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
