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
        <label htmlFor={selectId} className="text-xs font-bold text-[#141413] tracking-tight flex items-center justify-between">
          <span>
            {label} {required && <span className="text-[#b91c1c]">*</span>}
          </span>
        </label>
      )}

      <div className={`relative flex items-center bg-[#faf9f5] border rounded-xl transition-all focus-within:bg-white focus-within:border-[#141413] focus-within:ring-1 focus-within:ring-[#141413] ${
        error ? 'border-[#b91c1c] bg-[#fef2f2]' : 'border-[#e5e3dc]'
      } ${disabled ? 'opacity-50 cursor-not-allowed bg-[#f4f2eb]' : ''}`}>
        {Icon && (
          <div className="pl-3.5 pr-1 text-[#73726c] pointer-events-none flex items-center">
            <Icon className="w-3.5 h-3.5" />
          </div>
        )}

        <select
          id={selectId}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`w-full appearance-none bg-transparent text-xs text-[#141413] font-medium px-3.5 py-2.5 pr-8 outline-none cursor-pointer disabled:cursor-not-allowed ${
            Icon ? 'pl-2' : ''
          } ${className}`}
          {...props}
        >
          {children || options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#73726c] pointer-events-none flex items-center">
          <ChevronDown className="w-3.5 h-3.5" />
        </div>
      </div>

      {error && (
        <span className="text-[11px] font-semibold text-[#b91c1c] mt-0.5">
          {error}
        </span>
      )}

      {!error && helperText && (
        <span className="text-[11px] text-[#73726c] mt-0.5">
          {helperText}
        </span>
      )}
    </div>
  );
}
