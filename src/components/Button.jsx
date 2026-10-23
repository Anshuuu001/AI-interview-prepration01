import React from 'react';
import { useDesign } from '../context/DesignContext';

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon: Icon,
  className = '',
  ...props
}) => {
  const base = 'group inline-flex items-center justify-center font-sans font-semibold rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-[var(--app-bg)] disabled:opacity-40 disabled:cursor-not-allowed select-none relative';

  const variants = {
    primary: {
      className: 'bg-[#E97878] hover:bg-[#DC6666] text-white shadow-xs hover:shadow transition-all duration-200 active:scale-[0.98] motion-reduce:active:scale-100',
    },
    navy: {
      className: 'bg-[#10194A] hover:bg-[#1A2563] text-white shadow-xs hover:shadow transition-all duration-200 active:scale-[0.98] motion-reduce:active:scale-100 dark:bg-[#1E2536] dark:hover:bg-[#283248]',
    },
    secondary: {
      className: 'bg-white hover:bg-slate-50 text-[#0F172A] border border-black/10 shadow-xs hover:border-black/20 transition-all duration-200 active:scale-[0.98] motion-reduce:active:scale-100 dark:bg-[#161B26] dark:text-[#F8FAFC] dark:border-white/10 dark:hover:bg-[#1F2533] dark:hover:border-white/20',
    },
    apricot: {
      className: 'bg-[#EBA66F] hover:bg-[#D88A4C] text-[#10194A] shadow-xs hover:shadow transition-all duration-200 active:scale-[0.98] motion-reduce:active:scale-100',
    },
    mist: {
      className: 'bg-[#DFE8F7] hover:bg-[#C9D9F2] text-[#10194A] shadow-xs transition-all duration-200 active:scale-[0.98] motion-reduce:active:scale-100 dark:bg-white/10 dark:text-[#F8FAFC] dark:hover:bg-white/15',
    },
    outline: {
      className: 'bg-transparent border border-black/10 text-[#0F172A] hover:bg-black/[0.03] transition-all duration-200 active:scale-[0.98] motion-reduce:active:scale-100 dark:text-[#F8FAFC] dark:border-white/15 dark:hover:bg-white/5',
    },
    ghost: {
      className: 'bg-transparent text-[#475569] hover:text-[#0F172A] hover:bg-black/[0.04] transition-all duration-200 active:scale-[0.98] motion-reduce:active:scale-100 dark:text-[#94A3B8] dark:hover:text-[#F8FAFC] dark:hover:bg-white/5',
    },
    danger: {
      className: 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs hover:shadow transition-all duration-200 active:scale-[0.98] motion-reduce:active:scale-100',
    },
  };

  const sizes = {
    sm: 'px-3.5 py-1.5 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-7 py-3.5 text-base gap-2.5',
  };

  const v = variants[variant] || variants.primary;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${v.className} ${sizes[size]} ${className}`}
      {...props}
    >
      <div className="relative z-10 flex items-center justify-center gap-inherit w-full h-full pointer-events-none">
        {loading ? (
          <svg className="animate-spin w-4 h-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : Icon ? (
          <Icon className={`w-4 h-4 flex-shrink-0 ${children ? 'mr-1' : 'm-0'}`} />
        ) : null}
        {children}
      </div>
    </button>
  );
};

export default Button;
