import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import interviewService from '../../services/interviewService';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { Video, Calendar, Clock, Star, Play, Award, HelpCircle, ChevronRight, PlayCircle, Camera } from 'lucide-react';
import { getScoreColor } from '../../utils/formatters';
import { getTranslation } from '../../utils/translations';
import Footer from '../../components/Footer';

const VideoInterviewDashboard = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
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

  const videoTemplates = templates.filter(t => t.isVideo);

  useEffect(() => {
    if (videoTemplates.length > 0 && !selectedTemplateId) {
      setSelectedTemplateId(videoTemplates[0].id);
    }
  }, [videoTemplates, selectedTemplateId]);

  const handleStartInterview = (id) => {
    navigate(`/interview/room/${id}`);
  };

  return (
    <div className="space-y-8 animate-fade-in-up font-sans">
      
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#DFE8F7] text-[#10194A] border border-[#C9D9F2]">
          <Camera className="w-3.5 h-3.5 text-[#10194A]" />
          <span>Camera-Proctored Simulation</span>
        </div>
        <h1 className="font-editorial text-3xl sm:text-4xl font-normal text-[#10194A] dark:text-[#FAF5EF]">
          AI Video Interview Arena
        </h1>
        <p className="text-sm text-[#666675] dark:text-[#C4C4D4] max-w-2xl leading-relaxed">
          {getTranslation('videoArenaDescription')}
        </p>
      </div>

      {/* Templates Section */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-[#666675] dark:text-[#C4C4D4] uppercase tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#27845B]" />
          {getTranslation('selectVideoProfile')}
        </h2>
        
        <div className="bg-white dark:bg-[#131E54] rounded-2xl border border-[#E7E2DC] dark:border-white/10 p-6 sm:p-8 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-[#10194A] dark:text-[#FAF5EF]">
            {getTranslation('configureYourSession')}
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {videoTemplates.map(tpl => (
              <button
                key={tpl.id}
                onClick={() => setSelectedTemplateId(tpl.id)}
                className={`p-3.5 rounded-xl text-xs font-semibold transition-all text-left flex flex-col gap-2 border ${
                  selectedTemplateId === tpl.id 
                    ? 'bg-[#10194A] text-white border-[#10194A] shadow-xs' 
                    : 'bg-[#FAF5EF] dark:bg-white/5 border-[#E7E2DC] dark:border-white/10 text-[#22243A] dark:text-[#FAF5EF] hover:border-[#D6CFCE]'
                }`}
              >
                <Video className={`w-4 h-4 ${selectedTemplateId === tpl.id ? 'text-[#EBA66F]' : 'text-[#666675]'}`} />
                <span className="truncate w-full">{tpl.title}</span>
              </button>
            ))}
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-[#E7E2DC] dark:border-white/10 gap-4">
            <div className="text-xs text-[#666675] dark:text-[#C4C4D4] max-w-md">
              <span className="font-bold text-[#27845B]">{getTranslation('proctoringActiveLabel')}</span> {getTranslation('proctoringActiveDescription')}
            </div>
            
            <button
              onClick={() => selectedTemplateId && handleStartInterview(selectedTemplateId)}
              disabled={!selectedTemplateId}
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#E97878] hover:bg-[#DC6666] disabled:bg-[#E7E2DC] disabled:text-[#666675] text-white text-xs font-semibold shadow-xs hover:shadow transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{getTranslation('launchInterview')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* History section */}
      <div className="space-y-4 pt-4">
        <h2 className="text-xs font-bold text-[#666675] dark:text-[#C4C4D4] uppercase tracking-wider">
          {getTranslation('pastEvaluationReports')}
        </h2>
        
        {history.filter(h => templates.find(t => t.id === h.templateId)?.isVideo).length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-sm text-[#666675]">{getTranslation('noPastVideoReports')}</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {history.filter(h => templates.find(t => t.id === h.templateId)?.isVideo).map((rep) => {
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
                      {getTranslation('inspectReport')}
                    </Button>
                  }
                >
                  <div className="flex items-center justify-between gap-4 mt-2">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-[10px] text-[#666675] font-bold uppercase tracking-wider">{getTranslation('overall')}</p>
                        <span className={`inline-block px-2.5 py-0.5 mt-1 rounded-full text-xs font-bold border ${scoreBadgeColor}`}>
                          {score}%
                        </span>
                      </div>
                      <div className="h-8 w-px bg-[#E7E2DC] dark:bg-white/10" />
                      <div>
                        <p className="text-[10px] text-[#666675] font-bold uppercase tracking-wider">{getTranslation('technicalLabel')} (Est.)</p>
                        <p className="text-sm font-bold text-[#10194A] dark:text-[#FAF5EF] mt-1">{rep.technicalScore}%</p>
                      </div>
                      <div className="h-8 w-px bg-[#E7E2DC] dark:bg-white/10" />
                      <div>
                        <p className="text-[10px] text-[#666675] font-bold uppercase tracking-wider">{getTranslation('behavioral')} (Est.)</p>
                        <p className="text-sm font-bold text-[#10194A] dark:text-[#FAF5EF] mt-1">{rep.behavioralScore}%</p>
                      </div>
                    </div>

                    <div className="text-xs text-[#666675] flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-[#10194A]" />
                      <span>{Math.round(rep.duration / 60)} {getTranslation('minutesLabel')}</span>
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

export default VideoInterviewDashboard;
