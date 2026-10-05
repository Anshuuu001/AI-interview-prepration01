import React, { useState } from 'react';
import { Settings, Palette, Type, Monitor, Focus, Columns, Grid3x3, Pin, Keyboard, Sun, Moon, Sparkles } from 'lucide-react';

const WorkspaceSettings = () => {
  const [settings, setSettings] = useState({
    theme: 'dark', accentColor: '#6366f1', fontSize: 14, compactMode: false,
    focusMode: false, splitView: false, animations: true,
  });

  const accents = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#14b8a6'];
  const update = (key, val) => setSettings(p => ({ ...p, [key]: val }));

  const shortcuts = [
    { keys: 'Ctrl + K', action: 'Open Search' },
    { keys: 'Ctrl + N', action: 'New Chat' },
    { keys: 'Ctrl + B', action: 'Toggle Sidebar' },
    { keys: 'Ctrl + /', action: 'Keyboard Shortcuts' },
    { keys: 'Ctrl + S', action: 'Save' },
    { keys: 'Esc', action: 'Close Modal' },
  ];

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-slate-400" /> Workspace Personalization
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">Customize your workspace — theme, colors, layout, and keyboard shortcuts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Theme */}
        <div className="liquid-glass-card rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2"><Palette className="w-4 h-4 text-violet-400" /> Appearance</h3>
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Theme</label>
            <div className="flex gap-2">
              {[{ id: 'dark', label: 'Dark', icon: Moon }, { id: 'light', label: 'Light', icon: Sun }].map(t => (
                <button key={t.id} onClick={() => update('theme', t.id)}
                  className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl text-xs font-semibold transition-all border ${
                    settings.theme === t.id ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300' : 'bg-slate-900/40 border-white/5 text-slate-400'}`}>
                  <t.icon className="w-4 h-4" />{t.label}
                </button>
              ))}
            </div>
            <label className="text-[10px] font-bold text-slate-500 uppercase">Accent Color</label>
            <div className="flex gap-2">
              {accents.map(c => (
                <button key={c} onClick={() => update('accentColor', c)}
                  className={`w-8 h-8 rounded-xl transition-all ${settings.accentColor === c ? 'ring-2 ring-white/40 scale-110' : 'hover:scale-105'}`}
                  style={{ background: c }} />
              ))}
            </div>
            <label className="text-[10px] font-bold text-slate-500 uppercase">Font Size: {settings.fontSize}px</label>
            <input type="range" min={12} max={20} value={settings.fontSize} onChange={e => update('fontSize', parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-500" />
          </div>
        </div>

        {/* Layout */}
        <div className="liquid-glass-card rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2"><Monitor className="w-4 h-4 text-cyan-400" /> Layout</h3>
          {[
            { key: 'compactMode', label: 'Compact Mode', desc: 'Reduce padding and spacing', icon: Grid3x3 },
            { key: 'focusMode', label: 'Focus Mode', desc: 'Hide sidebar and distractions', icon: Focus },
            { key: 'splitView', label: 'Split View', desc: 'Side-by-side panels', icon: Columns },
            { key: 'animations', label: 'Animations', desc: 'Enable smooth transitions', icon: Sparkles },
          ].map(opt => (
            <div key={opt.key} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/30 border border-white/5">
              <div className="flex items-center gap-3">
                <opt.icon className="w-4 h-4 text-slate-500" />
                <div><p className="text-xs font-bold text-slate-300">{opt.label}</p><p className="text-[10px] text-slate-600">{opt.desc}</p></div>
              </div>
              <button onClick={() => update(opt.key, !settings[opt.key])}
                className={`w-10 h-5 rounded-full transition-colors ${settings[opt.key] ? 'bg-indigo-500' : 'bg-slate-700'}`}>
                <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${settings[opt.key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          ))}
        </div>

        {/* Shortcuts */}
        <div className="liquid-glass-card rounded-2xl p-5 md:col-span-2">
          <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2"><Keyboard className="w-4 h-4 text-amber-400" /> Keyboard Shortcuts</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {shortcuts.map((s, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/30 border border-white/5">
                <span className="text-[11px] text-slate-400">{s.action}</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono border border-white/10">{s.keys}</kbd>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceSettings;
