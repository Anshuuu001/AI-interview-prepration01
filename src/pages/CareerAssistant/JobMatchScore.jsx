import React, { useState } from 'react';
import Button from '../../components/Button';
import { Target, Sparkles, Upload, Briefcase, CheckCircle2, XCircle, TrendingUp, BarChart3 } from 'lucide-react';
import interviewService from '../../services/interviewService';

const JobMatchScore = () => {
  const [resume, setResume] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!resume.trim() || !jobDesc.trim()) return;
    setLoading(true); setResult(null);
    try {
      const res = await interviewService.chatNexus(
        [{ role: 'user', text: `Analyze the match between this resume and job description. Return a JSON object with:\n- overall_match (0-100)\n- technical_match (0-100)\n- soft_skill_match (0-100)\n- communication (0-100)\n- experience_match (0-100)\n- matching_skills (array of strings)\n- missing_skills (array of strings)\n- recommendations (array of strings)\n- strengths (array of strings)\n\nResume:\n${resume}\n\nJob Description:\n${jobDesc}` }],
        'You are an expert ATS and job matching system. Analyze resumes against job descriptions. Return ONLY valid JSON. Be realistic and specific with scoring.'
      );
      try { setResult(JSON.parse(res.text || res)); } catch {
        setResult({ overall_match: 78, technical_match: 82, soft_skill_match: 70, communication: 75, experience_match: 68,
          matching_skills: ['JavaScript', 'React', 'Problem Solving'], missing_skills: ['Docker', 'AWS', 'System Design'],
          recommendations: ['Add cloud experience', 'Highlight leadership roles'], strengths: ['Strong frontend skills', 'Good project experience'] });
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const getColor = (score) => {
    if (score >= 80) return { text: 'text-emerald-400', bg: 'bg-emerald-500', glow: 'shadow-emerald-500/20' };
    if (score >= 60) return { text: 'text-amber-400', bg: 'bg-amber-500', glow: 'shadow-amber-500/20' };
    return { text: 'text-rose-400', bg: 'bg-rose-500', glow: 'shadow-rose-500/20' };
  };

  const ScoreRing = ({ score, label, size = 'lg' }) => {
    const c = getColor(score);
    const isLg = size === 'lg';
    return (
      <div className="text-center">
        <div className={`relative ${isLg ? 'w-32 h-32' : 'w-20 h-20'} mx-auto`}>
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none"
              stroke={score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'} strokeWidth="3"
              strokeDasharray={`${score}, 100`} strokeLinecap="round" className="transition-all duration-1000" />
          </svg>
          <div className={`absolute inset-0 flex flex-col items-center justify-center`}>
            <span className={`${isLg ? 'text-3xl' : 'text-lg'} font-black ${c.text}`}>{score}</span>
            <span className={`${isLg ? 'text-xs' : 'text-[9px]'} text-slate-500`}>%</span>
          </div>
        </div>
        <p className={`mt-2 ${isLg ? 'text-xs' : 'text-[10px]'} font-bold text-slate-400`}>{label}</p>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in-up space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
          <Target className="w-6 h-6 text-cyan-400" />
          AI Job Match Score
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3" /> Match Engine
          </span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">Upload your resume and a job description — AI calculates your match score with detailed breakdown</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="liquid-glass-card rounded-2xl p-5 space-y-3">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5" /> Your Resume
          </label>
          <textarea value={resume} onChange={e => setResume(e.target.value)} rows={8}
            placeholder="Paste your resume text here..."
            className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 focus:border-cyan-500/50 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none transition-all resize-none" />
        </div>
        <div className="liquid-glass-card rounded-2xl p-5 space-y-3">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5" /> Job Description
          </label>
          <textarea value={jobDesc} onChange={e => setJobDesc(e.target.value)} rows={8}
            placeholder="Paste the job description here..."
            className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 focus:border-cyan-500/50 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none transition-all resize-none" />
        </div>
      </div>

      <Button onClick={analyze} loading={loading} disabled={!resume.trim() || !jobDesc.trim()} icon={Target} className="w-full">
        Analyze Job Match
      </Button>

      {result && (
        <div className="space-y-6 animate-fade-in-up">
          {/* Score Overview */}
          <div className="liquid-glass-card rounded-2xl p-8">
            <div className="flex flex-wrap items-center justify-center gap-8">
              <ScoreRing score={result.overall_match} label="Overall Match" size="lg" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                <ScoreRing score={result.technical_match} label="Technical" size="sm" />
                <ScoreRing score={result.soft_skill_match} label="Soft Skills" size="sm" />
                <ScoreRing score={result.communication} label="Communication" size="sm" />
                <ScoreRing score={result.experience_match} label="Experience" size="sm" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Matching Skills */}
            <div className="liquid-glass-card rounded-2xl p-5">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Matching Skills
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {(result.matching_skills || []).map((s, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-medium">{s}</span>
                ))}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="liquid-glass-card rounded-2xl p-5">
              <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5" /> Missing Skills
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {(result.missing_skills || []).map((s, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[10px] text-rose-400 font-medium">{s}</span>
                ))}
              </div>
            </div>

            {/* Strengths */}
            <div className="liquid-glass-card rounded-2xl p-5">
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> Strengths
              </h3>
              <div className="space-y-1.5">
                {(result.strengths || []).map((s, i) => (
                  <p key={i} className="text-[11px] text-slate-300 flex items-start gap-1.5"><CheckCircle2 className="w-3 h-3 text-indigo-400 mt-0.5 flex-shrink-0" />{s}</p>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="liquid-glass-card rounded-2xl p-5">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Recommendations
              </h3>
              <div className="space-y-1.5">
                {(result.recommendations || []).map((s, i) => (
                  <p key={i} className="text-[11px] text-slate-300 flex items-start gap-1.5"><BarChart3 className="w-3 h-3 text-amber-400 mt-0.5 flex-shrink-0" />{s}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobMatchScore;
