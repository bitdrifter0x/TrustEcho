import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

export default function SubmitForm() {
  const { userId } = useParams(); // Grabs the target user ID directly from the URL
  const [formData, setFormData] = useState({ clientName: '', clientEmail: '', clientCompany: '', content: '', rating: 5 });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const res = await fetch('http://localhost:5000/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...formData }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Submission failed');

      setStatus({ type: 'success', message: 'Thank you! Your testimonial has been submitted successfully.' });
      setFormData({ clientName: '', clientEmail: '', clientCompany: '', content: '', rating: 5 });
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-h-screen bg-[#060A14] flex flex-col items-center justify-center text-slate-100 font-sans overflow-x-hidden px-4 py-16 relative">
      
      {/* Background Ambient Glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none -z-10"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 65%)', width: '700px', height: '700px' }} 
      />

      {/* Brand Watermark for public users */}
      <div className="flex items-center gap-2 mb-8 opacity-60 hover:opacity-100 transition-opacity duration-300">
        <div className="w-6 h-6 rounded-[7px] pb-0.5 flex items-center justify-center text-xs font-black text-white" style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)' }}>
          ᯤ
        </div>
        <span className="text-sm font-bold tracking-tight text-slate-300">Powered by TrustEcho</span>
      </div>

      {/* Main Review Form Card */}
      <div className="relative overflow-hidden bg-slate-900/40 border border-slate-800 p-8 sm:p-8 rounded-2xl w-full max-w-lg shadow-[0_24px_64px_rgba(0,0,0,0.5)] backdrop-blur-xl">
        <div style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.05) 0%, transparent 60%)' }} className="absolute inset-0 pointer-events-none" />
        
        <div className="relative z-10">
          <h2 className="text-3xl font-black tracking-tight mb-2 text-center sm:text-left">
            Leave a{' '}
            <span style={{ background: 'linear-gradient(125deg,#818CF8,#C4B5FD,#FCD34D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Review
            </span>
          </h2>
          <p className="text-slate-400 text-xs font-medium tracking-wide mb-8 text-center sm:text-left uppercase">WE VALUE YOUR FEEDBACK! PLEASE SHARE YOUR EXPERIENCE.</p>

          {status.message && (
            <div className={`p-4 rounded-xl text-xs font-semibold mb-6 border ${
              status.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}>
              {status.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Your Name</label>
                <input 
                  type="text" 
                  required 
                  className="w-full bg-[#060A14] border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500/60 transition-colors placeholder-slate-700" 
                  placeholder="Jane Smith" 
                  value={formData.clientName} 
                  onChange={e => setFormData({ ...formData, clientName: e.target.value })} 
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Your Email</label>
                <input 
                  type="email" 
                  required 
                  className="w-full bg-[#060A14] border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500/60 transition-colors placeholder-slate-700" 
                  placeholder="jane@example.com" 
                  value={formData.clientEmail} 
                  onChange={e => setFormData({ ...formData, clientEmail: e.target.value })} 
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                Company / Position <span className="text-slate-600 font-normal lowercase">(optional)</span>
              </label>
              <input 
                type="text" 
                className="w-full bg-[#060A14] border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500/60 transition-colors placeholder-slate-700" 
                placeholder="CTO at TechCorp" 
                value={formData.clientCompany} 
                onChange={e => setFormData({ ...formData, clientCompany: e.target.value })} 
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Overall Rating</label>
              <div className="flex gap-1.5 items-center py-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    type="button" 
                    key={star} 
                    onClick={() => setFormData({ ...formData, rating: star })} 
                    className={`text-2xl transition-all transform hover:scale-110 active:scale-95 ${
                      star <= formData.rating 
                        ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]' 
                        : 'text-slate-700 hover:text-slate-500'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Your Testimonial</label>
              <textarea 
                required 
                rows="4" 
                className="w-full bg-[#060A14] border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500/60 transition-colors placeholder-slate-700 resize-none leading-relaxed" 
                placeholder="Share your experience working with us, what went well, and what you achieved..." 
                value={formData.content} 
                onChange={e => setFormData({ ...formData, content: e.target.value })}
              />
            </div>

            <button 
              type="submit" 
              disabled={submitting} 
              className="w-full inline-flex items-center justify-center text-[14px] font-bold text-white p-3.5 rounded-xl shadow-[0_0_24px_rgba(99,102,241,0.2)] hover:shadow-[0_0_36px_rgba(99,102,241,0.4)] transition-all tracking-tight disabled:opacity-50 disabled:pointer-events-none"
              style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)' }}
            >
              {submitting ? 'Submitting Review...' : 'Send Testimonial'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}