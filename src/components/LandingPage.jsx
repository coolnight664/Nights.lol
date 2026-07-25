import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Sparkles, CheckCircle2, XCircle, ArrowRight, Music, Layers, Code, Flame, ExternalLink } from 'lucide-react';

export const LandingPage = () => {
  const { checkUsernameAvailable, sites } = useApp();
  const navigate = useNavigate();
  const [inputUsername, setInputUsername] = useState('');
  const availability = inputUsername ? checkUsernameAvailable(inputUsername) : null;

  return (
    <div className="min-h-screen pb-20 px-4 md:px-8 max-w-6xl mx-auto space-y-20">
      <div className="text-center space-y-8 relative pt-16">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          Next-Gen Bio Platform
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1]">
          One Link for Your{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">
            Digital Universe
          </span>
        </h1>

        <p className="max-w-xl mx-auto text-gray-400 text-sm md:text-base leading-relaxed">
          Build your ultimate bio site with video backgrounds, Spotify synced lyrics, canvas drag-and-drop, and more.
        </p>

        <div className="max-w-lg mx-auto space-y-3">
          <div className="bg-white/[0.04] backdrop-blur-xl p-1.5 rounded-xl border border-white/[0.08] flex items-center gap-1">
            <span className="pl-3 font-mono font-semibold text-gray-500 text-sm shrink-0">coolnight664.github.io/Nights.lol/</span>
            <input
              type="text"
              placeholder="yourname"
              value={inputUsername}
              onChange={(e) => setInputUsername(e.target.value)}
              className="w-full bg-transparent text-white text-sm font-semibold font-mono focus:outline-none placeholder-gray-600 py-2"
            />
            <button
              onClick={() => navigate('/login')}
              disabled={!inputUsername}
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold text-xs shrink-0 transition-all disabled:opacity-40 shadow-lg shadow-purple-500/20"
            >
              Claim <ArrowRight className="w-3.5 h-3.5 inline ml-1" />
            </button>
          </div>

          {availability && (
            <div className="text-left px-3 space-y-2">
              {availability.available ? (
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> coolnight664.github.io/Nights.lol/{availability.name} is available!
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono text-red-400 font-semibold">
                    <XCircle className="w-3.5 h-3.5" /> Taken. Try:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {availability.suggestions.map((sug) => (
                      <button key={sug} onClick={() => navigate('/login')} className="px-2.5 py-1 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-mono hover:bg-purple-500/30 transition-all">
                        /{sug}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-white flex items-center justify-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" /> Featured Sites
          </h2>
          <p className="text-xs text-gray-500 font-mono">Click to view a live bio page</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sites.map((s) => (
            <div key={s.id} onClick={() => navigate(`/${s.username}`)} className="bg-white/[0.03] backdrop-blur-xl p-4 rounded-2xl border border-white/[0.06] hover:border-purple-500/30 transition-all cursor-pointer group flex items-center gap-4">
              <img src={s.avatarUrl} alt={s.displayName} className="w-12 h-12 rounded-xl object-cover border border-white/10 group-hover:scale-105 transition-transform" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-sm group-hover:text-purple-300 transition-colors truncate">{s.displayName}</h3>
                  {s.badges?.slice(0, 2).map((b, i) => (
                    <span key={i} className="text-[9px] bg-purple-500/15 text-purple-300 px-1.5 py-0.5 rounded-full font-semibold shrink-0">{b}</span>
                  ))}
                </div>
                <p className="text-[10px] text-purple-400 font-mono">coolnight664.github.io/Nights.lol/{s.username}</p>
                <p className="text-[10px] text-gray-500 truncate mt-0.5">{s.bio}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-purple-400 transition-colors shrink-0" />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Music, color: '#10b981', title: 'Spotify Lyrics', desc: 'Synced lyrics that scroll with your audio. Click any line to seek.' },
          { icon: Layers, color: '#8b5cf6', title: 'Canvas Grid', desc: 'Drag-and-drop link placement with pixel-perfect grid snapping.' },
          { icon: Code, color: '#ec4899', title: 'HTML Importer', desc: 'Import custom HTML, CSS, JS and upload asset folders.' },
        ].map(({ icon: Icon, color, title, desc }) => (
          <div key={title} className="bg-white/[0.03] backdrop-blur-xl p-5 rounded-2xl border border-white/[0.06] space-y-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center border" style={{ backgroundColor: `${color}18`, color, borderColor: `${color}30` }}>
              <Icon className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">{title}</h3>
            <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
