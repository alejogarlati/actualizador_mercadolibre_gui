import React from 'react';

export default function Badge({
  children,
  variant = 'neutral', // 'success' | 'error' | 'warning' | 'info' | 'neutral' | 'dark' | 'outline'
  size = 'md', // 'sm' | 'md'
  dot = false,
  className = '',
  ...props
}) {
  const baseClasses = "inline-flex items-center font-bold tracking-tight rounded-full select-none";

  const variantClasses = {
    success: "bg-[#f0fdf4] text-[#14532d] border border-[#bbf7d0] dark:bg-[#14532d]/25 dark:text-[#86efac] dark:border-[#15803d]/50",
    error: "bg-[#fef2f2] text-[#7f1d1d] border border-[#fecaca] dark:bg-[#7f1d1d]/25 dark:text-[#fca5a5] dark:border-[#b91c1c]/50",
    warning: "bg-[#fffbeb] text-[#78350f] border border-[#fde68a] dark:bg-[#78350f]/25 dark:text-[#fde047] dark:border-[#b45309]/50",
    info: "bg-[#eff6ff] text-[#1e3a8a] border border-[#bfdbfe] dark:bg-[#1e3a8a]/25 dark:text-[#93c5fd] dark:border-[#1d4ed8]/50",
    neutral: "bg-[#f4f2eb] text-[#141413] border border-[#e5e3dc] dark:bg-[#262624] dark:text-[#faf9f5] dark:border-[#363633]",
    dark: "bg-[#141413] text-white border border-[#141413] dark:bg-[#faf9f5] dark:text-[#141413] dark:border-[#faf9f5]",
    outline: "bg-transparent text-[#73726c] border border-[#e5e3dc] dark:text-[#a3a199] dark:border-[#363633]"
  };

  const dotClasses = {
    success: "bg-[#15803d] dark:bg-[#4ade80]",
    error: "bg-[#b91c1c] dark:bg-[#f87171]",
    warning: "bg-[#b45309] dark:bg-[#facc15]",
    info: "bg-[#1d4ed8] dark:bg-[#60a5fa]",
    neutral: "bg-[#73726c] dark:bg-[#a3a199]",
    dark: "bg-white dark:bg-[#141413]",
    outline: "bg-[#73726c] dark:bg-[#a3a199]"
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px] gap-1",
    md: "px-2.5 py-1 text-[11px] gap-1.5"
  };

  return (
    <span
      className={`${baseClasses} ${variantClasses[variant] || variantClasses.neutral} ${sizeClasses[size] || sizeClasses.md} ${className}`}
      {...props}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClasses[variant] || 'bg-current'}`} />
      )}
      <span>{children}</span>
    </span>
  );
}
