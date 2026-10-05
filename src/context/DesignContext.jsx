import React, { createContext, useContext, useState, useEffect } from 'react';

const DesignContext = createContext(null);

export const DesignProvider = ({ children }) => {
  // designStyle can be 'glass', 'minimal', or 'brutalist'
  const [designStyle, setDesignStyle] = useState('minimal');
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  });

  useEffect(() => {
    const saved = localStorage.getItem('designStyle');
    if (saved) {
      setDesignStyle(saved);
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const changeDesignStyle = (style) => {
    setDesignStyle(style);
    localStorage.setItem('designStyle', style);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <DesignContext.Provider value={{ designStyle, changeDesignStyle, theme, toggleTheme, setTheme }}>
      {/* We apply a wrapper class that can affect children if needed */}
      <div className={`design-theme-${designStyle} min-h-screen transition-all duration-500 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100`}>
        {children}
      </div>
    </DesignContext.Provider>
  );
};

export const useDesign = () => {
  const context = useContext(DesignContext);
  if (!context) throw new Error('useDesign must be used within a DesignProvider');
  return context;
};
