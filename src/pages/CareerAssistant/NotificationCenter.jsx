import React, { useState } from 'react';
import { Bell, CheckCircle2, Briefcase, Calendar, BookOpen, Trophy, AlertTriangle, Settings, X } from 'lucide-react';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'placement', title: 'Google Hiring Drive', desc: 'Google is conducting campus placements. Apply before July 30.', time: '2 hours ago', read: false, icon: Briefcase, color: 'text-blue-400' },
    { id: 2, type: 'interview', title: 'Interview Reminder', desc: 'Your mock interview is scheduled for tomorrow at 10 AM.', time: '5 hours ago', read: false, icon: Calendar, color: 'text-orange-400' },
    { id: 3, type: 'learning', title: 'Daily Challenge Available', desc: 'New coding challenge is ready. Maintain your streak!', time: '8 hours ago', read: true, icon: BookOpen, color: 'text-emerald-400' },
    { id: 4, type: 'achievement', title: 'Achievement Unlocked!', desc: 'You earned the "7-Day Streak" badge. Keep going!', time: '1 day ago', read: true, icon: Trophy, color: 'text-amber-400' },
    { id: 5, type: 'job', title: 'New Job Match', desc: 'A 92% match job at Microsoft was found for your profile.', time: '2 days ago', read: true, icon: Briefcase, color: 'text-indigo-400' },
    { id: 6, type: 'system', title: 'System Update', desc: 'New features added: AI Labs, Portfolio Generator, Voice Analysis.', time: '3 days ago', read: true, icon: Settings, color: 'text-slate-400' },
  ]);
  const [filter, setFilter] = useState('all');

  const markRead = (id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const dismiss = (id) => setNotifications(prev => prev.filter(n => n.id !== id));

  const filters = ['all', 'placement', 'interview', 'learning', 'achievement', 'job', 'system'];
  const filtered = notifications.filter(n => filter === 'all' || n.type === filter);
  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-amber-400" /> Notification Center
            {unread > 0 && <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">{unread}</span>}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Stay updated with placement news, reminders, achievements, and alerts</p>
        </div>
        <button onClick={markAllRead} className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">Mark all as read</button>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold capitalize transition-all border ${filter === f ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300' : 'bg-slate-900/40 border-white/5 text-slate-500 hover:text-slate-300'}`}>{f}</button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map(n => (
          <div key={n.id} onClick={() => markRead(n.id)}
            className={`liquid-glass-card rounded-xl p-4 flex items-start gap-3 cursor-pointer transition-colors ${!n.read ? 'border-indigo-500/20 bg-indigo-500/5' : 'hover:border-white/10'}`}>
            <div className={`p-2 rounded-lg ${!n.read ? 'bg-indigo-500/10' : 'bg-slate-800/50'} flex-shrink-0`}>
              <n.icon className={`w-4 h-4 ${n.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className={`text-xs font-bold ${!n.read ? 'text-slate-100' : 'text-slate-300'}`}>{n.title}</h4>
                {!n.read && <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">{n.desc}</p>
              <p className="text-[10px] text-slate-600 mt-1">{n.time}</p>
            </div>
            <button onClick={e => { e.stopPropagation(); dismiss(n.id); }} className="p-1 rounded text-slate-700 hover:text-rose-400 transition-colors">
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center py-8 text-sm text-slate-600">No notifications</p>}
      </div>
    </div>
  );
};

export default NotificationCenter;
