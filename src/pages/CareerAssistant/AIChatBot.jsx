import React, { useState, useEffect, useRef } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { MessageSquare, Send, User, RefreshCw, Sparkles, AlertCircle, Mic, MicOff, Volume2, VolumeX, Key, ThumbsUp, ThumbsDown, Pin, PinOff, CornerUpLeft, Clock, BookMarked, X, ChevronRight, HelpCircle } from 'lucide-react';
import { 
  TERA_BHAI_SYSTEM_PROMPT, 
  BHAICHARA_SYSTEM_PROMPT,
  PROFESSIONAL_SYSTEM_PROMPT,
  INTERVIEWER_MODE_PROMPT
} from '../../services/geminiService';
import { getTranslation } from '../../utils/translations';
import interviewService from '../../services/interviewService';
import { prepareVoiceText } from '../../utils/voiceEngine';
import axios from 'axios';

const AIChatBot = () => {
  const activeLang = localStorage.getItem('language') || 'english';
  const [selectedMode, setSelectedMode] = useState(localStorage.getItem('chat_mode') || 'tera-bhai');
  const [showModeDropdown, setShowModeDropdown] = useState(false);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState(null);

  const [replyingTo, setReplyingTo] = useState(null);
  const [activeTopic, setActiveTopic] = useState(localStorage.getItem('chat_active_topic') || '');
  const [pinnedMessages, setPinnedMessages] = useState(() => {
    try {
      const stored = localStorage.getItem('pinned_messages');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [conversationSummary, setConversationSummary] = useState(localStorage.getItem('chat_summary') || '');
  const [activeSidebarTab, setActiveSidebarTab] = useState('topics'); // 'topics' | 'pins' | 'timeline'
  const [timeline, setTimeline] = useState([]);
  const [typingSuggestions, setTypingSuggestions] = useState([]);
  const [highlightedMsgId, setHighlightedMsgId] = useState(null);

  const getModeIcon = (mode) => {
    switch(mode) {
      case 'bhaichara': return '🤝';
      case 'professional': return '💼';
      case 'interviewer': return '🎤';
      default: return '👨‍🏫';
    }
  };

  const getModeLabel = (mode) => {
    switch(mode) {
      case 'bhaichara': return 'Bhaichara Mode';
      case 'professional': return 'Professional Mode';
      case 'interviewer': return 'Interviewer Coach';
      default: return 'Tera Bhai Mode';
    }
  };

  const modesList = [
    { id: 'tera-bhai', label: 'Tera Bhai Mode', icon: '👨‍🏫' },
    { id: 'bhaichara', label: 'Bhaichara Mode', icon: '🤝' },
    { id: 'professional', label: 'Professional Mode', icon: '💼' },
    { id: 'interviewer', label: 'Interviewer Coach', icon: '🎤' }
  ];

  const detectModeFromInput = (input) => {
    const text = input.toLowerCase();
    
    // Bhaichara triggers
    if (
      text.includes('bhai') || 
      text.includes('yaar') || 
      text.includes('bhaichara') || 
      text.includes('bro') || 
      text.includes('dost')
    ) {
      return 'bhaichara';
    }
    
    // Tera Bhai triggers
    if (
      text.includes('simple language') || 
      text.includes('aasan bhasha') || 
      text.includes('simple bhasha') || 
      text.includes('easy explanation') || 
      text.includes('tera bhai') ||
      text.includes('samjha') ||
      text.includes('explain simply')
    ) {
      return 'tera-bhai';
    }
    
    // Interviewer triggers
    if (
      text.includes('take my interview') || 
      text.includes('mock interview') || 
      text.includes('interview me') || 
      text.includes('interviewer') ||
      text.includes('mock test')
    ) {
      return 'interviewer';
    }
    

    
    // Professional triggers
    if (
      text.includes('explain jwt professionally') || 
      text.includes('professionally') || 
      text.includes('precise answers') || 
      text.includes('expert guidance') ||
      text.includes('jwt') ||
      text.includes('microservices') ||
      text.includes('oop') ||
      text.includes('api') ||
      text.includes('spring boot') ||
      text.includes('professional')
    ) {
      return 'professional';
    }
    
    return null;
  };

  const handlePinMessage = (msg) => {
    if (pinnedMessages.find(p => p.id === msg.id)) return;
    const updated = [...pinnedMessages, { id: msg.id, text: msg.text, time: msg.time }];
    setPinnedMessages(updated);
    localStorage.setItem('pinned_messages', JSON.stringify(updated));
  };

  const handleUnpinMessage = (msgId) => {
    const updated = pinnedMessages.filter(p => p.id !== msgId);
    setPinnedMessages(updated);
    localStorage.setItem('pinned_messages', JSON.stringify(updated));
  };

  const detectTopicLabel = (text) => {
    const lower = text.toLowerCase();
    if (lower.includes('spring security')) return 'Spring Security';
    if (lower.includes('spring boot') || lower.includes('spring')) return 'Spring Boot';
    if (lower.includes('jwt')) return 'JWT Authentication';
    if (lower.includes('react hook') || lower.includes('useeffect') || lower.includes('usestate')) return 'React Hooks';
    if (lower.includes('react')) return 'React.js';
    if (lower.includes('oop') || lower.includes('encapsulation') || lower.includes('polymorphism')) return 'OOP Concepts';
    if (lower.includes('database') || lower.includes('mysql') || lower.includes('jpa')) return 'Database & JPA';
    if (lower.includes('api') || lower.includes('rest')) return 'REST APIs';
    if (lower.includes('java')) return 'Java Programming';
    return null;
  };

  const scrollToMessage = (msgId) => {
    setHighlightedMsgId(msgId);
    setTimeout(() => {
      const el = document.getElementById(msgId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
    setTimeout(() => setHighlightedMsgId(null), 2500);
  };

  const getSuggestionsForInput = (text) => {
    const val = text.trim().toLowerCase();
    if (!val) {
      setTypingSuggestions([]);
      return;
    }
    const matches = [];
    if (val.includes('jw') || val.includes('token')) {
      matches.push('Explain JWT Authentication', 'JWT Interview Questions', 'JWT Refresh Token');
    }
    if (val.includes('spring') || val.includes('boot')) {
      matches.push('Spring Boot Architecture', 'Spring Security config', 'Explain Spring Boot REST API');
    }
    if (val.includes('react') || val.includes('hook') || val.includes('state')) {
      matches.push('Explain React Hooks', 'React Virtual DOM', 'Context API vs Redux');
    }
    if (val.includes('oop') || val.includes('class') || val.includes('object')) {
      matches.push('4 pillars of OOP', 'Inheritance vs Polymorphism', 'Encapsulation with examples');
    }
    if (val.includes('api') || val.includes('rest')) {
      matches.push('What is REST API', 'HTTP status codes', 'API security practices');
    }
    setTypingSuggestions(matches.slice(0, 3));
  };

  useEffect(() => {
    if (!inputText) {
      if (activeTopic === 'Spring Boot') {
        setTypingSuggestions(['Spring Security config', 'Spring Boot REST API', 'Explain JPA and Hibernate']);
      } else if (activeTopic === 'React.js' || activeTopic === 'React Hooks') {
        setTypingSuggestions(['Explain React Hooks', 'React Virtual DOM', 'Context API vs Redux']);
      } else if (activeTopic === 'JWT Authentication') {
        setTypingSuggestions(['JWT Refresh Token', 'Explain JWT vs Session', 'JWT Security practices']);
      } else {
        setTypingSuggestions([]);
      }
    } else {
      getSuggestionsForInput(inputText);
    }
  }, [activeTopic, inputText]);

  const getSystemPromptForMode = (mode) => {
    let basePrompt = '';
    switch (mode) {
      case 'bhaichara': basePrompt = BHAICHARA_SYSTEM_PROMPT; break;
      case 'professional': basePrompt = PROFESSIONAL_SYSTEM_PROMPT; break;
      case 'interviewer': basePrompt = INTERVIEWER_MODE_PROMPT; break;
      default: basePrompt = TERA_BHAI_SYSTEM_PROMPT; break;
    }
    if (conversationSummary) {
      basePrompt += `\n\n[Summary of conversation so far]: ${conversationSummary}`;
    }
    if (activeTopic) {
      basePrompt += `\n\n[Current Context Focus]: The user is currently focusing on "${activeTopic}". Maintain context relevant to this topic unless they explicitly pivot.`;
    }

    basePrompt += `\n\nCRITICAL RESPONSE FORMAT: You MUST return your response as a valid JSON object with EXACTLY these two keys:
1. "display": A string containing the markdown-formatted, detailed response that will be displayed in the chat interface. (e.g., has tables, code blocks, bullet points, headers, bold text, emojis).
2. "voice": A string containing the highly speakable, conversational response optimized for TTS. (e.g., references tables or code blocks on screen instead of displaying them, contains no markdown characters, spelling-out of acronyms like J-W-T, uses natural pauses, and is strictly under 300 words).

Example format:
{
  "display": "Here is the response with **bolding** and code...",
  "voice": "Here is the response. I've shown an example on your screen..."
}

Always return a single, valid JSON object starting with { and ending with } in your raw response. Do NOT wrap it in markdown code blocks like \`\`\`json.`;

    return basePrompt;
  };

  const getInitialMessage = (mode = selectedMode) => {
    if (activeLang === 'hindi') {
      switch(mode) {
        case 'bhaichara':
          return `अरे भाई! 😄 टेंशन बिल्कुल मत ले, तेरा भाई तेरे साथ है। हर समस्या का हल निकाल लेंगे!

बता, क्या दिक्कत आ रही है?
- इंटरव्यू से डर लग रहा है?
- कोडिंग या डेटा स्ट्रक्चर्स कठिन लग रहे हैं?
- प्लेसमेंट की चिंता सता रही है?

दिल खोल के पूछ, तेरा भाई हाजिर है! 🤝`;
        case 'professional':
          return `स्वागत है! 💼 प्रोफेशनल मोड (Professional Mode) सक्रिय है।
मैं एक सीनियर सॉफ़्टवेयर इंजीनियर और टेक्निकल आर्किटेक्ट के रूप में आपकी सहायता के लिए तैयार हूँ।

आप मुझसे इन चीज़ों के लिए कह सकते हैं:
- किसी भी तकनीक (जैसे JWT, Microservices) का गहरा विश्लेषण।
- स्वच्छ कोड लिखना और SOLID सिद्धांतों की समीक्षा करना।
- सिस्टम डिज़ाइन (System Design) और डेटाबेस स्कीमा बनाना।`;
        case 'interviewer':
          return `नमस्ते! 🎤 मॉक इंटरव्यू कोच (Mock Interview Coach) मोड सक्रिय है।
मैं Google, Microsoft, Amazon, TCS जैसी कंपनियों के स्तर का मॉक इंटरव्यू आयोजित करूँगा।

कृपया वह भूमिका (Role) और लक्षित कंपनी बताएं जिसके लिए आप अभ्यास करना चाहते हैं।`;

        default:
          return `ओये भाई! 😄 तेरा भाई यहाँ है। प्लेसमेंट की तैयारी को एकदम आसान बनाते हैं।

मुझसे कुछ भी पूछ:
- React, Node.js या Java के कॉन्सेप्ट्स को सिंपल उदाहरण से समझना।
- रिज्यूम को शानदार बनाना और प्रोजेक्ट्स में STAR बुलेट्स लिखना।
- कोल्ड ईमेल ड्राफ्ट करना या इंटरव्यू की चिंता दूर करना।

बता, आज क्या टॉपिक समझना है? 🔥`;
      }
    } else if (activeLang === 'marathi') {
      switch(mode) {
        case 'bhaichara':
          return `अरे भावा! 😄 अजिबात काळजी करू नकोस, तुझा भाऊ तुझ्या सोबत आहे. प्रत्येक समस्येचे उत्तर शोधूया!

सांग, काय अडचण येत आहे?
- इंटरव्यूची भीती वाटत आहे का?
- कोडिंग किंवा डेटा स्ट्रक्चर्स कठीण वाटत आहेत?
- प्लेसमेंटची काळजी वाटत आहे का?

मन मोकळे करून विचार, तुझा भाऊ हजर आहे! 🤝`;
        case 'professional':
          return `स्वागत आहे! 💼 प्रोफेशनल मोड (Professional Mode) सक्रिय आहे.
मी एक सीनियर सॉफ्टवेअर इंजिनिअर आणि टेक्निकल आर्किटेक्ट म्हणून मदत करण्यास तयार आहे.

तुम्ही मला विचारू शकता:
- कोणत्याही तंत्रज्ञानाचे (जसे की JWT, Microservices) सखोल विश्लेषण.
- क्लीन कोड आणि SOLID तत्त्वांचे पुनरावलोकन.
- सिस्टम डिझाइन आणि डेटाबेस मॉडेल तयार करणे.`;
        case 'interviewer':
          return `नमस्कार! 🎤 मॉक इंटरव्यू कोच (Mock Interview Coach) मोड सक्रिय आहे.
मी Google, Microsoft, Amazon, TCS सारख्या कंपन्यांच्या पातळीचे मॉक इंटरव्यू घेईन.

कृपया तुमची भूमिका (Role) आणि लक्ष्य कंपनी सांगा ज्यासाठी तुम्हाला सराव करायचा आहे!`;

        default:
          return `ओये भावा! 😄 तुझा भाऊ इथे आहे. प्लेसमेंटची तयारी एकदम सोपी करूया.

मला काहीही विचार:
- React, Node.js किंवा Java च्या संकल्पना सोप्या उदाहरणांनी समजून घेणे.
- बायोडाटा (resume) उत्कृष्ट बनवणे आणि STAR बुलेट्स लिहिणे.
- कोल्ड ईमेल तयार करणे किंवा इंटरव्यूची भीती घालवणे.

सांग, आज काय शिकायचे आहे? 🔥`;
      }
    }

    // Default English
    switch(mode) {
      case 'bhaichara':
        return `Arre bhai! 😄 No need to worry at all, your brother is here to solve any problem you have.

Tell me what's bothering you:
- Scared of interviews?
- Finding DSA or Web Dev tough?
- Stressed about placements?

Ask anything, your brother has your back! 🤝`;
      case 'professional':
        return `Welcome! 💼 Professional Mode is active.
I will assist you as a Senior Software Engineer, Technical Architect, and Career Consultant.

You can request:
- In-depth analysis of technical concepts (e.g., JWT, Microservices) following industry structures.
- Clean code audits, design patterns, and SOLID reviews.
- System architecture plans and database designs.`;
      case 'interviewer':
        return `Hello! 🎤 Mock Interview Coach Mode is active.
I will conduct technical and behavioral interviews simulating rounds at Google, Microsoft, Amazon, TCS, etc.

Please specify the role and target company you would like to practice for!`;

      default:
        return `Hey brother! 😄 Your AI mentor and best friend is here. Let's make placement prep easy and fun.

You can ask me to:
- Explain React Hooks, Node.js, or Java concepts with real-life analogies.
- Review your resume and build STAR bullet points.
- Draft cold emails or design a step-by-step roadmap.

Tell me, what are we learning today? 🔥`;
    }
  };

  const [messages, setMessages] = useState([
    {
      id: 'msg-init',
      sender: 'ai',
      text: getInitialMessage(selectedMode),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const handleModeChange = (mode) => {
    setSelectedMode(mode);
    localStorage.setItem('chat_mode', mode);
  };

  useEffect(() => {
    // If the chat has only the initial message, update it when language or mode changes
    if (messages.length === 1 && messages[0].id === 'msg-init') {
      setMessages([
        {
          id: 'msg-init',
          sender: 'ai',
          text: getInitialMessage(selectedMode),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [selectedMode, activeLang]);


  const [showKeyModal, setShowKeyModal] = useState(false);
  const [customKey, setCustomKey] = useState(localStorage.getItem('custom_gemini_api_key') || '');
  const [hasCustomKey, setHasCustomKey] = useState(!!localStorage.getItem('custom_gemini_api_key'));

  const handleSaveKey = () => {
    if (customKey.trim()) {
      localStorage.setItem('custom_gemini_api_key', customKey.trim());
      setHasCustomKey(true);
    } else {
      localStorage.removeItem('custom_gemini_api_key');
      setHasCustomKey(false);
    }
    setShowKeyModal(false);
  };

  const handleClearKey = () => {
    localStorage.removeItem('custom_gemini_api_key');
    setCustomKey('');
    setHasCustomKey(false);
    setShowKeyModal(false);
  };
  
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const inputRef = useRef(null);

  const [showTeachModal, setShowTeachModal] = useState(false);
  const [teachQuestion, setTeachQuestion] = useState('');
  const [teachAnswer, setTeachAnswer] = useState('');
  const [isTraining, setIsTraining] = useState(false);
  const [taughtRules, setTaughtRules] = useState([]);

  const fetchTaughtRules = async () => {
    try {
      const data = await interviewService.getTaughtRules();
      setTaughtRules(data || []);
    } catch (err) {
      console.error("Failed to load taught rules:", err);
    }
  };

  useEffect(() => {
    fetchTaughtRules();
  }, []);

  const handleTrainAI = async (e) => {
    e.preventDefault();
    if (!teachQuestion.trim() || !teachAnswer.trim()) return;

    setIsTraining(true);
    try {
      await interviewService.teachAI(teachQuestion, teachAnswer);
      setTeachQuestion('');
      setTeachAnswer('');
      setShowTeachModal(false);
      await fetchTaughtRules();
    } catch (err) {
      console.error("Failed to train AI rule:", err);
      alert("Failed to save rules to dataset. Please try again.");
    } finally {
      setIsTraining(false);
    }
  };

  const handleDeleteTaughtRule = async (id) => {
    if (!window.confirm("Are you sure you want to delete this custom learning rule?")) return;
    try {
      await interviewService.deleteTaughtRule(id);
      await fetchTaughtRules();
    } catch (err) {
      console.error("Failed to delete taught rule:", err);
    }
  };

  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState(() => {
    try {
      const stored = localStorage.getItem('voice_settings');
      let parsed = stored ? JSON.parse(stored) : null;
      
      // Auto-migration: Replace old default voice IDs and empty key with the new premium values
      if (parsed) {
        let migrated = false;
        if (parsed.teraBhaiVoiceId === 'ErXwobaYiN019PkySvjV') {
          parsed.teraBhaiVoiceId = '3AMU7jXQuQa3oRvRqUmb';
          migrated = true;
        }
        if (parsed.bhaicharaVoiceId === 'pNInz6obpgfrAEX3fxtm') {
          parsed.bhaicharaVoiceId = '3AMU7jXQuQa3oRvRqUmb';
          migrated = true;
        }
        if (!parsed.elevenLabsApiKey || parsed.elevenLabsApiKey.trim() === '') {
          parsed.elevenLabsApiKey = '10dc179a20777d4b30de228ce5254ed36e7e3a51f908864496ff138df1ae19a2';
          migrated = true;
        }
        if (migrated) {
          localStorage.setItem('voice_settings', JSON.stringify(parsed));
        }
      }

      return {
        voiceType: parsed?.voiceType || 'female',
        accent: parsed?.accent || 'indian',
        speed: parsed?.speed !== undefined ? parsed.speed : 1.0,
        pitch: parsed?.pitch !== undefined ? parsed.pitch : 1.0,
        emotion: parsed?.emotion || 'medium',
        bargeIn: parsed?.bargeIn !== undefined ? parsed.bargeIn : true,
        elevenLabsApiKey: parsed?.elevenLabsApiKey || '10dc179a20777d4b30de228ce5254ed36e7e3a51f908864496ff138df1ae19a2',
        bhaicharaVoiceId: parsed?.bhaicharaVoiceId || '3AMU7jXQuQa3oRvRqUmb',
        teraBhaiVoiceId: parsed?.teraBhaiVoiceId || '3AMU7jXQuQa3oRvRqUmb',
        professionalVoiceId: parsed?.professionalVoiceId || '21m00Tcm4TlvDq8ikWAM'
      };
    } catch {
      return { 
        voiceType: 'female', 
        accent: 'indian', 
        speed: 1.0, 
        pitch: 1.0, 
        emotion: 'medium', 
        bargeIn: true,
        elevenLabsApiKey: '10dc179a20777d4b30de228ce5254ed36e7e3a51f908864496ff138df1ae19a2',
        bhaicharaVoiceId: '3AMU7jXQuQa3oRvRqUmb',
        teraBhaiVoiceId: '3AMU7jXQuQa3oRvRqUmb',
        professionalVoiceId: '21m00Tcm4TlvDq8ikWAM'
      };
    }
  });

  const handleSaveVoiceSettings = (settings) => {
    setVoiceSettings(settings);
    localStorage.setItem('voice_settings', JSON.stringify(settings));
    setShowVoiceModal(false);
  };

  const speakQueueRef = useRef([]);
  const activeUtteranceRef = useRef(null);
  const activeAudioRef = useRef(null);
  const speakingMessageIdRef = useRef(null);

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    if (activeAudioRef.current) {
      try {
        activeAudioRef.current.pause();
        activeAudioRef.current.currentTime = 0;
      } catch (e) {}
      activeAudioRef.current = null;
    }
    speakQueueRef.current = [];
    activeUtteranceRef.current = null;
    speakingMessageIdRef.current = null;
    setSpeakingMessageId(null);
  };

  const splitIntoSentences = (text) => {
    if (!text) return [];
    let cleanText = text.replace(/\*\*+/g, '').replace(/[-*•]\s+/g, '');
    const sentences = cleanText.split(/(?<=[.?!।\n])\s+/);
    return sentences
      .map(s => s.trim())
      .filter(s => s.length > 0);
  };

  const technicalPronunciations = {
    'JWT': 'J-W-T',
    'SQL': 'Sequel',
    'REST': 'Rest',
    'API': 'A-P-I',
    'DSA': 'D-S-A',
    'HTML': 'H-T-M-L',
    'CSS': 'C-S-S',
    'OOP': 'O-O-P',
    'React': 'React',
    'Vite': 'Veet',
    'Node.js': 'Node J-S',
    'Express.js': 'Express J-S',
    'Spring Boot': 'Spring Boot',
    'GitHub': 'Git-Hub'
  };

  const formatPronunciation = (text) => {
    let cleanedText = text;
    Object.entries(technicalPronunciations).forEach(([term, pronunciation]) => {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      cleanedText = cleanedText.replace(regex, pronunciation);
    });
    return cleanedText;
  };

  const getVoiceForPreferences = (voices, voiceType, accent, activeLang) => {
    if (activeLang === 'hindi') {
      const hiVoice = voices.find(v => v.lang.toLowerCase().includes('hi-in'));
      if (hiVoice) return hiVoice;
    }
    if (activeLang === 'marathi') {
      const mrVoice = voices.find(v => v.lang.toLowerCase().includes('mr-in') || v.lang.toLowerCase().includes('hi-in'));
      if (mrVoice) return mrVoice;
    }

    let targetLang = 'en-US';
    if (accent === 'indian') targetLang = 'en-IN';
    else if (accent === 'british') targetLang = 'en-GB';

    let filtered = voices.filter(v => v.lang.toLowerCase().includes(targetLang.toLowerCase()));
    if (filtered.length === 0) {
      filtered = voices.filter(v => v.lang.toLowerCase().startsWith('en'));
    }

    const isFemale = voiceType === 'female';
    let genderFiltered = filtered.filter(v => {
      const name = v.name.toLowerCase();
      if (isFemale) {
        return name.includes('female') || name.includes('zira') || name.includes('hazel') || name.includes('samantha') || name.includes('heera') || name.includes('veena');
      } else {
        return name.includes('male') || name.includes('david') || name.includes('george') || name.includes('ravi');
      }
    });

    if (genderFiltered.length > 0) {
      return genderFiltered[0];
    }
    return filtered[0] || voices[0];
  };

  const getUtteranceStyle = (text, mode, settings) => {
    let rate = parseFloat(settings.speed) || 1.0;
    let pitch = parseFloat(settings.pitch) || 1.0;

    if (mode === 'bhaichara') {
      rate *= 1.05;
      pitch *= 1.05;
    } else if (mode === 'tera-bhai') {
      rate *= 0.95;
    }

    const lowerText = text.toLowerCase();
    const happyWords = ['congratulations', 'great', 'excellent', 'awesome', 'amazing', 'happy', 'superb', 'shandaar', 'badhiya', 'mubarak'];
    const seriousWords = ['warning', 'security', 'risk', 'vulnerability', 'error', 'failed', 'danger', 'careful', 'critical', 'danger', 'chinta', 'tension'];

    const isHappy = happyWords.some(w => lowerText.includes(w));
    const isSerious = seriousWords.some(w => lowerText.includes(w));

    if (settings.emotion !== 'low') {
      const factor = settings.emotion === 'high' ? 0.15 : 0.08;
      if (isHappy) {
        rate += factor;
        pitch += factor / 2;
      } else if (isSerious) {
        rate -= factor;
        pitch -= factor / 2;
      }
    }

    rate = Math.max(0.6, Math.min(2.0, rate));
    pitch = Math.max(0.5, Math.min(1.5, pitch));

    return { rate, pitch };
  };

  const getQuickPrompts = () => {
    if (activeLang === 'hindi') {
      return [
        "रिएक्ट इंटर्नशिप के लिए कोल्ड ईमेल लिखें",
        "OOP बनाम कार्यात्मक प्रोग्रामिंग समझाएं",
        "STAR कहानियां कैसे तैयार करें?",
        "मुझे 5 HTML इंटरव्यू प्रश्न दें",
        "सॉफ्टवेयर इंजीनियर के लिए रिज्यूम समीक्षा करें",
        "सैलरी ऑफर पर बातचीत कैसे करें?"
      ];
    } else if (activeLang === 'marathi') {
      return [
        "रिएक्ट इंटर्नशिपसाठी कोल्ड ईमेल लिहा",
        "OOP विरुद्ध फंक्शनल प्रोग्रामिंग स्पष्ट करा",
        "STAR कथा कशा तयार करायच्या?",
        "मला 5 HTML इंटरव्यू प्रश्न द्या",
        "सॉफ्टवेअर इंजिनिअरसाठीचे बायोडाटा तपासा",
        "पगार ऑफरवर चर्चा कशी करावी?"
      ];
    }
    return [
      "Write a cold email for a React internship",
      "Explain OOP vs Functional programming",
      "How should I structure STAR stories?",
      "Give me 5 HTML interview questions",
      "Review my resume for a software engineer role",
      "How do I negotiate my salary offer?"
    ];
  };

  const quickPrompts = getQuickPrompts();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    // Auto-focus input on mount and when modal closes
    if (!showKeyModal) {
      inputRef.current?.focus();
    }
  }, [showKeyModal]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // If the API key modal is open, do not hijack keystrokes
      if (showKeyModal) return;

      const activeElement = document.activeElement;
      if (
        activeElement &&
        (activeElement.tagName === 'INPUT' ||
         activeElement.tagName === 'TEXTAREA' ||
         activeElement.isContentEditable)
      ) {
        return;
      }

      // Ignore modifier keys to prevent hijacking browser/system shortcuts (e.g. Ctrl+C, Ctrl+V, Alt+Tab, etc.)
      if (e.ctrlKey || e.altKey || e.metaKey) {
        return;
      }

      // Capture single printable characters and focus the input box automatically
      if (e.key.length === 1) {
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showKeyModal]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      
      if (activeLang === 'hindi') rec.lang = 'hi-IN';
      else if (activeLang === 'marathi') rec.lang = 'mr-IN';
      else rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
        if (voiceSettings.bargeIn) {
          stopSpeaking();
        }
      };

      rec.onsoundstart = () => {
        if (voiceSettings.bargeIn) {
          stopSpeaking();
        }
      };

      rec.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        setInputText((prev) => (prev ? prev + ' ' + transcript : transcript));
      };

      rec.onerror = (e) => {
        console.error('Speech recognition error:', e);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }

    return () => {
      stopSpeaking();
    };
  }, [activeLang, voiceSettings.bargeIn]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported in this browser. Please try Google Chrome or MS Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      if (voiceSettings.bargeIn) {
        stopSpeaking();
      }
      recognitionRef.current.start();
    }
  };

  const speakNextSentence = async (msgId) => {
    if (speakQueueRef.current.length === 0) {
      speakingMessageIdRef.current = null;
      setSpeakingMessageId(null);
      return;
    }

    const nextText = speakQueueRef.current.shift();
    const formattedText = formatPronunciation(nextText);

    try {
      const apiKey = 'sk_ccb5cdd22bf0298d8c33728e7019dc6b3e6e947084a69511';
      let voiceId = '3OUAuH7CeDSQhCCijs1Y'; // Default Professional
      if (selectedMode === 'bhaichara') {
        voiceId = 'Ms9OTvWb99V6DwRHZn6q';
      } else if (selectedMode === 'tera-bhai') {
        voiceId = 'TRnaQb7q41oL7sV0w6Bu';
      }

      const stability = voiceSettings.emotion === 'high' ? 0.4 : voiceSettings.emotion === 'low' ? 0.8 : 0.65;
      const similarity = 0.75;

      const res = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          text: formattedText,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability,
            similarity_boost: similarity
          }
        },
        {
          headers: {
            'xi-api-key': apiKey,
            'Content-Type': 'application/json'
          },
          responseType: 'blob'
        }
      );

      const audioUrl = URL.createObjectURL(res.data);
      const audio = new Audio(audioUrl);
      activeAudioRef.current = audio;
      audio.playbackRate = parseFloat(voiceSettings.speed) || 1.0;

      audio.onended = () => {
        setTimeout(() => {
          if (speakingMessageIdRef.current === msgId) {
            speakNextSentence(msgId);
          }
        }, 150);
      };

      audio.onerror = (e) => {
        console.warn("ElevenLabs audio failed, falling back to WebSpeech:", e);
        speakSystemUtterance(formattedText, msgId);
      };

      audio.play();
    } catch (err) {
      console.error("ElevenLabs API request failed, falling back to WebSpeech:", err);
      speakSystemUtterance(formattedText, msgId);
    }
  };

  const speakSystemUtterance = (formattedText, msgId) => {
    const utterance = new SpeechSynthesisUtterance(formattedText);
    activeUtteranceRef.current = utterance;

    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = getVoiceForPreferences(voices, voiceSettings.voiceType, voiceSettings.accent, activeLang);
    if (matchedVoice) {
      utterance.voice = matchedVoice;
      utterance.lang = matchedVoice.lang;
    } else {
      if (activeLang === 'hindi') utterance.lang = 'hi-IN';
      else if (activeLang === 'marathi') utterance.lang = 'mr-IN';
      else utterance.lang = 'en-US';
    }

    const { rate, pitch } = getUtteranceStyle(formattedText, selectedMode, voiceSettings);
    utterance.rate = rate;
    utterance.pitch = pitch;

    utterance.onend = () => {
      setTimeout(() => {
        if (speakingMessageIdRef.current === msgId) {
          speakNextSentence(msgId);
        }
      }, 150);
    };

    utterance.onerror = (e) => {
      console.error('Speech error:', e);
      if (speakingMessageIdRef.current === msgId) {
        speakNextSentence(msgId);
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  const speakMessage = (msgId, text, voiceText = null) => {
    if (speakingMessageIdRef.current === msgId) {
      stopSpeaking();
      return;
    }

    stopSpeaking();

    const textToProcess = voiceText || prepareVoiceText(text);
    const sentences = splitIntoSentences(textToProcess);
    if (sentences.length === 0) return;

    if (selectedMode === 'bhaichara') {
      const fillers = ["Arre bhai, ", "Hmm, ", "Alright, ", "Dekho, "];
      const randomFiller = fillers[Math.floor(Math.random() * fillers.length)];
      sentences[0] = randomFiller + sentences[0];
    } else if (selectedMode === 'tera-bhai') {
      const fillers = ["Dekh bhai, ", "So, ", "Let's see, ", "Hmm, "];
      const randomFiller = fillers[Math.floor(Math.random() * fillers.length)];
      sentences[0] = randomFiller + sentences[0];
    }

    speakQueueRef.current = sentences;
    speakingMessageIdRef.current = msgId;
    setSpeakingMessageId(msgId);

    speakNextSentence(msgId);
  };

  const handleSendMessage = async (textToSend) => {
    if (!textToSend.trim() || isTyping) return;

    stopSpeaking();

    const detectedMode = detectModeFromInput(textToSend);
    let activeMode = selectedMode;
    let systemMsg = null;

    if (detectedMode && detectedMode !== selectedMode) {
      activeMode = detectedMode;
      setSelectedMode(detectedMode);
      localStorage.setItem('chat_mode', detectedMode);
      systemMsg = {
        id: `msg-sys-${Date.now()}`,
        sender: 'system',
        text: `Mode Auto-Switched to ${getModeIcon(detectedMode)} ${getModeLabel(detectedMode)} based on your query.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    }

    // Auto-detect topic
    const detectedTopic = detectTopicLabel(textToSend);
    if (detectedTopic && detectedTopic !== activeTopic) {
      setActiveTopic(detectedTopic);
      localStorage.setItem('chat_active_topic', detectedTopic);
    }

    const userMsgId = `msg-user-${Date.now()}`;
    const userMsg = {
      id: userMsgId,
      sender: 'user',
      text: textToSend.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      replyTo: replyingTo ? { id: replyingTo.id, text: replyingTo.text } : null,
      topic: activeTopic || detectedTopic || 'General Technical'
    };

    // Update timeline
    if (detectedTopic) {
      setTimeline(prev => {
        if (!prev.find(t => t.label === detectedTopic)) {
          return [...prev, { label: detectedTopic, msgId: userMsgId, timestamp: Date.now() }];
        }
        return prev;
      });
    }

    let updatedMessages = [...messages];
    if (systemMsg) {
      updatedMessages.push(systemMsg);
    }
    updatedMessages.push(userMsg);

    setMessages(updatedMessages);
    setInputText('');
    setReplyingTo(null);
    setIsTyping(true);
    setError(null);

    const startTime = Date.now();

    try {
      const history = updatedMessages
        .filter(m => m.id !== 'msg-init' && m.sender !== 'system')
        .map(m => {
          let text = m.text;
          if (m.replyTo) {
            text = `[Replying to your previous message: "${m.replyTo.text}"]\n\n${text}`;
          }
          return {
            role: m.sender === 'user' ? 'user' : m.sender || 'model',
            text
          };
        });

      const resData = await interviewService.chatNexus(
        history, 
        getSystemPromptForMode(activeMode)
      );
      const latencySeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));
      
      const aiText = resData.text || '';
      const model = resData.sourceModel || 'Gemini Fallback';

      let displayContent = aiText;
      let voiceContent = '';

      const extractJson = (text) => {
        if (!text) return null;
        let cleaned = text.trim();
        if (cleaned.startsWith('```')) {
          const startIdx = cleaned.indexOf('{');
          const endIdx = cleaned.lastIndexOf('}');
          if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
            cleaned = cleaned.substring(startIdx, endIdx + 1);
          }
        }
        try {
          return JSON.parse(cleaned);
        } catch {
          const startIdx = cleaned.indexOf('{');
          const endIdx = cleaned.lastIndexOf('}');
          if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
            try {
              return JSON.parse(cleaned.substring(startIdx, endIdx + 1));
            } catch {
              return null;
            }
          }
          return null;
        }
      };

      const parsedJson = extractJson(aiText);
      if (parsedJson && parsedJson.display && parsedJson.voice) {
        displayContent = parsedJson.display;
        voiceContent = parsedJson.voice;
      }

      if (!voiceContent) {
        voiceContent = prepareVoiceText(displayContent);
      }

      let topic = userMsg.topic;

      const aiMsg = {
        id: `msg-ai-${Date.now()}`,
        sender: 'ai',
        text: displayContent,
        voiceText: voiceContent,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        latency: latencySeconds,
        questionContext: textToSend.trim(),
        topic,
        sourceModel: model,
        rated: null
      };

      const finalMessages = [...updatedMessages, aiMsg];
      setMessages(finalMessages);

      // Smart Memory Summarizer: run in background every 6 messages
      const nonSystemCount = finalMessages.filter(m => m.sender !== 'system').length;
      if (nonSystemCount > 0 && nonSystemCount % 6 === 0) {
        const summaryHistory = finalMessages
          .filter(m => m.id !== 'msg-init' && m.sender !== 'system')
          .map(m => ({
            role: m.sender === 'user' ? 'user' : 'model',
            text: m.text
          }));
          
        summaryHistory.push({
          role: 'user',
          text: 'Summarize our conversation so far in 1 short sentence. Focus on key technical concepts discussed. Start your answer with "CONVERSATION_SUMMARY: "'
        });

        interviewService.chatNexus(summaryHistory, 'You are an AI assistant helping with conversation memory.')
          .then(res => {
            const reply = res.text || res;
            if (reply && reply.includes('CONVERSATION_SUMMARY:')) {
              const cleaned = reply.split('CONVERSATION_SUMMARY:')[1]?.trim();
              if (cleaned) {
                setConversationSummary(cleaned);
                localStorage.setItem('chat_summary', cleaned);
              }
            }
          })
          .catch(err => console.warn('Background summary failed:', err));
      }

    } catch (err) {
      console.error('Nexus AI error:', err);
      setError(err.message || 'Failed to get AI response. Please try again.');
    } finally {
      setIsTyping(false);
    }
  };

  const handleRateResponse = async (msg, rating) => {
    try {
      const topic = msg.topic || 'General Technical';
      const timeTaken = msg.latency || 8;
      const question = msg.questionContext || 'General query';
      
      await interviewService.logNexusInteraction({
        question,
        rating,
        timeTaken,
        difficulty: 'Medium',
        topic,
        outcome: rating === 'helpful' ? 'Correct' : 'Incorrect'
      });
      
      setMessages(prev => prev.map(m => {
        if (m.id === msg.id) {
          return { ...m, rated: rating };
        }
        return m;
      }));
    } catch (e) {
      console.error('Failed to log rating:', e);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'msg-init',
        sender: 'ai',
        text: getInitialMessage(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setReplyingTo(null);
    setActiveTopic('');
    setTimeline([]);
    setConversationSummary('');
    localStorage.removeItem('chat_active_topic');
    localStorage.removeItem('chat_summary');
    setError(null);
    window.speechSynthesis.cancel();
    setSpeakingMessageId(null);
  };

  // Helper to render **bold** text cleanly without a heavy markdown parser
  const renderItalics = (text) => {
    const parts = text.split(/(\*.*?\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
        return <em key={idx} className="italic opacity-90 text-indigo-700 dark:text-indigo-200">{part.slice(1, -1)}</em>;
      }
      let cleanPart = part;
      cleanPart = cleanPart.replace(/(?:^|\n)\s*[-*]\s+/g, (match) => {
        return match.startsWith('\n') ? '\n• ' : '• ';
      });
      return cleanPart;
    });
  };

  const renderMessageText = (text) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        return (
          <strong key={index} className="font-bold text-indigo-800 dark:text-indigo-300 drop-shadow-sm">
            {renderItalics(part.slice(2, -2))}
          </strong>
        );
      }
      return <React.Fragment key={index}>{renderItalics(part)}</React.Fragment>;
    });
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in-up flex flex-col gap-6" style={{ height: 'calc(100vh - 7rem)' }}>

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-primary-400" />
            {getTranslation('careerAssistant')}
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              Gemini AI
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {getTranslation('careerAssistantSubtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          {/* Mode Dropdown Selector */}
          <div className="relative">
            <button
              onClick={() => setShowModeDropdown(!showModeDropdown)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-700/50 bg-slate-800/80 text-xs font-bold text-slate-100 hover:bg-slate-700/60 transition-all select-none shadow-sm"
            >
              <span>{getModeIcon(selectedMode)} {getModeLabel(selectedMode)}</span>
              <span className="opacity-60 text-[9px]">▼</span>
            </button>
            
            {showModeDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowModeDropdown(false)} />
                <div className="absolute right-0 mt-2 w-52 rounded-xl bg-slate-900/95 border border-slate-700/60 shadow-2xl p-1.5 z-50 animate-fade-in backdrop-blur-md">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider px-2.5 py-1 select-none">
                    AI Assistant Mode
                  </div>
                  {modesList.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        handleModeChange(m.id);
                        setShowModeDropdown(false);
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                        selectedMode === m.id
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span>{m.icon}</span>
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => setShowVoiceModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-700/50 bg-slate-800/80 text-xs font-semibold text-slate-300 hover:bg-slate-700/60 hover:text-white transition-all select-none shadow-sm"
            title="Configure Voice Settings & Voice Memory"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Voice Settings</span>
          </button>

          <button
            onClick={() => setShowTeachModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-700/50 bg-slate-800/80 text-xs font-semibold text-slate-300 hover:bg-slate-700/60 hover:text-white transition-all select-none shadow-sm"
            title="Teach Custom Responses to AI"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Train AI 🧠</span>
          </button>

          <button
            onClick={() => setShowKeyModal(true)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              hasCustomKey
                ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20'
                : 'bg-slate-800/80 border-slate-700/50 text-slate-300 hover:bg-slate-700/60'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            {hasCustomKey ? 'API Key Active' : 'Configure API Key'}
          </button>
          <Button size="sm" variant="secondary" icon={RefreshCw} onClick={handleResetChat}>
            {getTranslation('resetChat')}
          </Button>
        </div>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-500 dark:text-rose-400 text-xs font-medium flex-shrink-0">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-0.5">{getTranslation('aiError')}</span>
            {error}
          </div>
          <button onClick={() => setError(null)} className="ml-auto text-rose-400 hover:text-rose-300 font-bold">✕</button>
        </div>
      )}

      {/* ── Main Chat Body ── */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-4 gap-5">

        {/* Left: Sidebar (Topics, Timeline, Bookmarks) */}
        <div className="hidden lg:flex flex-col col-span-1">
          <div className="liquid-glass-card p-5 rounded-2xl h-full flex flex-col min-h-[450px]">
            {/* Tabs */}
            <div className="flex border-b border-slate-700/50 mb-4 text-[10px] select-none uppercase tracking-wider font-extrabold">
              <button
                onClick={() => setActiveSidebarTab('topics')}
                className={`flex-1 pb-2 text-center border-b-2 transition-all flex items-center justify-center gap-1 ${
                  activeSidebarTab === 'topics'
                    ? 'border-indigo-500 text-slate-100 font-black'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Topics
              </button>
              <button
                onClick={() => setActiveSidebarTab('timeline')}
                className={`flex-1 pb-2 text-center border-b-2 transition-all flex items-center justify-center gap-1 ${
                  activeSidebarTab === 'timeline'
                    ? 'border-indigo-500 text-slate-100 font-black'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Timeline
              </button>
              <button
                onClick={() => setActiveSidebarTab('pins')}
                className={`flex-1 pb-2 text-center border-b-2 transition-all flex items-center justify-center gap-1 ${
                  activeSidebarTab === 'pins'
                    ? 'border-indigo-500 text-slate-100 font-black'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Pins
              </button>
              <button
                onClick={() => setActiveSidebarTab('trained')}
                className={`flex-1 pb-2 text-center border-b-2 transition-all flex items-center justify-center gap-1 ${
                  activeSidebarTab === 'trained'
                    ? 'border-indigo-500 text-slate-100 font-black'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                🧠 Taught
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 flex flex-col min-h-0">
              {activeSidebarTab === 'topics' && (
                <div className="flex flex-col gap-3 overflow-y-auto pr-1">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Quick Prompts</p>
                  {quickPrompts.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(p)}
                      disabled={isTyping}
                      className="w-full text-left px-4 py-3 rounded-xl bg-slate-800/20 hover:bg-indigo-600/10 border border-slate-700/40 hover:border-indigo-500/40 text-xs text-slate-200 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed leading-relaxed"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}

              {activeSidebarTab === 'timeline' && (
                <div className="flex flex-col gap-2 overflow-y-auto pr-1">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Session Timeline</p>
                  {timeline.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                      <Clock className="w-8 h-8 text-slate-600 mb-2 opacity-50" />
                      <p className="text-xs text-slate-500 font-medium">No topics logged yet.</p>
                    </div>
                  ) : (
                    timeline.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => scrollToMessage(item.msgId)}
                        className="w-full text-left px-3 py-2.5 rounded-xl bg-slate-800/20 hover:bg-slate-800/50 border border-slate-700/30 hover:border-slate-700/60 text-xs text-slate-300 transition-all font-semibold flex items-center justify-between group"
                      >
                        <span className="truncate">📘 {item.label}</span>
                        <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all text-slate-400" />
                      </button>
                    ))
                  )}
                </div>
              )}

              {activeSidebarTab === 'pins' && (
                <div className="flex flex-col gap-3 overflow-y-auto pr-1">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Pinned Explanations</p>
                  {pinnedMessages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                      <BookMarked className="w-8 h-8 text-slate-600 mb-2 opacity-50" />
                      <p className="text-xs text-slate-500 font-medium px-2">No bookmarks yet. Hover over AI messages and click Pin to save them.</p>
                    </div>
                  ) : (
                    pinnedMessages.map((msg) => (
                      <div key={msg.id} className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/20 text-xs text-slate-300 relative group flex flex-col justify-between min-h-[90px]">
                        <p className="font-semibold line-clamp-3 leading-relaxed mb-2 select-text">{msg.text}</p>
                        <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1.5 border-t border-slate-700/20 pt-1.5">
                          <span>{msg.time}</span>
                          <button
                            onClick={() => handleUnpinMessage(msg.id)}
                            className="text-rose-400 hover:text-rose-300 font-bold opacity-0 group-hover:opacity-100 transition-all"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeSidebarTab === 'trained' && (
                <div className="flex flex-col gap-3 overflow-y-auto pr-1">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Trained AI Dataset Rules</p>
                  {taughtRules.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                      <Sparkles className="w-8 h-8 text-slate-600 mb-2 opacity-50" />
                      <p className="text-xs text-slate-500 font-medium px-2 leading-relaxed">You haven't taught the AI any rules yet. Click "Train AI" in the header to teach a custom response.</p>
                    </div>
                  ) : (
                    taughtRules.map((rule) => (
                      <div key={rule.id} className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-xs text-slate-300 relative group flex flex-col justify-between min-h-[95px]">
                        <div>
                          <p className="font-bold text-cyan-400 truncate mb-1">Q: {rule.question}</p>
                          <p className="leading-relaxed line-clamp-3 select-text text-slate-300">A: {rule.answer}</p>
                        </div>
                        <div className="flex justify-between items-center text-[9px] text-slate-500 mt-2 border-t border-slate-700/20 pt-1.5">
                          <span>{new Date(rule.timestamp).toLocaleDateString()}</span>
                          <button
                            onClick={() => handleDeleteTaughtRule(rule.id)}
                            className="text-rose-400 hover:text-rose-300 font-bold opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Chat Frame */}
        <div className="lg:col-span-3 flex flex-col min-h-0 rounded-2xl overflow-hidden liquid-glass-card shadow-2xl relative">
          
          {/* Subtle Ambient Glow inside chat */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cognitive-primary/5 rounded-full blur-[100px] pointer-events-none" />

          {/* Messages scroll area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10">
            {messages.map((msg) => {
              if (msg.sender === 'system') {
                return (
                  <div key={msg.id} className="flex justify-center my-4 animate-fade-in select-none">
                    <span className="px-4 py-2 rounded-xl bg-slate-800/40 border border-slate-700/30 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-md shadow-sm">
                      ⚙️ {msg.text}
                    </span>
                  </div>
                );
              }
              const isAi = msg.sender === 'ai';
              const isHighlighted = highlightedMsgId === msg.id;
              return (
                <div
                  key={msg.id}
                  id={msg.id}
                  className={`flex gap-4 group/msg transition-all duration-300 ${
                    isHighlighted ? 'ring-2 ring-indigo-500/80 shadow-indigo-500/20 scale-[1.01] p-2 rounded-2xl bg-indigo-500/5' : ''
                  } ${isAi ? 'mr-auto max-w-[85%]' : 'ml-auto max-w-[85%] flex-row-reverse'}`}
                >
                  {/* Avatar */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-xs text-white shadow-lg ${
                    isAi
                      ? 'bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-indigo-500/25 border border-white/10'
                      : 'bg-gradient-to-br from-slate-600 to-slate-800 border border-white/5'
                  }`}>
                    {isAi ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  {/* Bubble */}
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className={`px-5 py-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-md border ${
                      isAi
                        ? 'bg-white/90 dark:bg-[#0f172a]/80 backdrop-blur-md border-indigo-500/20 text-gray-900 dark:text-white rounded-tl-sm'
                        : 'bg-gradient-to-br from-indigo-600 to-indigo-800 border-indigo-500/30 text-white rounded-tr-sm shadow-indigo-500/20'
                    }`}>
                      {/* Quoted Message Render */}
                      {msg.replyTo && (
                        <div 
                          onClick={() => scrollToMessage(msg.replyTo.id)}
                          className="mb-3 p-2.5 rounded-lg bg-slate-900/60 border-l-4 border-indigo-500 text-[11px] text-slate-300 opacity-90 select-none cursor-pointer hover:bg-slate-900/80 transition-all flex flex-col gap-0.5"
                        >
                          <span className="font-bold text-indigo-400 flex items-center gap-1 text-[10px] uppercase tracking-wider">
                            <CornerUpLeft className="w-3 h-3" /> Replied to:
                          </span>
                          <span className="truncate italic">"{msg.replyTo.text}"</span>
                        </div>
                      )}
                      {renderMessageText(msg.text)}

                      {/* Follow-up suggestions */}
                      {isAi && msg.id !== 'msg-init' && (
                        <div className="mt-3.5 flex flex-wrap gap-2 border-t border-slate-700/20 pt-3 select-none">
                          <button
                            onClick={() => handleSendMessage(`Give me an example of the concept you just explained.`)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/25 text-[10px] font-extrabold text-indigo-400 transition-all flex items-center gap-1"
                          >
                            💡 Example
                          </button>
                          <button
                            onClick={() => handleSendMessage(`Explain this simply with a real-life analogy.`)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/25 text-[10px] font-extrabold text-indigo-400 transition-all flex items-center gap-1"
                          >
                            👨‍🏫 Explain Simply
                          </button>
                          <button
                            onClick={() => handleSendMessage(`Ask me 3 interview questions on this topic to test my knowledge.`)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/25 text-[10px] font-extrabold text-indigo-400 transition-all flex items-center gap-1"
                          >
                            🎤 Interview Test
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <p className={`text-[10px] text-gray-500 dark:text-gray-400 ${isAi ? 'text-left pl-1' : 'text-right pr-1'}`}>
                        {msg.time}
                      </p>
                      
                      <div className="flex items-center gap-1.5 ml-2">
                        {isAi && (
                          <button
                            onClick={() => speakMessage(msg.id, msg.text, msg.voiceText)}
                            className={`p-1 rounded-md transition-colors ${
                              speakingMessageId === msg.id
                                ? 'text-rose-500 bg-rose-500/10'
                                : 'text-slate-500 hover:text-indigo-400 hover:bg-slate-900/10 dark:hover:bg-white/5'
                            }`}
                            title={speakingMessageId === msg.id ? getTranslation('stop') : getTranslation('listen')}
                          >
                            {speakingMessageId === msg.id ? (
                              <VolumeX className="w-3.5 h-3.5" />
                            ) : (
                              <Volume2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}

                        <button
                          onClick={() => setReplyingTo(msg)}
                          className="p-1 rounded-md text-slate-500 hover:text-indigo-400 hover:bg-slate-900/10 dark:hover:bg-white/5 transition-colors"
                          title="Reply to message"
                        >
                          <CornerUpLeft className="w-3.5 h-3.5" />
                        </button>

                        {isAi && (
                          <>
                            <button
                              onClick={() => pinnedMessages.find(p => p.id === msg.id) ? handleUnpinMessage(msg.id) : handlePinMessage(msg)}
                              className={`p-1 rounded-md transition-colors ${
                                pinnedMessages.find(p => p.id === msg.id)
                                  ? 'text-yellow-500 bg-yellow-500/10'
                                  : 'text-slate-500 hover:text-yellow-400 hover:bg-slate-900/10 dark:hover:bg-white/5'
                              }`}
                              title={pinnedMessages.find(p => p.id === msg.id) ? "Unpin explanation" : "Pin explanation"}
                            >
                              <Pin className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleRateResponse(msg, 'helpful')}
                              disabled={!!msg.rated}
                              className={`p-1 rounded-md transition-colors ${
                                msg.rated === 'helpful'
                                  ? 'text-emerald-500 bg-emerald-500/10'
                                  : 'text-slate-500 hover:text-emerald-400 hover:bg-slate-900/10 dark:hover:bg-white/5'
                              }`}
                              title="Helpful (Logs telemetry)"
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleRateResponse(msg, 'unhelpful')}
                              disabled={!!msg.rated}
                              className={`p-1 rounded-md transition-colors ${
                                msg.rated === 'unhelpful'
                                  ? 'text-rose-500 bg-rose-500/10'
                                  : 'text-slate-500 hover:text-rose-500 hover:bg-slate-900/10 dark:hover:bg-white/5'
                              }`}
                              title="Unhelpful (Logs telemetry)"
                            >
                              <ThumbsDown className="w-3.5 h-3.5" />
                            </button>

                            {msg.sourceModel && (
                              <span className="text-[9px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/15 select-none ml-2">
                                {msg.sourceModel} {msg.latency && `(${msg.latency}s)`}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* AI Typing Indicator */}
            {isTyping && (
              <div className="flex gap-3 mr-auto max-w-[80%]">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white flex-shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="bg-white/95 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/60 px-4 py-3.5 rounded-2xl flex items-center gap-1.5 shadow-sm">
                  <span className="text-[10px] text-slate-400 mr-1 font-medium">{getTranslation('typingIndicator')}</span>
                  <span className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar — pinned to bottom */}
          <div className="flex-shrink-0 p-5 border-t border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#0a0f18]/80 backdrop-blur-xl relative z-20 flex flex-col gap-3">
            
            {/* Quoted Quote Reply Banner */}
            {replyingTo && (
              <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700/50 flex items-center justify-between animate-fade-in backdrop-blur-md shadow-sm">
                <div className="flex items-center gap-2 text-xs text-slate-300 min-w-0">
                  <CornerUpLeft className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  <div className="truncate">
                    <span className="font-bold text-indigo-400 mr-1.5">Replying to {replyingTo.sender === 'ai' ? 'AI' : 'User'}:</span>
                    <span className="italic text-slate-400 text-[11px]">"{replyingTo.text}"</span>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  className="p-1 rounded bg-slate-900/50 hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 transition-colors ml-2"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Active Topic Context Chip */}
            {activeTopic && (
              <div className="flex items-center select-none animate-fade-in">
                <span className="px-3 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/25 text-[10px] font-extrabold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-sm shadow-sm">
                  📘 Discussing: {activeTopic}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTopic('');
                      localStorage.removeItem('chat_active_topic');
                    }}
                    className="hover:text-rose-400 transition-colors font-black ml-1 text-slate-500"
                    title="Clear Topic Context"
                  >
                    ✕
                  </button>
                </span>
              </div>
            )}

            {/* Smart Typing Suggestions */}
            {typingSuggestions.length > 0 && (
              <div className="flex flex-wrap gap-2 select-none animate-fade-in">
                {typingSuggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(suggestion)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800/40 border border-slate-700/30 hover:bg-indigo-600/15 hover:border-indigo-500/40 text-[11px] font-bold text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                  >
                    ➕ {suggestion}
                  </button>
                ))}
              </div>
            )}

            <form
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputText); }}
              className="flex gap-3 relative"
            >
              <button
                type="button"
                onClick={toggleListening}
                className={`p-3 rounded-xl border transition-all ${
                  isListening
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-500 dark:text-rose-400 animate-pulse'
                    : 'bg-slate-50/90 dark:bg-white/5 border-slate-300 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10'
                }`}
                title={isListening ? getTranslation('stop') : getTranslation('startListening')}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  if (voiceSettings.bargeIn && speakingMessageIdRef.current) {
                    stopSpeaking();
                  }
                }}
                placeholder={getTranslation('inputPlaceholder')}
                disabled={isTyping}
                className="flex-1 px-5 py-3 bg-white dark:bg-[#0d131f] border border-slate-200 dark:border-white/10 focus:border-cognitive-primary/50 focus:ring-1 focus:ring-cognitive-primary/30 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm transition-all focus:outline-none disabled:opacity-60 shadow-inner"
              />
              <Button
                type="submit"
                disabled={!inputText.trim() || isTyping}
                icon={Send}
                className="rounded-xl px-6 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 border-none shadow-lg shadow-cyan-500/25 text-white"
              >
                {getTranslation('send')}
              </Button>
            </form>
          </div>
        </div>

      </div>

      {/* ── API Key Configuration Modal ── */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-white/10 shadow-2xl p-6 relative overflow-hidden bg-[#0d131f]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-2">
              <Key className="w-5 h-5 text-indigo-400" />
              Configure Gemini API Key
            </h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              If the server's free-tier Gemini API key has exceeded its daily/minute quota, you can configure your own personal API key. This key will be saved locally on your device and sent to the server for model authorization.
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Your API Key
                </label>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-white/10 focus:border-indigo-500 rounded-xl text-gray-200 placeholder-gray-600 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all font-mono"
                />
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>You can get a free API Key from <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Google AI Studio</a>.</span>
              </div>
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={() => {
                  setShowKeyModal(false);
                  setCustomKey(localStorage.getItem('custom_gemini_api_key') || '');
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold hover:bg-white/5 text-slate-400 transition-colors"
              >
                Cancel
              </button>
              {localStorage.getItem('custom_gemini_api_key') && (
                <button
                  onClick={handleClearKey}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 border border-rose-500/20 transition-colors"
                >
                  Clear Key
                </button>
              )}
              <button
                onClick={handleSaveKey}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/25 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Voice Settings & Memory Configuration Modal ── */}
      {showVoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-white/10 shadow-2xl p-6 relative overflow-hidden bg-[#0d131f]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-2">
              <Volume2 className="w-5 h-5 text-cyan-400" />
              Voice Settings & Preferences
            </h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Customize voice properties and preferred accents. Preferences are saved automatically to Voice Memory.
            </p>

            <div className="space-y-4">
              {/* Voice Gender Selection */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Voice Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setVoiceSettings({ ...voiceSettings, voiceType: 'female' })}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      voiceSettings.voiceType === 'female'
                        ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400 font-bold'
                        : 'bg-slate-900 border-white/5 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    👩 Female Voice
                  </button>
                  <button
                    type="button"
                    onClick={() => setVoiceSettings({ ...voiceSettings, voiceType: 'male' })}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      voiceSettings.voiceType === 'male'
                        ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400 font-bold'
                        : 'bg-slate-900 border-white/5 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    👨 Male Voice
                  </button>
                </div>
              </div>

              {/* Accent Selection */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Voice Accent
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'indian', label: '🇮🇳 Indian' },
                    { id: 'american', label: '🇺🇸 US' },
                    { id: 'british', label: '🇬🇧 UK' }
                  ].map(acc => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => setVoiceSettings({ ...voiceSettings, accent: acc.id })}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        voiceSettings.accent === acc.id
                          ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-400 font-bold'
                          : 'bg-slate-900 border-white/5 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {acc.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sliders for Speed and Pitch */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    <span>Speed</span>
                    <span className="text-cyan-400">{voiceSettings.speed}x</span>
                  </label>
                  <input
                    type="range"
                    min="0.8"
                    max="1.5"
                    step="0.1"
                    value={voiceSettings.speed}
                    onChange={(e) => setVoiceSettings({ ...voiceSettings, speed: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                </div>
                <div>
                  <label className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    <span>Pitch</span>
                    <span className="text-cyan-400">{voiceSettings.pitch}x</span>
                  </label>
                  <input
                    type="range"
                    min="0.8"
                    max="1.2"
                    step="0.05"
                    value={voiceSettings.pitch}
                    onChange={(e) => setVoiceSettings({ ...voiceSettings, pitch: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                </div>
              </div>

              {/* Emotion Level and Barge In */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Emotion Level
                  </label>
                  <select
                    value={voiceSettings.emotion}
                    onChange={(e) => setVoiceSettings({ ...voiceSettings, emotion: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/5 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 text-xs text-slate-300 select-none cursor-pointer py-1.5 font-semibold">
                    <input
                      type="checkbox"
                      checked={voiceSettings.bargeIn}
                      onChange={(e) => setVoiceSettings({ ...voiceSettings, bargeIn: e.target.checked })}
                      className="rounded border-white/10 text-indigo-600 focus:ring-indigo-500/30 bg-slate-900 mr-1.5"
                    />
                    <span>Enable Barge-in / Interrupt</span>
                  </label>
                </div>
              </div>

            </div>

            <div className="flex gap-3 mt-6 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowVoiceModal(false);
                  try {
                    const stored = localStorage.getItem('voice_settings');
                    if (stored) setVoiceSettings(JSON.parse(stored));
                  } catch (e) {}
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold hover:bg-white/5 text-slate-400 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveVoiceSettings(voiceSettings)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/25 transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Train AI / Custom Learning Rules Modal ── */}
      {showTeachModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-white/10 shadow-2xl p-6 relative overflow-hidden bg-[#0d131f]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              Train AI / Teach Custom Response
            </h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Teach your Career Assistant custom behaviors or exact replies. The rules are appended to a JSON training dataset file on the server and injected dynamically using Cosine similarity matches.
            </p>
            <form onSubmit={handleTrainAI} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  User Question / Triggers
                </label>
                <input
                  type="text"
                  placeholder="e.g., What is my target company?"
                  value={teachQuestion}
                  onChange={(e) => setTeachQuestion(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-900 border border-white/5 focus:border-cyan-500 rounded-xl text-slate-200 placeholder-slate-600 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  AI Response / Guidelines
                </label>
                <textarea
                  rows="3"
                  placeholder="e.g., Your target company is Google! Let's prepare to clear their system design rounds."
                  value={teachAnswer}
                  onChange={(e) => setTeachAnswer(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-900 border border-white/5 focus:border-cyan-500 rounded-xl text-slate-200 placeholder-slate-600 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all resize-none"
                />
              </div>
              <div className="flex gap-3 mt-6 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowTeachModal(false);
                    setTeachQuestion('');
                    setTeachAnswer('');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold hover:bg-white/5 text-slate-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isTraining || !teachQuestion.trim() || !teachAnswer.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/25 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isTraining ? 'Training Adapter...' : 'Train AI Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChatBot;
