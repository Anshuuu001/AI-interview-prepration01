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
      className={`bg-white dark:bg-[#121620] border border-black/[0.07] dark:border-white/[0.08] rounded-2xl shadow-xs transition-all duration-200 w-full overflow-hidden ${
        hoverEffect ? 'hover:shadow-md hover:border-black/15 dark:hover:border-white/15' : ''
      } ${className}`}
      {...props}
    >
      {/* Header */}
      {(title || subtitle || actions) && (
        <div className="px-6 py-5 flex items-center justify-between gap-4 border-b border-black/[0.06] dark:border-white/[0.08]">
          <div>
            {title && (
              <h3 className="text-base font-semibold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && <p className="text-xs text-[#475569] dark:text-[#94A3B8] mt-0.5 font-normal">{subtitle}</p>}
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
        <div className="px-6 py-4 flex items-center justify-between border-t border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.02]">
          {footer}
        </div>
      )}
    </div>
  );

  return cardContent;
};

export default Card;
