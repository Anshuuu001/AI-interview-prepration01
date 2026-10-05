import React, { useState } from 'react';
import { GraduationCap, Star, Video, MessageSquare, Monitor, Clock, Calendar, Search, Filter } from 'lucide-react';

const MentorMarketplace = () => {
  const [searchQ, setSearchQ] = useState('');
  const mentors = [
    { id: 1, name: 'Arjun Sharma', title: 'Senior SDE at Google', rating: 4.9, reviews: 128, price: '₹500/session', skills: ['System Design', 'DSA', 'React'], available: true, avatar: 'AS' },
    { id: 2, name: 'Priya Patel', title: 'Tech Lead at Microsoft', rating: 4.8, reviews: 95, price: '₹600/session', skills: ['Backend', 'Microservices', 'Java'], available: true, avatar: 'PP' },
    { id: 3, name: 'Rahul Verma', title: 'ML Engineer at Amazon', rating: 4.7, reviews: 72, price: '₹450/session', skills: ['ML', 'Python', 'Data Science'], available: false, avatar: 'RV' },
    { id: 4, name: 'Sneha Gupta', title: 'HR Manager at Flipkart', rating: 4.9, reviews: 200, price: '₹400/session', skills: ['HR Prep', 'Communication', 'Resume'], available: true, avatar: 'SG' },
  ];

  return (
    <div className="max-w-5xl mx-auto animate-fade-in-up space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
          <GraduationCap className="w-6 h-6 text-violet-400" /> Mentor Marketplace
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">Book sessions with industry mentors — chat, video call, whiteboard, and code reviews</p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search mentors by name or skill..."
          className="w-full pl-11 pr-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mentors.filter(m => !searchQ || m.name.toLowerCase().includes(searchQ.toLowerCase()) || m.skills.some(s => s.toLowerCase().includes(searchQ.toLowerCase()))).map(m => (
          <div key={m.id} className="liquid-glass-card rounded-2xl p-5 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">{m.avatar}</div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-slate-200">{m.name}</h3>
                <p className="text-[11px] text-slate-500">{m.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-0.5"><Star className="w-3 h-3 text-amber-400 fill-amber-400" /><span className="text-[11px] font-bold text-amber-400">{m.rating}</span></div>
                  <span className="text-[10px] text-slate-600">({m.reviews} reviews)</span>
                  <span className="text-[10px] font-bold text-emerald-400">{m.price}</span>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold ${m.available ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-600'}`}>
                {m.available ? 'Available' : 'Busy'}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {m.skills.map((s, i) => <span key={i} className="px-2 py-0.5 rounded-lg bg-slate-800 text-[10px] text-slate-400">{s}</span>)}
            </div>
            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-[11px] font-bold text-violet-400 hover:bg-violet-500/20 transition-colors">
                <Calendar className="w-3 h-3" /> Book Session
              </button>
              <button className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 border border-white/5 text-[11px] font-bold text-slate-400 hover:bg-slate-700 transition-colors">
                <MessageSquare className="w-3 h-3" /> Chat
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MentorMarketplace;
