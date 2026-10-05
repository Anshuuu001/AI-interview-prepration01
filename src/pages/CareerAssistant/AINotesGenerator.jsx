import React, { useState } from 'react';
import Button from '../../components/Button';
import { FileText, Sparkles, BookOpen, StickyNote, Brain, Map, Download, Bookmark, Copy, CheckCircle2, List, CreditCard } from 'lucide-react';
import interviewService from '../../services/interviewService';

const AINotesGenerator = () => {
  const [input, setInput] = useState('');
  const [outputType, setOutputType] = useState('notes');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [copied, setCopied] = useState(false);

  const outputTypes = [
    { id: 'notes', label: 'Notes', icon: FileText, color: 'text-indigo-400' },
    { id: 'summary', label: 'Summary', icon: List, color: 'text-cyan-400' },
    { id: 'flashcards', label: 'Flashcards', icon: CreditCard, color: 'text-amber-400' },
    { id: 'mindmap', label: 'Mind Map', icon: Map, color: 'text-violet-400' },
    { id: 'cheatsheet', label: 'Cheat Sheet', icon: BookOpen, color: 'text-emerald-400' },
    { id: 'revision', label: 'Revision Notes', icon: Brain, color: 'text-rose-400' },
    { id: 'interview', label: 'Interview Notes', icon: StickyNote, color: 'text-pink-400' },
  ];

  const prompts = {
    notes: 'Convert this content into well-organized study notes with headers, bullet points, key definitions, and important concepts highlighted. Make it easy to review.',
    summary: 'Create a concise summary of this content. Capture the key points, main ideas, and critical takeaways in 5-10 bullet points.',
    flashcards: 'Create 10 flashcards from this content. Format each as:\nQ: [Question]\nA: [Answer]\n\nFocus on key concepts, definitions, and important details.',
    mindmap: 'Create a text-based mind map from this content. Use indentation to show hierarchy:\n- Main Topic\n  - Subtopic 1\n    - Detail\n  - Subtopic 2\nMake it comprehensive but organized.',
    cheatsheet: 'Create a developer cheat sheet from this content. Include: syntax examples, common patterns, tips & tricks, gotchas, and quick reference items. Format for quick scanning.',
    revision: 'Create last-minute revision notes from this content. Include: key formulas, important definitions, must-remember points, common mistakes to avoid. Keep it ultra-concise.',
    interview: 'Convert this content into interview preparation notes. Include: likely interview questions, key points to mention, example answers, common follow-ups, and impressive details to highlight.',
  };

  const generate = async () => {
    if (!input.trim()) return;
    setLoading(true); setResult('');
    try {
      const res = await interviewService.chatNexus(
        [{ role: 'user', text: `${prompts[outputType]}\n\nContent:\n${input}` }],
        'You are an expert note-taking assistant. Create high-quality, well-formatted study materials. Use markdown formatting with headers, bullets, bold text for emphasis.'
      );
      setResult(res.text || res);
    } catch (e) { setResult('Error: ' + e.message); }
    setLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportPDF = () => {
    const blob = new Blob([result], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${outputType}_notes.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  const addBookmark = () => {
    if (result) {
      setBookmarks(prev => [...prev, { id: Date.now(), type: outputType, preview: result.substring(0, 100) + '...', content: result, time: new Date().toLocaleString() }]);
    }
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
          <StickyNote className="w-6 h-6 text-amber-400" />
          AI Notes Generator
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3" /> Smart Convert
          </span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">Convert any AI answer or text into notes, flashcards, mind maps, cheat sheets, and more</p>
      </div>

      {/* Output Type Selector */}
      <div className="flex flex-wrap gap-2">
        {outputTypes.map(t => (
          <button key={t.id} onClick={() => setOutputType(t.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
              outputType === t.id ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300 shadow-lg shadow-indigo-500/10' : 'bg-slate-900/40 border-white/5 text-slate-400 hover:bg-slate-800/60'}`}>
            <t.icon className={`w-3.5 h-3.5 ${t.color}`} />
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="liquid-glass-card rounded-2xl p-5 space-y-3">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Input Content</label>
          <textarea value={input} onChange={e => setInput(e.target.value)} rows={14}
            placeholder="Paste any text, AI conversation, or content here. The AI will convert it into your chosen format..."
            className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 focus:border-indigo-500/50 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none transition-all resize-none" />
          <Button onClick={generate} loading={loading} disabled={!input.trim()} icon={Sparkles} className="w-full">
            Generate {outputTypes.find(t => t.id === outputType)?.label}
          </Button>
        </div>

        {/* Output */}
        <div className="liquid-glass-card rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Generated Output</label>
            {result && (
              <div className="flex gap-1.5">
                <button onClick={copyToClipboard} className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors" title="Copy">
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button onClick={addBookmark} className="p-1.5 rounded-lg text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 transition-colors" title="Bookmark">
                  <Bookmark className="w-3.5 h-3.5" />
                </button>
                <button onClick={exportPDF} className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors" title="Export">
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
          <div className="min-h-[320px] px-4 py-3 bg-slate-950/30 border border-white/5 rounded-xl text-sm text-slate-300 whitespace-pre-wrap leading-relaxed overflow-y-auto max-h-[500px]">
            {result ? renderText(result) : <span className="text-slate-600 italic">Output will appear here...</span>}
          </div>
        </div>
      </div>

      {/* Bookmarks */}
      {bookmarks.length > 0 && (
        <div className="liquid-glass-card rounded-2xl p-5">
          <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-amber-400" /> Bookmarked Notes ({bookmarks.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {bookmarks.map(b => (
              <div key={b.id} className="p-3 rounded-xl bg-slate-900/30 border border-white/5 cursor-pointer hover:border-amber-500/20 transition-colors" onClick={() => setResult(b.content)}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold uppercase">{b.type}</span>
                  <span className="text-[10px] text-slate-600">{b.time}</span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2">{b.preview}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AINotesGenerator;
