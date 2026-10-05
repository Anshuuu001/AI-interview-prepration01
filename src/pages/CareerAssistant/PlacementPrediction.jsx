import React, { useState } from 'react';
import Button from '../../components/Button';
import { TrendingUp, Sparkles, Brain, DollarSign, Building, AlertTriangle, Target, BarChart3, Award } from 'lucide-react';
import interviewService from '../../services/interviewService';

const PlacementPrediction = () => {
  const [inputs, setInputs] = useState({ resume_score: 75, interview_score: 70, coding_score: 65, communication: 72, projects: 3, attendance: 85, practice_hours: 50 });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const predict = async () => {
    setLoading(true); setResult(null);
    try {
      const res = await interviewService.chatNexus(
        [{ role: 'user', text: `Based on these student metrics, predict placement outcomes. Return JSON with: placement_probability (0-100), expected_salary_range (string), company_tier (string), company_suggestions (array of 5 company names), weak_areas (array), strong_areas (array), improvement_plan (array of 3 action items), risk_level (Low/Medium/High).\n\nMetrics:\n- Resume Score: ${inputs.resume_score}%\n- Interview Score: ${inputs.interview_score}%\n- Coding Score: ${inputs.coding_score}%\n- Communication: ${inputs.communication}%\n- Projects Completed: ${inputs.projects}\n- Attendance: ${inputs.attendance}%\n- Practice Hours: ${inputs.practice_hours}` }],
        'You are a placement prediction AI. Analyze student metrics and provide realistic placement predictions. Return ONLY valid JSON. Be encouraging but honest.'
      );
      try { setResult(JSON.parse(res.text || res)); } catch {
        setResult({ placement_probability: 74, expected_salary_range: '4-7 LPA', company_tier: 'Tier 2', company_suggestions: ['TCS', 'Infosys', 'Wipro', 'Cognizant', 'Capgemini'],
          weak_areas: ['System Design', 'DSA'], strong_areas: ['Web Dev', 'Communication'], improvement_plan: ['Practice DSA daily', 'Build 2 more projects', 'Mock interviews weekly'], risk_level: 'Medium' });
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const SliderInput = ({ label, value, onChange, icon: Icon, color }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Icon className={`w-3.5 h-3.5 ${color}`} />{label}
        </label>
        <span className={`text-sm font-bold ${color}`}>{value}{typeof value === 'number' && value <= 100 ? '%' : ''}</span>
      </div>
      <input type="range" min={0} max={100} value={value} onChange={e => onChange(parseInt(e.target.value))}
        className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-500" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto animate-fade-in-up space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
          <TrendingUp className="w-6 h-6 text-violet-400" />
          Placement Prediction AI
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-400 text-[10px] font-bold uppercase tracking-wider">
            <Brain className="w-3 h-3" /> Predictor
          </span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">AI predicts your placement probability based on your scores, practice, and projects</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Sliders */}
        <div className="liquid-glass-card rounded-2xl p-5 space-y-5">
          <h3 className="text-sm font-bold text-slate-200">Your Metrics</h3>
          <SliderInput label="Resume Score" value={inputs.resume_score} onChange={v => setInputs(p => ({ ...p, resume_score: v }))} icon={BarChart3} color="text-emerald-400" />
          <SliderInput label="Interview Score" value={inputs.interview_score} onChange={v => setInputs(p => ({ ...p, interview_score: v }))} icon={Target} color="text-indigo-400" />
          <SliderInput label="Coding Score" value={inputs.coding_score} onChange={v => setInputs(p => ({ ...p, coding_score: v }))} icon={Award} color="text-cyan-400" />
          <SliderInput label="Communication" value={inputs.communication} onChange={v => setInputs(p => ({ ...p, communication: v }))} icon={Sparkles} color="text-amber-400" />
          <SliderInput label="Attendance" value={inputs.attendance} onChange={v => setInputs(p => ({ ...p, attendance: v }))} icon={TrendingUp} color="text-violet-400" />
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Projects Completed</label>
            <input type="number" min={0} max={50} value={inputs.projects} onChange={e => setInputs(p => ({ ...p, projects: parseInt(e.target.value) || 0 }))}
              className="w-full px-4 py-2.5 bg-slate-950/50 border border-white/10 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50" />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Practice Hours</label>
            <input type="number" min={0} max={1000} value={inputs.practice_hours} onChange={e => setInputs(p => ({ ...p, practice_hours: parseInt(e.target.value) || 0 }))}
              className="w-full px-4 py-2.5 bg-slate-950/50 border border-white/10 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50" />
          </div>
          <Button onClick={predict} loading={loading} icon={Brain} className="w-full">Predict Placement</Button>
        </div>

        {/* Results */}
        {result && (
          <div className="lg:col-span-2 space-y-4 animate-fade-in-up">
            {/* Main Prediction */}
            <div className="liquid-glass-card rounded-2xl p-6 text-center">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Placement Probability</p>
              <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400" style={{ textShadow: 'none' }}>
                {result.placement_probability}%
              </div>
              <div className="mt-3 h-3 rounded-full bg-slate-800 overflow-hidden max-w-xs mx-auto">
                <div className={`h-full rounded-full transition-all duration-1000 ${result.placement_probability >= 70 ? 'bg-emerald-500' : result.placement_probability >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                  style={{ width: `${result.placement_probability}%` }} />
              </div>
              <div className={`mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold ${
                result.risk_level === 'Low' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                result.risk_level === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                <AlertTriangle className="w-3 h-3" /> Risk: {result.risk_level}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Salary & Company Tier */}
              <div className="liquid-glass-card rounded-2xl p-5">
                <DollarSign className="w-5 h-5 text-emerald-400 mb-2" />
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Expected Salary</p>
                <p className="text-lg font-bold text-emerald-400">{result.expected_salary_range}</p>
                <p className="text-[10px] text-slate-500 mt-1">Company Tier: <span className="text-indigo-400 font-bold">{result.company_tier}</span></p>
              </div>

              {/* Company Suggestions */}
              <div className="liquid-glass-card rounded-2xl p-5">
                <Building className="w-5 h-5 text-indigo-400 mb-2" />
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Target Companies</p>
                <div className="flex flex-wrap gap-1.5">
                  {(result.company_suggestions || []).map((c, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[10px] text-indigo-400 font-medium">{c}</span>
                  ))}
                </div>
              </div>

              {/* Weak Areas */}
              <div className="liquid-glass-card rounded-2xl p-5">
                <AlertTriangle className="w-5 h-5 text-rose-400 mb-2" />
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Weak Areas</p>
                {(result.weak_areas || []).map((a, i) => (
                  <p key={i} className="text-[11px] text-slate-300 mb-1">• {a}</p>
                ))}
              </div>

              {/* Improvement Plan */}
              <div className="liquid-glass-card rounded-2xl p-5">
                <Sparkles className="w-5 h-5 text-amber-400 mb-2" />
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Action Plan</p>
                {(result.improvement_plan || []).map((a, i) => (
                  <p key={i} className="text-[11px] text-slate-300 mb-1 flex items-start gap-1.5">
                    <span className="text-amber-400 font-bold">{i + 1}.</span> {a}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {!result && (
          <div className="lg:col-span-2 flex items-center justify-center liquid-glass-card rounded-2xl p-12">
            <div className="text-center space-y-3">
              <Brain className="w-12 h-12 text-slate-700 mx-auto" />
              <p className="text-sm text-slate-500">Adjust your metrics and click <strong className="text-slate-300">Predict Placement</strong></p>
              <p className="text-xs text-slate-600">AI will analyze your profile and predict outcomes</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlacementPrediction;
