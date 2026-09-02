import React from 'react';
import { Search, X, RefreshCw } from 'lucide-react';
import Button from './Button';

export default function Toolbar({
  searchTerm = '',
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  filters = null,
  actions = null,
  onRefresh = null,
  refreshing = false,
  refreshTitle = 'Refrescar',
  totalItems = null,
  filteredCount = null,
  className = '',
  children
}) {
  return (
    <div className={`bg-white border border-[#e5e3dc] rounded-2xl p-3.5 shadow-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 ${className}`}>
      <div className="flex flex-1 flex-wrap items-center gap-2.5 min-w-0">
        {/* Search Input */}
        {onSearchChange && (
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="w-3.5 h-3.5 text-[#73726c] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-[#faf9f5] hover:bg-[#f2efe6] focus:bg-white text-xs text-[#141413] pl-8 pr-7 py-2 rounded-xl border border-[#e5e3dc] focus:border-[#141413] focus:ring-1 focus:ring-[#141413] focus:outline-none transition-all placeholder:text-[#9c998f] font-medium"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#73726c] hover:text-[#141413] p-0.5 rounded cursor-pointer"
                title="Limpiar búsqueda"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Filter slots */}
        {filters}
        {children}
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
        {totalItems !== null && (
          <div className="hidden lg:flex items-center text-[11px] font-mono text-[#73726c] bg-[#faf9f5] px-2.5 py-1.5 rounded-xl border border-[#e5e3dc]">
            <span>
              {filteredCount !== null && filteredCount !== totalItems ? (
                <>Mostrando <strong className="text-[#141413]">{filteredCount}</strong> de {totalItems}</>
              ) : (
                <><strong className="text-[#141413]">{totalItems}</strong> registros</>
              )}
            </span>
          </div>
        )}

        {actions}

        {onRefresh && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onRefresh}
            loading={refreshing}
            icon={RefreshCw}
            title={refreshTitle}
          >
            <span className="hidden sm:inline">{refreshTitle}</span>
          </Button>
        )}
      </div>
    </div>
  );
}
