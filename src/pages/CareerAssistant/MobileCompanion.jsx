import React from 'react';
import { Smartphone, Wifi, WifiOff, Mic, Bell, Camera, QrCode, Download, Sparkles } from 'lucide-react';

const MobileCompanion = () => {
  const features = [
    { icon: WifiOff, label: 'Offline Notes', desc: 'Access your notes without internet', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { icon: Mic, label: 'Voice Practice', desc: 'Practice answers with voice recognition', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { icon: Bell, label: 'Push Notifications', desc: 'Get reminders for interviews and practice', color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { icon: Camera, label: 'Scan Resume', desc: 'Scan physical resume with camera', color: 'text-rose-400', bg: 'bg-rose-500/10' },
    { icon: Sparkles, label: 'Practice Anywhere', desc: 'Full AI assistant on mobile', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { icon: QrCode, label: 'QR Login', desc: 'Scan QR code to login instantly', color: 'text-violet-400', bg: 'bg-violet-500/10' },
  ];

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-100 flex items-center justify-center gap-2.5">
          <Smartphone className="w-6 h-6 text-cyan-400" /> Mobile Companion
        </h2>
        <p className="text-xs text-slate-400">Take your preparation everywhere — offline notes, voice practice, push notifications</p>
      </div>

      {/* QR Code Section */}
      <div className="liquid-glass-card rounded-2xl p-8 text-center space-y-4 max-w-md mx-auto">
        <div className="w-48 h-48 mx-auto bg-white rounded-2xl p-4 flex items-center justify-center">
          <div className="w-full h-full bg-gradient-to-br from-slate-900 to-indigo-900 rounded-xl flex items-center justify-center">
            <QrCode className="w-20 h-20 text-white/80" />
          </div>
        </div>
        <p className="text-sm text-slate-300 font-bold">Scan to Login on Mobile</p>
        <p className="text-[11px] text-slate-500">Open the ElevateAI mobile app and scan this QR code</p>
        <div className="flex justify-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors">
            <Download className="w-4 h-4" /> App Store
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors">
            <Download className="w-4 h-4" /> Play Store
          </button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {features.map((f, i) => (
          <div key={i} className="liquid-glass-card rounded-xl p-4 text-center space-y-2 hover:border-cyan-500/20 transition-colors">
            <div className={`w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center mx-auto`}><f.icon className={`w-5 h-5 ${f.color}`} /></div>
            <p className="text-xs font-bold text-slate-200">{f.label}</p>
            <p className="text-[10px] text-slate-500">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MobileCompanion;
