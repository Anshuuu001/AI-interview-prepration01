import React, { useState } from 'react';
import Button from '../../components/Button';
import { Globe, Sparkles, Copy, CheckCircle2, Code2, User, Mail, FolderGit2, Download, Share2 } from 'lucide-react';
import interviewService from '../../services/interviewService';

const PortfolioGenerator = () => {
  const [details, setDetails] = useState({ name: '', title: '', about: '', skills: '', projects: '', github: '', linkedin: '', email: '' });
  const [activeGen, setActiveGen] = useState('portfolio');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generators = [
    { id: 'portfolio', label: 'Portfolio Website', icon: Globe, color: 'text-indigo-400' },
    { id: 'readme', label: 'GitHub README', icon: FolderGit2, color: 'text-slate-300' },
    { id: 'linkedin', label: 'LinkedIn Summary', icon: Share2, color: 'text-blue-400' },
    { id: 'about', label: 'About Me', icon: User, color: 'text-violet-400' },
    { id: 'contact', label: 'Contact Page', icon: Mail, color: 'text-emerald-400' },
  ];

  const prompts = {
    portfolio: 'Generate a complete single-page portfolio website in HTML/CSS/JS. Include: hero section, about me, skills, projects, and contact. Use modern design with dark theme, gradients, and animations. Make it ready to deploy.',
    readme: 'Generate a professional GitHub profile README.md. Include: animated header, about section, tech stack badges, GitHub stats placeholder, and social links. Use markdown with emojis.',
    linkedin: 'Write a compelling LinkedIn About/Summary section. Make it professional, engaging, highlight key skills and career goals. Include a call to action.',
    about: 'Write a professional "About Me" section for a portfolio. Include background, skills, interests, and career goals. Make it personal but professional.',
    contact: 'Generate an HTML contact page with a form (name, email, message), social links, and a map placeholder. Use modern dark theme styling.',
  };

  const generate = async () => {
    setLoading(true); setResult('');
    try {
      const info = `Name: ${details.name || 'Developer'}\nTitle: ${details.title || 'Full Stack Developer'}\nAbout: ${details.about || ''}\nSkills: ${details.skills || 'React, Node.js, Python'}\nProjects: ${details.projects || ''}\nGitHub: ${details.github || ''}\nLinkedIn: ${details.linkedin || ''}\nEmail: ${details.email || ''}`;
      const res = await interviewService.chatNexus(
        [{ role: 'user', text: `${prompts[activeGen]}\n\nUse this information:\n${info}` }],
        'You are a web developer and personal branding expert. Generate high-quality content. For HTML, include inline CSS. For Markdown, use proper formatting.'
      );
      setResult(res.text || res);
    } catch (e) { setResult('Error: ' + e.message); }
    setLoading(false);
  };

  const copyResult = () => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const downloadResult = () => {
    const ext = activeGen === 'readme' ? '.md' : '.html';
    const blob = new Blob([result], { type: 'text/plain' }); const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${activeGen}${ext}`; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in-up space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
          <Globe className="w-6 h-6 text-indigo-400" /> Portfolio Generator
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 text-[10px] font-bold uppercase tracking-wider"><Sparkles className="w-3 h-3" /> AI Builder</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">Generate portfolio websites, GitHub READMEs, LinkedIn summaries, and more</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {generators.map(g => (
          <button key={g.id} onClick={() => setActiveGen(g.id)} className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${activeGen === g.id ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300' : 'bg-slate-900/40 border-white/5 text-slate-400 hover:bg-slate-800/60'}`}>
            <g.icon className={`w-3.5 h-3.5 ${g.color}`} />{g.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="liquid-glass-card rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-200">Your Details</h3>
          {[
            { key: 'name', label: 'Full Name', placeholder: 'John Doe' },
            { key: 'title', label: 'Job Title', placeholder: 'Full Stack Developer' },
            { key: 'skills', label: 'Skills', placeholder: 'React, Node.js, Python...' },
            { key: 'github', label: 'GitHub', placeholder: 'github.com/...' },
            { key: 'linkedin', label: 'LinkedIn', placeholder: 'linkedin.com/in/...' },
            { key: 'email', label: 'Email', placeholder: 'john@email.com' },
          ].map(f => (
            <div key={f.key} className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">{f.label}</label>
              <input value={details[f.key]} onChange={e => setDetails(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder}
                className="w-full px-3 py-2 bg-slate-950/50 border border-white/10 rounded-lg text-xs text-slate-200 placeholder-slate-600 focus:outline-none" />
            </div>
          ))}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">About / Projects</label>
            <textarea value={details.about} onChange={e => setDetails(p => ({ ...p, about: e.target.value }))} rows={3} placeholder="Brief about yourself and projects..."
              className="w-full px-3 py-2 bg-slate-950/50 border border-white/10 rounded-lg text-xs text-slate-200 placeholder-slate-600 focus:outline-none resize-none" />
          </div>
          <Button onClick={generate} loading={loading} icon={Sparkles} className="w-full">Generate</Button>
        </div>

        <div className="lg:col-span-2 liquid-glass-card rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Generated Output</label>
            {result && (
              <div className="flex gap-1.5">
                <button onClick={copyResult} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-slate-400 hover:text-emerald-400 border border-white/5 transition-colors">
                  {copied ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />} {copied ? 'Copied' : 'Copy'}
                </button>
                <button onClick={downloadResult} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-slate-400 hover:text-indigo-400 border border-white/5 transition-colors">
                  <Download className="w-3 h-3" /> Download
                </button>
              </div>
            )}
          </div>
          <pre className="min-h-[400px] max-h-[600px] overflow-auto p-4 bg-slate-950/30 border border-white/5 rounded-xl text-xs text-slate-300 whitespace-pre-wrap font-mono">
            {result || <span className="text-slate-600 italic">Fill in your details and click Generate...</span>}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default PortfolioGenerator;
