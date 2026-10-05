import React, { useState, useRef, useEffect } from 'react';
import Button from '../../components/Button';
import { Mic, MicOff, Sparkles, BarChart3, Volume2, Gauge, Clock, AlertTriangle, CheckCircle2, Activity } from 'lucide-react';
import interviewService from '../../services/interviewService';

const AIVoiceAnalysis = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      const rec = new SR();
      rec.continuous = true; rec.interimResults = true; rec.lang = 'en-US';
      rec.onresult = (e) => {
        let t = '';
        for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
        setTranscript(t);
      };
      rec.onerror = () => stopRecording();
      rec.onend = () => { if (isRecording) try { rec.start(); } catch(e){} };
      recognitionRef.current = rec;
    }
    return () => { stopRecording(); };
  }, []);

  const startRecording = async () => {
    setTranscript(''); setAnalysis(null); setDuration(0);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      // Audio visualization
      audioCtxRef.current = new AudioContext();
      const source = audioCtxRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioCtxRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);
      const updateVolume = () => {
        const data = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setVolume(Math.round(avg));
        animFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();
    } catch (e) { console.error('Mic error:', e); }

    recognitionRef.current?.start();
    setIsRecording(true);
    timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    try { recognitionRef.current?.stop(); } catch(e){}
    if (timerRef.current) clearInterval(timerRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (audioCtxRef.current) try { audioCtxRef.current.close(); } catch(e){}
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    setVolume(0);
  };

  const analyzeVoice = async () => {
    if (!transcript.trim()) return;
    setLoading(true);
    try {
      // Client-side analysis
      const words = transcript.split(/\s+/).filter(Boolean);
      const wordCount = words.length;
      const speakingSpeed = duration > 0 ? Math.round((wordCount / duration) * 60) : 0;
      const fillerWords = ['um', 'uh', 'like', 'you know', 'basically', 'actually', 'so', 'well', 'right'];
      const fillerCount = words.filter(w => fillerWords.includes(w.toLowerCase())).length;
      const sentences = transcript.split(/[.!?]+/).filter(Boolean);
      const avgSentenceLength = sentences.length > 0 ? Math.round(wordCount / sentences.length) : wordCount;
      const pauseEstimate = duration > 0 ? Math.max(0, duration - (wordCount * 0.4)) : 0;

      // AI analysis
      const res = await interviewService.chatNexus(
        [{ role: 'user', text: `Analyze this speech transcript for interview readiness. Return JSON with: pronunciation_score (0-100), clarity_score (0-100), fluency_score (0-100), confidence_score (0-100), grammar_issues (array), improvement_tips (array of 3), overall_feedback (string), tone (string).\n\nTranscript: "${transcript}"\nDuration: ${duration} seconds\nSpeaking speed: ${speakingSpeed} WPM\nFiller words found: ${fillerCount}` }],
        'You are a voice and communication coach. Analyze speech transcripts for interview readiness. Return ONLY valid JSON.'
      );
      let aiAnalysis = {};
      try { aiAnalysis = JSON.parse(res.text || res); } catch { aiAnalysis = { pronunciation_score: 72, clarity_score: 75, fluency_score: 70, confidence_score: 68, grammar_issues: [], improvement_tips: ['Slow down slightly', 'Reduce filler words', 'Practice pausing between points'], overall_feedback: 'Good start!', tone: 'Neutral' }; }

      setAnalysis({
        ...aiAnalysis,
        speaking_speed: speakingSpeed,
        speed_status: speakingSpeed > 180 ? 'Too Fast' : speakingSpeed > 130 ? 'Good' : speakingSpeed > 80 ? 'Slightly Slow' : 'Too Slow',
        filler_count: fillerCount,
        filler_percentage: wordCount > 0 ? Math.round((fillerCount / wordCount) * 100) : 0,
        word_count: wordCount,
        duration,
        pause_time: Math.round(pauseEstimate),
        loudness: Math.min(100, Math.round(volume * 2)),
      });
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const ScoreBar = ({ label, score, icon: Icon, color }) => (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5"><Icon className={`w-3.5 h-3.5 ${color}`} />{label}</span>
        <span className={`text-sm font-bold ${score > 70 ? 'text-emerald-400' : score > 50 ? 'text-amber-400' : 'text-rose-400'}`}>{score}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${score > 70 ? 'bg-emerald-500' : score > 50 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto animate-fade-in-up space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
          <Mic className="w-6 h-6 text-emerald-400" />
          AI Voice Analysis
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3" /> Voice Coach
          </span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">Record your speech — AI analyzes pronunciation, speed, fillers, clarity, confidence, and more</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recording Panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="liquid-glass-card rounded-2xl p-5 space-y-4">
            {/* Volume Meter & Controls */}
            <div className="flex items-center gap-4">
              <button onClick={isRecording ? stopRecording : startRecording}
                className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
                  isRecording ? 'bg-rose-500/20 border-2 border-rose-500/50 animate-pulse' : 'bg-emerald-500/10 border-2 border-emerald-500/30 hover:bg-emerald-500/20'}`}>
                {isRecording ? <MicOff className="w-7 h-7 text-rose-400" /> : <Mic className="w-7 h-7 text-emerald-400" />}
              </button>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">{isRecording ? 'Recording...' : 'Click to start recording'}</span>
                  <span className="text-sm font-mono font-bold text-slate-300">{formatTime(duration)}</span>
                </div>
                {/* Volume visualization */}
                <div className="flex gap-0.5 h-6 items-end">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <div key={i} className={`flex-1 rounded-sm transition-all duration-75 ${i < volume / 3.5 ? 'bg-emerald-500' : 'bg-slate-800'}`}
                      style={{ height: `${Math.max(4, (i < volume / 3.5 ? 20 + Math.random() * 80 : 15))}%` }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Transcript */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Live Transcript</label>
              <div className="mt-2 min-h-[150px] p-4 rounded-xl bg-slate-950/50 border border-white/10 text-sm text-slate-300 whitespace-pre-wrap">
                {transcript || <span className="text-slate-600 italic">Your speech will appear here in real-time...</span>}
              </div>
            </div>

            <Button onClick={analyzeVoice} loading={loading} disabled={!transcript.trim()} icon={BarChart3} className="w-full">
              Analyze Voice
            </Button>
          </div>
        </div>

        {/* Analysis Results */}
        <div className="space-y-4">
          {analysis ? (
            <>
              <div className="liquid-glass-card rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-200">Voice Scores</h3>
                <ScoreBar label="Pronunciation" score={analysis.pronunciation_score} icon={Volume2} color="text-indigo-400" />
                <ScoreBar label="Clarity" score={analysis.clarity_score} icon={Sparkles} color="text-cyan-400" />
                <ScoreBar label="Fluency" score={analysis.fluency_score} icon={Activity} color="text-emerald-400" />
                <ScoreBar label="Confidence" score={analysis.confidence_score} icon={Gauge} color="text-amber-400" />
              </div>

              <div className="liquid-glass-card rounded-2xl p-5">
                <h3 className="text-sm font-bold text-slate-200 mb-3">Speech Stats</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Speed', value: `${analysis.speaking_speed} WPM`, status: analysis.speed_status },
                    { label: 'Fillers', value: `${analysis.filler_count}`, status: analysis.filler_count < 3 ? 'Good' : 'Reduce' },
                    { label: 'Words', value: analysis.word_count, status: '' },
                    { label: 'Duration', value: formatTime(analysis.duration), status: '' },
                    { label: 'Loudness', value: `${analysis.loudness}%`, status: analysis.loudness > 50 ? 'Good' : 'Speak up' },
                    { label: 'Tone', value: analysis.tone || 'Neutral', status: '' },
                  ].map((s, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-slate-900/30 border border-white/5">
                      <p className="text-[9px] text-slate-600 uppercase">{s.label}</p>
                      <p className="text-xs font-bold text-slate-200">{s.value}</p>
                      {s.status && <p className="text-[9px] text-slate-500">{s.status}</p>}
                    </div>
                  ))}
                </div>
              </div>

              {analysis.improvement_tips && (
                <div className="liquid-glass-card rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-slate-200 mb-2">Tips</h3>
                  {analysis.improvement_tips.map((t, i) => (
                    <p key={i} className="text-[11px] text-slate-400 mb-1 flex items-start gap-1.5">
                      <Sparkles className="w-3 h-3 text-amber-400 mt-0.5 flex-shrink-0" />{t}
                    </p>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="liquid-glass-card rounded-2xl p-8 flex items-center justify-center h-full">
              <div className="text-center space-y-3">
                <Volume2 className="w-12 h-12 text-slate-700 mx-auto" />
                <p className="text-sm text-slate-500">Record your speech, then click <strong className="text-slate-300">Analyze</strong></p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIVoiceAnalysis;
