import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export default function ToastContainer({ toasts = [], onRemove }) {
  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl shadow-elevated border text-xs transition-all animate-in slide-in-from-top-2 duration-150 ${
            toast.type === 'success' ? 'bg-white dark:bg-[#1c1c1a] border-[#bbf7d0] dark:border-[#15803d]/50 text-[#141413] dark:text-[#faf9f5]' :
            toast.type === 'error' ? 'bg-white dark:bg-[#1c1c1a] border-[#fecaca] dark:border-[#b91c1c]/50 text-[#141413] dark:text-[#faf9f5]' :
            toast.type === 'warning' ? 'bg-[#141413] dark:bg-[#faf9f5] border-[#141413] dark:border-[#faf9f5] text-white dark:text-[#141413]' :
            'bg-white dark:bg-[#1c1c1a] border-[#e5e3dc] dark:border-[#363633] text-[#141413] dark:text-[#faf9f5]'
          }`}
        >
          <div className="mt-0.5 shrink-0">
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#15803d] dark:text-[#4ade80]" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-[#b91c1c] dark:text-[#f87171]" />}
            {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-[#f59e0b] dark:text-[#d97706]" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-[#1d4ed8] dark:text-[#60a5fa]" />}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-bold tracking-tight">{toast.title}</h4>
            {toast.message && (
              <p className={`text-[11px] mt-0.5 leading-normal ${
                toast.type === 'warning' ? 'text-[#dcd8cd] dark:text-[#52524e]' : 'text-[#73726c] dark:text-[#a3a199]'
              }`}>
                {toast.message}
              </p>
            )}
          </div>

          <button
            onClick={() => onRemove(toast.id)}
            className={`p-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
              toast.type === 'warning'
                ? 'text-white/60 dark:text-[#141413]/60 hover:text-white dark:hover:text-[#141413] hover:bg-white/10 dark:hover:bg-black/10'
                : 'text-[#73726c] dark:text-[#a3a199] hover:text-[#141413] dark:hover:text-[#faf9f5] hover:bg-[#f4f2eb] dark:hover:bg-[#262624]'
            }`}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
