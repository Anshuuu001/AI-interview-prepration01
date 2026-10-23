import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import interviewService from '../../services/interviewService';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Loader from '../../components/Loader';
import {
  Award,
  BookOpen,
  ArrowLeft,
  HelpCircle,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { getScoreColor } from '../../utils/formatters';
import { getTranslation } from '../../utils/translations';
import Footer from '../../components/Footer';

const PerformanceReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [report, setReport] = useState(() => {
    if (location.state?.report && location.state.report.id === id) {
      return location.state.report;
    }
    return null;
  });

  useEffect(() => {
    if (report && report.id === id) return;

    let isMounted = true;
    const loadReport = async () => {
      try {
        const history = await interviewService.getPastInterviews();
        const found = (history || []).find(r => r.id === id);
        if (!isMounted) return;
        if (!found) {
          navigate('/interview');
          return;
        }
        setReport(found);
      } catch (err) {
        if (!isMounted) return;
        console.error("Failed to load interview report:", err);
        navigate('/interview');
      }
    };
    loadReport();

    return () => { isMounted = false; };
  }, [id, navigate, report]);

  if (!report) return <Loader message={getTranslation('loadingGradingDashboard')} />;

  const overall = report.overallScore || 0;
  const overallBadgeColor = overall >= 80 
    ? 'bg-[#27845B]/10 text-[#27845B] border-[#27845B]/20' 
    : overall >= 60 
      ? 'bg-[#B87924]/10 text-[#B87924] border-[#B87924]/20' 
      : 'bg-[#C44848]/10 text-[#C44848] border-[#C44848]/20';

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up font-sans">
      
      {/* Header breadcrumb & Meta */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/interview')}
          className="flex items-center gap-2 text-xs font-semibold text-[#666675] hover:text-[#10194A] dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{getTranslation('backToInterviews')}</span>
        </button>

        <span className="text-xs text-[#666675] dark:text-[#C4C4D4] font-medium">
          {getTranslation('evaluatedOn')} {new Date(report.date).toLocaleDateString()}
        </span>
      </div>

      {/* Main Title Banner */}
      <div className="bg-white dark:bg-[#131E54] border border-[#E7E2DC] dark:border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#DFE8F7] text-[#10194A] border border-[#C9D9F2] mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>VEYRA Insights • AI Performance Appraisal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-editorial font-normal text-[#10194A] dark:text-[#FAF5EF]">
            {report.roleTitle}
          </h1>
          <p className="text-xs text-[#666675] dark:text-[#C4C4D4] mt-1 font-sans">
            Comprehensive diagnostic of your answers, communication structure, and technical depth evaluated by VEYRA AI.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={() => navigate('/dashboard')}>
            Dashboard
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/interview')}>
            Take Another Practice
          </Button>
        </div>
      </div>

      {/* Score Grid Cards */}
      <div className={`grid grid-cols-2 ${report.integrityScore !== undefined ? 'md:grid-cols-5' : 'md:grid-cols-4'} gap-4`}>
        
        {/* Overall Score Card */}
        <div className="bg-white dark:bg-[#131E54] p-5 rounded-2xl border border-[#E7E2DC] dark:border-white/10 text-center shadow-xs flex flex-col justify-between">
          <p className="text-[11px] font-bold text-[#666675] uppercase tracking-wider mb-2">Overall Score</p>
          <div className="text-3xl sm:text-4xl font-bold text-[#10194A] dark:text-[#FAF5EF] mb-2">{overall}%</div>
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${overallBadgeColor}`}>
            {overall >= 80 ? 'Distinguished' : overall >= 60 ? 'Competent' : 'Needs Practice'}
          </span>
        </div>

        {/* Technical Score Card */}
        <div className="bg-white dark:bg-[#131E54] p-5 rounded-2xl border border-[#E7E2DC] dark:border-white/10 text-center shadow-xs flex flex-col justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#666675] uppercase tracking-wider">Technical Depth</p>
            <span className="text-[9px] text-[#8E8E9F] block mb-1 font-medium">(Derived Estimate)</span>
          </div>
          <div className="text-3xl font-bold text-[#10194A] dark:text-[#FAF5EF] mb-2">{report.technicalScore || 0}%</div>
          <div className="w-full bg-[#FAF5EF] dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-[#10194A] dark:bg-[#DFE8F7] rounded-full" style={{ width: `${report.technicalScore || 0}%` }} />
          </div>
        </div>

        {/* Behavioral Score Card */}
        <div className="bg-white dark:bg-[#131E54] p-5 rounded-2xl border border-[#E7E2DC] dark:border-white/10 text-center shadow-xs flex flex-col justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#666675] uppercase tracking-wider">STAR Structure</p>
            <span className="text-[9px] text-[#8E8E9F] block mb-1 font-medium">(Derived Estimate)</span>
          </div>
          <div className="text-3xl font-bold text-[#10194A] dark:text-[#FAF5EF] mb-2">{report.behavioralScore || 0}%</div>
          <div className="w-full bg-[#FAF5EF] dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-[#EBA66F] rounded-full" style={{ width: `${report.behavioralScore || 0}%` }} />
          </div>
        </div>

        {/* Camera Presence Card */}
        <div className="bg-white dark:bg-[#131E54] p-5 rounded-2xl border border-[#E7E2DC] dark:border-white/10 text-center shadow-xs flex flex-col justify-between">
          <p className="text-[11px] font-bold text-[#666675] uppercase tracking-wider mb-2">Camera Presence</p>
          <div className="text-3xl font-bold text-[#10194A] dark:text-[#FAF5EF] mb-2">{report.presenceScore ?? 100}%</div>
          <div className="w-full bg-[#FAF5EF] dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-[#27845B] rounded-full" style={{ width: `${report.presenceScore ?? 100}%` }} />
          </div>
        </div>

        {/* AI Integrity Score Card */}
        {report.integrityScore !== undefined && (
          <div className="bg-white dark:bg-[#131E54] p-5 rounded-2xl border border-[#E7E2DC] dark:border-white/10 text-center shadow-xs flex flex-col justify-between col-span-2 md:col-span-1">
            <p className="text-[11px] font-bold text-[#666675] uppercase tracking-wider mb-2">Integrity</p>
            <div className={`text-3xl font-bold mb-2 ${report.integrityScore >= 75 ? 'text-[#27845B]' : 'text-[#C44848]'}`}>
              {report.integrityScore}%
            </div>
            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${
              report.cheatingRisk === 'Low'
                ? 'bg-[#27845B]/10 border-[#27845B]/20 text-[#27845B]'
                : 'bg-[#C44848]/10 border-[#C44848]/20 text-[#C44848]'
            }`}>
              {report.cheatingRisk || 'Low'} Risk
            </span>
          </div>
        )}
      </div>

      {/* General feedback summary card */}
      <Card title="Overall AI Evaluation Remarks" subtitle="Summary feedback synthesized from your full interview responses.">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-[#DFE8F7] text-[#10194A] rounded-xl flex-shrink-0">
            <Award className="w-5 h-5 text-[#10194A]" />
          </div>
          <p className="text-sm text-[#22243A] dark:text-[#FAF5EF] leading-relaxed">
            {report.feedback || "Your session demonstrated solid technical foundations. Focus on providing concise metrics and explicit outcomes in your STAR responses to elevate your scoring further."}
          </p>
        </div>
      </Card>

      {/* Question Diagnostics */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#10194A] dark:text-[#FAF5EF] uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#10194A]" />
            Question-by-Question Diagnostics ({report.qaList?.length || 0})
          </h2>
        </div>

        <div className="space-y-6">
          {(report.qaList || []).map((qa, index) => {
            const qaScore = qa.score || 0;
            const qaBadge = qaScore >= 80 
              ? 'bg-[#27845B]/10 text-[#27845B] border-[#27845B]/20' 
              : qaScore >= 60 
                ? 'bg-[#B87924]/10 text-[#B87924] border-[#B87924]/20' 
                : 'bg-[#C44848]/10 text-[#C44848] border-[#C44848]/20';

            return (
              <Card
                key={index}
                title={`Question ${index + 1}`}
                actions={
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${qaBadge}`}>
                    Score: {qaScore}%
                  </span>
                }
              >
                <div className="space-y-4 text-xs sm:text-sm">
                  {/* Prompt Box */}
                  <div className="p-4 bg-[#FAF5EF] dark:bg-white/5 border border-[#E7E2DC] dark:border-white/10 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-[#666675] uppercase tracking-wider flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-[#10194A]" />
                      Interview Prompt
                    </span>
                    <p className="text-sm font-bold text-[#10194A] dark:text-[#FAF5EF] leading-snug">{qa.question}</p>
                    {qa.correctness && (
                      <div className="pt-2">
                        <span className="text-[10px] font-bold text-[#27845B] bg-[#27845B]/10 px-2 py-0.5 rounded-md">
                          Accuracy: {qa.correctness}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Candidate Response */}
                  <div className="p-4 bg-white dark:bg-[#0E174B] border border-[#E7E2DC] dark:border-white/10 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-[#666675] uppercase tracking-wider">Candidate Response</span>
                    <p className="text-[#22243A] dark:text-[#C4C4D4] italic whitespace-pre-line leading-relaxed">
                      "{qa.userAnswer}"
                    </p>
                  </div>

                  {/* Technical Depth */}
                  {qa.technicalKnowledge && (
                    <div className="p-4 bg-[#DFE8F7]/40 border border-[#C9D9F2] rounded-xl space-y-1">
                      <span className="text-[10px] font-bold text-[#10194A] uppercase tracking-wider flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-[#10194A]" />
                        Technical Analysis
                      </span>
                      <p className="text-[#22243A] leading-relaxed">{qa.technicalKnowledge}</p>
                    </div>
                  )}

                  {/* Communication */}
                  {qa.communication && (
                    <div className="p-4 bg-white dark:bg-white/5 border border-[#E7E2DC] dark:border-white/10 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold text-[#EBA66F] uppercase tracking-wider flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5" />
                        Communication Delivery
                      </span>
                      <p className="text-[#22243A] dark:text-[#C4C4D4] leading-relaxed">{qa.communication}</p>
                    </div>
                  )}

                  {/* Improvement Recommendation */}
                  {qa.suggestions && (
                    <div className="p-4 bg-[#FAF5EF] dark:bg-white/5 border border-[#EBA66F]/40 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold text-[#B87924] uppercase tracking-wider flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-[#B87924]" />
                        Recommended Next Step
                      </span>
                      <p className="text-[#22243A] dark:text-[#C4C4D4] leading-relaxed">{qa.suggestions}</p>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PerformanceReport;
