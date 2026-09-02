import React from 'react';
import { RefreshCw } from 'lucide-react';

export default function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'danger-outline'
  size = 'md', // 'sm' | 'md' | 'lg' | 'icon'
  icon: Icon = null,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  onClick,
  type = 'button',
  title = '',
  ...props
}) {
  const baseClasses = "inline-flex items-center justify-center font-bold tracking-tight rounded-xl transition-all select-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141413] dark:focus-visible:ring-[#faf9f5] focus-visible:ring-offset-2 active:scale-[0.98]";

  const variantClasses = {
    primary: "bg-[#141413] hover:bg-[#262624] text-white shadow-xs border border-[#141413] dark:bg-[#faf9f5] dark:hover:bg-[#ece9df] dark:text-[#141413] dark:border-[#faf9f5]",
    secondary: "bg-[#faf9f5] hover:bg-[#f2efe6] text-[#141413] border border-[#e5e3dc] shadow-xs dark:bg-[#262624] dark:hover:bg-[#30302d] dark:text-[#faf9f5] dark:border-[#363633]",
    outline: "bg-transparent hover:bg-[#faf9f5] text-[#141413] border border-[#141413] dark:text-[#faf9f5] dark:border-[#a3a199] dark:hover:bg-[#262624]",
    ghost: "bg-transparent hover:bg-[#f4f2eb] text-[#141413] border border-transparent dark:text-[#faf9f5] dark:hover:bg-[#262624]",
    danger: "bg-[#b91c1c] hover:bg-[#991b1b] text-white shadow-xs border border-[#b91c1c] dark:bg-[#dc2626] dark:hover:bg-[#b91c1c]",
    "danger-outline": "bg-transparent hover:bg-red-50 text-[#b91c1c] border border-[#fecaca] dark:hover:bg-red-950/40 dark:border-red-900/60 dark:text-red-400",
    muted: "bg-[#f4f2eb] hover:bg-[#ece9df] text-[#73726c] hover:text-[#141413] border border-[#e5e3dc] dark:bg-[#262624] dark:hover:bg-[#30302d] dark:text-[#a3a199] dark:hover:text-[#faf9f5] dark:border-[#363633]"
  };

  const sizeClasses = {
    sm: "px-2.5 py-1.5 text-[11px] gap-1.5 min-h-[30px]",
    md: "px-4 py-2 text-xs gap-2 min-h-[36px]",
    lg: "px-5 py-2.5 text-xs gap-2.5 min-h-[44px]",
    icon: "p-2 min-h-[34px] min-w-[34px] aspect-square"
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      title={title}
      className={`${baseClasses} ${variantClasses[variant] || variantClasses.primary} ${sizeClasses[size] || sizeClasses.md} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {loading ? (
        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
      ) : Icon && iconPosition === 'left' ? (
        <Icon className="w-3.5 h-3.5 shrink-0" />
      ) : null}

      {children && <span>{children}</span>}

      {!loading && Icon && iconPosition === 'right' && (
        <Icon className="w-3.5 h-3.5 shrink-0" />
      )}
    </button>
  );
}
