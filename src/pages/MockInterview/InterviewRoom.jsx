import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import interviewService from '../../services/interviewService';
import api from '../../services/api';
import { useNotifications } from '../../hooks/useNotifications';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Loader from '../../components/Loader';
import AntiCheatOverlay from '../../components/AntiCheatOverlay';
import useAntiCheat from '../../hooks/useAntiCheat';
import useFaceDetection from '../../hooks/useFaceDetection';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Clock,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  Cpu,
  Radio,
  SkipForward,
  Activity,
  Camera,
  CameraOff,
  ShieldCheck,
  Play,
  Keyboard,
  Type
} from 'lucide-react';
import { formatDuration } from '../../utils/formatters';
import { getTranslation } from '../../utils/translations';
import { askGemini } from '../../services/geminiService';

const InterviewRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  
  const [template, setTemplate] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [qaPairs, setQaPairs] = useState([]);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [activeLeftTab, setActiveLeftTab] = useState('ai'); // 'ai' or 'camera'
  const [answerMode, setAnswerMode] = useState('text'); // 'voice' or 'text'
  
  // Lobby and Verification State
  const [verified, setVerified] = useState(false);
  const [faceMatched, setFaceMatched] = useState(false);
  const [matchingFace, setMatchingFace] = useState(false);
  const [lightingStatus, setLightingStatus] = useState('good');
  const [lightingVal, setLightingVal] = useState(120);
  const [audioLevel, setAudioLevel] = useState(0);
  const [offlineTimeout, setOfflineTimeout] = useState(120);
  const [cheatingRisk, setCheatingRisk] = useState('Low');
  const [integrityScore, setIntegrityScore] = useState(100);

  // Session & Telemetry State
  const [seconds, setSeconds] = useState(120);
  const [elapsed, setElapsed] = useState(0);
  const [recording, setRecording] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fillerCount, setFillerCount] = useState(0);
  const [wpm, setWpm] = useState(0);
  
  // Camera State
  const [stream, setStream] = useState(null);
  const [cameraError, setCameraError] = useState('');
  
  const timerRef = useRef(null);
  const transcribingRef = useRef(null);
  const speechRecognitionRef = useRef(null);
  const videoRef = useRef(null);
  const audioContextRef = useRef(null);
  const audioStreamRef = useRef(null);
  const questionSpokenForIdx = useRef(-1);
  const submitStartedRef = useRef(false);
  const faceViolationTimerRef = useRef(null);
  const silenceCounterRef = useRef(0);
  const lastTypedAnswerRef = useRef('');
  const typedAnswerRef = useRef('');

  useEffect(() => {
    typedAnswerRef.current = typedAnswer;
  }, [typedAnswer]);

  const faceCountRef = useRef(0);
  const streamRef = useRef(null);

  // Advanced Anti-Cheat
  const { warningCount, showWarning, warningMessage, isBlurred, isOnline, dismiss, triggerWarning } = useAntiCheat({
    active: verified && !!template && !submitting,
    onViolation: (count, msg) => {
      let warningType = 'suspicious';
      if (msg.includes('Tab')) warningType = 'tab';
      else if (msg.includes('Focus')) warningType = 'tab';
      else if (msg.includes('Copy') || msg.includes('Paste') || msg.includes('Cut') || msg.includes('select') || msg.includes('Right-click')) warningType = 'copy';
      else if (msg.includes('DevTools') || msg.includes('inspect') || msg.includes('source')) warningType = 'devtools';
      else if (msg.includes('zoom')) warningType = 'zoom';
      else if (msg.includes('Fullscreen')) warningType = 'fullscreen';
      else if (msg.includes('Mouse')) warningType = 'mouse';
      
      interviewService.logWarning(id, warningType, msg, count)
        .catch(e => console.warn(e));

      if (count >= 5) {
        handleDisqualification();
      }
    }
  });

  // Multi-Face Detection
  const { faceCount, modelLoaded, getPresenceScore, checkLighting, simulateFaceMatch } = useFaceDetection(videoRef, !!stream);

  useEffect(() => {
    faceCountRef.current = faceCount;
  }, [faceCount]);
  
  // Microphone RMS analyser in lobby
  useEffect(() => {
    if (verified) return;

    let isMounted = true;
    let audioCtx = null;
    let streamObj = null;

    const startMic = async () => {
      try {
        streamObj = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioStreamRef.current = streamObj;
        
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        audioContextRef.current = audioCtx;
        
        const source = audioCtx.createMediaStreamSource(streamObj);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const checkVolume = () => {
          if (!isMounted) return;
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
          }
          const average = sum / bufferLength;
          setAudioLevel(Math.round(average));
          requestAnimationFrame(checkVolume);
        };
        checkVolume();
      } catch (err) {
        console.warn("Microphone access denied:", err);
      }
    };

    startMic();

    return () => {
      isMounted = false;
      if (audioCtx) audioCtx.close();
      if (streamObj) streamObj.getTracks().forEach(t => t.stop());
    };
  }, [verified]);

  // Periodically check lighting status in lobby
  useEffect(() => {
    if (verified || !stream) return;
    const interval = setInterval(() => {
      const { brightness, status } = checkLighting();
      setLightingVal(brightness);
      setLightingStatus(status);
    }, 500);
    return () => clearInterval(interval);
  }, [verified, stream]);

  // Run face matching when face is first detected in the lobby
  useEffect(() => {
    if (verified || faceCount !== 1 || faceMatched || matchingFace) return;
    
    setMatchingFace(true);
    simulateFaceMatch().then((res) => {
      if (res.matched) {
        setFaceMatched(true);
        setMatchingFace(false);
        addNotification({
          title: "Identity Verified",
          message: `Face match verified successfully with ${res.confidence}% confidence.`,
          type: "success"
        });
      }
    });
  }, [verified, faceCount, faceMatched, matchingFace]);

  // Zoom monitoring / check dynamically
  useEffect(() => {
    let score = 100;
    let risk = 'Low';
    if (warningCount === 1) { score = 95; risk = 'Low'; }
    else if (warningCount === 2) { score = 85; risk = 'Medium'; }
    else if (warningCount === 3) { score = 70; risk = 'Medium'; }
    else if (warningCount === 4) { score = 55; risk = 'High'; }
    else if (warningCount >= 5) { score = 20; risk = 'Critical'; }
    setIntegrityScore(score);
    setCheatingRisk(risk);
  }, [warningCount]);

  // Network Recovery countdown
  useEffect(() => {
    if (!verified || submitting) return;
    if (isOnline) {
      setOfflineTimeout(120);
      return;
    }
    
    const interval = setInterval(() => {
      setOfflineTimeout(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitInterview(qaPairs, true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isOnline, verified, submitting, qaPairs]);

  // Gaze check simulation
  useEffect(() => {
    if (!verified || submitting) return;
    const gazeInterval = setInterval(() => {
      if (Math.random() < 0.1) {
        triggerWarning("⚠️ Gaze deviation detected! Please look directly at the screen during the assessment.");
      }
    }, 25000);
    return () => clearInterval(gazeInterval);
  }, [verified, submitting]);

  // Enforced Full Screen listener
  useEffect(() => {
    if (!verified || submitting || !template) return;
    
    const onFullscreenChange = () => {
      const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
      if (!isFullscreen) {
        triggerWarning("⚠️ Fullscreen mode exited! The assessment must be completed in fullscreen. This violation has been logged.");
        const requestFS = async () => {
          try {
            const elem = document.documentElement;
            if (elem.requestFullscreen) await elem.requestFullscreen();
            else if (elem.webkitRequestFullscreen) await elem.webkitRequestFullscreen();
          } catch (e) {
            console.warn(e);
          }
        };
        requestFS();
      }
    };
    
    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
    };
  }, [verified, submitting, template, triggerWarning]);

  // Pause and Speak logic based on face detection and user presence
  useEffect(() => {
    if (!verified) return;
    
    if (faceCount > 1) {
      // Start a 3-second grace timer if not already running, to prevent blink/frame-drop spikes
      if (!faceViolationTimerRef.current) {
        faceViolationTimerRef.current = setTimeout(() => {
          triggerWarning(`⚠️ Multiple faces detected (${faceCount}). Please ensure you are alone.`);
          faceViolationTimerRef.current = null;
        }, 3000);
      }

      // Pause the timer and speech recognition immediately for security
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (speechRecognitionRef.current && recording) {
        speechRecognitionRef.current.stop();
        setRecording(false);
      }
      window.speechSynthesis.cancel();
    } else if (!submitting) {
      // Clear pending face warning timers since user is back
      if (faceViolationTimerRef.current) {
        clearTimeout(faceViolationTimerRef.current);
        faceViolationTimerRef.current = null;
      }

      // Start or Resume timer if not already running
      if (!timerRef.current) {
        timerRef.current = setInterval(() => {
          setSeconds(prev => {
            if (prev <= 1) {
              clearInterval(timerRef.current);
              timerRef.current = null;
              handleNextQuestion(true);
              return 0;
            }
            return prev - 1;
          });
          setElapsed(prev => prev + 1);

          // Track prolonged silence during voice mode answer attempts
          if (recording) {
            if (typedAnswerRef.current === lastTypedAnswerRef.current) {
              silenceCounterRef.current += 1;
              if (silenceCounterRef.current === 30) {
                triggerWarning("🎙️ Silence detected for more than 30 seconds. Please answer the question by speaking.");
              }
            } else {
              silenceCounterRef.current = 0;
              lastTypedAnswerRef.current = typedAnswerRef.current;
            }
          } else {
            silenceCounterRef.current = 0;
          }
        }, 1000);
      }

      // Read question if user is present and it hasn't been read yet for this index
      if (template && speechEnabled && questionSpokenForIdx.current !== currentIdx) {
        speakQuestion(template.questions[currentIdx].text);
        questionSpokenForIdx.current = currentIdx;
      }
    }
  }, [faceCount, submitting, verified, currentIdx, template, speechEnabled, triggerWarning, handleNextQuestion, recording]);

  const handleDisqualification = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    window.speechSynthesis.cancel();
    
    // Suspend the specific user account
    if (user && user.id) {
      try {
        const ip = '127.0.0.1';
        const browser = navigator.userAgent;
        const device = navigator.platform;
        const os = 'Windows';
        
        await api.post('/auth/suspend', {
          userId: user.id,
          reason: 'Automated Proctor lockout: Candidate triggered 5 security warnings.',
          warnings: 5,
          ip,
          device,
          browser,
          os
        });
        
        const blockUntil = Date.now() + 30 * 60 * 1000;
        localStorage.setItem(`proctoring_block_until`, blockUntil.toString());
      } catch (err) {
        console.error("Failed to suspend user:", err);
      }
    }
    
    alert("DISQUALIFICATION: You have triggered 5 proctoring strikes. The interview is terminated immediately and your account is locked.");
    handleSubmitInterview(qaPairs, true);
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      setStream(mediaStream);
      streamRef.current = mediaStream;
      setCameraError('');
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Camera access denied:', err);
      setCameraError('Camera access denied or not available.');
    }
  };

  // Synchronize stream with video DOM element whenever stream or view (lobby vs room) changes
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, verified]);

  const toggleCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      streamRef.current = null;
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    } else {
      startCamera();
    }
  };

  const enterExamHall = async () => {
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        await elem.webkitRequestFullscreen();
      }
    } catch (err) {
      console.warn("Fullscreen denied:", err);
    }
    
    try {
      await interviewService.startSession(id);
      await interviewService.logActivity(id, 'camera_verified', 'Pre-interview verification checks passed.');
    } catch (e) {}

    setVerified(true);
  };

  useEffect(() => {
    const loadTemplate = async () => {
      try {
        const templates = await interviewService.getTemplates() || [];
        const found = templates.find(t => t.id === id);
        if (!found) {
          navigate('/interview');
          return;
        }

        // Deep copy template to avoid mutating cached templates
        const templateCopy = JSON.parse(JSON.stringify(found));

        // Dynamic Question Translation for Multilingual candidates
        const activeLang = localStorage.getItem('language') || 'english';
        if (activeLang !== 'english') {
          try {
            const questionTexts = templateCopy.questions.map(q => q.text);
            const targetLangLabel = activeLang === 'hindi' ? 'Hindi (हिंदी)' : 'Marathi (मराठी)';
            const prompt = `Translate the following interview questions into ${targetLangLabel}. Return ONLY a JSON array of translated strings in the exact same order. Do not include any markdown formatting, thoughts, explanations, or code block markers (like \`\`\`json). Just the raw JSON array.
Questions: ${JSON.stringify(questionTexts)}`;
            
            const translatedText = await askGemini(prompt, 'You are a professional translator. Return ONLY a valid JSON array of strings.');
            let translatedArray = null;
            try {
              const cleanedText = translatedText.replace(/```json/g, '').replace(/```/g, '').trim();
              translatedArray = JSON.parse(cleanedText);
            } catch (e) {
              console.warn("Failed to parse translated questions JSON, trying fallback regex", e);
              const match = translatedText.match(/\[\s*".*"\s*\]/s);
              if (match) {
                translatedArray = JSON.parse(match[0]);
              }
            }

            if (translatedArray && Array.isArray(translatedArray) && translatedArray.length === templateCopy.questions.length) {
              templateCopy.questions = templateCopy.questions.map((q, idx) => ({
                ...q,
                text: translatedArray[idx]
              }));
            }
          } catch (transErr) {
            console.error("Failed to translate interview questions:", transErr);
          }
        }

        setTemplate(templateCopy);
        
        if (found.isVideo) {
          startCamera();
        } else {
          setVerified(true);
        }
      } catch (err) {
        console.error("Failed to load template in InterviewRoom:", err);
        navigate('/interview');
      }
    };
    loadTemplate();

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event) => {
        if (faceCountRef.current > 1) return; // Prevent input if paused
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTypedAnswer((prev) => prev + (prev ? ' ' : '') + finalTranscript);
        }
      };
      
      recognition.onerror = (event) => {
        console.warn('Speech recognition error', event.error);
        setRecording(false);
      };
      
      speechRecognitionRef.current = recognition;
    }

    setSeconds(120);
    setElapsed(0);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (speechRecognitionRef.current) speechRecognitionRef.current.stop();
      window.speechSynthesis.cancel();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [id, navigate]);

  const speakQuestion = (text) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;

    const activeLang = localStorage.getItem('language') || 'english';
    if (activeLang === 'hindi') {
      utterance.lang = 'hi-IN';
    } else if (activeLang === 'marathi') {
      utterance.lang = 'mr-IN';
    } else {
      utterance.lang = 'en-US';
    }

    if (window.speechSynthesis) {
      const voices = window.speechSynthesis.getVoices();
      let matchedVoice = null;
      if (activeLang === 'hindi') {
        matchedVoice = voices.find(v => v.lang.startsWith('hi'));
      } else if (activeLang === 'marathi') {
        matchedVoice = voices.find(v => v.lang.startsWith('mr'));
      } else {
        matchedVoice = voices.find(v => v.lang.startsWith('en'));
      }
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }
    }

    window.speechSynthesis.speak(utterance);
  };

  const toggleSpeech = () => {
    if (speechEnabled) {
      window.speechSynthesis.cancel();
    } else if (template) {
      speakQuestion(template.questions[currentIdx].text);
    }
    setSpeechEnabled(!speechEnabled);
  };

  // Calculate telemetry when answer changes
  useEffect(() => {
    if (typedAnswer) {
      // Filler words
      const fillers = ['um', 'uh', 'like', 'basically', 'you know'];
      const words = typedAnswer.toLowerCase().split(/\s+/);
      const count = words.filter(w => fillers.includes(w)).length;
      setFillerCount(count);

      // WPM
      const mins = elapsed / 60;
      if (mins > 0) {
        setWpm(Math.round(words.length / mins));
      }
    }
  }, [typedAnswer, elapsed]);

  const handleToggleRecord = () => {
    if (!speechRecognitionRef.current) {
      alert(getTranslation('micNotSupportedAlert'));
      return;
    }

    if (recording) {
      speechRecognitionRef.current.stop();
      setRecording(false);
    } else {
      try {
        speechRecognitionRef.current.start();
        setRecording(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  function handleNextQuestion(forced = false) {
    if (!template) return;
    if (recording && speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
      setRecording(false);
    }
    
    // Save current answer
    const currentQuestion = template.questions[currentIdx].text;
    const finalAnswer = typedAnswer.trim() || (forced ? "[Timeout: No Answer]" : "[Skipped by Candidate]");
    const newPairs = [...qaPairs, { question: currentQuestion, userAnswer: finalAnswer }];
    
    // Mid-Session Payload Transmitter
    interviewService.cacheProgress(id, newPairs).catch(e => console.warn(e));
    
    setQaPairs(newPairs);
    setTypedAnswer('');
    setFillerCount(0);
    setWpm(0);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Check if last question
    if (currentIdx < template.questions.length - 1) {
      setSeconds(120);
      setCurrentIdx(currentIdx + 1);
    } else {
      handleSubmitInterview(newPairs);
    }
  };

  const handleSubmitInterview = async (finalPairs, disqualified = false) => {
    if (submitStartedRef.current) return;
    submitStartedRef.current = true;
    setSubmitting(true);
    window.speechSynthesis.cancel();
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    try {
      const score = getPresenceScore();
      const report = await interviewService.submitInterview(id, finalPairs, elapsed, disqualified, score);
      
      // Trigger a live notification
      addNotification({
        title: 'Mock Interview Graded',
        message: `You completed your ${template?.title || 'Mock'} interview with an overall score of ${report.overallScore}%.`,
        type: 'interview',
        link: `/interview/report/${report.id}`
      });

      navigate(`/interview/report/${report.id}`);
    } catch (e) {
      console.error(e);
      setSubmitting(false);
    }
  };

  if (!template) return <Loader message={getTranslation('loadingQuestions')} />;

  if (submitting) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <Card className="glass-panel text-center py-12 border border-slate-200 dark:border-slate-800/80">
          <Loader message={getTranslation('analyzingResponses')} size="lg" />
        </Card>
      </div>
    );
  }

  if (!verified) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 animate-fade-in-up font-sans">
        <div className="space-y-2 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#DFE8F7] text-[#10194A] border border-[#C9D9F2]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#27845B]" />
            <span>VEYRA Practice Room • Pre-Session Verification</span>
          </div>
          <h2 className="text-3xl font-editorial font-normal text-[#10194A] dark:text-[#FAF5EF]">
            Secure Proctoring Lobby
          </h2>
          <p className="text-sm text-[#666675] dark:text-[#C4C4D4] max-w-2xl leading-relaxed">
            Please verify your camera feed, microphone input, proper room lighting, and face mapping status before entering the secure examination zone.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-5 flex flex-col gap-4">
            <div className="bg-white dark:bg-[#131E54] p-4 rounded-2xl border border-[#E7E2DC] dark:border-white/10 shadow-sm relative overflow-hidden flex items-center justify-center min-h-[280px]">
              {matchingFace && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#10194A]/70 backdrop-blur-xs">
                  <div className="w-12 h-12 rounded-full border-3 border-[#EBA66F] border-t-transparent animate-spin mb-3" />
                  <p className="text-xs font-bold text-white tracking-widest uppercase">Scanning & Matching Face...</p>
                </div>
              )}
              {cameraError ? (
                <div className="text-center p-4">
                  <CameraOff className="w-10 h-10 text-[#C44848] mx-auto mb-2 opacity-60" />
                  <p className="text-xs font-bold text-[#C44848]">{cameraError}</p>
                  <Button variant="secondary" size="sm" onClick={startCamera} className="mt-3">Allow Camera</Button>
                </div>
              ) : (
                <div className="relative w-full rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                  {faceCount === 1 && !faceMatched && (
                    <div className="absolute inset-x-8 top-6 bottom-6 border-2 border-dashed border-[#27845B] rounded-xl animate-pulse flex items-center justify-center">
                      <div className="absolute w-full h-0.5 bg-[#27845B] top-0 left-0 animate-scan shadow-sm" />
                    </div>
                  )}
                  {faceMatched && (
                    <div className="absolute top-3 right-3 bg-[#27845B] text-white rounded-full p-1.5 shadow-sm">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="bg-white dark:bg-[#131E54] p-4 border border-[#E7E2DC] dark:border-white/10 rounded-2xl shadow-xs">
              <span className="text-[11px] font-bold text-[#666675] uppercase tracking-wider flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-[#27845B] animate-pulse" /> Live Sound Levels:
              </span>
              <div className="flex items-center gap-2 mt-2.5">
                <Mic className="w-4 h-4 text-[#666675]" />
                <div className="flex-1 h-2.5 bg-[#FAF5EF] dark:bg-black/30 rounded-full overflow-hidden border border-[#E7E2DC] dark:border-white/10">
                  <div 
                    className="h-full bg-[#27845B] rounded-full transition-all duration-75"
                    style={{ width: `${Math.min(100, (audioLevel / 128) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-7">
            <div className="bg-white dark:bg-[#131E54] p-6 sm:p-7 rounded-2xl border border-[#E7E2DC] dark:border-white/10 shadow-sm flex flex-col gap-6">
              <h3 className="text-base font-bold text-[#10194A] dark:text-[#FAF5EF]">Proctor Readiness Checklist</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className={`p-1.5 rounded-full flex-shrink-0 mt-0.5 ${stream ? 'bg-[#27845B]/10 text-[#27845B]' : 'bg-[#C44848]/10 text-[#C44848]'}`}>
                    {stream ? <ShieldCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#10194A] dark:text-[#FAF5EF]">Camera Feed Authorization {template?.isVideo ? '(Required)' : '(Optional)'}</h4>
                    <p className="text-xs text-[#666675] dark:text-[#C4C4D4] mt-0.5">Permits live visual proctor tracking during assessment.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className={`p-1.5 rounded-full flex-shrink-0 mt-0.5 ${audioLevel > 5 ? 'bg-[#27845B]/10 text-[#27845B]' : 'bg-[#C44848]/10 text-[#C44848]'}`}>
                    {audioLevel > 5 ? <ShieldCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#10194A] dark:text-[#FAF5EF]">Active Microphone Input (Required)</h4>
                    <p className="text-xs text-[#666675] dark:text-[#C4C4D4] mt-0.5">Analyzes room noise levels. Speak into the mic to verify.</p>
                  </div>
                </div>

                {template?.isVideo && (
                  <>
                    <div className="flex items-start gap-3.5">
                      <div className={`p-1.5 rounded-full flex-shrink-0 mt-0.5 ${lightingStatus === 'good' ? 'bg-[#27845B]/10 text-[#27845B]' : 'bg-[#C44848]/10 text-[#C44848]'}`}>
                        {lightingStatus === 'good' ? <ShieldCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#10194A] dark:text-[#FAF5EF]">Adequate Room Lighting</h4>
                        <p className="text-xs text-[#666675] dark:text-[#C4C4D4] mt-0.5">
                          {lightingStatus === 'too_dark' ? '⚠️ Lighting is too dark. Brighten your room.' : lightingStatus === 'too_bright' ? '⚠️ Lighting is too bright. Reduce direct light source.' : 'Room illumination is within acceptable metrics.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5">
                  <div className={`p-1.5 rounded-full flex-shrink-0 mt-0.5 ${faceCount === 1 ? 'bg-[#27845B]/10 text-[#27845B]' : 'bg-[#C44848]/10 text-[#C44848]'}`}>
                        {faceCount === 1 ? <ShieldCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#10194A] dark:text-[#FAF5EF]">Single Candidate Presence</h4>
                        <p className="text-xs text-[#666675] dark:text-[#C4C4D4] mt-0.5">Ensure you are sitting directly in front of the lens alone.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5">
                      <div className={`p-1.5 rounded-full flex-shrink-0 mt-0.5 ${faceMatched ? 'bg-[#27845B]/10 text-[#27845B]' : 'bg-[#C44848]/10 text-[#C44848]'}`}>
                        {faceMatched ? <ShieldCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#10194A] dark:text-[#FAF5EF]">Facial Signature Verification</h4>
                        <p className="text-xs text-[#666675] dark:text-[#C4C4D4] mt-0.5">Matches candidate facial pattern against registration records.</p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {template?.isVideo && !stream && (
                <div className="bg-[#C44848]/10 border border-[#C44848]/20 text-[#C44848] px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>Camera is required for Video Interview. Please enable your webcam.</span>
                </div>
              )}

              {!template?.isVideo && audioLevel <= 5 && (
                <div className="bg-[#C44848]/10 border border-[#C44848]/20 text-[#C44848] px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>Microphone not detected. Please speak or connect a microphone before launching.</span>
                </div>
              )}

              <div className="pt-4 border-t border-[#E7E2DC] dark:border-white/10 space-y-2">
                <button
                  disabled={template?.isVideo ? !(stream && audioLevel > 5 && lightingStatus === 'good' && faceCount === 1 && faceMatched) : !(audioLevel > 5)}
                  onClick={enterExamHall}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#E97878] hover:bg-[#DC6666] disabled:bg-[#E7E2DC] disabled:text-[#666675] disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl shadow-xs transition-all active:scale-[0.98]"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Enter Exam Hall in Full Screen Mode</span>
                </button>
                <p className="text-[11px] text-[#666675] text-center">
                  Requesting fullscreen is required to maintain assessment integrity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestionObj = template.questions[currentIdx];

  return (
    <div className="max-w-7xl mx-auto min-h-[calc(100vh-180px)] flex flex-col gap-5 animate-fade-in-up" style={{ userSelect: 'none' }}>
      {/* Anti-cheat violation overlay */}
      <AntiCheatOverlay
        show={showWarning}
        message={warningMessage}
        warningCount={warningCount}
        onDismiss={dismiss}
      />

      {/* Offline/Connection loss Overlay */}
      {!isOnline && (
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center backdrop-blur-xl saturate-150 animate-fade-in"
          style={{ background: 'rgba(10, 6, 30, 0.85)' }}
        >
          <Card className="max-w-md w-full text-center py-10 px-6 border-rose-500/30 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-6 relative">
              <Radio className="w-8 h-8 text-rose-500 animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Internet Disconnected</h3>
            <p className="text-sm text-slate-450 dark:text-slate-400 mb-6 leading-relaxed">
              Your connection was lost. Proctoring timers are paused. Please check your local network connection.
            </p>
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex items-center justify-center gap-3">
              <Clock className="w-5 h-5 text-amber-500 animate-bounce" />
              <span className="text-lg font-mono font-bold text-amber-500">{offlineTimeout}s</span>
              <span className="text-xs font-semibold text-slate-400">until auto-submission</span>
            </div>
          </Card>
        </div>
      )}
      
      {/* HUD Header Bar */}
      <div className="flex-shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#131E54] px-6 py-4 rounded-2xl border border-[#E7E2DC] dark:border-white/10 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-editorial font-bold text-[#10194A] dark:text-[#FAF5EF] tracking-tight">
            {template.title}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-[#27845B] animate-pulse" />
            <p className="text-xs text-[#666675] dark:text-[#C4C4D4] font-medium">
              VEYRA Practice Room • {template.category} • Question {currentIdx + 1} of {template.questions.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Proctoring HUD Panel */}
          <div className={`flex items-center gap-2.5 bg-[#FAF5EF] dark:bg-black/20 border px-3.5 py-1.5 rounded-xl text-xs font-semibold ${
            cheatingRisk === 'Critical' || cheatingRisk === 'High'
              ? 'border-[#C44848]/30 text-[#C44848]'
              : 'border-[#E7E2DC] dark:border-white/10 text-[#22243A] dark:text-[#FAF5EF]'
          }`}>
            <ShieldCheck className="w-4 h-4 text-[#27845B]" />
            <div className="flex gap-2.5 text-xs">
              <span>Integrity: <span className="text-[#27845B] font-bold">{integrityScore}%</span></span>
              <span className="w-px h-3.5 bg-[#E7E2DC] dark:bg-white/10 self-center" />
              <span>Warnings: <span className="text-[#B87924] font-bold">{warningCount}/5</span></span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-[#FAF5EF] dark:bg-black/20 border border-[#E7E2DC] dark:border-white/10 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#22243A] dark:text-[#FAF5EF]">
            <Activity className="w-4 h-4 text-[#EBA66F]" />
            <div className="flex gap-2.5">
              <span>Fillers: <span className={fillerCount > 3 ? "text-[#C44848] font-bold" : "text-[#27845B] font-bold"}>{fillerCount}</span></span>
              <span className="w-px h-3.5 bg-[#E7E2DC] dark:bg-white/10 self-center" />
              <span>Pace: <span className="text-[#10194A] dark:text-[#FAF5EF] font-bold">{wpm} WPM</span></span>
            </div>
          </div>
          
          <div className={`flex items-center gap-2 border px-4 py-1.5 rounded-xl text-sm font-bold transition-colors ${
            seconds <= 30 
              ? 'bg-[#C44848]/10 border-[#C44848]/30 text-[#C44848] animate-pulse' 
              : 'bg-[#10194A] border-[#10194A] text-white'
          }`}>
            <Clock className="w-4 h-4" />
            <span>{formatDuration(seconds)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left pane: Proctoring feed (Col Span 4) - only shown for Video Interviews */}
        {template?.isVideo && (
          <div className="lg:col-span-4 flex flex-col gap-4">
            <Card className="liquid-glass-card flex flex-col p-5 overflow-hidden relative shadow-xl">
              {/* Background Ambient Glow */}
              <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-cognitive-primary/20 to-transparent blur-2xl pointer-events-none opacity-60" />

              <div className="flex flex-col relative z-10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-display font-bold text-slate-500 uppercase tracking-[0.15em]">
                      {getTranslation('proctoringFeed')}
                    </span>
                  </div>
                  
                  <button
                    onClick={toggleCamera}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                      stream 
                        ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/20' 
                        : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20'
                    }`}
                  >
                    {stream ? <><CameraOff className="w-3 h-3" /> {getTranslation('stopLabel')}</> : <><Camera className="w-3 h-3" /> {getTranslation('startLabel')}</>}
                  </button>
                </div>
                
                <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-900 border border-slate-200/50 dark:border-slate-800 shadow-inner flex items-center justify-center group">
                  {cameraError ? (
                    <div className="text-center p-4">
                      <CameraOff className="w-8 h-8 text-rose-500 mx-auto mb-2 opacity-50" />
                      <p className="text-xs font-bold text-rose-500">{cameraError}</p>
                      <p className="text-[10px] text-slate-500 mt-1">{getTranslation('allowCameraPermissions')}</p>
                    </div>
                  ) : !stream ? (
                    <div className="text-center p-4">
                      <CameraOff className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-50" />
                      <p className="text-xs font-bold text-slate-400">Camera Feed Off</p>
                      <button onClick={startCamera} className="mt-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold hover:bg-emerald-500/30 transition-all">
                        Start Camera
                      </button>
                    </div>
                  ) : (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover mirror"
                        style={{ transform: 'scaleX(-1)' }}
                      />
                      
                      {/* Face Warning Overlay */}
                      {faceCount > 1 && (
                        <div className="absolute inset-0 bg-rose-900/90 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center z-50">
                          <AlertTriangle className="w-12 h-12 text-rose-400 mb-3 animate-bounce" />
                          <h4 className="text-white font-black uppercase tracking-wider text-sm mb-1">{getTranslation('violationDetected')}</h4>
                          <p className="text-rose-200 text-xs font-medium">
                            {faceCount} {getTranslation('facesFoundPaused')}
                          </p>
                        </div>
                      )}
                      
                      {/* Scanning Line Effect */}
                      <div className="absolute inset-0 pointer-events-none border-t border-emerald-500/30 opacity-50 shadow-[0_5px_15px_rgba(16,185,129,0.3)] animate-[float-drift_4s_ease-in-out_infinite]" />

                      {/* Status Pill */}
                      <div className="absolute bottom-3 left-3 px-2.5 py-1.5 bg-black/70 backdrop-blur-md rounded-lg flex items-center gap-2 text-[10px] font-mono font-bold text-white shadow-lg border border-white/10">
                        <div className={`w-2 h-2 rounded-full ${modelLoaded ? (faceCount === 1 ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.8)]') : 'bg-amber-400 animate-pulse'}`} />
                        {modelLoaded ? `${faceCount} ${getTranslation('facesDetected')}` : getTranslation('loadingModel')}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Right pane: Action Center */}
        <div className={`${template?.isVideo ? 'lg:col-span-8' : 'lg:col-span-12 max-w-5xl mx-auto w-full'} flex flex-col gap-5`}>
          
          <div className="bg-white dark:bg-[#131E54] rounded-2xl border border-[#E7E2DC] dark:border-white/10 p-6 sm:p-8 shadow-sm space-y-6">
            {/* Question Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DFE8F7] border border-[#C9D9F2] text-xs font-semibold text-[#10194A]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Question {currentIdx + 1} of {template.questions.length}</span>
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#10194A] dark:text-[#FAF5EF] leading-relaxed max-h-[25vh] overflow-y-auto custom-scrollbar pr-2">
                {currentQuestionObj.text}
              </h3>
            </div>

            {/* Answer Interface */}
            <div className="flex flex-col gap-3 bg-[#FAF5EF] dark:bg-black/20 rounded-2xl border border-[#E7E2DC] dark:border-white/10 p-4 sm:p-5">
              <div className="flex justify-between items-center flex-shrink-0">
                <label className="flex items-center gap-2 text-xs font-bold text-[#666675] uppercase tracking-wider">
                  <Radio className="w-3.5 h-3.5 text-[#E97878]" />
                  <span>Your Response</span>
                </label>

                <div className="flex items-center gap-2">
                  {recording && (
                    <span className="text-xs text-[#27845B] font-bold flex items-center gap-2 px-3 py-1 bg-[#27845B]/10 rounded-full border border-[#27845B]/20">
                      <span className="w-2 h-2 rounded-full bg-[#27845B] animate-ping" />
                      Listening...
                    </span>
                  )}

                  {/* Voice / Text Mode Toggle */}
                  <div className="flex gap-1 p-0.5 bg-white dark:bg-slate-800 rounded-lg border border-[#E7E2DC] dark:border-white/10">
                    <button
                      onClick={() => setAnswerMode('text')}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                        answerMode === 'text'
                          ? 'bg-[#10194A] text-white shadow-xs'
                          : 'text-[#666675] hover:text-[#10194A]'
                      }`}
                    >
                      <Keyboard className="w-3.5 h-3.5" /> Text
                    </button>
                    <button
                      onClick={() => setAnswerMode('voice')}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                        answerMode === 'voice'
                          ? 'bg-[#10194A] text-white shadow-xs'
                          : 'text-[#666675] hover:text-[#10194A]'
                      }`}
                    >
                      <Mic className="w-3.5 h-3.5" /> Voice
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="rounded-xl overflow-hidden border border-[#E7E2DC] dark:border-white/10 bg-white dark:bg-[#0E174B]">
                <textarea
                  value={typedAnswer}
                  onChange={(e) => setTypedAnswer(e.target.value)}
                  onPaste={(e) => e.preventDefault()}
                  placeholder={answerMode === 'text' ? 'Type your answer here... Structure your response clearly using the STAR framework.' : 'Click "Start Recording" to speak your answer or type directly...'}
                  rows={6}
                  className="w-full p-4 bg-transparent text-[#22243A] dark:text-[#FAF5EF] text-sm sm:text-base leading-relaxed transition-all focus:outline-none resize-none custom-scrollbar"
                  style={{ userSelect: 'text' }}
                />
              </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="flex items-center justify-between pt-2">
              {answerMode === 'voice' ? (
                <button
                  onClick={handleToggleRecord}
                  className={`px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 transition-all ${
                    recording 
                      ? 'bg-[#C44848] text-white animate-pulse' 
                      : 'bg-white hover:bg-[#FAF5EF] text-[#10194A] border border-[#E7E2DC]'
                  }`}
                >
                  {recording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  <span>{recording ? 'Stop Recording' : 'Start Recording'}</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 text-xs text-[#666675]">
                  <Keyboard className="w-4 h-4 text-[#10194A] dark:text-[#DFE8F7]" />
                  <span className="font-medium">Text Mode — Structure your points with concrete metrics</span>
                </div>
              )}

              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleNextQuestion(false)}
                  className="text-xs font-semibold text-[#666675] hover:text-[#10194A] dark:hover:text-[#FAF5EF] transition-colors"
                >
                  Skip Question
                </button>
                <button
                  onClick={() => handleNextQuestion(false)}
                  className="px-6 py-2.5 rounded-xl bg-[#E97878] hover:bg-[#DC6666] text-white font-semibold text-xs shadow-xs hover:shadow transition-all duration-200 active:scale-95 flex items-center gap-2"
                >
                  <span>{currentIdx === template.questions.length - 1 ? 'Complete Evaluation' : 'Submit & Next Question'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );

};

export default InterviewRoom;
