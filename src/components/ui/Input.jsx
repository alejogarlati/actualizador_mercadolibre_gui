import React from 'react';

export default function Input({
  label,
  error,
  helperText,
  icon: Icon = null,
  prefix = null,
  suffix = null,
  className = '',
  id,
  type = 'text',
  disabled = false,
  required = false,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1 w-full text-left">
      {label && (
        <label htmlFor={inputId} className="text-xs font-bold text-[#141413] dark:text-[#faf9f5] tracking-tight flex items-center justify-between">
          <span>
            {label} {required && <span className="text-[#b91c1c] dark:text-[#f87171]">*</span>}
          </span>
        </label>
      )}

      <div className={`relative flex items-center bg-[#faf9f5] dark:bg-[#262624] border rounded-xl transition-all focus-within:bg-white dark:focus-within:bg-[#1c1c1a] focus-within:border-[#141413] dark:focus-within:border-[#faf9f5] focus-within:ring-1 focus-within:ring-[#141413] dark:focus-within:ring-[#faf9f5] ${
        error ? 'border-[#b91c1c] dark:border-[#ef4444] bg-[#fef2f2] dark:bg-red-950/20' : 'border-[#e5e3dc] dark:border-[#363633]'
      } ${disabled ? 'opacity-50 cursor-not-allowed bg-[#f4f2eb] dark:bg-[#1f1f1d]' : ''}`}>
        {Icon && (
          <div className="pl-3.5 pr-1 text-[#73726c] dark:text-[#a3a199] pointer-events-none flex items-center">
            <Icon className="w-3.5 h-3.5" />
          </div>
        )}

        {prefix && (
          <span className="pl-3 text-xs font-bold font-mono text-[#73726c] dark:text-[#a3a199] select-none">
            {prefix}
          </span>
        )}

        <input
          id={inputId}
          type={type}
          disabled={disabled}
          required={required}
          className={`w-full bg-transparent text-xs text-[#141413] dark:text-[#faf9f5] placeholder:text-[#9c998f] dark:placeholder:text-[#6b6960] px-3.5 py-2.5 outline-none font-medium disabled:cursor-not-allowed ${
            Icon ? 'pl-2' : ''
          } ${prefix ? 'pl-1.5' : ''} ${suffix ? 'pr-1.5' : ''} ${className}`}
          {...props}
        />

        {suffix && (
          <span className="pr-3 text-xs font-bold text-[#73726c] dark:text-[#a3a199] select-none">
            {suffix}
          </span>
        )}
      </div>

      {error && (
        <span className="text-[11px] font-semibold text-[#b91c1c] dark:text-[#f87171] mt-0.5">
          {error}
        </span>
      )}

      {!error && helperText && (
        <span className="text-[11px] text-[#73726c] dark:text-[#a3a199] mt-0.5">
          {helperText}
        </span>
      )}
    </div>
  );
}
