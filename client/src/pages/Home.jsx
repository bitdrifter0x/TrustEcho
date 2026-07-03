import React from 'react';
import { Link } from 'react-router-dom';

/* ── SVG Icons ─────────────────────────────────────────────────────── */
const LinkIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
);
const ShieldIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const ZapIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const VideoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7"/>
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
  </svg>
);
const ArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

const Stars = () => (
  <div className="flex gap-0.5">
    {[1,2,3,4,5].map(i => <span key={i} className="text-amber-400 text-xs">★</span>)}
  </div>
);

const stats = [
  ['2 min', 'Average setup'],
  ['40+',   'Agencies onboarded'],
  ['99.9%', 'Uptime SLA'],
];

const features = [
  {
    col: 'col-span-4',
    icon: <LinkIcon />,
    iconBg: 'bg-indigo-500/15',
    iconColor: 'text-indigo-400',
    glow: 'right',
    title: 'Branded Collection Forms',
    desc: 'Every project gets its own public URL. Clients land on a fully branded form — your logo, your colors — with zero TrustEcho branding visible.',
    extra: null,
  },
  {
    col: 'col-span-2',
    icon: <VideoIcon />,
    iconBg: 'bg-violet-500/15',
    iconColor: 'text-violet-400',
    glow: null,
    title: 'Video & Audio',
    desc: 'Clients record right from the browser. No app installs, no upload links, no friction.',
    extra: null,
  },
  {
    col: 'col-span-2',
    icon: <ShieldIcon />,
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-400',
    glow: null,
    title: 'Moderation Queue',
    desc: 'Review every submission. Approve with one click. Nothing goes live without your say.',
    extra: null,
  },
  {
    col: 'col-span-4',
    icon: <ZapIcon />,
    iconBg: 'bg-indigo-500/12',
    iconColor: 'text-indigo-400',
    glow: 'left',
    title: 'One-Line Embed. Zero Iframes.',
    desc: 'Drop one script tag on any page. TrustEcho renders a native, responsive testimonial grid — carousel or masonry — that loads async and never blocks your page.',
    extra: (
      <div className="mt-5 bg-black/40 border border-slate-800 rounded-xl px-4 py-3 font-mono text-xs text-violet-400 inline-block tracking-wide">
        {'<script src="trustecho.io/w/your-slug.js" />'}
      </div>
    ),
  },
];

/* ── Component ──────────────────────────────────────────────────────── */
export default function Home() {
  return (
    <div className="min-h-screen bg-[#060A14] text-slate-100 font-sans overflow-x-hidden">

      

      {/* ── HEADER ───────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-[#060A14]/85 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[9px] pb-1 flex items-center justify-center text-md font-black shadow-[0_0_16px_rgba(99,102,241,0.4)]" style={{ background: 'linear-gradient(135deg,#6366F1,#A78BFA)' }}>
              ᯤ
            </div>
            <span className="text-[17px] font-extrabold tracking-tight">TrustEcho</span>
          </div>

          <nav className="flex items-center gap-2">
            <Link
              to="/login"
              className="text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors px-4 py-2"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-sm font-bold text-white px-5 py-2.5 rounded-[10px] shadow-[0_0_24px_rgba(99,102,241,0.28)] hover:shadow-[0_0_36px_rgba(99,102,241,0.48)] transition-shadow"
              style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)' }}
            >
              Get Started Free
            </Link>
          </nav>
        </div>
      </header>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

        {/* Left — copy */}
        <div>
          {/* Beta pill */}
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3.5 py-1.5 mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366F1]" />
            <span className="text-[11px] font-bold text-violet-400 tracking-widest uppercase">
              Public Beta · Free to start
            </span>
          </div>

          <h1 className="text-5xl lg:text-[54px] font-black leading-[1.1] tracking-tight mb-6" style={{ maxWidth: '480px' }}>
            Let your clients<br />
            <span style={{ background: 'linear-gradient(125deg,#818CF8,#C4B5FD,#FCD34D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              do the selling.
            </span>
          </h1>

          <p className="text-[17px] text-slate-400 leading-[1.75] mb-10" style={{ maxWidth: '420px' }}>
            A branded submission form, video & text testimonials, a moderation
            queue, and a single script tag that embeds everything. No iframes.
          </p>

          <div className="flex flex-wrap items-center gap-3 mb-12">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 text-[15px] font-bold text-white px-7 py-3.5 rounded-xl shadow-[0_0_24px_rgba(99,102,241,0.28)] hover:shadow-[0_0_36px_rgba(99,102,241,0.48)] transition-shadow tracking-tight"
              style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)' }}
            >
              Create Free Space <ArrowRight />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 text-[15px] font-semibold text-slate-400 bg-white/0.04 border border-slate-800 px-6 py-3.5 rounded-xl hover:bg-white/[0.07] transition-colors"
            >
              How it works
            </a>
          </div>

          {/* Stats */}
          <div className="flex gap-0 border-t border-slate-800/60 pt-7">
            {stats.map(([val, lbl], i) => (
              <div
                key={i}
                className={`flex-1 ${i < stats.length - 1 ? 'pr-6 border-r border-slate-800/60 mr-6' : ''}`}
              >
                <div className="text-[22px] font-black text-slate-100 tracking-tight">{val}</div>
                <div className="text-[11px] text-slate-600 mt-1 font-medium">{lbl}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — live testimonial preview cards */}
        <div className="relative hidden lg:block" style={{ height: '440px' }}>

          {/* Ambient glow */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 68%)' }} style={{ Width: '360px', height: '360px' }}/>

          {/* Card 1 — top */}
          <div className="absolute top-0 left-0 right-12 bg-[#0B1224]/90 border border-slate-800 rounded-[18px] p-5 backdrop-blur-xl shadow-[0_24px_64px_rgba(0,0,0,0.4)]">
            <div className="flex gap-3.5 items-start">
              <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-xs font-bold shrink-0" style={{ background: 'linear-gradient(135deg,#6366F1,#A78BFA)' }}>
                SC
              </div>
              <div>
                <Stars />
                <p className="text-[13px] text-slate-300 leading-relaxed mt-2 mb-3">
                  "Honestly the smoothest client tool I've used. Inquiries jumped within a week."
                </p>
                <div className="text-[13px] font-semibold text-slate-100">Sarah Chen</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Product Designer · Notion</div>
              </div>
            </div>
          </div>

          {/* Card 2 — bottom */}
          <div className="absolute bottom-0 left-12 right-0 bg-[#0B1224]/90 border border-slate-800 rounded-[18px] p-5 backdrop-blur-xl shadow-[0_24px_64px_rgba(0,0,0,0.4)]">
            <div className="flex gap-3.5 items-start">
              <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-xs font-bold shrink-0" style={{ background: 'linear-gradient(135deg,#8B5CF6,#D946EF)' }}>
                MR
              </div>
              <div>
                <Stars />
                <p className="text-[13px] text-slate-300 leading-relaxed mt-2 mb-3">
                  "Skeptical at first — but 40% more leads after embedding. Genuinely surprised."
                </p>
                <div className="text-[13px] font-semibold text-slate-100">Marcus Reid</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Freelance Developer</div>
              </div>
            </div>
          </div>

          {/* Floating amber badge */}
          <div className="absolute top-1/2 -right-6 -translate-y-1/2 bg-amber-500/10 border border-amber-500/25 rounded-xl px-4 py-3 text-center backdrop-blur-xl">
            <div className="text-[22px] font-black text-amber-400 tracking-tight">98%</div>
            <div className="text-[10px] text-amber-600 font-semibold whitespace-nowrap mt-0.5">Approval rate</div>
          </div>

          {/* Live activity pill */}
          <div className="absolute -top-4 right-20 bg-slate-900 border border-slate-800 rounded-full px-3.5 py-1.5 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_#4ade80]" />
            <span className="text-[11px] font-semibold text-green-300">New testimonial collected</span>
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────── */}
      <section
        id="features"
        className="relative z-10 max-w-6xl mx-auto px-6 py-24 border-t border-b border-slate-800/60"
      >
        <div className="text-center mb-16">
          <p className="text-[11px] font-bold text-indigo-400 tracking-[0.12em] uppercase mb-3">Features</p>
          <h2 className="text-4xl font-black tracking-tight mb-4">
            Built for conversion,<br />not configuration
          </h2>
          <p className="text-base text-slate-400">
            Every feature exists to turn client words into closed deals.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-6 gap-4">
          {features.map((f, i) => (
            <div
              key={i}
              className={`${f.col} relative overflow-hidden bg-slate-900/40 border border-slate-800 rounded-2xl ${f.col === 'col-span-4' ? 'p-9' : 'p-7'}`}
            >
              {/* Radial glow inside card */}
              {f.glow === 'right' && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: 'radial-gradient(ellipse at 80% 50%, rgba(99,102,241,0.09) 0%, transparent 60%)' }}
                />
              )}
              {f.glow === 'left' && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: 'radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.09) 0%, transparent 60%)' }}
                />
              )}

              <div className={`w-10 h-10 ${f.iconBg} ${f.iconColor} rounded-[10px] flex items-center justify-center mb-5`}>
                {f.icon}
              </div>
              <h3 className={`font-bold tracking-tight mb-2.5 ${f.col === 'col-span-4' ? 'text-xl' : 'text-[17px]'}`}>
                {f.title}
              </h3>
              <p className={`text-slate-400 leading-relaxed ${f.col === 'col-span-4' ? 'text-sm' : 'text-[13px]'}`} style={{ maxWidth: '380px' }}>
                {f.desc}
              </p>
              {f.extra}
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER CTA ───────────────────────────────────────────── */}
      <section
        className="relative z-10 py-28 text-center"
      >
        <div className="mx-auto px-6" style={{ maxWidth: '560px' }}>
          <h2 className="text-[44px] font-black tracking-tight leading-[1.12] mb-5">
            Your next client is<br />reading what past<br />
            <span style={{ background: 'linear-gradient(125deg,#818CF8,#C4B5FD,#FCD34D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              ones already said.
            </span>
          </h2>
          <p className="text-base text-slate-400 leading-relaxed mb-10">
            Set up your testimonial workspace in under 2 minutes.<br />No credit card required.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2.5 text-base font-bold text-white px-10 py-4 rounded-[14px] shadow-[0_0_24px_rgba(99,102,241,0.28)] hover:shadow-[0_0_36px_rgba(99,102,241,0.48)] transition-shadow tracking-tight"
            style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)' }}
          >
            Create Your Free Space <ArrowRight />
          </Link>
          <p className="text-xs text-slate-600 mt-5">
            Free forever on the starter plan · No credit card needed
          </p>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-slate-800/60 py-7 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-xs text-slate-600">© 2025 TrustEcho. All rights reserved.</span>
          <div className="flex gap-5">
            {['Privacy', 'Terms', 'Contact'].map(l => (
              <a key={l} href="#" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}