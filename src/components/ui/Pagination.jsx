import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 25,
  onPageChange,
  onPageSizeChange = null,
  pageSizeOptions = [10, 25, 50, 100],
  className = ''
}) {
  if (totalItems === 0) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, currentPage + 2);
      if (start === 1) end = Math.min(totalPages, maxVisible);
      if (end === totalPages) start = Math.max(1, totalPages - maxVisible + 1);
      for (let i = start; i <= end; i++) pages.push(i);
    }
    return pages;
  };

  const startItem = (currentPage - 1) * (pageSize === 'all' ? totalItems : pageSize) + 1;
  const endItem = pageSize === 'all' ? totalItems : Math.min(totalItems, currentPage * pageSize);

  return (
    <div className={`p-3.5 bg-[#faf9f5] border-t border-[#e5e3dc] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs select-none ${className}`}>
      {/* Left info & Page Size */}
      <div className="flex items-center gap-3 text-[#73726c]">
        <span>
          Mostrando <strong className="text-[#141413] font-mono">{startItem}</strong> - <strong className="text-[#141413] font-mono">{endItem}</strong> de <strong className="text-[#141413] font-mono">{totalItems}</strong> registros
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 pl-3 border-l border-[#e5e3dc]">
            <span className="text-[11px]">Por página:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="bg-white border border-[#e5e3dc] rounded-lg px-2 py-1 text-xs font-bold text-[#141413] outline-none cursor-pointer"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Page navigation */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg border border-[#e5e3dc] bg-white hover:bg-[#f2efe6] text-[#141413] disabled:opacity-30 disabled:hover:bg-white transition-colors cursor-pointer"
          title="Primera página"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg border border-[#e5e3dc] bg-white hover:bg-[#f2efe6] text-[#141413] disabled:opacity-30 disabled:hover:bg-white transition-colors cursor-pointer"
          title="Página anterior"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-1 mx-1">
          {getPageNumbers().map((num) => (
            <button
              key={num}
              onClick={() => onPageChange(num)}
              className={`min-w-[28px] h-7 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentPage === num
                  ? 'bg-[#141413] text-white shadow-xs'
                  : 'bg-white text-[#141413] hover:bg-[#f2efe6] border border-[#e5e3dc]'
              }`}
            >
              {num}
            </button>
          ))}
        </div>

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg border border-[#e5e3dc] bg-white hover:bg-[#f2efe6] text-[#141413] disabled:opacity-30 disabled:hover:bg-white transition-colors cursor-pointer"
          title="Página siguiente"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg border border-[#e5e3dc] bg-white hover:bg-[#f2efe6] text-[#141413] disabled:opacity-30 disabled:hover:bg-white transition-colors cursor-pointer"
          title="Última página"
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
