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
        <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#10194A] flex items-center gap-3">
          <Bot className="w-7 h-7 text-[#EBA66F]" />
          AI Interview Copilot
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EBA66F]/20 border border-[#EBA66F]/40 text-[#10194A] text-[10px] font-semibold uppercase tracking-wider">
            <Zap className="w-3 h-3 text-[#10194A]" /> Real-Time Coach
          </span>
        </h2>
        <p className="font-sans text-xs sm:text-sm text-[#666675] mt-1">
          Your real-time interview assistant — dynamic hints, STAR formulation, follow-up prediction, and actionable coaching
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Input Panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Question Input */}
          <div className="bg-white border border-[#E7E2DC] rounded-2xl p-6 shadow-sm space-y-4">
            <label className="text-[11px] font-semibold text-[#666675] uppercase tracking-wider block">Interview Question</label>
            <textarea 
              value={question} 
              onChange={e => setQuestion(e.target.value)} 
              rows={3}
              placeholder="Enter the interview question here... (e.g., 'Tell me about a time you led a team through a difficult technical challenge')"
              className="w-full px-4 py-3 bg-[#FAF5EF]/50 border border-[#E7E2DC] focus:bg-white focus:border-[#10194A] rounded-xl text-sm text-[#22243A] placeholder-[#666675]/50 focus:outline-none transition-all resize-none" 
            />

            <label className="text-[11px] font-semibold text-[#666675] uppercase tracking-wider flex items-center gap-2">
              Your Answer
              {isListening && <span className="flex items-center gap-1 text-[#C44848] animate-pulse"><Mic className="w-3 h-3" /> Recording microphone...</span>}
            </label>
            <textarea 
              value={answer} 
              onChange={e => setAnswer(e.target.value)} 
              rows={5}
              placeholder="Type or speak your answer clearly..."
              className="w-full px-4 py-3 bg-[#FAF5EF]/50 border border-[#E7E2DC] focus:bg-white focus:border-[#10194A] rounded-xl text-sm text-[#22243A] placeholder-[#666675]/50 focus:outline-none transition-all resize-none" 
            />

            {/* Confidence Meter */}
            {confidence > 0 && (
              <div className="flex items-center gap-3 p-3 bg-[#FAF5EF] rounded-xl border border-[#E7E2DC]">
                <Gauge className="w-4 h-4 text-[#10194A]" />
                <span className="text-[11px] font-semibold text-[#666675] uppercase tracking-wider">Verbal Fluency</span>
                <div className="flex-1 h-2 rounded-full bg-[#E7E2DC] overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-[#27845B] transition-all duration-500" 
                    style={{ width: `${confidence}%` }} 
                  />
                </div>
                <span className="text-xs font-semibold text-[#10194A]">{confidence}%</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2.5 pt-2">
              <button 
                onClick={toggleListening}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
                  isListening 
                    ? 'bg-[#C44848]/10 border-[#C44848]/40 text-[#C44848] animate-pulse' 
                    : 'bg-[#FAF5EF] border-[#E7E2DC] text-[#22243A] hover:bg-white'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-[#EBA66F]" />}
                {isListening ? 'Stop Recording' : 'Voice Input'}
              </button>
              <Button onClick={getHint} disabled={loading || !question.trim()} loading={loading && !result} size="sm" variant="secondary" icon={Lightbulb}>Live Hint</Button>
              <Button onClick={generateSTAR} disabled={loading || !question.trim()} loading={loading && !result} size="sm" variant="primary" icon={Star}>STAR Answer</Button>
              <Button onClick={predictFollowUp} disabled={loading || !question.trim()} loading={loading && !result} size="sm" variant="secondary" icon={MessageCircle}>Predict Follow-ups</Button>
              <Button onClick={getCoaching} disabled={loading || !answer.trim()} loading={loading && !result} size="sm" variant="secondary" icon={Brain}>AI Coaching</Button>
            </div>
          </div>

          {/* Result Panel */}
          {result && (
            <div className="bg-white border border-[#E7E2DC] rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-[#E7E2DC]">
                {result.type === 'star' && <Star className="w-4 h-4 text-[#EBA66F]" />}
                {result.type === 'predict' && <MessageCircle className="w-4 h-4 text-[#10194A]" />}
                {result.type === 'coaching' && <Brain className="w-4 h-4 text-[#E97878]" />}
                {result.type === 'hint' && <Lightbulb className="w-4 h-4 text-[#27845B]" />}
                {result.type === 'error' && <AlertTriangle className="w-4 h-4 text-[#C44848]" />}
                <h3 className="font-sans text-sm font-semibold text-[#10194A]">
                  {result.type === 'star' && 'STAR Answer Structure'}
                  {result.type === 'predict' && 'Anticipated Follow-up Inquiries'}
                  {result.type === 'coaching' && 'AI Evaluation & Coaching Feedback'}
                  {result.type === 'hint' && 'Strategic Live Hint'}
                  {result.type === 'error' && 'Diagnostic Notice'}
                </h3>
              </div>
              <div className={`text-sm leading-relaxed whitespace-pre-wrap font-sans ${result.type === 'error' ? 'text-[#C44848]' : 'text-[#22243A]'}`}>
                {renderMessageText(typeof result.text === 'string' ? result.text : JSON.stringify(result.text))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Quick Features Panel */}
        <div className="space-y-4">
          <div className="bg-white border border-[#E7E2DC] rounded-2xl p-6 shadow-sm">
            <h3 className="font-sans text-sm font-semibold text-[#10194A] mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#EBA66F]" /> Copilot Capabilities
            </h3>
            <div className="space-y-2.5">
              {[
                { icon: Lightbulb, label: 'Live Hints', desc: 'Contextual bullet points without giving away full answer', color: 'text-[#27845B]' },
                { icon: Star, label: 'STAR Generator', desc: 'Situation, Task, Action, Result structured answers', color: 'text-[#EBA66F]' },
                { icon: MessageCircle, label: 'Follow-up Prediction', desc: 'Anticipate interviewer probe questions', color: 'text-[#10194A]' },
                { icon: Gauge, label: 'Verbal Confidence', desc: 'Real-time filler and fluency tracking', color: 'text-[#E97878]' },
                { icon: Brain, label: 'AI Coaching', desc: 'Specific feedback on impact and clarity', color: 'text-[#10194A]' },
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[#FAF5EF]/60 border border-[#E7E2DC]">
                  <f.icon className={`w-4 h-4 mt-0.5 ${f.color} flex-shrink-0`} />
                  <div>
                    <p className="text-xs font-semibold text-[#10194A]">{f.label}</p>
                    <p className="text-[11px] text-[#666675]">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sample Questions */}
          <div className="bg-white border border-[#E7E2DC] rounded-2xl p-6 shadow-sm">
            <h3 className="font-sans text-sm font-semibold text-[#10194A] mb-3">Practice Prompts</h3>
            <div className="space-y-2">
              {[
                "Tell me about yourself and your career focus",
                "Describe a challenging project you spearheaded",
                "How do you handle critical architectural disagreements?",
                "Why are you interested in this specific role?",
                "Where do you see yourself evolving over the next 3 years?"
              ].map((q, i) => (
                <button 
                  key={i} 
                  onClick={() => setQuestion(q)}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl bg-[#FAF5EF]/60 border border-[#E7E2DC] hover:border-[#10194A]/40 text-xs text-[#22243A] hover:text-[#10194A] transition-all"
                >
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
