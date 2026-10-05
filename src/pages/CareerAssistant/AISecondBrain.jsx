import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { Brain, Save, Sparkles, Target, BookOpen, Heart, Code2, Globe, User, Palette, StickyNote, TrendingUp, CheckCircle2, RefreshCw } from 'lucide-react';
import interviewService from '../../services/interviewService';

const AISecondBrain = () => {
  const [memory, setMemory] = useState({
    resume: '', skills: '', career_goal: 'Graduate Candidate', weak_topics: '', strong_topics: '',
    preferred_language: 'English', learning_style: 'Practical & Example-Driven', notes: '',
    favorite_companies: '', favorite_language: '', daily_goals: '', career_goals: '',
    ai_personality: 'Professional', learning_habits: ''
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('memory');

  useEffect(() => {
    (async () => {
      try {
        const data = await interviewService.getNexusMemory();
        if (data) setMemory(prev => ({ ...prev, ...data }));
      } catch (e) { console.error('Failed to load memory:', e); }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await interviewService.updateNexusMemory(memory);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) { console.error('Failed to save:', e); }
    setSaving(false);
  };

  const personalities = ['Professional', 'Friendly', 'Strict Mentor', 'Motivational Coach', 'Casual Buddy', 'Socratic Teacher'];
  const languages = ['English', 'Hindi', 'Marathi', 'Tamil', 'Telugu', 'Gujarati', 'Kannada', 'Bengali', 'Punjabi', 'Urdu'];
  const learningStyles = ['Practical & Example-Driven', 'Theory First', 'Visual Learner', 'Project-Based', 'Quiz-Based', 'Spaced Repetition'];

  const tabs = [
    { id: 'memory', label: 'Personal Memory', icon: Brain },
    { id: 'preferences', label: 'Preferences', icon: Palette },
    { id: 'goals', label: 'Goals & Habits', icon: Target },
    { id: 'notes', label: 'Notes', icon: StickyNote },
  ];

  const renderField = (label, key, placeholder, multiline = false, icon = null) => (
    <div className="space-y-2">
      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
        {icon && React.createElement(icon, { className: 'w-3.5 h-3.5' })}
        {label}
      </label>
      {multiline ? (
        <textarea value={memory[key] || ''} onChange={e => setMemory(p => ({ ...p, [key]: e.target.value }))}
          placeholder={placeholder} rows={4}
          className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 focus:border-indigo-500/50 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all resize-none" />
      ) : (
        <input value={memory[key] || ''} onChange={e => setMemory(p => ({ ...p, [key]: e.target.value }))}
          placeholder={placeholder}
          className="w-full px-4 py-2.5 bg-slate-950/50 border border-white/10 focus:border-indigo-500/50 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all" />
      )}
    </div>
  );

  const renderSelect = (label, key, options, icon = null) => (
    <div className="space-y-2">
      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
        {icon && React.createElement(icon, { className: 'w-3.5 h-3.5' })}
        {label}
      </label>
      <select value={memory[key] || options[0]} onChange={e => setMemory(p => ({ ...p, [key]: e.target.value }))}
        className="w-full px-4 py-2.5 bg-slate-950/50 border border-white/10 focus:border-indigo-500/50 rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all appearance-none cursor-pointer">
        {options.map(o => <option key={o} value={o} className="bg-slate-900">{o}</option>)}
      </select>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto animate-fade-in-up space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <Brain className="w-6 h-6 text-violet-400" />
            AI Second Brain
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-400 text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3" /> Memory Engine
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Your AI remembers everything — skills, goals, preferences, and learning patterns</p>
        </div>
        <Button onClick={handleSave} loading={saving} icon={saved ? CheckCircle2 : Save} variant={saved ? 'secondary' : 'primary'}>
          {saved ? 'Saved!' : 'Save Memory'}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === t.id
                ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300 border shadow-lg shadow-indigo-500/10'
                : 'bg-slate-900/40 border-white/5 text-slate-400 border hover:bg-slate-800/60 hover:text-slate-300'
            }`}>
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="liquid-glass-card rounded-2xl p-6">
        {activeTab === 'memory' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderField('Resume Content', 'resume', 'Paste your resume text here...', true, User)}
            {renderField('Skills (comma separated)', 'skills', 'React, Node.js, Python, SQL...', false, Code2)}
            {renderField('Strong Topics', 'strong_topics', 'React Hooks, REST APIs, CSS...', false, TrendingUp)}
            {renderField('Weak Topics', 'weak_topics', 'System Design, Docker, AWS...', false, Target)}
            {renderField('Interview History Notes', 'notes', 'Key takeaways from past interviews...', true, BookOpen)}
            {renderField('Favorite Companies', 'favorite_companies', 'Google, Microsoft, Amazon...', false, Heart)}
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {renderSelect('AI Personality', 'ai_personality', personalities, Sparkles)}
            {renderSelect('Preferred Interview Language', 'preferred_language', languages, Globe)}
            {renderSelect('Learning Style', 'learning_style', learningStyles, BookOpen)}
            {renderField('Favorite Programming Language', 'favorite_language', 'JavaScript, Python...', false, Code2)}
            {renderField('Career Goal Title', 'career_goal', 'Full Stack Developer', false, Target)}
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderField('Daily Goals', 'daily_goals', 'Solve 3 coding problems, practice 1 interview...', true, CheckCircle2)}
            {renderField('Career Goals', 'career_goals', 'Get placed at a product-based company by Dec 2026...', true, Target)}
            {renderField('Learning Habits', 'learning_habits', 'Study 2 hours daily, weekend projects...', true, BookOpen)}
            <div className="lg:col-span-2 p-4 rounded-xl bg-violet-500/5 border border-violet-500/15">
              <p className="text-xs text-violet-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <strong>AI Tip:</strong> The more details you provide here, the more personalized your AI coaching becomes. Your memory is synced across all features.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-4">
            {renderField('Personal Notes', 'notes', 'Write anything you want the AI to remember — interview feedback, learning notes, project ideas, personal reminders...', true, StickyNote)}
            <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/15">
              <p className="text-xs text-indigo-300 flex items-center gap-2">
                <Brain className="w-4 h-4" />
                <strong>Memory Sync:</strong> These notes are accessible to your AI across Career Assistant, Interview Copilot, and all other AI features.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AISecondBrain;
