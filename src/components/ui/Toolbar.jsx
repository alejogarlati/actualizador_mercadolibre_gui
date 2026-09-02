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
    <div className={`bg-white dark:bg-[#1c1c1a] border border-[#e5e3dc] dark:border-[#2d2d2a] rounded-2xl p-3.5 shadow-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 ${className}`}>
      <div className="flex flex-1 flex-wrap items-center gap-2.5 min-w-0">
        {/* Search Input */}
        {onSearchChange && (
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="w-3.5 h-3.5 text-[#73726c] dark:text-[#a3a199] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-[#faf9f5] dark:bg-[#262624] hover:bg-[#f2efe6] dark:hover:bg-[#2d2d2a] focus:bg-white dark:focus:bg-[#1c1c1a] text-xs text-[#141413] dark:text-[#faf9f5] pl-8 pr-7 py-2 rounded-xl border border-[#e5e3dc] dark:border-[#363633] focus:border-[#141413] dark:focus:border-[#faf9f5] focus:ring-1 focus:ring-[#141413] dark:focus:ring-[#faf9f5] focus:outline-none transition-all placeholder:text-[#9c998f] dark:placeholder:text-[#6b6960] font-medium"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#73726c] dark:text-[#a3a199] hover:text-[#141413] dark:hover:text-[#faf9f5] p-0.5 rounded cursor-pointer"
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
          <div className="hidden lg:flex items-center text-[11px] font-mono text-[#73726c] dark:text-[#a3a199] bg-[#faf9f5] dark:bg-[#262624] px-2.5 py-1.5 rounded-xl border border-[#e5e3dc] dark:border-[#363633]">
            <span>
              {filteredCount !== null && filteredCount !== totalItems ? (
                <>Mostrando <strong className="text-[#141413] dark:text-[#faf9f5]">{filteredCount}</strong> de {totalItems}</>
              ) : (
                <><strong className="text-[#141413] dark:text-[#faf9f5]">{totalItems}</strong> registros</>
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
