import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function Widget() {
  const { userId } = useParams();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApprovedTestimonials = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/testimonials/widget/${userId}`);
        const result = await res.json();
        
        if (res.ok && result.data) {
          setTestimonials(result.data);
        }
      } catch (err) {
        console.error("Error loading widget testimonials:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchApprovedTestimonials();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px] text-slate-400 font-medium tracking-wide text-xs bg-[#060A14] rounded-2xl border border-slate-800">
        <div className="animate-pulse flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
          Loading TrustEcho Grid...
        </div>
      </div>
    );
  }
  
  if (testimonials.length === 0) {
    return (
      <div className="text-center text-slate-400 py-12 px-4 border border-dashed border-slate-800 rounded-2xl max-w-md mx-auto my-8 bg-[#060A14]">
        <p className="text-sm font-bold tracking-tight text-slate-200 mb-1">No live reviews found</p>
        <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">Approve submissions inside your dashboard to display them here.</p>
      </div>
    );
  }

  return (
    /* Changed from bg-transparent to a forced solid dark background so it never washes out on light sites */
    <div className="bg-[#060A14] min-h-screen w-full font-sans antialiased p-6 text-slate-100 relative z-0">
      
      {/* Background Ambient Glow */}
      <div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 rounded-full pointer-events-none -z-10 opacity-40"
        style={{  width: '500px', height: '500px' }} 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-7xl mx-auto">
        {testimonials.map((t) => (
          <div 
            key={t._id} 
            className="group relative overflow-hidden bg-slate-900 border border-slate-800/80 p-6 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.4)] flex flex-col justify-between"
          >
            <div>
              {/* Review Header */}
              <div className="flex justify-between items-start gap-3 mb-4">
                <div className="flex items-center gap-3">
                  {/* Initials Avatar */}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black text-white uppercase border border-indigo-500/20" style={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)' }}>
                    {t.clientName ? t.clientName.charAt(0) : 'C'}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-[15px] tracking-tight">
                      {t.clientName}
                    </h4>
                    <p className="text-xs font-medium text-slate-400 tracking-wide mt-0.5">
                      {t.clientCompany || 'Verified Partner'}
                    </p>
                  </div>
                </div>

                {/* Rating Badge */}
                <div className="flex bg-slate-950 border border-slate-800 px-2 py-1 rounded-lg text-amber-400 text-[10px] tracking-tight gap-0.5 shadow-inner">
                  {Array.from({ length: t.rating || 5 }).map((_, i) => (
                    <span key={i} className="drop-shadow-[0_0_4px_rgba(251,191,36,0.4)]">★</span>
                  ))}
                </div>
              </div>

              {/* Core Testimonial Content with explicit high-contrast white/slate text */}
              <p className="text-slate-200 text-[14px] leading-relaxed font-normal italic">
                “{t.content || 'Excellent Product!'}”
              </p>
            </div>

            {/* Verification Footer Row */}
            <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between">
              <span className="text-[9px] tracking-widest text-indigo-400 font-bold uppercase inline-flex items-center gap-1 bg-indigo-500/5 px-2 py-1 rounded-md border border-indigo-500/10">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="inline">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Verified Integrity
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}