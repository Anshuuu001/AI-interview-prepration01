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
          `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 font-sans group ${
            isActive
              ? 'bg-white/10 text-[#FAF5EF] font-semibold border-l-3 border-[#E97878] pl-3 shadow-xs'
              : 'text-[#DFE8F7]/75 hover:text-[#FAF5EF] hover:bg-white/5'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <link.icon className={`w-4 h-4 transition-colors ${
              isActive ? 'text-[#EBA66F]' : 'text-[#DFE8F7]/60 group-hover:text-[#FAF5EF]'
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
          className="fixed inset-0 z-40 bg-[#10194A]/70 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar - Deep Navy Brand Element */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 flex flex-col bg-[#10194A] text-[#FAF5EF] border-r border-[#10194A]/40 shadow-xl transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo Header */}
        <div className="h-16 flex items-center justify-between px-5 flex-shrink-0 border-b border-white/10">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <img 
              src="/veyra-logo.png" 
              alt="VEYRA AI Logo" 
              className="w-9 h-9 object-contain rounded-lg bg-white/5 p-0.5 border border-white/10 shadow-xs" 
            />
            <div>
              <span className="font-editorial text-lg font-bold tracking-tight text-[#FAF5EF]">
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
              className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 lg:hidden transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Nav Links */}
        <div className="flex-1 overflow-y-auto px-3.5 py-5 space-y-6">
          {/* Candidate Section */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-sans font-bold text-[#DFE8F7]/45 uppercase tracking-widest mb-2">
              {getTranslation('candidatePortal')}
            </p>
            {renderLinks(candidateLinks)}
          </div>

          {user?.role === 'admin' && (
            <div className="space-y-1 pt-4 border-t border-white/10">
              <p className="px-3 text-[10px] font-sans font-bold text-[#DFE8F7]/45 uppercase tracking-widest mb-2">
                {getTranslation('administration')}
              </p>
              {renderLinks(adminLinks)}
            </div>
          )}
        </div>

        {/* User Footer */}
        <div className="p-4 flex-shrink-0 border-t border-white/10 bg-[#0B1133]/50">
          <div className="flex items-center gap-3 p-2.5 rounded-xl mb-3 bg-white/5 border border-white/10">
            <div className="w-8 h-8 rounded-lg bg-[#DFE8F7] text-[#10194A] flex items-center justify-center font-bold text-xs flex-shrink-0">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0 font-sans">
              <p className="text-xs font-semibold text-[#FAF5EF] truncate">{user?.name || 'Guest'}</p>
              <p className="text-[10px] text-[#DFE8F7]/60 capitalize truncate">{user?.role || 'Student'}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors bg-white/5 hover:bg-[#C44848]/20 text-[#DFE8F7]/80 hover:text-[#F4A5A5] border border-white/10 group"
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
