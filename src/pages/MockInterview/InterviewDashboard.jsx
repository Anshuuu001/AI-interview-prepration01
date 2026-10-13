import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import interviewService from '../../services/interviewService';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { Video, Calendar, Clock, Star, Play, Award, HelpCircle, ChevronRight } from 'lucide-react';
import { getScoreColor } from '../../utils/formatters';
import { getTranslation } from '../../utils/translations';
import Footer from '../../components/Footer';

const InterviewDashboard = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const tpls = await interviewService.getTemplates();
        setTemplates(tpls || []);
      } catch (err) {
        console.error("Failed to load interview templates:", err);
      }
      try {
        const hist = await interviewService.getPastInterviews();
        setHistory(hist || []);
      } catch (err) {
        console.error("Failed to load interview history:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleStartInterview = (id) => {
    navigate(`/interview/room/${id}`);
  };

  return (
    <div className="space-y-8 animate-fade-in-up font-sans">
      
      {/* Page Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#DFE8F7] text-[#10194A] border border-[#C9D9F2]">
          <Video className="w-3.5 h-3.5" />
          <span>Interactive Simulation</span>
        </div>
        <h1 className="font-editorial text-3xl sm:text-4xl font-normal text-[#10194A] dark:text-[#FAF5EF]">
          VEYRA Interview Coach
        </h1>
        <p className="text-sm text-[#666675] dark:text-[#C4C4D4] max-w-2xl">
          Choose a role-specific interview profile to practice verbal and structured STAR responses under proctored real-time conditions with VEYRA AI.
        </p>
      </div>

      {/* Templates Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-[#666675] dark:text-[#C4C4D4] uppercase tracking-wider">
            Available Interview Profiles
          </h2>
          <span className="text-xs text-[#666675]">
            {templates.filter(t => !t.isVideo).length} Profiles
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {templates.filter(t => !t.isVideo).map((tpl) => (
            <Card
              key={tpl.id}
              hoverEffect
              title={tpl.title}
              subtitle={`${tpl.category} • ${tpl.difficulty}`}
              footer={
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs text-[#666675] dark:text-[#C4C4D4] flex items-center gap-1.5 font-medium">
                    <HelpCircle className="w-3.5 h-3.5 text-[#10194A] dark:text-[#EBA66F]" />
                    {tpl.questions.length} Questions
                  </span>
                  <button
                    onClick={() => handleStartInterview(tpl.id)}
                    className="px-4 py-2 bg-[#E97878] hover:bg-[#DC6666] text-white text-xs font-semibold rounded-xl shadow-xs hover:shadow transition-all duration-200 active:scale-95 flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Start Practice</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              }
            >
              <p className="text-xs sm:text-sm text-[#666675] dark:text-[#C4C4D4] leading-relaxed min-h-[55px]">
                {tpl.description}
              </p>
            </Card>
          ))}
        </div>
      </div>

      {/* History section */}
      <div className="space-y-4 pt-4">
        <h2 className="text-xs font-bold text-[#666675] dark:text-[#C4C4D4] uppercase tracking-wider">
          Previous Evaluation Reports
        </h2>
        
        {history.filter(h => !templates.find(t => t.id === h.templateId)?.isVideo).length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-sm text-[#666675]">No past evaluation reports found. Launch your first mock round above!</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {history.filter(h => !templates.find(t => t.id === h.templateId)?.isVideo).map((rep) => {
              const score = rep.overallScore || 0;
              const scoreBadgeColor = score >= 80 
                ? 'bg-[#27845B]/10 text-[#27845B] border-[#27845B]/20' 
                : score >= 60 
                  ? 'bg-[#B87924]/10 text-[#B87924] border-[#B87924]/20' 
                  : 'bg-[#C44848]/10 text-[#C44848] border-[#C44848]/20';

              return (
                <Card
                  key={rep.id}
                  hoverEffect
                  title={rep.roleTitle}
                  subtitle={new Date(rep.date).toLocaleDateString()}
                  actions={
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => navigate(`/interview/report/${rep.id}`)}
                      className="rounded-xl"
                    >
                      Inspect Report
                    </Button>
                  }
                >
                  <div className="flex items-center justify-between gap-4 mt-2">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-[10px] text-[#666675] font-bold uppercase tracking-wider">Overall</p>
                        <span className={`inline-block px-2.5 py-0.5 mt-1 rounded-full text-xs font-bold border ${scoreBadgeColor}`}>
                          {score}%
                        </span>
                      </div>
                      <div className="h-8 w-px bg-[#E7E2DC] dark:bg-white/10" />
                      <div>
                        <p className="text-[10px] text-[#666675] font-bold uppercase tracking-wider">Technical</p>
                        <p className="text-sm font-bold text-[#10194A] dark:text-[#FAF5EF] mt-1">{rep.technicalScore}%</p>
                      </div>
                      <div className="h-8 w-px bg-[#E7E2DC] dark:bg-white/10" />
                      <div>
                        <p className="text-[10px] text-[#666675] font-bold uppercase tracking-wider">Behavioral</p>
                        <p className="text-sm font-bold text-[#10194A] dark:text-[#FAF5EF] mt-1">{rep.behavioralScore}%</p>
                      </div>
                    </div>

                    <div className="text-xs text-[#666675] flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-[#10194A] dark:text-[#DFE8F7]" />
                      <span>{Math.round(rep.duration / 60)} mins</span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default InterviewDashboard;
