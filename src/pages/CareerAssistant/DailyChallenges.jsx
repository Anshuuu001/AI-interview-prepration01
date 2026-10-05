import React, { useState, useEffect } from 'react';
import Button from '../../components/Button';
import { Trophy, Sparkles, Code2, Brain, MessageSquare, Puzzle, Database, Coffee, Flame, Medal, Timer, CheckCircle2, XCircle, ArrowRight, RotateCcw } from 'lucide-react';
import interviewService from '../../services/interviewService';

const DailyChallenges = () => {
  const [activeCategory, setActiveCategory] = useState('coding');
  const [challenge, setChallenge] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [streak, setStreak] = useState(parseInt(localStorage.getItem('daily_streak') || '0'));
  const [completedToday, setCompletedToday] = useState(JSON.parse(localStorage.getItem('completed_challenges_today') || '[]'));

  const categories = [
    { id: 'coding', label: 'Coding', icon: Code2, color: 'text-cyan-400', bgColor: 'bg-cyan-500' },
    { id: 'hr', label: 'HR/Behavioral', icon: MessageSquare, color: 'text-pink-400', bgColor: 'bg-pink-500' },
    { id: 'aptitude', label: 'Aptitude', icon: Brain, color: 'text-violet-400', bgColor: 'bg-violet-500' },
    { id: 'sql', label: 'SQL', icon: Database, color: 'text-amber-400', bgColor: 'bg-amber-500' },
    { id: 'java', label: 'Java', icon: Coffee, color: 'text-orange-400', bgColor: 'bg-orange-500' },
    { id: 'python', label: 'Python', icon: Code2, color: 'text-emerald-400', bgColor: 'bg-emerald-500' },
    { id: 'communication', label: 'Communication', icon: MessageSquare, color: 'text-indigo-400', bgColor: 'bg-indigo-500' },
    { id: 'puzzle', label: 'Puzzle', icon: Puzzle, color: 'text-rose-400', bgColor: 'bg-rose-500' },
  ];

  const prompts = {
    coding: 'Give me a coding challenge suitable for placement prep. Include: problem statement, input/output examples, constraints, and difficulty (Easy/Medium/Hard). Format clearly.',
    hr: 'Give me a behavioral/HR interview question for practice. Include the question and key points to address in the answer. Make it realistic.',
    aptitude: 'Give me a quantitative aptitude question for placement prep. Include: question, 4 options (A/B/C/D), correct answer, and detailed explanation.',
    sql: 'Give me an SQL practice question. Include: scenario/table description, the query to write, expected output, and the solution with explanation.',
    java: 'Give me a Java coding/concept question for interviews. Include: question, code snippet if applicable, expected output, and explanation.',
    python: 'Give me a Python coding question for interviews. Include: problem, example, expected output, and clean solution.',
    communication: 'Give me a communication/presentation exercise. Include: scenario, what to say, tone guidance, and evaluation criteria.',
    puzzle: 'Give me a logical puzzle/brain teaser for interviews. Include: the puzzle, hints, and the solution with reasoning.',
  };

  const loadChallenge = async () => {
    setLoading(true); setChallenge(null); setResult(null); setUserAnswer('');
    try {
      const res = await interviewService.chatNexus(
        [{ role: 'user', text: `${prompts[activeCategory]}\n\nMake it unique and interesting. Today's date: ${new Date().toDateString()}` }],
        'You are a daily challenge generator for placement preparation. Create engaging, educational challenges. Format cleanly with markdown.'
      );
      setChallenge(res.text || res);
    } catch (e) { setChallenge('Failed to load challenge: ' + e.message); }
    setLoading(false);
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim()) return;
    setLoading(true); setResult(null);
    try {
      const res = await interviewService.chatNexus(
        [{ role: 'user', text: `Evaluate this answer to the challenge.\n\nChallenge:\n${challenge}\n\nMy Answer:\n${userAnswer}\n\nProvide: score (0-100), correctness assessment, feedback, and the ideal answer.` }],
        'You are a challenge evaluator. Score the answer, explain what was right/wrong, and provide the ideal answer.'
      );
      setResult(res.text || res);
      // Track completion
      const today = new Date().toDateString();
      const lastDate = localStorage.getItem('last_challenge_date');
      if (lastDate !== today) {
        const newStreak = lastDate === new Date(Date.now() - 86400000).toDateString() ? streak + 1 : 1;
        setStreak(newStreak);
        localStorage.setItem('daily_streak', String(newStreak));
        localStorage.setItem('last_challenge_date', today);
      }
      const updated = [...completedToday, activeCategory];
      setCompletedToday(updated);
      localStorage.setItem('completed_challenges_today', JSON.stringify(updated));
    } catch (e) { setResult('Error: ' + e.message); }
    setLoading(false);
  };

  useEffect(() => { loadChallenge(); }, [activeCategory]);

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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <Trophy className="w-6 h-6 text-amber-400" />
            Daily Challenges
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
              <Flame className="w-3 h-3" /> Day {streak}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Practice daily across 8 categories — build your streak and climb the leaderboard</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <Flame className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-bold text-amber-400">{streak} Day Streak</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-bold text-emerald-400">{completedToday.length}/8 Today</span>
          </div>
        </div>
      </div>

      {/* Category Selector */}
      <div className="flex flex-wrap gap-2">
        {categories.map(c => (
          <button key={c.id} onClick={() => setActiveCategory(c.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
              activeCategory === c.id ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300 shadow-lg shadow-indigo-500/10' : 'bg-slate-900/40 border-white/5 text-slate-400 hover:bg-slate-800/60'}`}>
            <c.icon className={`w-3.5 h-3.5 ${c.color}`} />
            {c.label}
            {completedToday.includes(c.id) && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Challenge */}
        <div className="lg:col-span-2 space-y-4">
          <div className="liquid-glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                {React.createElement(categories.find(c => c.id === activeCategory)?.icon || Code2, { className: `w-4 h-4 ${categories.find(c => c.id === activeCategory)?.color}` })}
                Today's {categories.find(c => c.id === activeCategory)?.label} Challenge
              </h3>
              <button onClick={loadChallenge} className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
            <div className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed min-h-[120px]">
              {loading && !challenge ? (
                <div className="flex items-center gap-2 text-slate-500"><Sparkles className="w-4 h-4 animate-spin" /> Loading challenge...</div>
              ) : challenge ? renderText(challenge) : 'Loading...'}
            </div>
          </div>

          {/* Answer Input */}
          <div className="liquid-glass-card rounded-2xl p-5 space-y-3">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Your Answer</label>
            <textarea value={userAnswer} onChange={e => setUserAnswer(e.target.value)} rows={6}
              placeholder="Type your answer here..."
              className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 focus:border-indigo-500/50 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none transition-all resize-none font-mono" />
            <div className="flex gap-2.5">
              <Button onClick={submitAnswer} loading={loading && !challenge} disabled={!userAnswer.trim()} icon={CheckCircle2} className="flex-1">Submit Answer</Button>
              <Button onClick={loadChallenge} variant="secondary" icon={ArrowRight}>Next Challenge</Button>
            </div>
          </div>

          {/* Result */}
          {result && (
            <div className="liquid-glass-card rounded-2xl p-5">
              <h3 className="text-sm font-bold text-slate-200 mb-2 flex items-center gap-2">
                <Medal className="w-4 h-4 text-amber-400" /> Evaluation
              </h3>
              <div className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                {renderText(typeof result === 'string' ? result : JSON.stringify(result))}
              </div>
            </div>
          )}
        </div>

        {/* Progress Panel */}
        <div className="space-y-4">
          <div className="liquid-glass-card rounded-2xl p-5">
            <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" /> Today's Progress
            </h3>
            <div className="space-y-2">
              {categories.map(c => (
                <div key={c.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/30 border border-white/5">
                  <div className="flex items-center gap-2">
                    <c.icon className={`w-3.5 h-3.5 ${c.color}`} />
                    <span className="text-[11px] text-slate-400">{c.label}</span>
                  </div>
                  {completedToday.includes(c.id) ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-slate-700" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="liquid-glass-card rounded-2xl p-5">
            <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" /> Rewards
            </h3>
            <div className="space-y-2 text-[11px] text-slate-400">
              <p className="flex items-center gap-2"><Medal className="w-3.5 h-3.5 text-amber-400" /> 7-day streak: <span className="text-amber-400 font-bold">Bronze Badge</span></p>
              <p className="flex items-center gap-2"><Medal className="w-3.5 h-3.5 text-slate-300" /> 30-day streak: <span className="text-slate-300 font-bold">Silver Badge</span></p>
              <p className="flex items-center gap-2"><Medal className="w-3.5 h-3.5 text-yellow-400" /> 100-day streak: <span className="text-yellow-400 font-bold">Gold Badge</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyChallenges;
