import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* ── SVG Icons matching Home.jsx Design Language ─────────────────── */
const ArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      
      login(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#060A14] flex flex-col items-center justify-center text-slate-100 font-sans overflow-x-hidden px-4 relative">
      
      {/* Background Ambient Glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none -z-10"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 65%)', width: '500px', height: '500px' }} 
      />

      {/* Brand Header */}
      <div className="flex items-center gap-2.5 mb-8">
        <div className="w-8 h-8 rounded-[9px] pb-1 flex items-center justify-center text-md font-black shadow-[0_0_16px_rgba(99,102,241,0.4)]" style={{ background: 'linear-gradient(135deg,#6366F1,#A78BFA)' }}>
          ᯤ
        </div>
        <span className="text-[17px] font-extrabold tracking-tight">TrustEcho</span>
      </div>

      {/* Main Form Card */}
      <div className="relative overflow-hidden bg-slate-900/40 border border-slate-800 p-8 rounded-2xl w-full max-w-md shadow-[0_24px_64px_rgba(0,0,0,0.4)] backdrop-blur-xl">
        <div style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.06) 0%, transparent 60%)' }} className="absolute inset-0 pointer-events-none" />
        
        <div className="relative z-10">
          <h2 className="text-3xl font-black text-center tracking-tight mb-2">
            Welcome back!
          </h2>
          <p className="text-slate-400 text-xs font-medium tracking-wide text-center mb-6">LOG IN TO MANAGE YOUR TESTIMONIAL WORKSPACE</p>
          
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3.5 rounded-xl text-xs font-semibold mb-5">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Email Address</label>
              <input 
                type="email" 
                required 
                className="w-full bg-[#060A14] border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500/60 transition-colors placeholder-slate-700" 
                placeholder="name@company.com" 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
              />
            </div>
            
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Password</label>
              <input 
                type="password" 
                required 
                className="w-full bg-[#060A14] border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500/60 transition-colors placeholder-slate-700" 
                placeholder="••••••••" 
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})} 
              />
            </div>
            
            <button 
              type="submit" 
              className="w-full inline-flex items-center justify-center gap-2 text-[14px] font-bold text-white p-3.5 rounded-xl shadow-[0_0_24px_rgba(99,102,241,0.28)] hover:shadow-[0_0_36px_rgba(99,102,241,0.48)] transition-shadow tracking-tight mt-6"
              style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)' }}
            >
              Sign In <ArrowRight />
            </button>
          </form>
          
          <div className="border-t border-slate-800/60 pt-5 mt-6 text-center">
            <p className="text-xs text-slate-400 font-medium">
              Don't have an account yet?{' '}
              <Link to="/register" className="text-violet-400 hover:text-indigo-400 font-bold transition-colors ml-1">
                Sign Up Here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}