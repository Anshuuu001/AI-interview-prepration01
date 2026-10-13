import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import interviewService from '../../services/interviewService';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Loader from '../../components/Loader';
import { ArrowLeft, CheckCircle2, XCircle, HelpCircle, BookOpen, Award, Sparkles, Clock } from 'lucide-react';
import { getScoreColor } from '../../utils/formatters';
import { getTranslation } from '../../utils/translations';

const TestResult = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);

  useEffect(() => {
    const loadResult = async () => {
      try {
        const history = await interviewService.getTestResults();
        const found = (history || []).find(r => r.id === id);
        if (!found) {
          navigate('/aptitude');
          return;
        }
        setResult(found);
      } catch (err) {
        console.error("Failed to load test result:", err);
        navigate('/aptitude');
      }
    };
    loadResult();
  }, [id, navigate]);

  if (!result) return <Loader message={getTranslation('compilingMetrics')} />;

  const accuracyColor = getScoreColor(result.percentage);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
      {/* Header navigators */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/aptitude')}
          className="flex items-center gap-2 text-xs font-semibold text-[#666675] hover:text-[#10194A] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {getTranslation('backToAssessmentHub')}
        </button>

        <span className="text-xs text-[#666675] font-medium">{getTranslation('completedOn')} {new Date(result.date).toLocaleDateString()}</span>
      </div>

      {/* Main Title Banner */}
      <div className="bg-white border border-[#E7E2DC] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#10194A] tracking-tight">{getTranslation('testReportCard')}</h2>
          <p className="font-sans text-xs text-[#666675] mt-1.5 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#EBA66F]" />
            {getTranslation('categoryLabel')} {result.category === 'All' ? getTranslation('allLabel') : result.category}
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => navigate('/dashboard')} className="rounded-xl">
            {getTranslation('dashboard')}
          </Button>
          <Button variant="primary" onClick={() => navigate('/aptitude')} className="rounded-xl shadow-sm">
            {getTranslation('retakePractice')}
          </Button>
        </div>
      </div>

      {/* Results Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Accuracy Index */}
        <Card className="text-center py-6 border border-[#E7E2DC] bg-white rounded-2xl shadow-sm">
          <p className="text-xs font-semibold text-[#666675] uppercase tracking-wider mb-2">{getTranslation('accuracyRating')}</p>
          <div className="text-4xl font-normal font-serif text-[#10194A] mb-2">{result.percentage}%</div>
          <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-semibold border ${
            result.percentage >= 70
              ? 'bg-[#27845B]/10 border-[#27845B]/20 text-[#27845B]'
              : 'bg-[#C44848]/10 border-[#C44848]/20 text-[#C44848]'
          }`}>
            {result.correctAnswers} {getTranslation('ofLabel')} {result.totalQuestions} {getTranslation('correctLabel')}
          </span>
        </Card>

        {/* Time Taken */}
        <Card className="text-center py-6 border border-[#E7E2DC] bg-white rounded-2xl shadow-sm">
          <p className="text-xs font-semibold text-[#666675] uppercase tracking-wider mb-2">{getTranslation('timeConsumed')}</p>
          <div className="text-3xl font-normal font-serif text-[#10194A] mb-2 flex items-center justify-center gap-2">
            <Clock className="w-5 h-5 text-[#EBA66F]" />
            {Math.floor(result.secondsSpent / 60)}m {result.secondsSpent % 60}s
          </div>
          <p className="text-xs text-[#666675]">{getTranslation('avgLabel')} {Math.round(result.secondsSpent / result.totalQuestions)}{getTranslation('perQuestionLabel')}</p>
        </Card>

        {/* Competency grade */}
        <Card className="text-center py-6 border border-[#E7E2DC] bg-white rounded-2xl shadow-sm">
          <p className="text-xs font-semibold text-[#666675] uppercase tracking-wider mb-2">{getTranslation('ratingGrade')}</p>
          <div className="text-3xl font-normal font-serif text-[#10194A] mb-2 flex items-center justify-center gap-2">
            <Award className="w-6 h-6 text-[#E97878]" />
            {result.percentage >= 80 ? 'A+' : result.percentage >= 60 ? 'B' : 'C-'}
          </div>
          <p className="text-xs text-[#666675] capitalize font-medium">{result.percentage >= 60 ? getTranslation('qualifiedGrade') : getTranslation('requiresReviewGrade')}</p>
        </Card>
      </div>

      {/* Questions analysis listing */}
      <div>
        <h3 className="text-xs font-semibold text-[#666675] uppercase tracking-wider mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#10194A]" />
          {getTranslation('reviewQuestionsExplanations')} ({result.totalQuestions})
        </h3>

        <div className="space-y-6">
          {(result.details || []).map((q, index) => {
            const hasSkipped = q.selectedOption === -1;
            return (
              <Card
                key={index}
                title={`${getTranslation('questionLabel')} ${index + 1}`}
                actions={
                  hasSkipped ? (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-medium border border-[#E7E2DC] bg-[#FAF5EF] text-[#666675]">
                      {getTranslation('skippedLabel')}
                    </span>
                  ) : q.isCorrect ? (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-[#27845B]/20 bg-[#27845B]/10 text-[#27845B] flex items-center gap-1.5 shadow-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {getTranslation('correctLabel')}
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-[#C44848]/20 bg-[#C44848]/10 text-[#C44848] flex items-center gap-1.5 shadow-xs">
                      <XCircle className="w-3.5 h-3.5" /> {getTranslation('incorrectLabel')}
                    </span>
                  )
                }
                className="border border-[#E7E2DC] bg-white rounded-2xl shadow-sm p-6"
              >
                <div className="space-y-4 text-sm">
                  {/* Question Asked */}
                  <div className="p-4 bg-[#FAF5EF] border border-[#E7E2DC] rounded-xl">
                    <p className="text-[#10194A] font-medium leading-relaxed">{q.question}</p>
                  </div>

                  {/* Answers chosen comparison */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 rounded-xl border border-[#E7E2DC] bg-[#FAF5EF]/50">
                      <p className="text-[#666675] font-semibold uppercase tracking-wider mb-1">{getTranslation('yourSelection')}</p>
                      <p className={`font-semibold ${q.isCorrect ? 'text-[#27845B]' : 'text-[#C44848]'}`}>
                        {hasSkipped ? getTranslation('noAnswerLabel') : q.options[q.selectedOption]}
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl border border-[#E7E2DC] bg-[#FAF5EF]/50">
                      <p className="text-[#666675] font-semibold uppercase tracking-wider mb-1">{getTranslation('correctAnswerLabel')}</p>
                      <p className="text-[#27845B] font-semibold">{q.options[q.correctOption]}</p>
                    </div>
                  </div>

                  {/* Explanations text block */}
                  <div className="p-4 bg-[#DFE8F7]/40 border border-[#DFE8F7] rounded-xl">
                    <p className="text-[#10194A] text-xs font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-[#10194A]" /> {getTranslation('correctExplanationLabel')}
                    </p>
                    <p className="text-[#22243A] leading-relaxed font-normal text-xs">{q.explanation}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TestResult;
