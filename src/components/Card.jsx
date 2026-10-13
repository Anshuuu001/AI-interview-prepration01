import React from 'react';
import Tilt from './Tilt';
import { useDesign } from '../context/DesignContext';

const Card = ({
  children,
  title,
  subtitle,
  actions,
  footer,
  hoverEffect = false,
  className = '',
  ...props
}) => {
  const cardContent = (
    <div
      className={`bg-white dark:bg-[#131E54] border border-[#E7E2DC] dark:border-white/10 rounded-2xl shadow-[0_2px_8px_-2px_rgba(16,25,74,0.05)] transition-all duration-200 w-full overflow-hidden ${
        hoverEffect ? 'hover:shadow-[0_8px_24px_-4px_rgba(16,25,74,0.08)] hover:border-[#D6CFCE]' : ''
      } ${className}`}
      {...props}
    >
      {/* Header */}
      {(title || subtitle || actions) && (
        <div className="px-6 py-5 flex items-center justify-between gap-4 border-b border-[#E7E2DC] dark:border-white/10">
          <div>
            {title && (
              <h3 className="text-base font-bold text-[#10194A] dark:text-[#FAF5EF] tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && <p className="text-xs text-[#666675] dark:text-[#C4C4D4] mt-0.5 font-normal">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}

      {/* Body */}
      <div className="p-6">
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className="px-6 py-4 flex items-center justify-between border-t border-[#E7E2DC] dark:border-white/10 bg-[#FAF5EF]/50 dark:bg-white/[0.02]">
          {footer}
        </div>
      )}
    </div>
  );

  return cardContent;
};

export default Card;
