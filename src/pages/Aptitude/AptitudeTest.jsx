import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import interviewService from '../../services/interviewService';
import { useNotifications } from '../../hooks/useNotifications';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Loader from '../../components/Loader';
import AntiCheatOverlay from '../../components/AntiCheatOverlay';
import useAntiCheat from '../../hooks/useAntiCheat';
import { ClipboardList, Clock, Check, ArrowLeft, ArrowRight, RefreshCw, BookOpen, HelpCircle, AlertCircle } from 'lucide-react';
import { formatDuration } from '../../utils/formatters';
import { getTranslation } from '../../utils/translations';

const AptitudeTest = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Test execution state
  const [testActive, setTestActive] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: selectedOptionIndex }
  const [testQuestions, setTestQuestions] = useState([]);
  
  // Timer and submission state
  const [timeRemaining, setTimeRemaining] = useState(300);
  const [secondsSpent, setSecondsSpent] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const timerRef = useRef(null);

  // Anti-cheat: active only during live test
  const { warningCount, showWarning, warningMessage, dismiss } = useAntiCheat({
    active: testActive,
    onViolation: (count) => {
      // After 3 violations during aptitude test, auto-submit
      if (count >= 3 && testActive) {
        submitAnswers();
      }
    },
  });

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const list = await interviewService.getAptitudeQuestions();
        const safeList = list || [];
        setQuestions(safeList);
        // Extract unique categories
        const cats = ['All', ...new Set(safeList.map(q => q.category))];
        setCategories(cats);
      } catch (err) {
        console.error("Failed to fetch aptitude questions:", err);
      }
    };
    loadQuestions();
  }, []);

  const handleStartTest = () => {
    // Filter questions
    const filtered = selectedCategory === 'All'
      ? questions
      : questions.filter(q => q.category === selectedCategory);
    
    // Pick max 5 questions for simplicity and speed
    const selected = filtered.sort(() => 0.5 - Math.random()).slice(0, 5);
    setTestQuestions(selected);
    setAnswers({});
    setActiveIdx(0);
    setTimeRemaining(300);
    setSecondsSpent(0);
    setTestActive(true);

    // Start timer
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => (prev <= 1 ? 0 : prev - 1));
      setSecondsSpent(prev => prev + 1);
    }, 1000);
  };

  const handleAutoSubmit = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    submitAnswers();
  };

  const handleSelectOption = (idx) => {
    const qId = testQuestions[activeIdx].id;
    setAnswers({ ...answers, [qId]: idx });
  };

  const handleNext = () => {
    if (activeIdx < testQuestions.length - 1) {
      setActiveIdx(activeIdx + 1);
    }
  };

  const handlePrev = () => {
    if (activeIdx > 0) {
      setActiveIdx(activeIdx - 1);
    }
  };

  const submitAnswers = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSubmitting(true);
    setSubmitError(null);
    
    let correctCount = 0;
    const details = testQuestions.map(q => {
      const selected = answers[q.id];
      const isCorrect = selected === q.correctAnswer;
      if (isCorrect) correctCount++;

      return {
        questionId: q.id,
        question: q.question,
        options: q.options,
        selectedOption: selected !== undefined ? selected : -1,
        correctOption: q.correctAnswer,
        explanation: q.explanation,
        isCorrect
      };
    });

    const percentage = Math.round((correctCount / testQuestions.length) * 100);

    const testResult = {
      id: `result-${Date.now()}`,
      category: selectedCategory,
      totalQuestions: testQuestions.length,
      correctAnswers: correctCount,
      percentage,
      secondsSpent,
      date: new Date().toISOString(),
      details
    };

    try {
      await interviewService.saveTestResult(testResult);
      
      // Trigger a live notification
      addNotification({
        title: 'Aptitude Test Graded',
        message: `You scored ${percentage}% in your ${selectedCategory === 'All' ? 'All Subjects' : selectedCategory} aptitude quiz.`,
        type: 'aptitude',
        link: `/aptitude/result/${testResult.id}`
      });

      setTestActive(false);
      navigate(`/aptitude/result/${testResult.id}`, { state: { result: testResult } });
    } catch (err) {
      console.error("Failed to save aptitude test result:", err);
      setSubmitting(false);
      const errMsg = err.response?.data?.error || err.message || 'Failed to submit test results to server. Please try submitting again.';
      setSubmitError(errMsg);
    }
  };

  useEffect(() => {
    if (testActive && timeRemaining === 0) {
      handleAutoSubmit();
    }
  }, [timeRemaining, testActive]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (submitting) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <Card className="p-8">
          <Loader message="Submitting and grading your assessment..." size="lg" />
        </Card>
      </div>
    );
  }

  if (testActive) {
    const currentQ = testQuestions[activeIdx];
    const answeredCount = Object.keys(answers).length;

    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up" style={{ userSelect: 'none' }}>
        {/* Anti-cheat overlay */}
        <AntiCheatOverlay
          show={showWarning}
          message={warningMessage}
          warningCount={warningCount}
          onDismiss={dismiss}
        />

        {/* Submit Error Banner */}
        {submitError && (
          <div className="p-4 rounded-xl bg-[#C44848]/10 border border-[#C44848]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#C44848]">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#C44848]" />
              <div>
                <p className="font-bold">Submission Failed</p>
                <p className="mt-0.5 text-[#666675] dark:text-[#C4C4D4]">{submitError}</p>
                <p className="mt-0.5 text-[11px] text-[#666675] dark:text-[#C4C4D4]">Your answers are safe. Please click Retry to submit again.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={submitAnswers}
              className="px-4 py-2 rounded-xl bg-[#C44848] text-white font-semibold text-xs hover:bg-[#AA3737] transition-all flex-shrink-0 self-end sm:self-center"
            >
              Retry Submit
            </button>
          </div>
        )}

        {/* Test top bar */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-[#666675] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#E97878] animate-pulse" />
              {selectedCategory === 'All' ? getTranslation('allLabel') : selectedCategory} {getTranslation('aptitudeQuiz')}
            </h3>
            <p className="text-xs text-[#666675] mt-1">
              {getTranslation('questionLabel')} {activeIdx + 1} {getTranslation('ofLabel')} {testQuestions.length} ({answeredCount} {getTranslation('answeredLabel')})
            </p>
          </div>

          {/* Clean Timer */}
          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            timeRemaining < 60
              ? 'bg-[#C44848]/10 border-[#C44848]/30 text-[#C44848] animate-pulse'
              : 'bg-[#DFE8F7] border-[#DFE8F7] text-[#10194A]'
          }`}>
            <Clock className="w-3.5 h-3.5 text-[#10194A]" />
            <span>{getTranslation('timeLeft')}: {formatDuration(timeRemaining)}</span>
          </div>
        </div>

        {/* Question Panel */}
        <Card className="min-h-[300px] flex flex-col justify-between border border-[#E7E2DC] bg-white rounded-2xl shadow-sm p-6 sm:p-8">
          <div className="space-y-6">
            <h4 className="text-base sm:text-lg font-medium text-[#10194A] leading-relaxed">
              {currentQ.question}
            </h4>

            {/* Options list */}
            <div className="grid grid-cols-1 gap-3">
              {currentQ.options.map((opt, oIdx) => {
                const isSelected = answers[currentQ.id] === oIdx;
                return (
                  <button
                    key={oIdx}
                    type="button"
                    onClick={() => handleSelectOption(oIdx)}
                    className={`text-left w-full px-5 py-3.5 rounded-xl border text-sm transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#FAF5EF] border-[#10194A] text-[#10194A] shadow-xs'
                        : 'bg-white border-[#E7E2DC] hover:border-[#10194A]/30 text-[#22243A] hover:bg-[#FAF5EF]/50'
                    }`}
                  >
                    <span className="font-medium">{opt}</span>
                    <span className={`w-6 h-6 rounded-lg border flex items-center justify-center text-xs font-semibold flex-shrink-0 transition-all ${
                      isSelected ? 'border-[#E97878] bg-[#E97878] text-white' : 'border-[#E7E2DC] bg-[#FAF5EF] text-[#666675]'
                    }`}>
                      {String.fromCharCode(65 + oIdx)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation controls */}
          <div className="flex items-center justify-between pt-6 border-t border-[#E7E2DC] mt-8">
            <Button
              onClick={handlePrev}
              disabled={activeIdx === 0}
              variant="secondary"
              icon={ArrowLeft}
              size="sm"
            >
              {getTranslation('previousLabel')}
            </Button>

            {activeIdx === testQuestions.length - 1 ? (
              <Button
                onClick={submitAnswers}
                variant="primary"
                icon={Check}
                className="shadow-sm"
              >
                {getTranslation('submitTest')}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                variant="secondary"
                icon={ArrowRight}
                size="sm"
              >
                {getTranslation('nextLabel')}
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
      <div>
        <h2 className="font-serif text-3xl font-normal text-[#10194A] flex items-center gap-3">
          <ClipboardList className="w-8 h-8 text-[#EBA66F]" />
          {getTranslation('aptitudeArenaTitle')}
        </h2>
        <p className="font-sans text-sm text-[#666675] mt-1">
          {getTranslation('aptitudeArenaDescription')}
        </p>
      </div>

      {/* Start Quiz Card */}
      <Card
        title={getTranslation('startAptitudeChallenge')}
        subtitle={getTranslation('aptitudeChallengeDescription')}
        className="border border-[#E7E2DC] bg-white rounded-2xl shadow-sm p-6 sm:p-8"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-[#666675] uppercase tracking-wider mb-3">
              {getTranslation('chooseTestCategory')}
            </label>
            <div className="flex flex-wrap gap-2.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all ${
                    selectedCategory === cat
                      ? 'bg-[#10194A] border-[#10194A] text-white shadow-xs'
                      : 'bg-[#FAF5EF] border-[#E7E2DC] text-[#22243A] hover:border-[#10194A]/40'
                  }`}
                >
                  {cat === 'All' ? getTranslation('allLabel') : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#DFE8F7]/40 border border-[#DFE8F7] text-xs text-[#22243A] flex gap-3">
            <BookOpen className="w-5 h-5 text-[#10194A] flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[#10194A] block mb-0.5">{getTranslation('rulesAndSetup')}</span>
              {getTranslation('aptitudeRulesDescription')}
            </div>
          </div>

          <div className="pt-4 border-t border-[#E7E2DC] flex justify-end">
            <Button
              onClick={handleStartTest}
              icon={RefreshCw}
              variant="primary"
              className="shadow-sm rounded-xl"
            >
              {getTranslation('beginQuiz')}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AptitudeTest;
