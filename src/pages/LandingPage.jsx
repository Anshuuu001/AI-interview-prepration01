import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, Code2, Sparkles, MessageSquare, Zap, 
  CheckCircle2, ChevronRight, ShieldCheck, Terminal, Award, 
  Camera, Mic, Clock, Menu, X, Check, Lock, FileText, Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  const openModal = (type) => setModalContent(type);
  const closeModal = () => setModalContent(null);

  const valuePillars = [
    {
      title: "Structured Interview Practice",
      description: "Experience role-specific interview simulations spanning technical architecture, data structures, and leadership scenarios.",
      tag: "Role-Aligned"
    },
    {
      title: "Objective STAR Feedback",
      description: "Receive instant evaluations assessing your Situation, Task, Action, and Result structure with actionable communication tips.",
      tag: "Deep Appraisal"
    },
    {
      title: "Live In-Browser Code Runner",
      description: "Tackle algorithmic coding challenges inside a professional Monaco sandbox with real-time test verification.",
      tag: "Monaco Sandbox"
    },
    {
      title: "Camera & Anti-Cheat Proctoring",
      description: "Client-side face presence monitoring and window supervision simulate authentic, focused testing environments.",
      tag: "BlazeFace AI"
    }
  ];

  const howItWorksSteps = [
    {
      step: "01",
      title: "Choose an interview or practice goal",
      description: "Select from curated role templates—including Full Stack Engineer, System Architect, or Product Lead—or jump straight into algorithmic code practice."
    },
    {
      step: "02",
      title: "Practise with realistic interview tools",
      description: "Answer verbal questions with real-time speech transcription, interactive timers, and browser-based focus safeguards."
    },
    {
      step: "03",
      title: "Review feedback & refine answers",
      description: "Analyze detailed performance breakdowns covering semantic precision, speaking confidence, and concrete areas for answer enhancement."
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF5EF] text-[#22243A] font-sans antialiased selection:bg-[#E97878] selection:text-white">
      
      {/* ── Navigation Bar ── */}
      <header className="w-full bg-[#FAF5EF]/95 backdrop-blur-md border-b border-[#E7E2DC] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Brand Logo */}
          <div 
            onClick={() => navigate('/')} 
            className="cursor-pointer flex items-center gap-3 group"
          >
            <img 
              src="/veyra-logo.png" 
              alt="VEYRA AI Logo" 
              className="h-11 w-auto object-contain rounded-xl shadow-xs" 
            />
            <div>
              <span className="font-editorial text-2xl sm:text-3xl font-bold tracking-tight text-[#10194A] block leading-none">
                VEYRA AI
              </span>
              <span className="text-[9px] text-[#EBA66F] font-sans font-bold tracking-wider uppercase block mt-1">
                Your Next Interview, Smarter
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#666675]">
            <a href="#product" className="hover:text-[#10194A] transition-colors">Product</a>
            <a href="#features" className="hover:text-[#10194A] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[#10194A] transition-colors">How it works</a>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <button 
                onClick={() => navigate('/dashboard')}
                className="px-5 py-2.5 rounded-xl bg-[#10194A] hover:bg-[#1A2563] text-[#FAF5EF] text-sm font-semibold transition-all shadow-xs"
              >
                Go to Dashboard
              </button>
            ) : (
              <>
                <button 
                  onClick={() => navigate('/login')}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[#10194A] hover:bg-white/80 transition-colors"
                >
                  Sign in
                </button>
                <button 
                  onClick={() => navigate('/register')}
                  className="px-5 py-2.5 rounded-xl bg-[#E97878] hover:bg-[#DC6666] text-white text-sm font-semibold shadow-xs hover:shadow transition-all duration-200 active:scale-95"
                >
                  Start Practising
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-[#10194A] hover:bg-white/80 transition-colors"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-[#E7E2DC] bg-[#FAF5EF] px-6 py-4 space-y-3 animate-fade-in-up">
            <a 
              href="#product" 
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-[#22243A] py-1"
            >
              Product
            </a>
            <a 
              href="#features" 
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-[#22243A] py-1"
            >
              Features
            </a>
            <a 
              href="#how-it-works" 
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-[#22243A] py-1"
            >
              How it works
            </a>
            <div className="pt-2 border-t border-[#E7E2DC] flex flex-col gap-2">
              {user ? (
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="w-full py-2.5 rounded-xl bg-[#10194A] text-white text-sm font-semibold text-center"
                >
                  Dashboard
                </button>
              ) : (
                <>
                  <button 
                    onClick={() => navigate('/login')}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold text-[#10194A] bg-white border border-[#E7E2DC] text-center"
                  >
                    Sign in
                  </button>
                  <button 
                    onClick={() => navigate('/register')}
                    className="w-full py-2.5 rounded-xl bg-[#E97878] text-white text-sm font-semibold text-center"
                  >
                    Start Practising
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ── Hero Section (Split Layout) ── */}
      <section id="product" className="max-w-7xl mx-auto px-6 pt-12 pb-20 lg:pt-16 lg:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          
          {/* Left Hero Column */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Small Eyebrow Label */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#DFE8F7] border border-[#C9D9F2] text-xs font-semibold text-[#10194A] tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-[#10194A]" />
              <span>AI-Powered Interview Preparation</span>
            </div>

            {/* Editorial Headline */}
            <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-normal text-[#10194A] leading-[1.2] tracking-tight">
              Your next opportunity <br className="hidden sm:inline" />
              starts with <span className="marker-apricot">confidence.</span>
            </h1>

            {/* Supporting Description in Inter */}
            <p className="text-base sm:text-lg text-[#666675] max-w-xl leading-relaxed">
              Practise interviews, improve your answers, and understand your strengths with personalised AI-powered feedback.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button 
                onClick={() => navigate(user ? '/interview' : '/register')}
                className="px-7 py-3.5 rounded-xl bg-[#E97878] hover:bg-[#DC6666] text-white font-semibold text-sm shadow-sm hover:shadow transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <span>Start Practising</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a 
                href="#features"
                className="px-6 py-3.5 rounded-xl bg-white hover:bg-[#FAF5EF] text-[#10194A] border border-[#E7E2DC] hover:border-[#D6CFCE] font-semibold text-sm transition-all text-center"
              >
                Explore Features
              </a>
            </div>

            {/* Grounded Truth Pillars */}
            <div className="pt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-[#666675]">
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#27845B]" />
                Technical & Behavioral Rounds
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#27845B]" />
                Real-Time STAR Analysis
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#27845B]" />
                Monaco Code Sandbox
              </span>
            </div>
          </div>

          {/* Right Hero Column: Polished Product Preview Mockup */}
          <div className="lg:col-span-6">
            <div className="relative">
              {/* Subtle background shadow block */}
              <div className="absolute -inset-3 bg-[#EBA66F]/15 rounded-3xl -rotate-1 pointer-events-none" />

              {/* Main Product Window Preview */}
              <div className="relative bg-white rounded-2xl border border-[#E7E2DC] shadow-[0_8px_30px_rgb(16,25,74,0.08)] overflow-hidden">
                
                {/* Window Title Bar */}
                <div className="px-5 py-3.5 bg-[#FAF5EF] border-b border-[#E7E2DC] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E7E2DC]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E7E2DC]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E7E2DC]" />
                    <span className="ml-2 text-xs font-semibold text-[#10194A]">Interview Arena • Full Stack Specialist</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#27845B] bg-[#27845B]/10 px-2.5 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#27845B] animate-pulse" />
                    <span>Live Simulation</span>
                  </div>
                </div>

                {/* Window Body */}
                <div className="p-6 space-y-5">
                  
                  {/* Status telemetry banner */}
                  <div className="flex items-center justify-between text-xs text-[#666675] pb-3 border-b border-[#E7E2DC]">
                    <div className="flex items-center gap-2 font-medium">
                      <Clock className="w-3.5 h-3.5 text-[#10194A]" />
                      <span>Question 2 of 5</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-[#27845B] font-medium">
                        <Camera className="w-3.5 h-3.5" /> Proctor Active
                      </span>
                      <span className="flex items-center gap-1 text-[#10194A] font-semibold bg-[#FAF5EF] px-2 py-0.5 rounded-md border border-[#E7E2DC]">
                        01:42 left
                      </span>
                    </div>
                  </div>

                  {/* Active Question Box */}
                  <div className="p-4 rounded-xl bg-[#FAF5EF] border border-[#E7E2DC] space-y-2">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-[#EBA66F]">Current Prompt</span>
                    <p className="text-sm font-semibold text-[#10194A] leading-snug">
                      "Walk me through a scenario where you faced significant database lock contention under high write loads. How did you diagnose and remediate it?"
                    </p>
                  </div>

                  {/* Real-time Voice Capture Visualizer */}
                  <div className="p-3.5 rounded-xl bg-[#DFE8F7]/40 border border-[#DFE8F7] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#10194A] text-white flex items-center justify-center">
                        <Mic className="w-4 h-4 text-[#EBA66F]" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#10194A]">Transcribing response in real-time...</p>
                        <p className="text-[11px] text-[#666675]">Speech pace: 135 WPM • Filler words: Minimal</p>
                      </div>
                    </div>
                    <div className="flex items-end gap-1 h-6">
                      <span className="w-1 bg-[#10194A] rounded-full h-3 animate-pulse" />
                      <span className="w-1 bg-[#EBA66F] rounded-full h-5 animate-pulse" />
                      <span className="w-1 bg-[#10194A] rounded-full h-2 animate-pulse" />
                      <span className="w-1 bg-[#EBA66F] rounded-full h-6 animate-pulse" />
                      <span className="w-1 bg-[#10194A] rounded-full h-4 animate-pulse" />
                    </div>
                  </div>

                  {/* Feedback Preview Module */}
                  <div className="p-4 rounded-xl bg-white border border-[#E7E2DC] shadow-xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#10194A]">STAR Appraisal Insight</span>
                      <span className="text-xs font-bold text-[#27845B]">88% Communication Score</span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      <div className="p-2 rounded-lg bg-[#FAF5EF] border border-[#E7E2DC]">
                        <p className="text-[10px] text-[#666675]">Situation</p>
                        <p className="font-bold text-[#10194A] mt-0.5">90%</p>
                      </div>
                      <div className="p-2 rounded-lg bg-[#FAF5EF] border border-[#E7E2DC]">
                        <p className="text-[10px] text-[#666675]">Task</p>
                        <p className="font-bold text-[#10194A] mt-0.5">85%</p>
                      </div>
                      <div className="p-2 rounded-lg bg-[#FAF5EF] border border-[#E7E2DC]">
                        <p className="text-[10px] text-[#666675]">Action</p>
                        <p className="font-bold text-[#10194A] mt-0.5">94%</p>
                      </div>
                      <div className="p-2 rounded-lg bg-[#FAF5EF] border border-[#E7E2DC]">
                        <p className="text-[10px] text-[#666675]">Result</p>
                        <p className="font-bold text-[#10194A] mt-0.5">84%</p>
                      </div>
                    </div>

                    <p className="text-xs text-[#666675] leading-relaxed pt-1">
                      <strong className="text-[#10194A]">Evaluator Summary:</strong> Clear technical remediation detailing read replicas, pessimistic-to-optimistic locking migration, and queue throttling.
                    </p>
                  </div>

                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Value Proposition Section ── */}
      <section className="w-full bg-white border-y border-[#E7E2DC] py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#EBA66F]">Core Principles</span>
            <h2 className="font-editorial text-3xl sm:text-4xl font-normal text-[#10194A] mt-2">
              Engineered for genuine interview readiness.
            </h2>
            <p className="text-sm text-[#666675] mt-2">
              Every tool within VEYRA AI focuses on developing structured thought, clear communication, and verified technical execution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {valuePillars.map((item, index) => (
              <div 
                key={index}
                className="p-6 rounded-2xl bg-[#FAF5EF] border border-[#E7E2DC] hover:border-[#D6CFCE] transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-bold bg-white text-[#10194A] border border-[#E7E2DC]">
                    {item.tag}
                  </span>
                  <h3 className="font-bold text-[#10194A] text-base leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#666675] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Editorial Feature Layout ── */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20 space-y-16">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#EBA66F]">Platform Capabilities</span>
          <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-normal text-[#10194A]">
            Tools designed to simulate every dimension of hiring.
          </h2>
          <p className="text-sm text-[#666675]">
            Explore the specialized environments built into VEYRA AI for full-cycle candidate preparation.
          </p>
        </div>

        {/* Feature 1: AI Mock Interviews (Split Row) */}
        <div className="bg-white rounded-3xl border border-[#E7E2DC] p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-xs">
          <div className="lg:col-span-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[#DFE8F7] text-[#10194A] flex items-center justify-center font-bold">
              <Mic className="w-5 h-5 text-[#10194A]" />
            </div>
            <h3 className="font-editorial text-2xl sm:text-3xl font-normal text-[#10194A]">
              AI Mock Interview Arena
            </h3>
            <p className="text-sm text-[#666675] leading-relaxed">
              Step into a simulated verbal interview room with dynamic question progression. Answer through microphone speech-to-text or structured written prompts, complete with realistic pacing timers.
            </p>
            <ul className="space-y-2 text-xs text-[#666675] pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#27845B]" />
                Role-tailored questions spanning software engineering, management, and system architecture.
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#27845B]" />
                Live voice recognition with real-time word pace and filler detection.
              </li>
            </ul>
            <div className="pt-2">
              <button 
                onClick={() => navigate(user ? '/interview' : '/login')}
                className="px-5 py-2.5 rounded-xl bg-[#10194A] hover:bg-[#1A2563] text-white text-xs font-semibold inline-flex items-center gap-2 transition-colors"
              >
                <span>Launch Mock Interview</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 bg-[#FAF5EF] rounded-2xl border border-[#E7E2DC] p-6 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#10194A]">Select Role Profile</span>
              <span className="text-[#666675]">3 Available Rounds</span>
            </div>
            <div className="space-y-2.5">
              <div className="p-3.5 rounded-xl bg-white border border-[#E7E2DC] flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#10194A]">Senior Full Stack Developer</p>
                  <p className="text-[11px] text-[#666675]">React, Node.js, System Architecture • Hard</p>
                </div>
                <span className="text-xs font-bold text-[#E97878]">5 Questions</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-[#E7E2DC] flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#10194A]">Engineering Team Lead (STAR)</p>
                  <p className="text-[11px] text-[#666675]">Conflict, Mentorship, Project Delivery • Medium</p>
                </div>
                <span className="text-xs font-bold text-[#E97878]">4 Questions</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-[#E7E2DC] flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#10194A]">Cloud Infrastructure Specialist</p>
                  <p className="text-[11px] text-[#666675]">Kubernetes, Terraform, Fault Tolerance • Hard</p>
                </div>
                <span className="text-xs font-bold text-[#E97878]">5 Questions</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 2: In-Browser Coding Sandbox & Proctoring (2 Columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Card A: Coding Sandbox */}
          <div className="bg-white rounded-3xl border border-[#E7E2DC] p-8 space-y-5 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#EBA66F]/20 text-[#10194A] flex items-center justify-center font-bold">
                <Code2 className="w-5 h-5 text-[#10194A]" />
              </div>
              <h3 className="font-editorial text-2xl font-normal text-[#10194A]">
                Algorithmic Code Sandbox
              </h3>
              <p className="text-xs sm:text-sm text-[#666675] leading-relaxed">
                Integrated Monaco code editor supporting JavaScript, Python, C++, and Java with an in-browser compilation sandbox and real-time algorithmic test evaluations.
              </p>
              
              {/* Code snippet mockup */}
              <div className="p-4 rounded-xl bg-[#10194A] text-[#FAF5EF] font-mono text-xs space-y-1">
                <div className="text-[#EBA66F]">// Two Sum Solution Verification</div>
                <div><span className="text-[#E97878]">function</span> twoSum(nums, target) &#123;</div>
                <div className="pl-4 text-[#DFE8F7]/80">const seen = new Map();</div>
                <div className="pl-4 text-[#DFE8F7]/80">for (let i = 0; i &lt; nums.length; i++) &#123;</div>
                <div className="pl-8 text-[#DFE8F7]/80">const diff = target - nums[i];</div>
                <div className="pl-4">&#125;</div>
                <div>&#125;</div>
              </div>
            </div>

            <div>
              <button 
                onClick={() => navigate(user ? '/practice' : '/login')}
                className="px-5 py-2.5 rounded-xl bg-[#FAF5EF] hover:bg-[#F2ECE4] text-[#10194A] border border-[#E7E2DC] text-xs font-semibold inline-flex items-center gap-2 transition-colors"
              >
                <span>Open Practice Sandbox</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card B: Proctoring & Integrity */}
          <div className="bg-white rounded-3xl border border-[#E7E2DC] p-8 space-y-5 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#DFE8F7] text-[#10194A] flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5 text-[#10194A]" />
              </div>
              <h3 className="font-editorial text-2xl font-normal text-[#10194A]">
                Integrity & Proctoring Guard
              </h3>
              <p className="text-xs sm:text-sm text-[#666675] leading-relaxed">
                VEYRA AI features client-side TensorFlow BlazeFace detection to track head pose and camera presence, alongside tab-switch and copy-paste monitors that ensure fair simulation standards.
              </p>

              {/* Security indicators */}
              <div className="p-4 rounded-xl bg-[#FAF5EF] border border-[#E7E2DC] space-y-2.5 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#E7E2DC]">
                  <span className="text-[#666675]">Face Tracking Model:</span>
                  <span className="font-semibold text-[#10194A]">BlazeFace TF.js</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-[#E7E2DC]">
                  <span className="text-[#666675]">Multi-Face Warning:</span>
                  <span className="font-semibold text-[#27845B]">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#666675]">Browser Focus Monitor:</span>
                  <span className="font-semibold text-[#27845B]">Enforced</span>
                </div>
              </div>
            </div>

            <div>
              <button 
                onClick={() => navigate(user ? '/aptitude' : '/login')}
                className="px-5 py-2.5 rounded-xl bg-[#FAF5EF] hover:bg-[#F2ECE4] text-[#10194A] border border-[#E7E2DC] text-xs font-semibold inline-flex items-center gap-2 transition-colors"
              >
                <span>Explore Aptitude Testing</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

        {/* Feature 3: Career Assistant */}
        <div className="bg-[#DFE8F7]/50 rounded-3xl border border-[#C9D9F2] p-8 sm:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#C9D9F2] text-xs font-bold text-[#10194A]">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>AI Career Assistant</span>
            </div>
            <h3 className="font-editorial text-2xl sm:text-3xl font-normal text-[#10194A]">
              Personalized mentorship tailored to your interview goals.
            </h3>
            <p className="text-sm text-[#666675] leading-relaxed">
              Engage with our career advisor to practice tricky HR questions, get instant resume talking points, and rehearse salary negotiation dialogues with audio TTS feedback.
            </p>
          </div>
          <button 
            onClick={() => navigate(user ? '/chat' : '/login')}
            className="px-6 py-3.5 rounded-xl bg-[#10194A] hover:bg-[#1A2563] text-white text-xs font-semibold whitespace-nowrap shadow-xs"
          >
            Chat with Assistant
          </button>
        </div>

      </section>

      {/* ── How It Works (3 Steps) ── */}
      <section id="how-it-works" className="w-full bg-white border-y border-[#E7E2DC] py-20">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center max-w-xl mx-auto mb-16 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#EBA66F]">Practice Workflow</span>
            <h2 className="font-editorial text-3xl sm:text-4xl font-normal text-[#10194A]">
              Three steps to confident interview delivery.
            </h2>
            <p className="text-sm text-[#666675]">
              A straightforward process designed to build structured habits before your real interview.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorksSteps.map((item, index) => (
              <div 
                key={index}
                className="p-8 rounded-2xl bg-[#FAF5EF] border border-[#E7E2DC] relative flex flex-col justify-between"
              >
                <div>
                  <span className="font-editorial text-4xl text-[#EBA66F] block mb-4 font-normal">
                    {item.step}
                  </span>
                  <h3 className="font-bold text-lg text-[#10194A] mb-2 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#666675] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Closing Call to Action ── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="rounded-3xl bg-[#10194A] text-[#FAF5EF] p-10 sm:p-16 lg:p-20 relative overflow-hidden text-center space-y-6 shadow-xl">
          
          {/* Subtle accent orbs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#EBA66F]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#E97878]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-5">
            <span className="inline-block px-3.5 py-1 rounded-full text-xs font-semibold bg-white/10 text-[#EBA66F] tracking-wide uppercase">
              Start Your Preparation Today
            </span>

            <h2 className="font-editorial text-3xl sm:text-5xl lg:text-6xl font-normal text-white leading-tight">
              Make your next interview <span className="text-[#EBA66F]">your best one.</span>
            </h2>

            <p className="text-sm sm:text-base text-[#DFE8F7]/80 leading-relaxed font-sans max-w-xl mx-auto">
              Prepare with role-tailored questions, real-time STAR scoring, and in-browser coding practice without guesswork.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button 
                onClick={() => navigate(user ? '/dashboard' : '/register')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#E97878] hover:bg-[#DC6666] text-white font-semibold text-sm shadow-md transition-all duration-200 active:scale-95"
              >
                {user ? 'Open Candidate Dashboard' : 'Start Practising Free'}
              </button>

              {!user && (
                <button 
                  onClick={() => navigate('/login')}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 font-semibold text-sm transition-all"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="w-full bg-white border-t border-[#E7E2DC] py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-[#E7E2DC]">
            <div className="flex items-center gap-3">
              <img 
                src="/veyra-logo.png" 
                alt="VEYRA AI Logo" 
                className="h-10 w-auto object-contain rounded-xl shadow-xs" 
              />
              <div>
                <span className="font-editorial text-2xl font-bold text-[#10194A] block leading-none">
                  VEYRA AI
                </span>
                <span className="text-[9px] text-[#EBA66F] font-sans font-bold tracking-wider uppercase block mt-1">
                  Your Next Interview, Smarter
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-[#666675]">
              <a href="#product" className="hover:text-[#10194A] transition-colors">Product</a>
              <a href="#features" className="hover:text-[#10194A] transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-[#10194A] transition-colors">How it works</a>
              <span onClick={() => openModal('terms')} className="cursor-pointer hover:text-[#10194A] transition-colors">Terms of Service</span>
              <span onClick={() => openModal('security')} className="cursor-pointer hover:text-[#10194A] transition-colors">Security Policy</span>
              <span onClick={() => openModal('status')} className="cursor-pointer hover:text-[#10194A] transition-colors">System Status</span>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#666675] gap-4">
            <p>© {new Date().getFullYear()} VEYRA AI. All rights reserved. Your Next Interview, Smarter.</p>
            <p className="text-[11px]">Editorial Warmth × Professional AI SaaS</p>
          </div>
        </div>
      </footer>

      {/* Policy Modals */}
      {modalContent && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#10194A]/60 backdrop-blur-xs cursor-pointer" onClick={closeModal} />
          <div className="relative w-full max-w-lg bg-white border border-[#E7E2DC] rounded-2xl shadow-2xl p-6 sm:p-8 animate-fade-in-up z-10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E2DC]">
              <h3 className="text-lg font-bold text-[#10194A] capitalize flex items-center gap-2">
                {modalContent === 'security' && <Lock className="w-4 h-4 text-[#10194A]" />}
                {modalContent === 'terms' && <FileText className="w-4 h-4 text-[#10194A]" />}
                {modalContent === 'status' && <Activity className="w-4 h-4 text-[#27845B]" />}
                {modalContent === 'security' ? 'Security Policy' : modalContent === 'terms' ? 'Terms of Service' : 'System Status'}
              </h3>
              <button onClick={closeModal} className="p-1 rounded-lg text-[#666675] hover:text-[#10194A]">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {modalContent === 'security' && (
              <div className="text-xs text-[#666675] space-y-3 leading-relaxed">
                <p>VEYRA AI enforces client-side data protection protocols. Interview responses and webcam streams are handled strictly within authorized evaluation sessions.</p>
                <p>No unauthorized biometric tracking or persistent recording occurs without user consent.</p>
              </div>
            )}

            {modalContent === 'terms' && (
              <div className="text-xs text-[#666675] space-y-3 leading-relaxed">
                <p>VEYRA AI is provided for personalized career growth and mock interview practice. Assessment scores and feedback are intended for developmental preparation.</p>
                <p>Fair usage guidelines apply to all AI inference sessions.</p>
              </div>
            )}

            {modalContent === 'status' && (
              <div className="text-xs space-y-3">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#27845B]/10 text-[#27845B] font-semibold">
                  <span className="w-2 h-2 rounded-full bg-[#27845B] animate-pulse" />
                  All Systems Operational
                </div>
                <div className="divide-y divide-[#E7E2DC] text-[#666675]">
                  <div className="py-2 flex justify-between"><span>Mock Interview Pipeline</span><span className="text-[#27845B] font-semibold">Healthy</span></div>
                  <div className="py-2 flex justify-between"><span>Monaco Sandbox Compiler</span><span className="text-[#27845B] font-semibold">Healthy</span></div>
                  <div className="py-2 flex justify-between"><span>TFJS BlazeFace Proctor</span><span className="text-[#27845B] font-semibold">Healthy</span></div>
                </div>
              </div>
            )}

            <div className="pt-2 text-right">
              <button 
                onClick={closeModal}
                className="px-4 py-2 rounded-xl bg-[#FAF5EF] hover:bg-[#F2ECE4] text-[#10194A] text-xs font-semibold border border-[#E7E2DC]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default LandingPage;
