import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import interviewService from '../../services/interviewService';
import Card from '../../components/Card';
import Button from '../../components/Button';
import {
  TrendingUp,
  Video,
  Award,
  BookOpen,
  ArrowRight,
  MessageSquare,
  Sparkles,
  Zap,
  ShieldCheck,
  ChevronRight,
  Code2,
  Calendar,
  Clock,
  FileText
} from 'lucide-react';
import { getScoreColor } from '../../utils/formatters';
import { getTranslation } from '../../utils/translations';
import Footer from '../../components/Footer';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    readiness: 72,
    interviewCount: 0,
    avgAptitude: 0
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const interviewHistory = await interviewService.getPastInterviews() || [];
        const aptitudeHistory = await interviewService.getTestResults() || [];

        setInterviews(interviewHistory);

        const avgInterview = interviewHistory.length > 0
          ? Math.round(interviewHistory.reduce((acc, curr) => acc + (curr.overallScore || 0), 0) / interviewHistory.length)
          : 70;
        
        const avgApt = aptitudeHistory.length > 0
          ? Math.round(aptitudeHistory.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / aptitudeHistory.length)
          : 0;

        const computedReadiness = Math.round((avgInterview * 0.6) + ((avgApt || 60) * 0.4));

        setMetrics({
          readiness: computedReadiness || 72,
          interviewCount: interviewHistory.length,
          avgAptitude: avgApt
        });
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in-up font-sans">
      
      {/* ── Editorial Welcome Banner ── */}
      <div className="relative rounded-3xl bg-white dark:bg-[#131E54] border border-[#E7E2DC] dark:border-white/10 p-7 sm:p-9 shadow-[0_2px_8px_-2px_rgba(16,25,74,0.05)] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
        
        <div className="space-y-3 max-w-2xl">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#DFE8F7] text-[#10194A] border border-[#C9D9F2]">
            <Zap className="w-3.5 h-3.5 text-[#10194A]" />
            <span>AI Career Preparation Active</span>
          </div>

          <h1 className="font-editorial text-3xl sm:text-4xl font-normal text-[#10194A] dark:text-[#FAF5EF] leading-tight">
            Welcome back, {user?.name || 'Candidate'}.
          </h1>

          <p className="text-sm text-[#666675] dark:text-[#C4C4D4] leading-relaxed max-w-xl">
            Track your interview readiness, review recent AI evaluations, and hone your technical answers before your next real-world round.
          </p>
        </div>

        {/* Primary Action Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-shrink-0 w-full sm:w-auto">
          <Button
            variant="primary"
            onClick={() => navigate('/interview')}
            className="px-6 py-3.5 text-sm font-semibold rounded-xl"
            icon={Video}
          >
            Start New Interview
          </Button>

          <Button
            variant="secondary"
            onClick={() => navigate('/practice')}
            className="px-5 py-3.5 text-sm font-semibold rounded-xl"
            icon={Code2}
          >
            Practice Code
          </Button>
        </div>
      </div>

      {/* ── Performance Summary Metric Panels ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        {/* Metric 1: Readiness Index */}
        <div className="bg-white dark:bg-[#131E54] p-6 rounded-2xl border border-[#E7E2DC] dark:border-white/10 shadow-[0_2px_8px_-2px_rgba(16,25,74,0.05)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#666675] uppercase tracking-wider">Readiness Rating</span>
              <div className="w-8 h-8 rounded-lg bg-[#27845B]/10 text-[#27845B] flex items-center justify-center font-bold">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-[#10194A] dark:text-[#FAF5EF]">
                {metrics.readiness}
              </span>
              <span className="text-lg font-semibold text-[#666675]">%</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E7E2DC] dark:border-white/10">
            <div className="w-full bg-[#FAF5EF] dark:bg-white/10 h-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#27845B] rounded-full transition-all duration-500" 
                style={{ width: `${metrics.readiness}%` }} 
              />
            </div>
            <p className="text-[11px] text-[#666675] dark:text-[#C4C4D4] mt-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#27845B]" />
              Composite interview & aptitude score
            </p>
          </div>
        </div>

        {/* Metric 2: Interviews Done */}
        <div className="bg-white dark:bg-[#131E54] p-6 rounded-2xl border border-[#E7E2DC] dark:border-white/10 shadow-[0_2px_8px_-2px_rgba(16,25,74,0.05)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#666675] uppercase tracking-wider">Completed Sessions</span>
              <div className="w-8 h-8 rounded-lg bg-[#DFE8F7] text-[#10194A] flex items-center justify-center font-bold">
                <Video className="w-4 h-4 text-[#10194A]" />
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-[#10194A] dark:text-[#FAF5EF]">
                {metrics.interviewCount}
              </span>
              <span className="text-sm font-semibold text-[#666675]">completed</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E7E2DC] dark:border-white/10">
            <p className="text-[11px] text-[#666675] dark:text-[#C4C4D4] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10194A] dark:bg-[#DFE8F7]" />
              Full simulations evaluated by AI
            </p>
          </div>
        </div>

        {/* Metric 3: Aptitude Score */}
        <div className="bg-white dark:bg-[#131E54] p-6 rounded-2xl border border-[#E7E2DC] dark:border-white/10 shadow-[0_2px_8px_-2px_rgba(16,25,74,0.05)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#666675] uppercase tracking-wider">Aptitude Score</span>
              <div className="w-8 h-8 rounded-lg bg-[#EBA66F]/20 text-[#10194A] flex items-center justify-center font-bold">
                <Award className="w-4 h-4 text-[#B87924]" />
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              {metrics.avgAptitude > 0 ? (
                <>
                  <span className="text-4xl font-bold text-[#10194A] dark:text-[#FAF5EF]">{metrics.avgAptitude}</span>
                  <span className="text-lg font-semibold text-[#666675]">%</span>
                </>
              ) : (
                <span className="text-2xl font-bold text-[#666675]">No Test Yet</span>
              )}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E7E2DC] dark:border-white/10">
            {metrics.avgAptitude > 0 ? (
              <Link to="/aptitude" className="text-xs font-semibold text-[#10194A] hover:text-[#E97878] flex items-center gap-1">
                <span>View Aptitude Results</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            ) : (
              <Link to="/aptitude" className="text-xs font-semibold text-[#E97878] hover:underline flex items-center gap-1">
                <span>Take first aptitude test</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>

      </div>

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Recent Mock Interviews */}
        <div className="lg:col-span-2 space-y-8">
          <Card
            title="Recent Mock Interviews"
            subtitle="Review your latest simulated sessions and appraisal reports."
            actions={
              <button
                onClick={() => navigate('/interview')}
                className="px-3.5 py-1.5 rounded-xl bg-[#FAF5EF] hover:bg-[#F2ECE4] border border-[#E7E2DC] text-xs font-semibold text-[#10194A] transition-colors"
              >
                All Interviews
              </button>
            }
          >
            {loading ? (
              <div className="py-12 text-center text-xs text-[#666675]">
                Loading your interview records...
              </div>
            ) : interviews.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#DFE8F7] text-[#10194A] mx-auto flex items-center justify-center">
                  <Video className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-[#10194A] dark:text-[#FAF5EF]">No interview sessions yet</h4>
                <p className="text-xs text-[#666675] max-w-sm mx-auto">
                  You haven't completed any mock interviews. Launch a practice round to generate your first comprehensive report.
                </p>
                <div className="pt-2">
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={() => navigate('/interview')}
                  >
                    Start First Interview
                  </Button>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-[#E7E2DC] dark:divide-white/10">
                {interviews.slice(0, 4).map((item) => {
                  const score = item.overallScore || 0;
                  const scoreBadgeColor = score >= 80 
                    ? 'bg-[#27845B]/10 text-[#27845B] border-[#27845B]/20' 
                    : score >= 60 
                      ? 'bg-[#B87924]/10 text-[#B87924] border-[#B87924]/20' 
                      : 'bg-[#C44848]/10 text-[#C44848] border-[#C44848]/20';

                  return (
                    <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-[#10194A] dark:text-[#FAF5EF] text-sm sm:text-base">
                          {item.roleTitle || 'Mock Interview Session'}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-[#666675] dark:text-[#C4C4D4] mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(item.date).toLocaleDateString()}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {Math.round((item.duration || 120) / 60)} mins
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${scoreBadgeColor}`}>
                          Score: {score}%
                        </span>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => navigate(`/interview/report/${item.id}`)}
                          className="rounded-xl"
                        >
                          View Report
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: AI Career Copilot & Shortcuts */}
        <div className="space-y-6">
          
          {/* Mist Blue Supporting Panel: AI Guidance */}
          <div className="p-6 rounded-2xl bg-[#DFE8F7]/60 border border-[#C9D9F2] space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#10194A] text-white flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-[#EBA66F]" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#10194A]">AI Career Recommendation</span>
            </div>

            <p className="text-xs text-[#22243A] leading-relaxed">
              Based on your target profile as <strong className="text-[#10194A]">{user?.title || 'Full Stack Engineer'}</strong>, we recommend reviewing system architecture trade-offs and practicing STAR behavioral conflict scenarios.
            </p>

            <Link
              to="/chat"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#10194A] hover:text-[#E97878] transition-colors"
            >
              <span>Consult Career Assistant</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Practice Shortcuts */}
          <Card
            title="Quick Practice Navigation"
            subtitle="Direct links to available tools."
          >
            <div className="space-y-2.5">
              <Link
                to="/practice"
                className="flex items-center justify-between p-3 rounded-xl bg-[#FAF5EF] hover:bg-[#F2ECE4] border border-[#E7E2DC] transition-colors text-xs font-semibold text-[#10194A] group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-white border border-[#E7E2DC]">
                    <Code2 className="w-4 h-4 text-[#10194A]" />
                  </div>
                  <span>Coding Sandbox (Monaco Runner)</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#666675] group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                to="/aptitude"
                className="flex items-center justify-between p-3 rounded-xl bg-[#FAF5EF] hover:bg-[#F2ECE4] border border-[#E7E2DC] transition-colors text-xs font-semibold text-[#10194A] group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-white border border-[#E7E2DC]">
                    <BookOpen className="w-4 h-4 text-[#10194A]" />
                  </div>
                  <span>Aptitude Assessment Arena</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#666675] group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                to="/resume"
                className="flex items-center justify-between p-3 rounded-xl bg-[#FAF5EF] hover:bg-[#F2ECE4] border border-[#E7E2DC] transition-colors text-xs font-semibold text-[#10194A] group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-white border border-[#E7E2DC]">
                    <FileText className="w-4 h-4 text-[#10194A]" />
                  </div>
                  <span>Resume Studio (ATS Scanner)</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#666675] group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                to="/analytics"
                className="flex items-center justify-between p-3 rounded-xl bg-[#FAF5EF] hover:bg-[#F2ECE4] border border-[#E7E2DC] transition-colors text-xs font-semibold text-[#10194A] group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-white border border-[#E7E2DC]">
                    <TrendingUp className="w-4 h-4 text-[#10194A]" />
                  </div>
                  <span>Skill Growth Analytics</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#666675] group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </Card>

          {/* Profile & Target Role Card */}
          <Card
            title="Candidate Profile"
            subtitle="Verified credentials & target focus."
          >
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-[#E7E2DC] dark:border-white/10">
                <span className="text-[#666675]">Status</span>
                <span className="font-bold text-[#27845B] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Active Candidate
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#E7E2DC] dark:border-white/10">
                <span className="text-[#666675]">Target Role</span>
                <span className="font-semibold text-[#10194A] dark:text-[#FAF5EF]">{user?.title || 'Full Stack Engineer'}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[#666675]">Focus Skills</span>
                <span className="font-semibold text-[#10194A] dark:text-[#FAF5EF] truncate max-w-[150px]">
                  {user?.skills && user.skills.length > 0 ? user.skills.join(', ') : 'JavaScript, React, Node.js'}
                </span>
              </div>
            </div>
          </Card>

        </div>

      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default StudentDashboard;
