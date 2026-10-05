import React, { useState } from 'react';
import Button from '../../components/Button';
import { Download, Share2, Copy, FileText, Code2, File, Link2, CheckCircle2, Sparkles } from 'lucide-react';

const ExportSharing = () => {
  const [content, setContent] = useState('');
  const [exported, setExported] = useState(false);
  const formats = [
    { id: 'pdf', label: 'PDF', icon: FileText, ext: '.txt', mime: 'text/plain' },
    { id: 'markdown', label: 'Markdown', icon: Code2, ext: '.md', mime: 'text/markdown' },
    { id: 'html', label: 'HTML', icon: File, ext: '.html', mime: 'text/html' },
    { id: 'json', label: 'JSON', icon: Code2, ext: '.json', mime: 'application/json' },
    { id: 'word', label: 'Word (Text)', icon: FileText, ext: '.txt', mime: 'text/plain' },
  ];

  const exportAs = (format) => {
    const text = content || 'No content to export. Paste your chat or notes here first.';
    let output = text;
    if (format.id === 'html') output = `<!DOCTYPE html><html><head><title>Export</title><style>body{font-family:sans-serif;padding:2rem;background:#0f172a;color:#e2e8f0;}</style></head><body><pre>${text}</pre></body></html>`;
    if (format.id === 'json') output = JSON.stringify({ content: text, exported_at: new Date().toISOString(), source: 'ElevateAI' }, null, 2);
    if (format.id === 'markdown') output = `# ElevateAI Export\n\n${text}\n\n---\n*Exported on ${new Date().toLocaleString()}*`;
    const blob = new Blob([output], { type: format.mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `elevateai_export${format.ext}`; a.click();
    URL.revokeObjectURL(url);
    setExported(true); setTimeout(() => setExported(false), 2000);
  };

  const copyLink = () => { navigator.clipboard.writeText(window.location.href); setExported(true); setTimeout(() => setExported(false), 2000); };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
          <Share2 className="w-6 h-6 text-teal-400" /> Export & Sharing
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">Export your chats, notes, and data as PDF, Markdown, HTML, JSON, or share with mentors</p>
      </div>

      <div className="liquid-glass-card rounded-2xl p-5 space-y-3">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Content to Export</label>
        <textarea value={content} onChange={e => setContent(e.target.value)} rows={8}
          placeholder="Paste your chat transcript, notes, or any content here..."
          className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 focus:border-teal-500/50 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none transition-all resize-none" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {formats.map(f => (
          <button key={f.id} onClick={() => exportAs(f)}
            className="liquid-glass-card rounded-xl p-4 text-center space-y-2 hover:border-teal-500/20 transition-colors group">
            <f.icon className="w-6 h-6 text-teal-400 mx-auto group-hover:scale-110 transition-transform" />
            <p className="text-xs font-bold text-slate-300">{f.label}</p>
            <p className="text-[10px] text-slate-600">{f.ext}</p>
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <Button onClick={copyLink} variant="secondary" icon={exported ? CheckCircle2 : Link2} className="flex-1">
          {exported ? 'Copied!' : 'Copy Share Link'}
        </Button>
        <Button onClick={() => { navigator.clipboard.writeText(content); setExported(true); setTimeout(() => setExported(false), 2000); }} variant="secondary" icon={Copy} className="flex-1">
          Copy Content
        </Button>
      </div>
    </div>
  );
};

export default ExportSharing;
