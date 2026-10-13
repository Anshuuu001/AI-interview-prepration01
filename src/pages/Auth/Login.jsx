import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, LogIn, Sparkles, UserCheck, Zap } from 'lucide-react';

const Login = () => {
  const { login, verifyDevice, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // New device verification state variables
  const [rememberDevice, setRememberDevice] = useState(false);
  const [verificationRequired, setVerificationRequired] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [verifying, setVerifying] = useState(false);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const user = await loginWithGoogle();
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Google Sign-In failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setLoading(true);

    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = 'dev-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('deviceId', deviceId);
    }

    try {
      const data = await login(email, password, deviceId, rememberDevice);
      if (data && data.verificationRequired) {
        setVerificationRequired(true);
        setTempToken(data.tempToken);
      } else if (data) {
        if (data.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (!verificationCode) {
      setError('Please enter verification code');
      return;
    }
    setError('');
    setVerifying(true);

    let deviceId = localStorage.getItem('deviceId');

    try {
      const user = await verifyDevice(tempToken, verificationCode, deviceId, rememberDevice);
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleQuickLogin = (role) => {
    if (role === 'student') {
      setEmail('student@veyra.ai');
      setPassword('password123');
    } else {
      setEmail('admin@veyra.ai');
      setPassword('password123');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#FAF5EF] text-[#22243A] transition-colors duration-300">
      <div className="w-full max-w-md animate-fade-in-up">
        {/* Brand Logo & Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div 
            onClick={() => navigate('/')} 
            className="cursor-pointer flex flex-col items-center mb-3 hover:scale-105 transition-all"
          >
            <img 
              src="/veyra-logo.png" 
              alt="VEYRA AI Logo" 
              className="h-16 w-auto object-contain rounded-2xl shadow-sm"
            />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-[#10194A]">
            Welcome Back
          </h1>
          <p className="text-sm font-sans text-[#666675] mt-1.5">
            Continue your preparation with VEYRA AI
          </p>
        </div>

        {/* Editorial Login Card */}
        <div className="bg-white border border-[#E7E2DC] rounded-2xl shadow-sm overflow-hidden p-8 sm:p-10">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E7E2DC]">
            <h2 className="font-sans text-base font-semibold text-[#10194A] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E97878]"></span>
              {verificationRequired ? 'Device Verification' : 'Candidate Sign In'}
            </h2>
            <span className="text-xs text-[#666675] font-medium">VEYRA AI</span>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-[#C44848]/10 border border-[#C44848]/20 text-[#C44848] text-xs font-medium">
              {error}
            </div>
          )}

          {verificationRequired ? (
            <form onSubmit={handleVerifySubmit} className="space-y-4">
              <div>
                <p className="text-[#666675] text-xs mb-4 leading-relaxed font-sans">
                  A verification code has been generated because we detected a login from a new device or IP address. Please enter the 6-digit code printed in the server logs.
                </p>
                <label className="block text-[11px] font-semibold text-[#666675] uppercase tracking-wider mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  maxLength="6"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="123456"
                  className="w-full text-center py-2.5 bg-[#FAF5EF]/60 border border-[#E7E2DC] focus:border-[#10194A] rounded-xl text-[#22243A] placeholder-[#666675]/50 text-sm tracking-[0.5em] font-mono transition-all focus:outline-none focus:ring-1 focus:ring-[#10194A]"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={verifying}
                className="w-full py-2.5 px-4 bg-[#E97878] hover:bg-[#d86565] text-white font-medium rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-75"
              >
                {verifying ? (
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                ) : (
                  'Verify & Continue'
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setVerificationRequired(false);
                  setVerificationCode('');
                  setTempToken('');
                  setError('');
                }}
                className="w-full text-center text-xs text-[#666675] hover:text-[#10194A] font-medium py-2 transition-colors mt-2"
              >
                Back to Sign In
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-[#666675] uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#666675]">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF5EF]/50 border border-[#E7E2DC] focus:border-[#10194A] rounded-xl text-[#22243A] placeholder-[#666675]/50 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[#10194A]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#666675] uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#666675]">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF5EF]/50 border border-[#E7E2DC] focus:border-[#10194A] rounded-xl text-[#22243A] placeholder-[#666675]/50 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[#10194A]"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mt-2 flex-shrink-0">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-sans text-[#666675] hover:text-[#22243A]">
                  <input
                    type="checkbox"
                    checked={rememberDevice}
                    onChange={(e) => setRememberDevice(e.target.checked)}
                    className="rounded border-[#E7E2DC] text-[#10194A] focus:ring-[#10194A] w-4 h-4 transition-all"
                  />
                  Remember this device
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-[#E97878] hover:bg-[#d86565] text-white font-medium rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-75"
              >
                {loading ? (
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Sign In to Dashboard
                  </>
                )}
              </button>
            </form>
          )}

          {/* Google Sign-In Section */}
          <div className="mt-6 flex flex-col items-center">
            <div className="flex items-center justify-center w-full mb-4">
              <div className="h-px bg-[#E7E2DC] w-full"></div>
              <span className="px-3 text-[10px] font-semibold text-[#666675] uppercase tracking-wider bg-transparent">Or</span>
              <div className="h-px bg-[#E7E2DC] w-full"></div>
            </div>
            
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl bg-white hover:bg-[#FAF5EF] border border-[#E7E2DC] text-[#22243A] text-sm font-medium transition-all shadow-xs disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {googleLoading ? (
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-[#10194A] border-t-transparent"></span>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Sign in with Google
                </>
              )}
            </button>
          </div>

          {/* Quick Login Section */}
          <div className="mt-8 pt-6 border-t border-[#E7E2DC]">
            <p className="text-center text-[#666675] text-[10px] font-semibold uppercase tracking-wider mb-3 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#EBA66F]" />
              Demo Account Pre-fill
            </p>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickLogin('student')}
                className="flex-1 py-2 px-3 rounded-xl bg-[#FAF5EF] hover:bg-[#FAF5EF]/80 border border-[#E7E2DC] text-[#22243A] text-xs font-medium transition-all flex items-center justify-center gap-1.5"
              >
                Candidate Demo
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="flex-1 py-2 px-3 rounded-xl bg-[#FAF5EF] hover:bg-[#FAF5EF]/80 border border-[#E7E2DC] text-[#22243A] text-xs font-medium transition-all flex items-center justify-center gap-1.5"
              >
                Recruiter Demo
              </button>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-[#666675] text-xs text-center mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#10194A] hover:underline font-semibold transition-all">
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
