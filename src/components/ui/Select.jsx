import React from 'react';
import { ChevronDown } from 'lucide-react';

export default function Select({
  label,
  options = [],
  value,
  onChange,
  error,
  helperText,
  icon: Icon = null,
  disabled = false,
  required = false,
  className = '',
  id,
  children,
  ...props
}) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1 w-full text-left">
      {label && (
        <label htmlFor={selectId} className="text-xs font-bold text-[#141413] dark:text-[#faf9f5] tracking-tight flex items-center justify-between">
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

        <select
          id={selectId}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`w-full appearance-none bg-transparent text-xs text-[#141413] dark:text-[#faf9f5] font-medium px-3.5 py-2.5 pr-8 outline-none cursor-pointer disabled:cursor-not-allowed ${
            Icon ? 'pl-2' : ''
          } ${className}`}
          {...props}
        >
          {children || options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-white dark:bg-[#1c1c1a] text-[#141413] dark:text-[#faf9f5]">
              {opt.label}
            </option>
          ))}
        </select>

        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#73726c] dark:text-[#a3a199] pointer-events-none flex items-center">
          <ChevronDown className="w-3.5 h-3.5" />
        </div>
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
