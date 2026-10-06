import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

/* ── SVG Icons matching Home.jsx Design Language ─────────────────── */
const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
);

const Stars = ({ count }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: count || 5 }).map((_, i) => (
      <span key={i} className="text-amber-400 text-xs">★</span>
    ))}
  </div>
);

/* ── Config & helpers ───────────────────────────────────────────── */

// FIX 2 (trailing slash): trailing slashes are stripped, so the URLs work whether or not
// the .env value ends with "/". The frontend URL falls back to the current site.
const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
const FRONTEND_URL = (import.meta.env.VITE_FRONTEND_URL || window.location.origin).replace(/\/+$/, '');

// FIX 3 (expired token): one helper for every dashboard API call. If the server answers 401
// (token invalid or expired), the user is logged out, and ProtectedRoute sends them to /login.
const apiRequest = async (path, token, onUnauthorized, options = {}) => {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) {
    onUnauthorized();
    throw new Error('Session expired. Please log in again.');
  }

  const result = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(result.message || 'Request failed');
  return result;
};

// FIX 5 (false "Copied!"): the success message is shown only after the browser really copied
// the text. If clipboard access is blocked or unavailable (for example on plain http),
// the user is told to copy it manually.
const copyText = async (text, setCopied) => {
  try {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  } catch {
    alert('Could not copy automatically. Please select the text and copy it manually.');
  }
};

// FIX 1 (stored XSS): builds the embed snippet customers paste into their websites.
// The old snippet put raw review text into innerHTML, so a malicious review could run
// JavaScript on every site using the widget. Now every value goes through esc() first,
// and the star count is forced to a number from 1 to 5.
// Inside this template, avoid backticks and "${" so the snippet stays plain JavaScript.
const buildEmbedCode = (widgetUrl) => `<div id="trust-echo-widget"></div>
<script>
(function () {
  // Escape text so reviews are always shown as plain text, never as HTML
  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  fetch(${JSON.stringify(widgetUrl)})
    .then(function (res) { return res.json(); })
    .then(function (result) {
      var data = result.data || [];
      if (data.length === 0) return;
      var container = document.getElementById("trust-echo-widget");
      container.style.display = "grid";
      container.style.gridTemplateColumns = "repeat(auto-fit, minmax(300px, 1fr))";
      container.style.gap = "16px";
      container.style.padding = "16px";
      container.innerHTML = data.map(function (t) {
        var stars = Math.min(5, Math.max(1, Math.round(Number(t.rating)) || 5));
        return '<div style="background: #0f172a; border: 1px solid #1e293b; padding: 20px; border-radius: 12px; font-family: sans-serif; color: #f8fafc; display: flex; flex-direction: column; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1)">'
          + '<div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 12px;">'
          + '<div>'
          + '<h4 style="margin: 0; font-weight: bold; color: #e2e8f0; font-size: 14px;">' + esc(t.clientName) + '</h4>'
          + '<p style="margin: 2px 0 0 0; font-size: 12px; color: #64748b;">' + esc(t.clientCompany || "Verified Customer") + '</p>'
          + '</div>'
          + '<div style="color: #fbbf24; font-size: 12px;">' + "★".repeat(stars) + '</div>'
          + '</div>'
          + '<p style="margin: 0; font-size: 13px; color: #94a3b8; font-style: italic; line-height: 1.6;">"' + esc(t.content) + '"</p>'
          + '<div style="margin-top: 16px; display: flex; justify-content: flex-end;">'
          + '<span style="font-size: 10px; font-family: monospace; color: #475569; text-transform: uppercase;">✓ Verified by Trust Echo</span>'
          + '</div>'
          + '</div>';
      }).join("");
    })
    .catch(function (err) { console.error("Trust Echo Error:", err); });
})();
</script>`;

/* ── Component ──────────────────────────────────────────────────── */
export default function Dashboard() {
  const { user, logout } = useAuth();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const userId = user?.user?._id || '';
  const formUrl = `${FRONTEND_URL}/submit/${userId}`;
  
  const embedCode = buildEmbedCode(`${API_URL}/api/testimonials/widget/${userId}`);
  const copyEmbed = () => copyText(embedCode, setCopiedEmbed);
  const copyFormLink = () => copyText(formUrl, setCopiedLink);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const result = await apiRequest('/api/testimonials', user.token, logout);
        setTestimonials(result.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    // FIX 4 (endless "Loading..."): a stored login without a token (for example a corrupted
    // localStorage entry) can never load data, so log out and let ProtectedRoute show /login.
    if (!user?.token) {
      logout();
      return;
    }
    fetchTestimonials();
  }, [user, logout]);

  const handleToggleApproval = async (id) => {
    try {
      await apiRequest(`/api/testimonials/${id}/approve`, user.token, logout, { method: 'PATCH' });
      setTestimonials(prev => prev.map(t => t._id === id ? { ...t, isApproved: !t.isApproved } : t));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this testimonial permanently?')) return;
    try {
      await apiRequest(`/api/testimonials/${id}`, user.token, logout, { method: 'DELETE' });
      setTestimonials(prev => prev.filter(t => t._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#060A14] text-slate-100 font-sans overflow-x-hidden">
      
      {/* ── HEADER NAVIGATION ────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-[#060A14]/85 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[9px] pb-1 flex items-center justify-center text-md font-black shadow-[0_0_16px_rgba(99,102,241,0.4)]" style={{ background: 'linear-gradient(135deg,#6366F1,#A78BFA)' }}>
              ᯤ
            </div>
            <span className="text-[17px] font-extrabold tracking-tight">TrustEcho</span>
            <span className="text-[11px] bg-indigo-500/10 text-violet-400 px-2 py-0.5 rounded-md font-bold tracking-wider uppercase border border-indigo-500/20 ml-1">
              Dashboard
            </span>
          </div>
          
          <div className="flex items-center gap-5">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-200 tracking-tight">{user?.user?.name}</p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">{user?.user?.companyName || 'Personal Workspace'}</p>
            </div>
            <button 
              onClick={logout} 
              className="text-xs font-semibold text-slate-400 bg-white/[0.04] border border-slate-800 px-4 py-2 rounded-xl hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20 transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT CONTAINER ────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-6 py-12 relative z-10">
        
        {/* Ambient Top Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] rounded-full pointer-events-none -z-10" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)' }} />

        {/* ── TOP ACTION CONTROL CARDS ────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          
          {/* Public Collection Card */}
          <div className="relative overflow-hidden bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
            <div style={{ background: 'radial-gradient(ellipse at 80% 20%, rgba(99,102,241,0.04) 0%, transparent 50%)' }} className="absolute inset-0 pointer-events-none" />
            <div>
              <h3 className="text-[15px] font-bold tracking-tight text-slate-200 mb-1">Public Collection Link</h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">Share this unique URL directly with your customers to gather feedback seamlessly.</p>
              <div className="mt-4 bg-black/40 border border-slate-800 rounded-xl px-3.5 py-2.5 font-mono text-[11px] text-violet-400 truncate tracking-wide">
                {formUrl}
              </div>
            </div>
            <button 
              onClick={copyFormLink} 
              className="mt-5 inline-flex items-center justify-center gap-2 text-xs font-semibold text-slate-300 bg-white/[0.04] border border-slate-800 py-3 px-4 rounded-xl hover:bg-white/[0.07] transition-colors"
            >
              <CopyIcon /> {copiedLink ? 'Link Copied! ✓' : 'Copy Collection Link'}
            </button>
          </div>

          {/* Code Inline Embed Card */}
          <div className="relative overflow-hidden bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
            <div style={{ background: 'radial-gradient(ellipse at 80% 20%, rgba(99,102,241,0.04) 0%, transparent 50%)' }} className="absolute inset-0 pointer-events-none" />
            <div>
              <h3 className="text-[15px] font-bold tracking-tight text-slate-200 mb-1">Website Embed</h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">Inject a lightweight, lightning-fast native review container grid without slow cross-origin iframes.</p>
              <div className="mt-4 bg-black/40 border border-slate-800 rounded-xl px-3.5 py-2.5 font-mono text-[11px] text-indigo-400/80 truncate tracking-wide">
                {'<div id="trust-echo-widget"></div>...'}
              </div>
            </div>
            <button 
              onClick={copyEmbed} 
              className="mt-5 inline-flex items-center justify-center gap-2 text-xs font-bold text-white py-3 px-4 rounded-xl shadow-[0_0_24px_rgba(99,102,241,0.2)] hover:shadow-[0_0_32px_rgba(99,102,241,0.4)] transition-shadow"
              style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)' }}
            >
              <CopyIcon /> {copiedEmbed ? 'Embed Code Copied! ✓' : 'Copy HTML Embed Code'}
            </button>
          </div>
        </div>

        {/* ── ANALYTICS METRICS BAR ───────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-14">
          <div className="bg-slate-900/40 border border-slate-800/60 p-5 rounded-2xl">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Collected</p>
            <p className="text-3xl font-black mt-2 tracking-tight" style={{ background: 'linear-gradient(135deg,#818CF8,#C4B5FD)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {testimonials.length}
            </p>
          </div>
          <div className="bg-slate-900/40 border border-slate-800/60 p-5 rounded-2xl">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Approved & Live</p>
            <p className="text-3xl font-black mt-2 text-emerald-400 tracking-tight">
              {testimonials.filter(t => t.isApproved).length}
            </p>
          </div>
          <div className="bg-slate-900/40 border border-slate-800/60 p-5 rounded-2xl">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Pending Review</p>
            <p className="text-3xl font-black mt-2 text-amber-400 tracking-tight">
              {testimonials.filter(t => !t.isApproved).length}
            </p>
          </div>
        </div>

        {/* ── SUBMISSIONS LIST ────────────────────────────────────── */}
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-xl font-black tracking-tight">Customer Submissions</h2>
          <div className="h-px flex-1 bg-slate-800/60 ml-4" />
        </div>
        
        {loading && (
          <div className="text-center text-slate-500 py-16 text-sm font-medium tracking-wide">
            Loading active responses...
          </div>
        )}
        
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-sm font-semibold mb-6">
            {error}
          </div>
        )}

        {!loading && testimonials.length === 0 && (
          <div className="bg-slate-900/20 border border-dashed border-slate-800 rounded-2xl p-16 text-center">
            <p className="text-sm text-slate-500 font-medium">No testimonials received in this workspace yet.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {testimonials.map((t) => (
            <div 
              key={t._id} 
              className="bg-slate-900/30 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between group transition-all hover:border-slate-700/80 shadow-sm"
            >
              <div>
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div>
                    <h4 className="font-bold text-slate-100 text-[15px] tracking-tight">{t.clientName}</h4>
                    <p className="text-xs text-slate-500 mt-0.5 tracking-wide">
                      {t.clientEmail} {t.clientCompany && ` · ${t.clientCompany}`}
                    </p>
                  </div>
                  <Stars count={t.rating} />
                </div>
                <p className="text-slate-300 text-[13px] leading-relaxed mb-6 italic">
                  "{t.content}"
                </p>
              </div>

              <div className="flex justify-between items-center border-t border-slate-800/60 pt-4 mt-auto">
                <button 
                  onClick={() => handleToggleApproval(t._id)}
                  className={`text-[11px] font-bold px-3 py-1.5 rounded-xl border transition-all uppercase tracking-wider ${
                    t.isApproved 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' 
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                  }`}
                >
                  {t.isApproved ? '● Live on Widget' : '○ Hidden (Approve)'}
                </button>
                <button 
                  onClick={() => handleDelete(t._id)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-rose-400 transition-colors px-2 py-1"
                >
                  <TrashIcon /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}