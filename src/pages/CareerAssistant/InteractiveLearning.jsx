import React, { useState } from 'react';
import Button from '../../components/Button';
import { Puzzle, Sparkles, GitBranch, Map, ListTree, BarChart3, Code2, CheckSquare, ClipboardList, Play, Brain } from 'lucide-react';
import interviewService from '../../services/interviewService';

const InteractiveLearning = () => {
  const [topic, setTopic] = useState('');
  const [activeType, setActiveType] = useState('timeline');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const types = [
    { id: 'timeline', label: 'Timeline', icon: GitBranch, color: 'text-indigo-400' },
    { id: 'flowchart', label: 'Flowchart', icon: ListTree, color: 'text-cyan-400' },
    { id: 'mindmap', label: 'Mind Map', icon: Map, color: 'text-violet-400' },
    { id: 'decision', label: 'Decision Tree', icon: GitBranch, color: 'text-emerald-400' },
    { id: 'chart', label: 'Comparison', icon: BarChart3, color: 'text-amber-400' },
    { id: 'sandbox', label: 'Code Sandbox', icon: Code2, color: 'text-rose-400' },
    { id: 'quiz', label: 'Quiz', icon: Brain, color: 'text-pink-400' },
    { id: 'checklist', label: 'Checklist', icon: CheckSquare, color: 'text-teal-400' },
    { id: 'practice', label: 'Practice Tasks', icon: ClipboardList, color: 'text-orange-400' },
  ];

  const prompts = {
    timeline: 'Create a learning timeline for this topic. Show concepts in chronological order of learning, with prerequisites and milestones.',
    flowchart: 'Create a text-based flowchart showing the decision-making process or concept flow for this topic. Use arrows (→) and branches.',
    mindmap: 'Create a comprehensive mind map for this topic. Use indentation to show hierarchy. Include all sub-topics and connections.',
    decision: 'Create a decision tree for this topic. Show decision points with yes/no branches and outcomes.',
    chart: 'Create a comparison table/chart for this topic. Compare different approaches, technologies, or concepts side by side.',
    sandbox: 'Create 3 hands-on coding exercises for this topic. Include: problem statement, starter code, and solution for each.',
    quiz: 'Create a 10-question quiz about this topic. Include: questions, 4 options each, correct answers, and explanations.',
    checklist: 'Create a comprehensive learning checklist for this topic. Include: prerequisites, core concepts, practice items, and advanced topics.',
    practice: 'Create 5 practical tasks/mini-projects for this topic. Include: task description, requirements, hints, and expected outcome.',
  };

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true); setContent('');
    try {
      const res = await interviewService.chatNexus(
        [{ role: 'user', text: `${prompts[activeType]}\n\nTopic: ${topic}` }],
        'You are an interactive learning content creator. Create engaging, visual, well-structured educational content. Use formatting, emojis, and clear structure.'
      );
      setContent(res.text || res);
    } catch (e) { setContent('Error: ' + e.message); }
    setLoading(false);
  };

  const renderText = (text) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) return <strong key={i} className="font-bold text-indigo-300">{part.slice(2, -2)}</strong>;
      return <span key={i}>{part.replace(/(?:^|\n)\s*[-*]\s+/g, m => m.startsWith('\n') ? '\n• ' : '• ')}</span>;
    });
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in-up space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
          <Puzzle className="w-6 h-6 text-emerald-400" /> Interactive Learning
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3" /> Visual
          </span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">Learn visually — timelines, flowcharts, mind maps, quizzes, coding sandboxes, and more</p>
      </div>

      {/* Topic Input */}
      <div className="flex gap-3">
        <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="Enter a topic... (e.g., React Lifecycle, SQL Joins, OOP)"
          className="flex-1 px-4 py-3 bg-slate-950/50 border border-white/10 focus:border-emerald-500/50 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none transition-all" />
        <Button onClick={generate} loading={loading} disabled={!topic.trim()} icon={Play}>Generate</Button>
      </div>

      {/* Type Selector */}
      <div className="flex flex-wrap gap-2">
        {types.map(t => (
          <button key={t.id} onClick={() => setActiveType(t.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
              activeType === t.id ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' : 'bg-slate-900/40 border-white/5 text-slate-400 hover:bg-slate-800/60'}`}>
            <t.icon className={`w-3.5 h-3.5 ${t.color}`} />{t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {content && (
        <div className="liquid-glass-card rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            {React.createElement(types.find(t => t.id === activeType)?.icon || Puzzle, { className: `w-5 h-5 ${types.find(t => t.id === activeType)?.color}` })}
            <h3 className="text-lg font-bold text-slate-200">{types.find(t => t.id === activeType)?.label}: {topic}</h3>
          </div>
          <div className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
            {renderText(content)}
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveLearning;
