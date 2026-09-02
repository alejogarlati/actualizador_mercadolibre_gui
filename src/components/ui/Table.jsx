import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowUpDown, RefreshCw, PackageX } from 'lucide-react';

export default function Table({
  columns = [], // [{ key, label, align: 'left'|'center'|'right', width, minWidth, sortable, renderHeader }]
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
  resizable = true
}) {
  // Inicializar anchos numéricos de columnas
  const parseWidth = (w) => {
    if (typeof w === 'number') return w;
    if (typeof w === 'string') {
      const num = parseInt(w, 10);
      return isNaN(num) ? 150 : num;
    }
    return 150;
  };

  const [colWidths, setColWidths] = useState(() => {
    const initial = {};
    columns.forEach(col => {
      initial[col.key] = parseWidth(col.width);
    });
    return initial;
  });

  // Resincronizar si cambian las columnas
  useEffect(() => {
    setColWidths(prev => {
      const next = { ...prev };
      columns.forEach(col => {
        if (!next[col.key]) {
          next[col.key] = parseWidth(col.width);
        }
      });
      return next;
    });
  }, [columns]);

  // Manejo del redimensionamiento por arrastre
  const resizingCol = useRef(null);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const handleMouseDown = (colKey, e) => {
    e.preventDefault();
    e.stopPropagation();
    resizingCol.current = colKey;
    startX.current = e.clientX;
    startWidth.current = colWidths[colKey] || 150;

    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';

    const handleMouseMove = (moveEvent) => {
      if (!resizingCol.current) return;
      const deltaX = moveEvent.clientX - startX.current;
      const minW = columns.find(c => c.key === resizingCol.current)?.minWidth || 50;
      const newWidth = Math.max(minW, startWidth.current + deltaX);

      setColWidths(prev => ({
        ...prev,
        [resizingCol.current]: newWidth
      }));
    };

    const handleMouseUp = () => {
      resizingCol.current = null;
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const totalTableWidth = columns.reduce((acc, col) => acc + (colWidths[col.key] || 150), 0);

  return (
    <div className={`bg-white border border-[#e5e3dc] rounded-2xl shadow-card overflow-hidden flex flex-col ${className}`}>
      <div className="overflow-x-auto">
        <table 
          className={`w-full text-left border-collapse text-xs table-fixed ${tableClassName}`}
          style={{ minWidth: `${Math.max(totalTableWidth, 800)}px` }}
        >
          <colgroup>
            {columns.map(col => (
              <col 
                key={col.key} 
                style={{ width: `${colWidths[col.key] || 150}px` }} 
              />
            ))}
          </colgroup>

          <thead>
            <tr className="bg-[#faf9f5] border-b border-[#e5e3dc] text-[#73726c] font-bold uppercase tracking-wider text-[10.5px] select-none">
              {columns.map((col, index) => {
                const isCurrentSort = sortBy === col.key;
                const alignClass = 
                  col.align === 'right' ? 'text-right justify-end' :
                  col.align === 'center' ? 'text-center justify-center' :
                  'text-left justify-start';

                return (
                  <th
                    key={col.key}
                    style={{ width: `${colWidths[col.key] || 150}px` }}
                    onClick={() => col.sortable && onSort && onSort(col.key)}
                    className={`relative py-3 px-3.5 group ${
                      col.sortable ? 'cursor-pointer hover:bg-[#f2efe6] transition-colors' : ''
                    }`}
                  >
                    <div className={`flex items-center gap-1 ${alignClass} truncate pr-2`}>
                      {col.renderHeader ? (
                        col.renderHeader()
                      ) : (
                        <span className="truncate">{col.label}</span>
                      )}
                      {col.sortable && (
                        <span className={`text-[10px] shrink-0 ${isCurrentSort ? 'text-[#141413] font-black' : 'text-[#9c998f]'}`}>
                          {isCurrentSort ? (sortOrder === 'asc' ? '▲' : '▼') : '↕'}
                        </span>
                      )}
                    </div>

                    {/* Resizer Handle */}
                    {resizable && index < columns.length && (
                      <div
                        onMouseDown={(e) => handleMouseDown(col.key, e)}
                        onClick={(e) => e.stopPropagation()}
                        title="Arrastrar para redimensionar columna"
                        className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize flex items-center justify-center group-hover:bg-[#141413]/10 active:bg-[#141413] hover:bg-[#141413] transition-colors z-10"
                      >
                        <div className="w-[1px] h-3.5 bg-[#e5e3dc] group-hover:bg-[#141413]" />
                      </div>
                    )}
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
              data.map((item, index) => renderRow(item, index, colWidths))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
