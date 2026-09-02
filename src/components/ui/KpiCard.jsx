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
      border: active 
        ? 'border-[#141413] dark:border-[#faf9f5] ring-1 ring-[#141413] dark:ring-[#faf9f5]' 
        : 'border-[#e5e3dc] dark:border-[#2d2d2a] hover:border-[#141413] dark:hover:border-[#faf9f5]',
      iconBg: 'bg-[#f4f2eb] dark:bg-[#262624] text-[#141413] dark:text-[#faf9f5] border-[#e5e3dc] dark:border-[#363633]',
      value: 'text-[#141413] dark:text-[#faf9f5]'
    },
    success: {
      border: active 
        ? 'border-[#15803d] ring-1 ring-[#15803d] bg-[#f0fdf4]/50 dark:bg-[#14532d]/20' 
        : 'border-[#bbf7d0] dark:border-[#15803d]/40 hover:border-[#15803d]',
      iconBg: 'bg-[#f0fdf4] dark:bg-[#14532d]/30 text-[#15803d] dark:text-[#4ade80] border-[#bbf7d0] dark:border-[#15803d]/40',
      value: 'text-[#15803d] dark:text-[#4ade80]'
    },
    error: {
      border: active 
        ? 'border-[#b91c1c] ring-1 ring-[#b91c1c] bg-[#fef2f2]/50 dark:bg-[#7f1d1d]/20' 
        : 'border-[#fecaca] dark:border-[#b91c1c]/40 hover:border-[#b91c1c]',
      iconBg: 'bg-[#fef2f2] dark:bg-[#7f1d1d]/30 text-[#b91c1c] dark:text-[#f87171] border-[#fecaca] dark:border-[#b91c1c]/40',
      value: 'text-[#b91c1c] dark:text-[#f87171]'
    },
    warning: {
      border: active 
        ? 'border-[#b45309] ring-1 ring-[#b45309] bg-[#fffbeb]/50 dark:bg-[#78350f]/20' 
        : 'border-[#fde68a] dark:border-[#b45309]/40 hover:border-[#b45309]',
      iconBg: 'bg-[#fffbeb] dark:bg-[#78350f]/30 text-[#b45309] dark:text-[#facc15] border-[#fde68a] dark:border-[#b45309]/40',
      value: 'text-[#b45309] dark:text-[#facc15]'
    }
  };

  const currentScheme = schemeStyles[colorScheme] || schemeStyles.default;

  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-[#1c1c1a] rounded-2xl border p-4 shadow-card transition-all ${currentScheme.border} ${
        onClick ? 'cursor-pointer hover:shadow-elevated active:scale-[0.99]' : ''
      } flex flex-col justify-between gap-3 ${className}`}
      {...props}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10.5px] font-bold text-[#73726c] dark:text-[#a3a199] uppercase tracking-wider truncate">
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
        <div className="flex items-center justify-between text-[11px] text-[#73726c] dark:text-[#a3a199] pt-1 border-t border-[#ece9df]/80 dark:border-[#2d2d2a]">
          <span className="truncate">{subtitle}</span>
          {trend && (
            <span className={`font-mono font-bold ${trend.positive ? 'text-[#15803d] dark:text-[#4ade80]' : 'text-[#b91c1c] dark:text-[#f87171]'}`}>
              {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
