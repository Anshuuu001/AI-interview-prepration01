import React, { useState } from 'react';
import Button from '../../components/Button';
import { Mail, Sparkles, Copy, CheckCircle2, Send, RefreshCw } from 'lucide-react';
import interviewService from '../../services/interviewService';

const EmailAssistant = () => {
  const [emailType, setEmailType] = useState('cold');
  const [context, setContext] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const emailTypes = [
    { id: 'cold', label: 'Cold Email', desc: 'Reach out to recruiters' },
    { id: 'followup', label: 'Follow-up', desc: 'After interview/application' },
    { id: 'thankyou', label: 'Thank You', desc: 'Post-interview gratitude' },
    { id: 'internship', label: 'Internship Request', desc: 'Apply for internships' },
    { id: 'referral', label: 'Referral Request', desc: 'Ask for job referrals' },
    { id: 'hr_reply', label: 'HR Reply', desc: 'Respond to HR emails' },
    { id: 'acceptance', label: 'Offer Acceptance', desc: 'Accept a job offer' },
    { id: 'rejection', label: 'Offer Rejection', desc: 'Politely decline offers' },
    { id: 'negotiation', label: 'Salary Negotiation', desc: 'Negotiate compensation' },
  ];

  const prompts = {
    cold: 'Write a professional cold email to a recruiter/hiring manager. Make it personalized, concise, and compelling. Include a hook, value proposition, and call to action.',
    followup: 'Write a professional follow-up email after an interview or job application. Be polite, reference the conversation, and reiterate interest.',
    thankyou: 'Write a thank you email to send after a job interview. Express gratitude, mention specific discussion points, and reaffirm enthusiasm.',
    internship: 'Write a professional email requesting an internship opportunity. Highlight relevant skills, academic background, and eagerness to learn.',
    referral: 'Write a polite email requesting a job referral from a connection. Be specific about the role, explain why you\'re a good fit, and make it easy for them to refer.',
    hr_reply: 'Write a professional reply to an HR email. Be prompt, professional, and address all points mentioned in the original email.',
    acceptance: 'Write a professional offer acceptance email. Express enthusiasm, confirm the terms, and ask about next steps.',
    rejection: 'Write a polite offer rejection email. Express gratitude for the opportunity, provide a brief reason, and keep the door open for future opportunities.',
    negotiation: 'Write a professional salary negotiation email. Be diplomatic, provide market data justification, and express continued interest in the role.',
  };

  const generate = async () => {
    setLoading(true); setResult('');
    try {
      const res = await interviewService.chatNexus(
        [{ role: 'user', text: `${prompts[emailType]}\n\n${context ? `Context/Details: ${context}` : 'Use generic but realistic details.'}` }],
        'You are a professional email writer specializing in career communications. Write emails that are polished, concise, and effective. Use proper email format with Subject line, greeting, body, and closing.'
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

  return (
    <div className="max-w-6xl mx-auto animate-fade-in-up space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
          <Mail className="w-6 h-6 text-pink-400" />
          Email Assistant
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-pink-500/15 border border-pink-500/30 text-pink-400 text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3" /> AI Writer
          </span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">Generate professional career emails — cold outreach, follow-ups, negotiations, and more</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Email Type Selector */}
        <div className="space-y-4">
          <div className="liquid-glass-card rounded-2xl p-5">
            <h3 className="text-sm font-bold text-slate-200 mb-3">Email Type</h3>
            <div className="space-y-2">
              {emailTypes.map(t => (
                <button key={t.id} onClick={() => setEmailType(t.id)}
                  className={`w-full text-left px-3.5 py-3 rounded-xl text-xs transition-all border ${
                    emailType === t.id ? 'bg-pink-500/10 border-pink-500/30 text-pink-300' : 'bg-slate-900/30 border-white/5 text-slate-400 hover:bg-slate-800/60 hover:text-slate-300'}`}>
                  <span className="font-bold block">{t.label}</span>
                  <span className="text-[10px] opacity-60">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Input & Output */}
        <div className="lg:col-span-2 space-y-4">
          <div className="liquid-glass-card rounded-2xl p-5 space-y-3">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Context & Details (Optional)</label>
            <textarea value={context} onChange={e => setContext(e.target.value)} rows={4}
              placeholder="Add details like: company name, role, recruiter name, interview date, salary offered, your skills, etc. The more context, the better the email."
              className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 focus:border-pink-500/50 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none transition-all resize-none" />
            <Button onClick={generate} loading={loading} icon={Sparkles} className="w-full">
              Generate {emailTypes.find(t => t.id === emailType)?.label}
            </Button>
          </div>

          {result && (
            <div className="liquid-glass-card rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Generated Email</label>
                <div className="flex gap-1.5">
                  <button onClick={copyToClipboard} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors border border-white/5">
                    {copied ? <><CheckCircle2 className="w-3 h-3 text-emerald-400" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                  </button>
                  <button onClick={generate} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors border border-white/5">
                    <RefreshCw className="w-3 h-3" /> Regenerate
                  </button>
                </div>
              </div>
              <div className="px-5 py-4 bg-slate-950/30 border border-white/5 rounded-xl text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                {result}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailAssistant;
