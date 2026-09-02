import React from 'react';

export default function Card({
  children,
  title,
  subtitle,
  icon: Icon = null,
  badge = null,
  action = null,
  footer = null,
  className = '',
  bodyClassName = '',
  onClick = null,
  hoverable = false,
  active = false,
  ...props
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border transition-all ${
        active 
          ? 'border-[#141413] ring-1 ring-[#141413] shadow-sm' 
          : 'border-[#e5e3dc] shadow-card'
      } ${
        hoverable || onClick 
          ? 'hover:border-[#141413] hover:shadow-elevated cursor-pointer active:scale-[0.995]' 
          : ''
      } flex flex-col justify-between overflow-hidden ${className}`}
      {...props}
    >
      {(title || subtitle || Icon || action || badge) && (
        <div className="p-5 pb-3 border-b border-[#ece9df] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {Icon && (
              <div className="p-2.5 bg-[#f4f2eb] text-[#141413] rounded-xl border border-[#e5e3dc] shrink-0">
                <Icon className="w-4 h-4" />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {title && (
                  <h3 className="text-sm font-bold text-[#141413] truncate tracking-tight">
                    {title}
                  </h3>
                )}
                {badge}
              </div>
              {subtitle && (
                <p className="text-[11px] text-[#73726c] mt-0.5 truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}

      <div className={`p-5 flex-1 ${bodyClassName}`}>
        {children}
      </div>

      {footer && (
        <div className="px-5 py-3.5 bg-[#faf9f5] border-t border-[#ece9df] flex items-center justify-between text-xs">
          {footer}
        </div>
      )}
    </div>
  );
}
