import React, { useState } from 'react';
import { Trophy, Star, Coins, Medal, Flame, Target, Award, Crown, Zap, TrendingUp, Gift, Users } from 'lucide-react';

const Gamification = () => {
  const [stats] = useState({
    xp: 2450, level: 12, coins: 380, streak: 7,
    rank: 'Silver Coder', nextLevel: 3000,
    achievements: [
      { id: 1, name: 'First Interview', desc: 'Complete your first mock interview', icon: '🎯', unlocked: true },
      { id: 2, name: 'Code Warrior', desc: 'Solve 50 coding problems', icon: '⚔️', unlocked: true },
      { id: 3, name: 'Resume Master', desc: 'Get 90+ ATS score', icon: '📄', unlocked: false },
      { id: 4, name: '7-Day Streak', desc: 'Practice 7 days in a row', icon: '🔥', unlocked: true },
      { id: 5, name: 'Speed Demon', desc: 'Solve a hard problem in < 10 min', icon: '⚡', unlocked: false },
      { id: 6, name: 'Perfect Score', desc: 'Score 100% in any interview', icon: '💯', unlocked: false },
      { id: 7, name: 'Team Player', desc: 'Join a study room session', icon: '👥', unlocked: true },
      { id: 8, name: 'Night Owl', desc: 'Practice after midnight', icon: '🦉', unlocked: true },
    ],
    badges: ['Frontend Pro', 'DSA Beginner', 'Communication Silver', 'React Specialist'],
    leaderboard: [
      { rank: 1, name: 'Arjun K.', xp: 5200, level: 18 },
      { rank: 2, name: 'Priya S.', xp: 4800, level: 17 },
      { rank: 3, name: 'Rahul M.', xp: 4300, level: 16 },
      { rank: 4, name: 'You', xp: 2450, level: 12, isYou: true },
      { rank: 5, name: 'Neha P.', xp: 2100, level: 11 },
    ]
  });

  const progressPercent = Math.round((stats.xp / stats.nextLevel) * 100);

  return (
    <div className="max-w-6xl mx-auto animate-fade-in-up space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
          <Trophy className="w-6 h-6 text-amber-400" /> Gamification
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
            <Crown className="w-3 h-3" /> Level {stats.level}
          </span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">Earn XP, collect coins, unlock achievements, and climb the leaderboard</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'XP', value: stats.xp.toLocaleString(), icon: Zap, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
          { label: 'Level', value: stats.level, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
          { label: 'Coins', value: stats.coins, icon: Coins, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
          { label: 'Streak', value: `${stats.streak} Days`, icon: Flame, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
        ].map((s, i) => (
          <div key={i} className={`liquid-glass-card rounded-2xl p-5 border ${s.border}`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{s.label}</p>
              <div className={`p-2 rounded-lg ${s.bg}`}><s.icon className={`w-4 h-4 ${s.color}`} /></div>
            </div>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Level Progress */}
      <div className="liquid-glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-400">Level {stats.level} → Level {stats.level + 1}</span>
          <span className="text-xs text-slate-500">{stats.xp} / {stats.nextLevel} XP</span>
        </div>
        <div className="h-3 rounded-full bg-slate-800 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
        </div>
        <p className="mt-2 text-[10px] text-slate-500">Career Rank: <span className="text-amber-400 font-bold">{stats.rank}</span></p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Achievements */}
        <div className="liquid-glass-card rounded-2xl p-5">
          <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2"><Award className="w-4 h-4 text-amber-400" /> Achievements</h3>
          <div className="grid grid-cols-2 gap-2">
            {stats.achievements.map(a => (
              <div key={a.id} className={`p-3 rounded-xl border text-center transition-colors ${a.unlocked ? 'bg-amber-500/5 border-amber-500/15' : 'bg-slate-900/30 border-white/5 opacity-50'}`}>
                <span className="text-2xl">{a.icon}</span>
                <p className="text-[10px] font-bold text-slate-300 mt-1">{a.name}</p>
                <p className="text-[9px] text-slate-600">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="liquid-glass-card rounded-2xl p-5">
          <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-indigo-400" /> Leaderboard</h3>
          <div className="space-y-2">
            {stats.leaderboard.map(p => (
              <div key={p.rank} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${p.isYou ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-slate-900/20 border-white/5'}`}>
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${p.rank <= 3 ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-500'}`}>
                  {p.rank <= 3 ? ['🥇', '🥈', '🥉'][p.rank - 1] : `#${p.rank}`}
                </span>
                <div className="flex-1">
                  <p className={`text-xs font-bold ${p.isYou ? 'text-indigo-300' : 'text-slate-300'}`}>{p.name}</p>
                  <p className="text-[10px] text-slate-500">Level {p.level}</p>
                </div>
                <span className="text-xs font-bold text-indigo-400">{p.xp.toLocaleString()} XP</span>
              </div>
            ))}
          </div>

          {/* Badges */}
          <h3 className="text-sm font-bold text-slate-200 mt-6 mb-3 flex items-center gap-2"><Medal className="w-4 h-4 text-violet-400" /> Skill Badges</h3>
          <div className="flex flex-wrap gap-1.5">
            {stats.badges.map((b, i) => (
              <span key={i} className="px-2.5 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20 text-[10px] text-violet-400 font-bold">{b}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gamification;
