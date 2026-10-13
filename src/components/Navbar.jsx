import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Menu, User, LogOut, ChevronDown, Bell, Shield, Globe, Award, BookOpen, BellRing, Sun, Moon } from 'lucide-react';
import { getTranslation } from '../utils/translations';
import { useNotifications } from '../hooks/useNotifications';
import { formatDate } from '../utils/formatters';
import { useDesign } from '../context/DesignContext';

const Navbar = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeLang, setActiveLang] = useState(() => localStorage.getItem('language') || 'english');
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { notifications, unreadCount, readIds, markAsRead, markAllAsRead } = useNotifications();
  const { theme, toggleTheme } = useDesign();

  const selectLanguage = (lang) => {
    localStorage.setItem('language', lang);
    setActiveLang(lang);
    setShowLangDropdown(false);
    window.location.reload();
  };

  return (
    <header
      className="sticky top-0 z-30 h-16 flex items-center justify-between px-6 flex-shrink-0 bg-[#FAF5EF]/95 dark:bg-[#10194A]/95 backdrop-blur-md border-b border-[#E7E2DC] dark:border-white/10"
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-xl text-[#666675] hover:text-[#10194A] hover:bg-[#E7E2DC]/50 dark:hover:bg-white/10 lg:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile brand mark */}
        <div className="flex items-center gap-2 lg:hidden cursor-pointer" onClick={() => navigate('/dashboard')}>
          <img src="/veyra-logo.png" alt="VEYRA AI" className="w-7 h-7 object-contain rounded-md" />
          <span className="font-editorial text-base font-bold text-[#10194A] dark:text-[#FAF5EF]">VEYRA AI</span>
        </div>

        {/* Status pill */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-[#DFE8F7] border border-[#C9D9F2] text-[#10194A]">
          <span className="w-2 h-2 rounded-full bg-[#27845B] animate-pulse" />
          <span>{getTranslation('aiEngineOnline')}</span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2.5">
        {/* Language selector */}
        <div className="relative">
          <button
            onClick={() => setShowLangDropdown(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all bg-white dark:bg-[#131E54] border border-[#E7E2DC] dark:border-white/10 text-[#22243A] dark:text-[#FAF5EF] hover:border-[#D6CFCE]"
          >
            <Globe className="w-3.5 h-3.5 text-[#666675]" />
            <span className="capitalize">{activeLang === 'english' ? 'English' : activeLang === 'hindi' ? 'हिंदी' : 'मराठी'}</span>
            <ChevronDown className="w-3 h-3 text-[#666675]" />
          </button>

          {showLangDropdown && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowLangDropdown(false)} />
              <div
                className="absolute right-0 mt-2 w-36 z-40 rounded-xl p-1.5 bg-white dark:bg-[#131E54] border border-[#E7E2DC] dark:border-white/10 shadow-lg animate-fade-in-up"
              >
                {['english', 'hindi', 'marathi'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => selectLanguage(lang)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs capitalize transition-colors font-sans ${
                      activeLang === lang
                        ? 'bg-[#10194A] text-[#FAF5EF] font-semibold'
                        : 'text-[#22243A] dark:text-[#FAF5EF] hover:bg-[#FAF5EF] dark:hover:bg-white/5'
                    }`}
                  >
                    <span>{lang === 'hindi' ? 'हिंदी' : lang === 'marathi' ? 'मराठी' : 'English'}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-[#666675] hover:text-[#10194A] hover:bg-white dark:hover:bg-white/5 transition-colors border border-transparent hover:border-[#E7E2DC] dark:hover:border-white/10"
          aria-label="Toggle Dark Mode"
        >
          {theme === 'dark' ? <Sun className="w-4.5 h-4.5 text-[#EBA66F]" /> : <Moon className="w-4.5 h-4.5 text-[#666675]" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(v => !v)}
            className="relative p-2 rounded-xl text-[#666675] hover:text-[#10194A] hover:bg-white dark:hover:bg-white/5 transition-colors border border-transparent hover:border-[#E7E2DC] dark:hover:border-white/10"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E97878] shadow-xs animate-pulse border border-white" />
            )}
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowNotifications(false)} />
              <div
                className="absolute right-0 mt-2 w-80 z-40 rounded-2xl p-2 bg-white dark:bg-[#131E54] border border-[#E7E2DC] dark:border-white/10 shadow-xl animate-fade-in-up"
              >
                <div className="px-3 py-2 border-b border-[#E7E2DC] dark:border-white/10 flex justify-between items-center">
                  <h4 className="text-xs font-bold text-[#10194A] dark:text-[#FAF5EF]">{getTranslation('notifications')}</h4>
                  {unreadCount > 0 && (
                    <span className="text-[10px] px-2 py-0.5 bg-[#E97878]/15 text-[#C44848] rounded-full font-bold">
                      {unreadCount} {getTranslation('newNotifications')}
                    </span>
                  )}
                </div>
                
                <div className="py-1 max-h-80 overflow-y-auto custom-scrollbar">
                  {notifications.map((notif) => {
                    const isRead = readIds.includes(notif.id);
                    return (
                      <div
                        key={notif.id}
                        onClick={() => {
                          markAsRead(notif.id);
                          setShowNotifications(false);
                          navigate(notif.link);
                        }}
                        className={`px-3 py-2.5 rounded-xl transition-colors cursor-pointer border-b border-cognitive-outline-variant/5 flex gap-2.5 items-start hover:bg-slate-900/5 ${
                          !isRead ? 'bg-indigo-500/[0.03]' : ''
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg flex-shrink-0 mt-0.5 ${
                          notif.type === 'interview' 
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : notif.type === 'aptitude'
                              ? 'bg-indigo-500/10 text-indigo-600'
                              : 'bg-amber-500/10 text-amber-600'
                        }`}>
                          {notif.type === 'interview' && <Award className="w-3.5 h-3.5" />}
                          {notif.type === 'aptitude' && <BookOpen className="w-3.5 h-3.5" />}
                          {notif.type !== 'interview' && notif.type !== 'aptitude' && <BellRing className="w-3.5 h-3.5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p className={`text-xs truncate ${!isRead ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                              {notif.title}
                            </p>
                            {!isRead && (
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">
                            {notif.message}
                          </p>
                          <p className="text-[8px] text-slate-400 mt-1 font-medium">
                            {formatDate(notif.date)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="px-3 py-2 border-t border-cognitive-outline-variant/10 text-center">
                  <button 
                    onClick={() => {
                      markAllAsRead();
                      setShowNotifications(false);
                    }} 
                    className="text-[10px] font-bold text-indigo-600 hover:underline"
                  >
                    {getTranslation('markAllAsRead')}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Profile */}
        <div className="relative ml-1">
          <button
            onClick={() => setShowDropdown(v => !v)}
            className={`flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl border transition-colors ${
              showDropdown
                ? 'bg-white dark:bg-[#131E54] border-[#E7E2DC] shadow-xs'
                : 'border-transparent hover:bg-white/80 dark:hover:bg-white/5'
            }`}
          >
            <div className="w-7 h-7 rounded-lg bg-[#DFE8F7] text-[#10194A] flex items-center justify-center font-bold text-xs">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="hidden sm:block text-left font-sans">
              <p className="text-xs font-semibold text-[#10194A] dark:text-[#FAF5EF] leading-tight">{user?.name || 'Candidate'}</p>
              <p className="text-[10px] text-[#666675] dark:text-[#C4C4D4] capitalize mt-0.5">{user?.role || 'Student'}</p>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-[#666675] hidden sm:block transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showDropdown && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowDropdown(false)} />
              <div
                className="absolute right-0 mt-2 w-56 z-40 rounded-2xl p-2 bg-white dark:bg-[#131E54] border border-[#E7E2DC] dark:border-white/10 shadow-xl animate-fade-in-up"
              >
                {/* User info */}
                <div className="px-3 py-2.5 rounded-xl mb-1 border-b border-[#E7E2DC] dark:border-white/10 bg-[#FAF5EF] dark:bg-white/5">
                  <p className="text-[10px] text-[#666675] dark:text-[#C4C4D4] mb-0.5 font-sans">{getTranslation('signedInAs')}</p>
                  <p className="text-xs font-semibold text-[#10194A] dark:text-[#FAF5EF] truncate font-sans">{user?.email}</p>
                </div>

                <Link
                  to="/profile"
                  onClick={() => setShowDropdown(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#22243A] dark:text-[#FAF5EF] hover:bg-[#FAF5EF] dark:hover:bg-white/5 transition-colors font-sans"
                >
                  <User className="w-3.5 h-3.5 text-[#666675]" />
                  {getTranslation('editProfile')}
                </Link>

                {user?.role === 'admin' && (
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#22243A] dark:text-[#FAF5EF] hover:bg-[#FAF5EF] dark:hover:bg-white/5 transition-colors font-sans"
                  >
                    <Shield className="w-3.5 h-3.5 text-[#666675]" />
                    {getTranslation('adminPanel')}
                  </Link>
                )}

                <div className="my-1 border-t border-[#E7E2DC] dark:border-white/10" />

                <button
                  onClick={() => { setShowDropdown(false); logout(); navigate('/'); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#C44848] hover:bg-[#C44848]/10 transition-colors text-left font-sans font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  {getTranslation('signOut')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
