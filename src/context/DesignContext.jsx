import React, { createContext, useContext, useState, useEffect } from 'react';

const DesignContext = createContext(null);

export const DesignProvider = ({ children }) => {
  // designStyle can be 'genz', 'glass', 'minimal', or 'brutalist'
  const [designStyle, setDesignStyle] = useState('genz');
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme;
    return 'light'; // Default to light so the rich peach/navy/apricot palette shines
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
      {/* Wrapper class */}
      <div className={`design-theme-${designStyle} min-h-screen transition-all duration-500 bg-[#fdf6ee] dark:bg-[#060c29] text-[#0b1343] dark:text-[#fdf6ee]`}>
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
