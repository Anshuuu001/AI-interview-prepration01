import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTranslation } from '../utils/translations';
import {
  LayoutDashboard, Video, ClipboardList, Camera,
  MessageSquare, ShieldCheck, Settings, LogOut, X, Zap, TrendingUp, Code2, FileText
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    if (onClose) onClose();
  };

  const candidateLinks = [
    { to: '/dashboard', label: getTranslation('dashboard'), icon: LayoutDashboard },
    { to: '/resume', label: 'Resume Studio', icon: FileText },
    { to: '/chat', label: 'Career Assistant', icon: MessageSquare },
    { to: '/analytics', label: getTranslation('analytics'), icon: TrendingUp },
    { to: '/interview', label: getTranslation('interviews'), icon: Video },
    { to: '/video-interview', label: getTranslation('videoInterview'), icon: Camera },
    { to: '/aptitude', label: getTranslation('aptitudeTest'), icon: ClipboardList },
    { to: '/practice', label: getTranslation('codingPractice'), icon: Code2 },
    { to: '/profile', label: getTranslation('settings'), icon: Settings },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Super Admin', icon: ShieldCheck },
    { to: '/admin/questions', label: 'Question Bank', icon: Settings },
  ];

  const renderLinks = (links) =>
    links.map((link) => (
      <NavLink
        key={link.to}
        to={link.to}
        onClick={() => onClose && onClose()}
        className={({ isActive }) =>
          `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 font-sans group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] ${
            isActive
              ? 'bg-white/[0.08] text-[#F8FAFC] font-semibold border-l-2 border-[#E97878] pl-3 shadow-xs'
              : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/[0.04]'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <link.icon className={`w-4 h-4 transition-colors ${
              isActive ? 'text-[#EBA66F]' : 'text-[#64748B] group-hover:text-[#F8FAFC]'
            }`} />
            <span className="truncate">{link.label}</span>
            {isActive && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#E97878]" />
            )}
          </>
        )}
      </NavLink>
    ));

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar - Deep Obsidian Luxury Element */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 flex flex-col bg-[#0E121B] text-[#F8FAFC] border-r border-white/[0.08] shadow-xl transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo Header */}
        <div className="h-16 flex items-center justify-between px-5 flex-shrink-0 border-b border-white/[0.08]">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <img 
              src="/veyra-logo.png" 
              alt="VEYRA AI Logo" 
              className="w-9 h-9 object-contain rounded-lg bg-white/5 p-0.5 border border-white/10 shadow-xs" 
            />
            <div>
              <span className="font-editorial text-lg font-bold tracking-tight text-[#F8FAFC]">
                VEYRA AI
              </span>
              <p className="text-[9px] text-[#EBA66F] font-sans tracking-wider uppercase font-semibold -mt-1">
                Your Next Interview, Smarter
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 lg:hidden transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Nav Links */}
        <div className="flex-1 overflow-y-auto px-3.5 py-5 space-y-6">
          {/* Candidate Section */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-sans font-bold text-slate-500 uppercase tracking-widest mb-2">
              {getTranslation('candidatePortal')}
            </p>
            {renderLinks(candidateLinks)}
          </div>

          {user?.role === 'admin' && (
            <div className="space-y-1 pt-4 border-t border-white/[0.08]">
              <p className="px-3 text-[10px] font-sans font-bold text-slate-500 uppercase tracking-widest mb-2">
                {getTranslation('administration')}
              </p>
              {renderLinks(adminLinks)}
            </div>
          )}
        </div>

        {/* User Footer */}
        <div className="p-4 flex-shrink-0 border-t border-white/[0.08] bg-[#0A0D14]/70">
          <div className="flex items-center gap-3 p-2.5 rounded-xl mb-3 bg-white/[0.04] border border-white/[0.08]">
            <div className="w-8 h-8 rounded-lg bg-[#DFE8F7] text-[#10194A] flex items-center justify-center font-bold text-xs flex-shrink-0">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0 font-sans">
              <p className="text-xs font-semibold text-[#F8FAFC] truncate">{user?.name || 'Guest'}</p>
              <p className="text-[10px] text-slate-400 capitalize truncate">{user?.role || 'Student'}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors bg-white/[0.04] hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-white/[0.08] group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
          >
            <LogOut className="w-3.5 h-3.5" />
            {getTranslation('signOut')}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
