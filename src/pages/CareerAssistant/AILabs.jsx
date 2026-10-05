import React, { useState } from 'react';
import Button from '../../components/Button';
import { FlaskConical, Sparkles, Sliders, MessageSquare, Brain, Thermometer, Palette, User } from 'lucide-react';
import interviewService from '../../services/interviewService';

const AILabs = () => {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({ temperature: 'Balanced', style: 'Professional', depth: 'Detailed', persona: 'Default AI' });

  const temperatures = ['Creative', 'Balanced', 'Precise'];
  const styles = ['Professional', 'Casual', 'Academic', 'Concise', 'Storytelling'];
  const depths = ['Brief', 'Detailed', 'Comprehensive', 'Expert-Level'];
  const personas = ['Default AI', 'Strict Mentor', 'Friendly Tutor', 'Tech Lead', 'HR Manager', 'Career Coach', 'Debugging Partner', 'Code Reviewer'];

  const run = async () => {
    if (!prompt.trim()) return;
    setLoading(true); setResult('');
    try {
      const sys = `You are an AI assistant. Response style: ${settings.style}. Depth: ${settings.depth}. Persona: ${settings.persona}. Temperature hint: ${settings.temperature}.`;
      const res = await interviewService.chatNexus([{ role: 'user', text: prompt }], sys);
      setResult(res.text || res);
    } catch (e) { setResult('Error: ' + e.message); }
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in-up space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
          <FlaskConical className="w-6 h-6 text-violet-400" /> AI Labs
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-400 text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3" /> Experimental
          </span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">Prompt playground — experiment with AI styles, personas, and response depths</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          <div className="liquid-glass-card rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2"><Sliders className="w-4 h-4 text-cyan-400" /> Controls</h3>
            {[
              { label: 'Temperature', key: 'temperature', options: temperatures, icon: Thermometer, color: 'text-rose-400' },
              { label: 'Response Style', key: 'style', options: styles, icon: Palette, color: 'text-indigo-400' },
              { label: 'Reasoning Depth', key: 'depth', options: depths, icon: Brain, color: 'text-emerald-400' },
              { label: 'AI Persona', key: 'persona', options: personas, icon: User, color: 'text-amber-400' },
            ].map(ctrl => (
              <div key={ctrl.key} className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                  <ctrl.icon className={`w-3 h-3 ${ctrl.color}`} />{ctrl.label}
                </label>
                <select value={settings[ctrl.key]} onChange={e => setSettings(p => ({ ...p, [ctrl.key]: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-950/50 border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none appearance-none cursor-pointer">
                  {ctrl.options.map(o => <option key={o} value={o} className="bg-slate-900">{o}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Prompt & Result */}
        <div className="lg:col-span-3 space-y-4">
          <div className="liquid-glass-card rounded-2xl p-5 space-y-3">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Prompt Playground</label>
            <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={5}
              placeholder="Enter any prompt here and experiment with different settings..."
              className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 focus:border-violet-500/50 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none transition-all resize-none" />
            <Button onClick={run} loading={loading} disabled={!prompt.trim()} icon={FlaskConical} className="w-full">Run Experiment</Button>
          </div>

          {result && (
            <div className="liquid-glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-4 h-4 text-violet-400" />
                <h3 className="text-sm font-bold text-slate-200">Result</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/15">
                  {settings.persona} • {settings.style} • {settings.depth}
                </span>
              </div>
              <div className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{result}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AILabs;
