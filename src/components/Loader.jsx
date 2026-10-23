import React from 'react';

const Loader = ({
  message = 'Processing details...',
  size = 'md',
  fullPage = false
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  const loaderContent = (
    <div className="flex flex-col items-center justify-center text-center p-6">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing pulsing ring */}
        <div className={`absolute rounded-full border border-primary-500/30 animate-ping opacity-75 ${sizeClasses[size]}`} />
        
        {/* Middle spinning gradient ring */}
        <div className={`rounded-full border-4 border-black/10 dark:border-white/10 border-t-[#E97878] animate-spin ${sizeClasses[size]}`} />

        {/* Inner static AI brain glow */}
        <div className="absolute w-3 h-3 rounded-full bg-[#E97878]/80 blur-[2px] animate-pulse" />
      </div>
      
      {message && (
        <div className="mt-6">
          <p className="text-sm font-medium text-slate-800 dark:text-slate-100 animate-pulse tracking-wide">{message}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Please do not refresh or close this tab</p>
        </div>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/70 backdrop-blur-md">
        <div className="bg-white/95 dark:bg-[#121620] border border-black/10 dark:border-white/10 shadow-2xl p-8 rounded-2xl max-w-sm mx-4">
          {loaderContent}
        </div>
      </div>
    );
  }

  return loaderContent;
};

export default Loader;
