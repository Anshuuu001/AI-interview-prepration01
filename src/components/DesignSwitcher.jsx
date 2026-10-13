import React from 'react';
import { useDesign } from '../context/DesignContext';
import { Palette, Layers, Minimize, Paintbrush, Sparkles } from 'lucide-react';

const DesignSwitcher = () => {
  const { designStyle, changeDesignStyle } = useDesign();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 p-2 rounded-2xl bg-[#0b1343]/80 backdrop-blur-md border border-[#fde8d7]/20 shadow-2xl">
      <div className="px-2 text-xs font-semibold text-[#fde8d7] uppercase tracking-wider hidden sm:flex items-center gap-1.5 font-sans">
        <Sparkles className="w-3.5 h-3.5 text-[#fa5252]" />
        Theme Style
      </div>
      
      <div className="flex gap-1">
        <button
          onClick={() => changeDesignStyle('genz')}
          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
            designStyle === 'genz' 
              ? 'bg-[#fa5252] text-white shadow-lg shadow-[#fa5252]/40 scale-105' 
              : 'hover:bg-white/10 text-[#fde8d7]'
          }`}
          title="Genz Editorial (Peach / Navy / Apricot)"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Genz Studio</span>
        </button>

        <button
          onClick={() => changeDesignStyle('glass')}
          className={`p-2 rounded-xl transition-all duration-200 flex items-center justify-center ${
            designStyle === 'glass' 
              ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' 
              : 'hover:bg-white/10 text-slate-300'
          }`}
          title="Liquid Glass (Glassmorphism)"
        >
          <Layers className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => changeDesignStyle('minimal')}
          className={`p-2 rounded-xl transition-all duration-200 flex items-center justify-center ${
            designStyle === 'minimal' 
              ? 'bg-[#fde8d7] text-[#0b1343] shadow-lg' 
              : 'hover:bg-white/10 text-slate-300'
          }`}
          title="Clean Minimalist"
        >
          <Minimize className="w-4 h-4" />
        </button>

        <button
          onClick={() => changeDesignStyle('brutalist')}
          className={`p-2 rounded-xl transition-all duration-200 flex items-center justify-center ${
            designStyle === 'brutalist' 
              ? 'bg-yellow-400 text-black border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' 
              : 'hover:bg-white/10 text-slate-300'
          }`}
          title="Neo-Brutalism"
        >
          <Paintbrush className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default DesignSwitcher;
