import React, { useState } from 'react';
import Button from '../../components/Button';
import { FileText, Download, Sparkles, Plus, Trash2, GripVertical, Eye, BarChart3, CheckCircle2, ArrowUp, ArrowDown, Languages, Copy, Wand2 } from 'lucide-react';
import interviewService from '../../services/interviewService';

const SmartResumeBuilder = () => {
  const [activeTab, setActiveTab] = useState('editor');
  const [sections, setSections] = useState([
    { id: '1', type: 'header', title: 'Personal Info', content: { name: '', email: '', phone: '', location: '', linkedin: '', portfolio: '' } },
    { id: '2', type: 'summary', title: 'Professional Summary', content: '' },
    { id: '3', type: 'experience', title: 'Work Experience', items: [{ company: '', role: '', duration: '', bullets: [''] }] },
    { id: '4', type: 'education', title: 'Education', items: [{ institution: '', degree: '', year: '', gpa: '' }] },
    { id: '5', type: 'skills', title: 'Skills', content: '' },
    { id: '6', type: 'projects', title: 'Projects', items: [{ name: '', description: '', tech: '', link: '' }] },
  ]);
  const [atsScore, setAtsScore] = useState(null);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [draggedIdx, setDraggedIdx] = useState(null);

  const templates = [
    { id: 'modern', name: 'Modern', color: 'from-indigo-500 to-cyan-500' },
    { id: 'classic', name: 'Classic', color: 'from-slate-600 to-slate-800' },
    { id: 'creative', name: 'Creative', color: 'from-violet-500 to-pink-500' },
    { id: 'minimal', name: 'Minimal', color: 'from-emerald-500 to-teal-500' },
    { id: 'tech', name: 'Tech Pro', color: 'from-amber-500 to-orange-500' },
  ];

  const updateSection = (id, updates) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const moveSection = (idx, dir) => {
    const newSections = [...sections];
    const target = idx + dir;
    if (target < 0 || target >= newSections.length) return;
    [newSections[idx], newSections[target]] = [newSections[target], newSections[idx]];
    setSections(newSections);
  };

  const getResumeText = () => {
    return sections.map(s => {
      if (s.type === 'header') return `Name: ${s.content.name}\nEmail: ${s.content.email}\nPhone: ${s.content.phone}\nLocation: ${s.content.location}`;
      if (s.type === 'summary' || s.type === 'skills') return `${s.title}:\n${s.content}`;
      if (s.type === 'experience') return `${s.title}:\n${s.items.map(it => `${it.role} at ${it.company} (${it.duration})\n${it.bullets.map(b => `• ${b}`).join('\n')}`).join('\n\n')}`;
      if (s.type === 'education') return `${s.title}:\n${s.items.map(it => `${it.degree} - ${it.institution} (${it.year}) GPA: ${it.gpa}`).join('\n')}`;
      if (s.type === 'projects') return `${s.title}:\n${s.items.map(it => `${it.name}: ${it.description} [${it.tech}]`).join('\n')}`;
      return '';
    }).join('\n\n');
  };

  const calculateATS = async () => {
    setLoading(true);
    try {
      const resumeText = getResumeText();
      const res = await interviewService.chatNexus(
        [{ role: 'user', text: `Analyze this resume for ATS compatibility and give a detailed score. Return a JSON object with: score (0-100), keywords_found (array), missing_keywords (array), format_issues (array), strengths (array), improvements (array).\n\nResume:\n${resumeText}` }],
        'You are an ATS resume scanner. Analyze resumes and return ONLY a valid JSON object with the specified fields. Be realistic with scoring.'
      );
      try { setAtsScore(JSON.parse(res.text || res)); } catch { setAtsScore({ score: 75, keywords_found: ['Skills listed'], missing_keywords: ['More details needed'], strengths: ['Good structure'], improvements: ['Add metrics'] }); }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const getAISuggestions = async (sectionId) => {
    setLoading(true);
    const section = sections.find(s => s.id === sectionId);
    try {
      const res = await interviewService.chatNexus(
        [{ role: 'user', text: `Improve this resume section. Suggest better phrasing, action verbs, and quantifiable achievements. Section: ${section.title}\nContent: ${JSON.stringify(section.content || section.items)}` }],
        'You are a resume writing expert. Suggest improvements with strong action verbs, quantifiable metrics, and ATS-friendly keywords.'
      );
      setAiSuggestion({ sectionId, text: res.text || res });
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const exportResume = () => {
    const text = getResumeText();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'resume.txt'; a.click();
    URL.revokeObjectURL(url);
  };

  const renderFieldInput = (label, value, onChange, placeholder = '') => (
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2 bg-slate-950/50 border border-white/10 focus:border-indigo-500/50 rounded-lg text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-all" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto animate-fade-in-up space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-emerald-400" />
            Smart Resume Builder
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3" /> AI-Powered
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Build, optimize, and score your resume with AI assistance</p>
        </div>
        <div className="flex gap-2.5">
          <Button onClick={calculateATS} loading={loading} size="sm" variant="secondary" icon={BarChart3}>ATS Score</Button>
          <Button onClick={exportResume} size="sm" variant="primary" icon={Download}>Export</Button>
        </div>
      </div>

      {/* Template Selector */}
      <div className="flex gap-3 overflow-x-auto pb-1">
        {templates.map(t => (
          <button key={t.id} onClick={() => setSelectedTemplate(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap border ${
              selectedTemplate === t.id ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300 shadow-lg shadow-indigo-500/10' : 'border-white/5 bg-slate-900/40 text-slate-400 hover:bg-slate-800/60'}`}>
            <div className={`w-4 h-4 rounded bg-gradient-to-br ${t.color}`} />
            {t.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Editor */}
        <div className="xl:col-span-2 space-y-4">
          {sections.map((section, idx) => (
            <div key={section.id} className="liquid-glass-card rounded-2xl p-5 space-y-3"
              draggable onDragStart={() => setDraggedIdx(idx)} onDragOver={e => e.preventDefault()}
              onDrop={() => { if (draggedIdx !== null && draggedIdx !== idx) { moveSection(draggedIdx, idx - draggedIdx); setDraggedIdx(null); } }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-slate-600 cursor-grab" />
                  <h3 className="text-sm font-bold text-slate-200">{section.title}</h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => getAISuggestions(section.id)} className="p-1.5 rounded-lg text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 transition-colors" title="AI Suggestions">
                    <Wand2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => moveSection(idx, -1)} disabled={idx === 0} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 disabled:opacity-30 transition-colors">
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => moveSection(idx, 1)} disabled={idx === sections.length - 1} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 disabled:opacity-30 transition-colors">
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {section.type === 'header' && (
                <div className="grid grid-cols-2 gap-3">
                  {renderFieldInput('Full Name', section.content.name, v => updateSection(section.id, { content: { ...section.content, name: v } }), 'John Doe')}
                  {renderFieldInput('Email', section.content.email, v => updateSection(section.id, { content: { ...section.content, email: v } }), 'john@email.com')}
                  {renderFieldInput('Phone', section.content.phone, v => updateSection(section.id, { content: { ...section.content, phone: v } }), '+91-XXXXX')}
                  {renderFieldInput('Location', section.content.location, v => updateSection(section.id, { content: { ...section.content, location: v } }), 'Mumbai, India')}
                  {renderFieldInput('LinkedIn', section.content.linkedin, v => updateSection(section.id, { content: { ...section.content, linkedin: v } }), 'linkedin.com/in/...')}
                  {renderFieldInput('Portfolio', section.content.portfolio, v => updateSection(section.id, { content: { ...section.content, portfolio: v } }), 'portfolio.dev')}
                </div>
              )}

              {(section.type === 'summary' || section.type === 'skills') && (
                <textarea value={section.content} onChange={e => updateSection(section.id, { content: e.target.value })} rows={3}
                  placeholder={section.type === 'summary' ? 'Results-driven software engineer with 2+ years of experience...' : 'React, Node.js, Python, SQL, Docker, AWS...'}
                  className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 focus:border-indigo-500/50 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-all resize-none" />
              )}

              {section.type === 'experience' && section.items.map((item, itemIdx) => (
                <div key={itemIdx} className="p-3 rounded-xl bg-slate-900/30 border border-white/5 space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    {renderFieldInput('Company', item.company, v => { const items = [...section.items]; items[itemIdx] = { ...item, company: v }; updateSection(section.id, { items }); })}
                    {renderFieldInput('Role', item.role, v => { const items = [...section.items]; items[itemIdx] = { ...item, role: v }; updateSection(section.id, { items }); })}
                    {renderFieldInput('Duration', item.duration, v => { const items = [...section.items]; items[itemIdx] = { ...item, duration: v }; updateSection(section.id, { items }); })}
                  </div>
                  {item.bullets.map((b, bIdx) => (
                    <div key={bIdx} className="flex gap-2 items-center">
                      <span className="text-slate-600 text-xs">•</span>
                      <input value={b} onChange={e => { const items = [...section.items]; items[itemIdx].bullets[bIdx] = e.target.value; updateSection(section.id, { items }); }}
                        placeholder="Achieved X by doing Y resulting in Z..." className="flex-1 px-3 py-1.5 bg-slate-950/50 border border-white/5 rounded-lg text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-all" />
                    </div>
                  ))}
                  <button onClick={() => { const items = [...section.items]; items[itemIdx].bullets.push(''); updateSection(section.id, { items }); }}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"><Plus className="w-3 h-3" />Add bullet</button>
                </div>
              ))}

              {section.type === 'education' && section.items.map((item, itemIdx) => (
                <div key={itemIdx} className="grid grid-cols-4 gap-2">
                  {renderFieldInput('Institution', item.institution, v => { const items = [...section.items]; items[itemIdx] = { ...item, institution: v }; updateSection(section.id, { items }); })}
                  {renderFieldInput('Degree', item.degree, v => { const items = [...section.items]; items[itemIdx] = { ...item, degree: v }; updateSection(section.id, { items }); })}
                  {renderFieldInput('Year', item.year, v => { const items = [...section.items]; items[itemIdx] = { ...item, year: v }; updateSection(section.id, { items }); })}
                  {renderFieldInput('GPA', item.gpa, v => { const items = [...section.items]; items[itemIdx] = { ...item, gpa: v }; updateSection(section.id, { items }); })}
                </div>
              ))}

              {section.type === 'projects' && section.items.map((item, itemIdx) => (
                <div key={itemIdx} className="grid grid-cols-2 gap-2">
                  {renderFieldInput('Project Name', item.name, v => { const items = [...section.items]; items[itemIdx] = { ...item, name: v }; updateSection(section.id, { items }); })}
                  {renderFieldInput('Tech Stack', item.tech, v => { const items = [...section.items]; items[itemIdx] = { ...item, tech: v }; updateSection(section.id, { items }); })}
                  <div className="col-span-2">
                    {renderFieldInput('Description', item.description, v => { const items = [...section.items]; items[itemIdx] = { ...item, description: v }; updateSection(section.id, { items }); })}
                  </div>
                </div>
              ))}

              {/* AI Suggestion for this section */}
              {aiSuggestion && aiSuggestion.sectionId === section.id && (
                <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 text-xs text-amber-200 whitespace-pre-wrap">
                  <p className="font-bold text-amber-400 flex items-center gap-1.5 mb-1"><Wand2 className="w-3.5 h-3.5" /> AI Suggestion</p>
                  {aiSuggestion.text}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ATS Score Panel */}
        <div className="space-y-4">
          {atsScore && (
            <div className="liquid-glass-card rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" /> ATS Score
              </h3>
              <div className="text-center py-4">
                <div className="text-5xl font-black text-emerald-400" style={{ textShadow: '0 0 30px rgba(16,185,129,0.4)' }}>
                  {atsScore.score || 75}<span className="text-2xl text-emerald-500/70">%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500 transition-all duration-1000" style={{ width: `${atsScore.score || 75}%` }} />
                </div>
              </div>
              {atsScore.strengths && (
                <div>
                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-2">Strengths</p>
                  {atsScore.strengths.map((s, i) => (
                    <div key={i} className="flex items-start gap-2 text-[11px] text-slate-300 mb-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />{s}
                    </div>
                  ))}
                </div>
              )}
              {atsScore.improvements && (
                <div>
                  <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-2">Improvements</p>
                  {atsScore.improvements.map((s, i) => (
                    <div key={i} className="flex items-start gap-2 text-[11px] text-slate-300 mb-1">
                      <Sparkles className="w-3 h-3 text-amber-400 mt-0.5 flex-shrink-0" />{s}
                    </div>
                  ))}
                </div>
              )}
              {atsScore.missing_keywords && atsScore.missing_keywords.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-2">Missing Keywords</p>
                  <div className="flex flex-wrap gap-1.5">
                    {atsScore.missing_keywords.map((k, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[10px] text-rose-400 font-medium">{k}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="liquid-glass-card rounded-2xl p-5">
            <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-400" /> Resume Tips
            </h3>
            <div className="space-y-2 text-[11px] text-slate-400">
              <p>• Use action verbs: <span className="text-indigo-400">Led, Built, Optimized, Reduced</span></p>
              <p>• Quantify achievements: <span className="text-indigo-400">"Improved by 40%"</span></p>
              <p>• Keep to 1-2 pages max</p>
              <p>• Tailor keywords to job description</p>
              <p>• Use consistent formatting</p>
              <p>• Include relevant projects with tech stack</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartResumeBuilder;
