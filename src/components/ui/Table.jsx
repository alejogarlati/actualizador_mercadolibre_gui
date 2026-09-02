import React from 'react';
import { ArrowUpDown, RefreshCw, PackageX } from 'lucide-react';

export default function Table({
  columns = [], // [{ key, label, align: 'left'|'center'|'right', width, sortable, renderHeader }]
  data = [],
  loading = false,
  emptyMessage = 'No se encontraron registros',
  emptySubMessage = 'Intenta ajustar los filtros de búsqueda.',
  sortBy = null,
  sortOrder = 'asc',
  onSort = null,
  renderRow,
  keyExtractor = (item, idx) => item.id || idx,
  className = '',
  tableClassName = '',
}) {
  return (
    <div className={`bg-white border border-[#e5e3dc] rounded-2xl shadow-card overflow-hidden flex flex-col ${className}`}>
      <div className="overflow-x-auto">
        <table className={`w-full text-left border-collapse text-xs ${tableClassName}`}>
          <thead>
            <tr className="bg-[#faf9f5] border-b border-[#e5e3dc] text-[#73726c] font-bold uppercase tracking-wider text-[10.5px] select-none">
              {columns.map((col) => {
                const isCurrentSort = sortBy === col.key;
                const alignClass = 
                  col.align === 'right' ? 'text-right justify-end' :
                  col.align === 'center' ? 'text-center justify-center' :
                  'text-left justify-start';

                return (
                  <th
                    key={col.key}
                    style={{ width: col.width }}
                    onClick={() => col.sortable && onSort && onSort(col.key)}
                    className={`py-3 px-3.5 ${
                      col.sortable ? 'cursor-pointer hover:bg-[#f2efe6] transition-colors' : ''
                    }`}
                  >
                    <div className={`flex items-center gap-1 ${alignClass}`}>
                      <span>{col.label}</span>
                      {col.sortable && (
                        <span className={`text-[10px] ${isCurrentSort ? 'text-[#141413] font-black' : 'text-[#9c998f]'}`}>
                          {isCurrentSort ? (sortOrder === 'asc' ? '▲' : '▼') : '↕'}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#ece9df] text-[#141413]">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="py-16 text-center text-[#73726c]">
                  <div className="flex flex-col items-center justify-center gap-2.5">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#141413]" />
                    <span className="font-semibold text-xs text-[#141413]">Cargando datos...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-14 text-center text-[#73726c]">
                  <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                    <PackageX className="w-9 h-9 text-[#9c998f]" />
                    <p className="text-xs font-bold text-[#141413]">{emptyMessage}</p>
                    {emptySubMessage && (
                      <p className="text-[11px] text-[#73726c]">{emptySubMessage}</p>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, index) => renderRow(item, index))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
