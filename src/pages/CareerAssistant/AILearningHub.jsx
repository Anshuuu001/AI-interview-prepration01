import React, { useState } from 'react';
import Button from '../../components/Button';
import { BookOpen, Sparkles, Play, FileText, Code2, CheckSquare, Brain, CreditCard, RotateCcw, BarChart3, ChevronRight } from 'lucide-react';
import interviewService from '../../services/interviewService';

const AILearningHub = () => {
  const [topic, setTopic] = useState('');
  const [course, setCourse] = useState(null);
  const [activeModule, setActiveModule] = useState(0);
  const [loading, setLoading] = useState(false);
  const [completedModules, setCompletedModules] = useState([]);
  const [quizAnswer, setQuizAnswer] = useState('');
  const [quizResult, setQuizResult] = useState(null);

  const generateCourse = async () => {
    if (!topic.trim()) return;
    setLoading(true); setCourse(null); setCompletedModules([]);
    try {
      const res = await interviewService.chatNexus(
        [{ role: 'user', text: `Create a personalized learning course on "${topic}" for interview prep. Return JSON with:\n- title (string)\n- description (string)\n- modules (array of 6 objects with: title, type (video|notes|coding|quiz|project|flashcard), content (detailed text), duration (string))\n\nMake each module substantive with real educational content.` }],
        'You are an expert course creator. Create detailed, practical learning modules. Return ONLY valid JSON. Each module should have rich educational content.'
      );
      try { setCourse(JSON.parse(res.text || res)); } catch {
        setCourse({
          title: `Master ${topic}`, description: `Comprehensive course on ${topic}`,
          modules: [
            { title: 'Introduction & Basics', type: 'notes', content: `Introduction to ${topic}...`, duration: '15 min' },
            { title: 'Core Concepts', type: 'notes', content: `Deep dive into core concepts...`, duration: '30 min' },
            { title: 'Practical Examples', type: 'coding', content: `Hands-on coding exercises...`, duration: '45 min' },
            { title: 'Practice Quiz', type: 'quiz', content: `Test your knowledge...`, duration: '20 min' },
            { title: 'Mini Project', type: 'project', content: `Build a mini project...`, duration: '60 min' },
            { title: 'Revision Flashcards', type: 'flashcard', content: `Key concepts to remember...`, duration: '10 min' },
          ]
        });
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const generateModuleContent = async (moduleIdx) => {
    setLoading(true);
    const module = course.modules[moduleIdx];
    try {
      const res = await interviewService.chatNexus(
        [{ role: 'user', text: `Generate detailed educational content for this module:\n\nCourse: ${course.title}\nModule: ${module.title}\nType: ${module.type}\n\nProvide comprehensive, practical content suitable for interview preparation. If it's a quiz, include 5 MCQs. If it's coding, include code examples. If flashcards, create 8 cards.` }],
        'You are an expert educator. Create detailed, practical learning content. Include examples, code snippets, and explanations.'
      );
      const updated = { ...course };
      updated.modules[moduleIdx] = { ...module, content: res.text || res, generated: true };
      setCourse(updated);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const markComplete = (idx) => {
    if (!completedModules.includes(idx)) {
      setCompletedModules(prev => [...prev, idx]);
    }
  };

  const completion = course ? Math.round((completedModules.length / course.modules.length) * 100) : 0;

  const typeIcon = (type) => {
    const icons = { video: Play, notes: FileText, coding: Code2, quiz: Brain, project: CheckSquare, flashcard: CreditCard };
    return icons[type] || FileText;
  };

  const typeColor = (type) => {
    const colors = { video: 'text-rose-400', notes: 'text-indigo-400', coding: 'text-cyan-400', quiz: 'text-amber-400', project: 'text-emerald-400', flashcard: 'text-violet-400' };
    return colors[type] || 'text-slate-400';
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
          <BookOpen className="w-6 h-6 text-indigo-400" />
          AI Learning Hub
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3" /> Personalized
          </span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">AI creates personalized courses with notes, coding, quizzes, projects, and flashcards</p>
      </div>

      {/* Topic Input */}
      {!course && (
        <div className="liquid-glass-card rounded-2xl p-6 space-y-4">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">What do you want to learn?</label>
          <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g., React Hooks, System Design, SQL Joins, Node.js Event Loop..."
            className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 focus:border-indigo-500/50 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none transition-all" />
          <div className="flex flex-wrap gap-2">
            {['React Hooks', 'System Design', 'SQL Joins', 'OOP in Java', 'Python DSA', 'REST APIs', 'Git & GitHub', 'CSS Flexbox'].map(t => (
              <button key={t} onClick={() => setTopic(t)} className="px-3 py-1.5 rounded-xl bg-slate-900/40 border border-white/5 text-[11px] text-slate-400 hover:text-indigo-300 hover:border-indigo-500/30 transition-all">{t}</button>
            ))}
          </div>
          <Button onClick={generateCourse} loading={loading} disabled={!topic.trim()} icon={Sparkles} className="w-full">Generate Course</Button>
        </div>
      )}

      {/* Course View */}
      {course && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Module List */}
          <div className="space-y-4">
            <div className="liquid-glass-card rounded-2xl p-5">
              <h3 className="text-sm font-bold text-slate-200 mb-1">{course.title}</h3>
              <p className="text-[10px] text-slate-500 mb-3">{course.description}</p>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full rounded-full bg-indigo-500 transition-all duration-500" style={{ width: `${completion}%` }} />
                </div>
                <span className="text-xs font-bold text-indigo-400">{completion}%</span>
              </div>
              <div className="space-y-1.5">
                {course.modules.map((m, idx) => {
                  const Icon = typeIcon(m.type);
                  return (
                    <button key={idx} onClick={() => setActiveModule(idx)}
                      className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left text-xs transition-all border ${
                        activeModule === idx ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300' : 'bg-slate-900/30 border-white/5 text-slate-400 hover:bg-slate-800/60'}`}>
                      <Icon className={`w-3.5 h-3.5 ${typeColor(m.type)} flex-shrink-0`} />
                      <span className="flex-1 truncate font-medium">{m.title}</span>
                      {completedModules.includes(idx) && <CheckSquare className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
              <button onClick={() => { setCourse(null); setTopic(''); }} className="w-full mt-3 flex items-center justify-center gap-2 p-2 rounded-xl text-[11px] text-slate-500 hover:text-slate-300 hover:bg-slate-800/60 transition-colors">
                <RotateCcw className="w-3 h-3" /> New Course
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-4">
            <div className="liquid-glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {React.createElement(typeIcon(course.modules[activeModule]?.type), { className: `w-5 h-5 ${typeColor(course.modules[activeModule]?.type)}` })}
                  <h3 className="text-lg font-bold text-slate-200">{course.modules[activeModule]?.title}</h3>
                  <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-[10px] text-slate-500 font-medium">{course.modules[activeModule]?.duration}</span>
                </div>
                <div className="flex gap-2">
                  {!course.modules[activeModule]?.generated && (
                    <Button onClick={() => generateModuleContent(activeModule)} loading={loading} size="sm" variant="secondary" icon={Sparkles}>Generate Content</Button>
                  )}
                  <Button onClick={() => markComplete(activeModule)} size="sm" variant={completedModules.includes(activeModule) ? 'secondary' : 'primary'} icon={CheckSquare}>
                    {completedModules.includes(activeModule) ? 'Completed' : 'Mark Done'}
                  </Button>
                </div>
              </div>
              <div className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed min-h-[300px]">
                {renderText(course.modules[activeModule]?.content)}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button onClick={() => setActiveModule(Math.max(0, activeModule - 1))} disabled={activeModule === 0} size="sm" variant="secondary">← Previous</Button>
              <Button onClick={() => setActiveModule(Math.min(course.modules.length - 1, activeModule + 1))} disabled={activeModule === course.modules.length - 1} size="sm" variant="primary" icon={ChevronRight}>Next →</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AILearningHub;
