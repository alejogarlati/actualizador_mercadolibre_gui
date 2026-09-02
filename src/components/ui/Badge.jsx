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
    success: "bg-[#f0fdf4] text-[#14532d] border border-[#bbf7d0]",
    error: "bg-[#fef2f2] text-[#7f1d1d] border border-[#fecaca]",
    warning: "bg-[#fffbeb] text-[#78350f] border border-[#fde68a]",
    info: "bg-[#eff6ff] text-[#1e3a8a] border border-[#bfdbfe]",
    neutral: "bg-[#f4f2eb] text-[#141413] border border-[#e5e3dc]",
    dark: "bg-[#141413] text-white border border-[#141413]",
    outline: "bg-transparent text-[#73726c] border border-[#e5e3dc]"
  };

  const dotClasses = {
    success: "bg-[#15803d]",
    error: "bg-[#b91c1c]",
    warning: "bg-[#b45309]",
    info: "bg-[#1d4ed8]",
    neutral: "bg-[#73726c]",
    dark: "bg-white",
    outline: "bg-[#73726c]"
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
