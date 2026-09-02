import React from 'react';

export default function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon = null,
  trend = null, // { value: string, positive: boolean }
  badge = null,
  active = false,
  onClick = null,
  valueClassName = '',
  className = '',
  colorScheme = 'default', // 'default' | 'success' | 'error' | 'warning'
  ...props
}) {
  const schemeStyles = {
    default: {
      border: active ? 'border-[#141413] ring-1 ring-[#141413]' : 'border-[#e5e3dc] hover:border-[#141413]',
      iconBg: 'bg-[#f4f2eb] text-[#141413] border-[#e5e3dc]',
      value: 'text-[#141413]'
    },
    success: {
      border: active ? 'border-[#15803d] ring-1 ring-[#15803d] bg-[#f0fdf4]/50' : 'border-[#bbf7d0] hover:border-[#15803d]',
      iconBg: 'bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0]',
      value: 'text-[#15803d]'
    },
    error: {
      border: active ? 'border-[#b91c1c] ring-1 ring-[#b91c1c] bg-[#fef2f2]/50' : 'border-[#fecaca] hover:border-[#b91c1c]',
      iconBg: 'bg-[#fef2f2] text-[#b91c1c] border-[#fecaca]',
      value: 'text-[#b91c1c]'
    },
    warning: {
      border: active ? 'border-[#b45309] ring-1 ring-[#b45309] bg-[#fffbeb]/50' : 'border-[#fde68a] hover:border-[#b45309]',
      iconBg: 'bg-[#fffbeb] text-[#b45309] border-[#fde68a]',
      value: 'text-[#b45309]'
    }
  };

  const currentScheme = schemeStyles[colorScheme] || schemeStyles.default;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border p-4 shadow-card transition-all ${currentScheme.border} ${
        onClick ? 'cursor-pointer hover:shadow-elevated active:scale-[0.99]' : ''
      } flex flex-col justify-between gap-3 ${className}`}
      {...props}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10.5px] font-bold text-[#73726c] uppercase tracking-wider truncate">
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded-xl border ${currentScheme.iconBg} shrink-0`}>
            <Icon className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <span className={`text-2xl font-black font-mono tracking-tight ${valueClassName || currentScheme.value}`}>
          {value}
        </span>
        {badge}
      </div>

      {(subtitle || trend) && (
        <div className="flex items-center justify-between text-[11px] text-[#73726c] pt-1 border-t border-[#ece9df]/80">
          <span className="truncate">{subtitle}</span>
          {trend && (
            <span className={`font-mono font-bold ${trend.positive ? 'text-[#15803d]' : 'text-[#b91c1c]'}`}>
              {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
