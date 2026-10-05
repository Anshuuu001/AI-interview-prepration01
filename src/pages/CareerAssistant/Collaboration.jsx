import React, { useState } from 'react';
import { Users, Video, Code2, Monitor, Mic, MessageSquare, Sparkles, Plus, UserPlus } from 'lucide-react';

const Collaboration = () => {
  const [rooms] = useState([
    { id: 1, name: 'DSA Study Group', members: 5, active: true, type: 'study' },
    { id: 2, name: 'Mock Interview Practice', members: 3, active: true, type: 'interview' },
    { id: 3, name: 'Frontend Project', members: 4, active: false, type: 'coding' },
  ]);

  const features = [
    { icon: Users, label: 'Live Study Room', desc: 'Join study sessions with peers', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { icon: Monitor, label: 'Shared Whiteboard', desc: 'Draw and explain concepts together', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { icon: Code2, label: 'Shared Coding', desc: 'Code together in real-time', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { icon: Video, label: 'Group Interview', desc: 'Practice interviews with peers', color: 'text-rose-400', bg: 'bg-rose-500/10' },
    { icon: Monitor, label: 'Screen Share', desc: 'Share your screen for demos', color: 'text-violet-400', bg: 'bg-violet-500/10' },
    { icon: Mic, label: 'Voice Rooms', desc: 'Voice chat while studying', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="max-w-5xl mx-auto animate-fade-in-up space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <Users className="w-6 h-6 text-indigo-400" /> Real-Time Collaboration
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Study rooms, shared coding, group interviews, and mentor collaboration</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold hover:bg-indigo-500/20 transition-colors">
          <Plus className="w-4 h-4" /> Create Room
        </button>
      </div>

      {/* Active Rooms */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-300">Active Rooms</h3>
        {rooms.map(r => (
          <div key={r.id} className="liquid-glass-card rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${r.type === 'study' ? 'bg-indigo-500/10' : r.type === 'interview' ? 'bg-rose-500/10' : 'bg-emerald-500/10'}`}>
                {r.type === 'study' ? <Users className="w-5 h-5 text-indigo-400" /> : r.type === 'interview' ? <Video className="w-5 h-5 text-rose-400" /> : <Code2 className="w-5 h-5 text-emerald-400" />}
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">{r.name}</h4>
                <p className="text-[10px] text-slate-500">{r.members} members {r.active && '• Active now'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {r.active && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
              <button className="px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-400 hover:bg-indigo-500/20 transition-colors">
                {r.active ? 'Join' : 'View'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {features.map((f, i) => (
          <div key={i} className="liquid-glass-card rounded-xl p-4 text-center space-y-2 hover:border-indigo-500/20 transition-colors cursor-pointer">
            <div className={`w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center mx-auto`}><f.icon className={`w-5 h-5 ${f.color}`} /></div>
            <p className="text-xs font-bold text-slate-200">{f.label}</p>
            <p className="text-[10px] text-slate-500">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Collaboration;
