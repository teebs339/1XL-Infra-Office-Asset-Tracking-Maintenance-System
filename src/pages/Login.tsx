import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, ArrowRight, Shield, BarChart3, Users, Wrench } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const success = await login(username, password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Invalid username or password');
        setLoading(false);
      }
    } catch {
      setError('Connection error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] bg-indigo-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-purple-500/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-[55%] relative items-center justify-center p-16">
        <div className="max-w-xl">
          <div className="flex items-center gap-4 mb-10">
            <img src={`${import.meta.env.BASE_URL}1XL VENTURES (1).jpg`} alt="1XL" className="w-14 h-14 rounded-2xl object-contain" />
            <span className="text-3xl font-bold text-white tracking-tight">1XL Assets</span>
          </div>
          <h1 className="text-5xl xl:text-6xl font-bold text-white leading-[1.1] mb-8">
            Office Asset<br />
            Tracking &<br />
            Maintenance
          </h1>
          <p className="text-xl text-slate-400 leading-relaxed mb-12 max-w-md">
            Streamline your organization's asset lifecycle with real-time tracking,
            automated maintenance, and comprehensive reporting.
          </p>
          <div className="grid grid-cols-2 gap-5">
            {[
              { icon: Shield, label: 'Role-Based Access', desc: 'Secure permissions' },
              { icon: BarChart3, label: 'Analytics & Reports', desc: 'Data-driven insights' },
              { icon: Users, label: 'Team Management', desc: 'Collaborative workflow' },
              { icon: Wrench, label: 'Maintenance Ops', desc: 'Preventive scheduling' },
            ].map(s => (
              <div key={s.label} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                  <s.icon className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{s.label}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-8 sm:p-12 relative">
        <div className="w-full max-w-[520px]">
          {/* Mobile branding */}
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <img src={`${import.meta.env.BASE_URL}1XL VENTURES (1).jpg`} alt="1XL" className="w-12 h-12 rounded-xl object-contain" />
            <span className="text-2xl font-bold text-white tracking-tight">1XL Assets</span>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-10 sm:p-12 shadow-2xl">
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-semibold text-white">Welcome back</h2>
              <p className="text-base text-slate-400 mt-2">Sign in to your account to continue</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full px-5 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white text-base placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-5 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white text-base placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all pr-12"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white text-base font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 disabled:opacity-60 mt-1">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Sign In <ArrowRight className="w-5 h-5" /></>
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-slate-600 mt-8">
            1XL Infrastructure &middot; Asset Management Suite
          </p>
        </div>
      </div>
    </div>
  );
}
