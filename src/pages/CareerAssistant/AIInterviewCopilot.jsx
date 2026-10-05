import React, { useState, useRef, useEffect } from 'react';
import Button from '../../components/Button';
import { Bot, Sparkles, Mic, MicOff, Gauge, Star, MessageCircle, ArrowRight, Lightbulb, CheckCircle2, AlertTriangle, Zap, Send, RefreshCw, Brain } from 'lucide-react';
import interviewService from '../../services/interviewService';
import { CAREER_SYSTEM_PROMPT } from '../../services/geminiService';

const AIInterviewCopilot = () => {
  const [mode, setMode] = useState('practice'); // practice | star | predict | coaching
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      const rec = new SR();
      rec.continuous = true; rec.interimResults = true; rec.lang = 'en-US';
      rec.onresult = (e) => {
        let transcript = '';
        for (let i = 0; i < e.results.length; i++) { transcript += e.results[i][0].transcript; }
        setAnswer(transcript);
        // Simple confidence based on word count and filler detection
        const words = transcript.split(/\s+/).filter(Boolean);
        const fillers = words.filter(w => ['um', 'uh', 'like', 'you know', 'basically', 'actually'].includes(w.toLowerCase()));
        const rawConf = Math.min(100, Math.max(20, words.length * 3 - fillers.length * 15));
        setConfidence(rawConf);
      };
      rec.onerror = () => setIsListening(false);
      rec.onend = () => setIsListening(false);
      recognitionRef.current = rec;
    }
    return () => { try { recognitionRef.current?.stop(); } catch(e){} };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) { alert('Speech Recognition not supported.'); return; }
    if (isListening) { recognitionRef.current.stop(); } else { setAnswer(''); setConfidence(0); recognitionRef.current.start(); setIsListening(true); }
  };

  const generateSTAR = async () => {
    if (!question.trim()) return;
    setLoading(true); setResult(null);
    try {
      const res = await interviewService.chatNexus([{ role: 'user', text: `Generate a STAR method answer for this interview question. Format clearly with Situation, Task, Action, Result sections. Make it specific and impressive.\n\nQuestion: ${question}\n${answer ? `\nMy rough answer: ${answer}` : ''}` }],
        'You are an expert interview coach. Generate detailed STAR method answers. Be specific with examples, metrics, and results. Format with clear S/T/A/R headers.');
      setResult({ type: 'star', text: res.text || res });
    } catch (e) { setResult({ type: 'error', text: e.message }); }
    setLoading(false);
  };

  const predictFollowUp = async () => {
    if (!question.trim()) return;
    setLoading(true); setResult(null);
    try {
      const res = await interviewService.chatNexus([{ role: 'user', text: `Based on this interview question and answer, predict 5 likely follow-up questions the interviewer might ask. For each, provide a brief coaching hint.\n\nQuestion: ${question}\nAnswer: ${answer || 'Not provided'}` }],
        'You are a senior interviewer. Predict follow-up questions and provide coaching hints. Be realistic about what interviewers typically dig into.');
      setResult({ type: 'predict', text: res.text || res });
    } catch (e) { setResult({ type: 'error', text: e.message }); }
    setLoading(false);
  };

  const getCoaching = async () => {
    if (!answer.trim()) return;
    setLoading(true); setResult(null);
    try {
      const res = await interviewService.chatNexus([{ role: 'user', text: `Analyze this interview answer and provide detailed real-time coaching feedback. Score it, identify filler words, check grammar, assess confidence level, and suggest an improved version.\n\nQuestion: ${question || 'General interview question'}\nMy Answer: ${answer}` }],
        'You are an interview coach. Analyze answers for: Grammar issues, Filler words, Confidence level, Structure quality, Content depth. Provide scores out of 10 and a rewritten improved answer.');
      setResult({ type: 'coaching', text: res.text || res });
    } catch (e) { setResult({ type: 'error', text: e.message }); }
    setLoading(false);
  };

  const getHint = async () => {
    if (!question.trim()) return;
    setLoading(true); setResult(null);
    try {
      const res = await interviewService.chatNexus([{ role: 'user', text: `Give me a brief hint to answer this interview question. Don't give the full answer, just key points to mention and approach.\n\nQuestion: ${question}` }],
        'You are an interview coach. Give brief, actionable hints — key points to mention, approach to take, common pitfalls to avoid. Keep it concise.');
      setResult({ type: 'hint', text: res.text || res });
    } catch (e) { setResult({ type: 'error', text: e.message }); }
    setLoading(false);
  };

  const renderMessageText = (text) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        return <strong key={i} className="font-bold text-indigo-300">{part.slice(2, -2)}</strong>;
      }
      let clean = part.replace(/(?:^|\n)\s*[-*]\s+/g, m => m.startsWith('\n') ? '\n• ' : '• ');
      return <span key={i}>{clean}</span>;
    });
  };

  const confColor = confidence >= 70 ? 'text-emerald-400' : confidence >= 40 ? 'text-amber-400' : 'text-rose-400';
  const confBg = confidence >= 70 ? 'bg-emerald-500' : confidence >= 40 ? 'bg-amber-500' : 'bg-rose-500';

  return (
    <div className="max-w-6xl mx-auto animate-fade-in-up space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
          <Bot className="w-6 h-6 text-cyan-400" />
          AI Interview Copilot
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-[10px] font-bold uppercase tracking-wider">
            <Zap className="w-3 h-3" /> Real-Time Coach
          </span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">Your real-time interview assistant — hints, STAR answers, follow-up prediction, and live coaching</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Input Panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Question Input */}
          <div className="liquid-glass-card rounded-2xl p-5 space-y-4">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Interview Question</label>
            <textarea value={question} onChange={e => setQuestion(e.target.value)} rows={3}
              placeholder="Enter the interview question here... (e.g., 'Tell me about a time you led a team through a difficult project')"
              className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 focus:border-cyan-500/50 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all resize-none" />

            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              Your Answer
              {isListening && <span className="flex items-center gap-1 text-rose-400 animate-pulse"><Mic className="w-3 h-3" /> Recording...</span>}
            </label>
            <textarea value={answer} onChange={e => setAnswer(e.target.value)} rows={5}
              placeholder="Type or speak your answer..."
              className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 focus:border-cyan-500/50 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all resize-none" />

            {/* Confidence Meter */}
            {confidence > 0 && (
              <div className="flex items-center gap-3">
                <Gauge className={`w-4 h-4 ${confColor}`} />
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Confidence</span>
                <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className={`h-full rounded-full ${confBg} transition-all duration-500`} style={{ width: `${confidence}%` }} />
                </div>
                <span className={`text-sm font-bold ${confColor}`}>{confidence}%</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2.5">
              <button onClick={toggleListening}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isListening ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 border animate-pulse' : 'bg-slate-800/80 border-white/10 text-slate-300 border hover:bg-slate-700/60'}`}>
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                {isListening ? 'Stop Recording' : 'Voice Input'}
              </button>
              <Button onClick={getHint} disabled={loading || !question.trim()} loading={loading && !result} size="sm" variant="secondary" icon={Lightbulb}>Live Hint</Button>
              <Button onClick={generateSTAR} disabled={loading || !question.trim()} loading={loading && !result} size="sm" variant="primary" icon={Star}>STAR Answer</Button>
              <Button onClick={predictFollowUp} disabled={loading || !question.trim()} loading={loading && !result} size="sm" variant="secondary" icon={MessageCircle}>Predict Follow-ups</Button>
              <Button onClick={getCoaching} disabled={loading || !answer.trim()} loading={loading && !result} size="sm" variant="secondary" icon={Brain}>AI Coaching</Button>
            </div>
          </div>

          {/* Result */}
          {result && (
            <div className="liquid-glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                {result.type === 'star' && <Star className="w-4 h-4 text-amber-400" />}
                {result.type === 'predict' && <MessageCircle className="w-4 h-4 text-cyan-400" />}
                {result.type === 'coaching' && <Brain className="w-4 h-4 text-violet-400" />}
                {result.type === 'hint' && <Lightbulb className="w-4 h-4 text-emerald-400" />}
                {result.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-400" />}
                <h3 className="text-sm font-bold text-slate-200">
                  {result.type === 'star' && 'STAR Answer Generated'}
                  {result.type === 'predict' && 'Predicted Follow-up Questions'}
                  {result.type === 'coaching' && 'AI Coaching Feedback'}
                  {result.type === 'hint' && 'Live Hint'}
                  {result.type === 'error' && 'Error'}
                </h3>
              </div>
              <div className={`text-sm leading-relaxed whitespace-pre-wrap ${result.type === 'error' ? 'text-rose-400' : 'text-slate-300'}`}>
                {renderMessageText(typeof result.text === 'string' ? result.text : JSON.stringify(result.text))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Quick Features Panel */}
        <div className="space-y-4">
          <div className="liquid-glass-card rounded-2xl p-5">
            <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" /> Copilot Features
            </h3>
            <div className="space-y-2.5">
              {[
                { icon: Lightbulb, label: 'Live Hints', desc: 'Get key points without full answer', color: 'text-emerald-400' },
                { icon: Star, label: 'STAR Generator', desc: 'Structured behavioral answers', color: 'text-amber-400' },
                { icon: MessageCircle, label: 'Follow-up Prediction', desc: 'Know what they\'ll ask next', color: 'text-cyan-400' },
                { icon: Gauge, label: 'Confidence Meter', desc: 'Real-time speaking confidence', color: 'text-violet-400' },
                { icon: Brain, label: 'AI Coaching', desc: 'Grammar, fillers, improvements', color: 'text-rose-400' },
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/30 border border-white/5 hover:border-white/10 transition-colors">
                  <f.icon className={`w-4 h-4 mt-0.5 ${f.color} flex-shrink-0`} />
                  <div>
                    <p className="text-xs font-bold text-slate-200">{f.label}</p>
                    <p className="text-[10px] text-slate-500">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sample Questions */}
          <div className="liquid-glass-card rounded-2xl p-5">
            <h3 className="text-sm font-bold text-slate-200 mb-3">Quick Practice</h3>
            <div className="space-y-2">
              {[
                "Tell me about yourself",
                "Describe a challenging project you worked on",
                "What is your greatest weakness?",
                "Why should we hire you?",
                "Where do you see yourself in 5 years?"
              ].map((q, i) => (
                <button key={i} onClick={() => setQuestion(q)}
                  className="w-full text-left px-3 py-2.5 rounded-xl bg-slate-900/30 border border-white/5 hover:border-cyan-500/30 text-[11px] text-slate-400 hover:text-slate-200 transition-all">
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInterviewCopilot;
