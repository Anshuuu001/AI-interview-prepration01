import React, { useState } from 'react';
import { Shield, Smartphone, History, Key, Fingerprint, Mail, Lock, AlertTriangle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

const SecuritySettings = () => {
  const [twoFA, setTwoFA] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const loginHistory = [
    { device: 'Chrome on Windows', ip: '192.168.1.xx', time: 'Today, 6:30 PM', status: 'success' },
    { device: 'Chrome on Android', ip: '10.0.0.xx', time: 'Yesterday, 9:15 AM', status: 'success' },
    { device: 'Firefox on MacOS', ip: '172.16.0.xx', time: '3 days ago', status: 'failed' },
  ];
  const devices = [
    { name: 'Chrome on Windows 11', last: 'Active now', current: true },
    { name: 'Chrome on Samsung Galaxy', last: 'Yesterday', current: false },
  ];

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
          <Shield className="w-6 h-6 text-emerald-400" /> Security Settings
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">Manage authentication, devices, login history, and security preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 2FA & Password */}
        <div className="liquid-glass-card rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2"><Key className="w-4 h-4 text-amber-400" /> Authentication</h3>
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/30 border border-white/5">
            <div><p className="text-xs font-bold text-slate-300">Two-Factor Authentication</p><p className="text-[10px] text-slate-600">Add extra security layer</p></div>
            <button onClick={() => setTwoFA(!twoFA)} className={`w-10 h-5 rounded-full transition-colors ${twoFA ? 'bg-emerald-500' : 'bg-slate-700'}`}>
              <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${twoFA ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Change Password</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} placeholder="New password..."
                className="w-full px-4 py-2.5 bg-slate-950/50 border border-white/10 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none pr-10" />
              <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden"><div className="h-full w-3/4 rounded-full bg-amber-500" /></div>
            <p className="text-[10px] text-amber-400">Password Strength: Good</p>
          </div>
          {[
            { label: 'Email Verification', desc: 'Verified ✓', icon: Mail, status: true },
            { label: 'Face Login', desc: 'Coming Soon', icon: Fingerprint, status: false },
            { label: 'Fingerprint Login', desc: 'Coming Soon', icon: Fingerprint, status: false },
          ].map((f, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/30 border border-white/5">
              <div className="flex items-center gap-2"><f.icon className="w-4 h-4 text-slate-500" /><div><p className="text-xs font-bold text-slate-300">{f.label}</p><p className="text-[10px] text-slate-600">{f.desc}</p></div></div>
              {f.status ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4 text-slate-700" />}
            </div>
          ))}
        </div>

        <div className="space-y-6">
          {/* Devices */}
          <div className="liquid-glass-card rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2"><Smartphone className="w-4 h-4 text-indigo-400" /> Active Devices</h3>
            {devices.map((d, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/30 border border-white/5">
                <div><p className="text-xs font-bold text-slate-300">{d.name}</p><p className="text-[10px] text-slate-600">{d.last}</p></div>
                {d.current ? <span className="text-[10px] text-emerald-400 font-bold">Current</span> : <button className="text-[10px] text-rose-400 font-bold hover:underline">Revoke</button>}
              </div>
            ))}
          </div>

          {/* Login History */}
          <div className="liquid-glass-card rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2"><History className="w-4 h-4 text-cyan-400" /> Login History</h3>
            {loginHistory.map((l, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/30 border border-white/5">
                <div><p className="text-xs font-bold text-slate-300">{l.device}</p><p className="text-[10px] text-slate-600">{l.time} • {l.ip}</p></div>
                {l.status === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;
