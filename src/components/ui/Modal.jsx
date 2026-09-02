import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon = null,
  children,
  footer = null,
  maxWidth = 'max-w-xl', // 'max-w-md' | 'max-w-xl' | 'max-w-2xl' | 'max-w-3xl' | 'max-w-4xl'
  className = ''
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#141413]/50 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-white border border-[#e5e3dc] w-full ${maxWidth} rounded-2xl shadow-elevated overflow-hidden flex flex-col my-8 max-h-[90vh] ${className}`}
      >
        {/* Header */}
        <div className="p-5 bg-[#faf9f5] border-b border-[#e5e3dc] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {Icon && (
              <div className="p-2.5 rounded-xl bg-[#f4f2eb] text-[#141413] border border-[#e5e3dc] shrink-0">
                <Icon className="w-4 h-4" />
              </div>
            )}
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-[#141413] tracking-tight truncate">
                {title}
              </h2>
              {subtitle && (
                <p className="text-[11px] text-[#73726c] mt-0.5 truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#73726c] hover:text-[#141413] hover:bg-[#ece9df] transition-colors cursor-pointer"
            title="Cerrar modal (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>

        {/* Footer Actions */}
        {footer && (
          <div className="p-4 bg-[#faf9f5] border-t border-[#e5e3dc] flex items-center justify-end gap-2.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
