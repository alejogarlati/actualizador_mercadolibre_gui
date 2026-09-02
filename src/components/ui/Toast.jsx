import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export default function ToastContainer({ toasts = [], onRemove }) {
  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl shadow-elevated border text-xs transition-all animate-in slide-in-from-top-2 duration-150 ${
            toast.type === 'success' ? 'bg-white border-[#bbf7d0] text-[#141413]' :
            toast.type === 'error' ? 'bg-white border-[#fecaca] text-[#141413]' :
            toast.type === 'warning' ? 'bg-[#141413] border-[#141413] text-white' :
            'bg-white border-[#e5e3dc] text-[#141413]'
          }`}
        >
          <div className="mt-0.5 shrink-0">
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#15803d]" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-[#b91c1c]" />}
            {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-[#f59e0b]" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-[#1d4ed8]" />}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-bold tracking-tight">{toast.title}</h4>
            {toast.message && (
              <p className={`text-[11px] mt-0.5 leading-normal ${
                toast.type === 'warning' ? 'text-[#dcd8cd]' : 'text-[#73726c]'
              }`}>
                {toast.message}
              </p>
            )}
          </div>

          <button
            onClick={() => onRemove(toast.id)}
            className={`p-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
              toast.type === 'warning'
                ? 'text-white/60 hover:text-white hover:bg-white/10'
                : 'text-[#73726c] hover:text-[#141413] hover:bg-[#f4f2eb]'
            }`}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
