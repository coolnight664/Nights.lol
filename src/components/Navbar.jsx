import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp, OWNER_DISCORD_ID } from '../context/AppContext';
import { Sparkles, ShieldCheck, LogOut, LayoutDashboard, ExternalLink, Menu, X } from 'lucide-react';

export const Navbar = ({ appTab, setAppTab }) => {
  const { currentUser, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const isOwner = currentUser?.id === OWNER_DISCORD_ID || currentUser?.isOwner;
  const isOnApp = location.pathname === '/app';
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-[#0a0a14]/80 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="h-full px-4 md:px-6 flex items-center justify-between max-w-7xl mx-auto">
        <div onClick={() => navigate('/')} className="flex items-center gap-2.5 cursor-pointer group shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-shadow">
            N
          </div>
          <span className="text-sm font-bold text-white tracking-tight hidden sm:block">Nights.lol</span>
        </div>

        <nav className="hidden md:flex items-center gap-1 bg-white/[0.04] rounded-xl p-1 border border-white/[0.06]">
          <button onClick={() => navigate('/')} className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${location.pathname === '/' && !isOnApp ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-gray-200'}`}>
            Home
          </button>
          <button onClick={() => { if (!currentUser) { navigate('/login'); return; } navigate('/app'); setAppTab?.('dashboard'); }} className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${isOnApp && appTab === 'dashboard' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-gray-200'}`}>
            <LayoutDashboard className="w-3.5 h-3.5" />
            Studio
          </button>
          <button onClick={() => { if (!currentUser) { navigate('/login'); return; } navigate('/app'); setAppTab?.('bio'); }} className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${isOnApp && appTab === 'bio' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-gray-200'}`}>
            <ExternalLink className="w-3.5 h-3.5" />
            Bio Site
          </button>
          {isOwner && (
            <button onClick={() => { navigate('/app'); setAppTab?.('admin'); }} className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${isOnApp && appTab === 'admin' ? 'bg-amber-500/15 text-amber-300' : 'text-amber-400/70 hover:text-amber-300'}`}>
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin
            </button>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {currentUser ? (
            <div className="flex items-center gap-2 bg-white/[0.04] rounded-xl px-2.5 py-1.5 border border-white/[0.06]">
              <img src={currentUser.avatar} alt="" className="w-7 h-7 rounded-lg object-cover" />
              <div className="hidden sm:block">
                <div className="text-xs font-semibold text-white leading-tight">{currentUser.username}</div>
                <div className="text-[9px] text-gray-500 font-mono">{currentUser.id.slice(0, 8)}...</div>
              </div>
              <button onClick={() => { logout(); navigate('/'); }} className="ml-1 p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Sign Out">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button onClick={() => navigate('/login')} className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white text-xs font-bold transition-all shadow-lg shadow-purple-500/20">
              Sign In
            </button>
          )}

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden absolute top-14 left-0 right-0 bg-[#0a0a14]/95 backdrop-blur-xl border-b border-white/[0.06] p-3 space-y-1">
          <button onClick={() => { navigate('/'); setMobileOpen(false); }} className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-white/5">Home</button>
          <button onClick={() => { if (!currentUser) { navigate('/login'); } else { navigate('/app'); setAppTab?.('dashboard'); } setMobileOpen(false); }} className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-white/5">Site Studio</button>
          <button onClick={() => { if (!currentUser) { navigate('/login'); } else { navigate('/app'); setAppTab?.('bio'); } setMobileOpen(false); }} className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-white/5">Bio Site</button>
          {isOwner && <button onClick={() => { navigate('/app'); setAppTab?.('admin'); setMobileOpen(false); }} className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-amber-400 hover:bg-white/5">Admin</button>}
        </div>
      )}
    </header>
  );
};
