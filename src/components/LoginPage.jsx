import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();

  const handleDiscordLogin = () => {
    window.location.href = '/auth/discord';
  };

  return (
    <div className="min-h-screen bg-nights-950 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-pink-600/8 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full space-y-6 relative z-10">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto text-white font-bold text-xl shadow-2xl shadow-purple-500/20">
            N
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Welcome back</h1>
            <p className="text-sm text-gray-500 mt-1">Sign in with Discord to manage your bio site</p>
          </div>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.06] p-6">
          <button onClick={handleDiscordLogin} className="w-full py-3.5 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold text-sm flex items-center justify-center gap-3 transition-all shadow-lg shadow-[#5865F2]/20 hover:shadow-[#5865F2]/40">
            <svg viewBox="0 0 16 16" width="20" height="20" fill="currentColor"><path d="M13.545 2.907a13.2 13.2 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.2 12.2 0 0 0-3.658 0 8 8 0 0 0-.412-.833.05.05 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.04.04 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032q.003.022.021.037a13.3 13.3 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019q.463-.63.818-1.329a.05.05 0 0 0-.01-.059l-.018-.011a9 9 0 0 1-1.248-.595.05.05 0 0 1-.02-.066l.015-.019q.127-.095.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.05.05 0 0 1 .053.007q.121.1.248.195a.05.05 0 0 1-.004.085 8 8 0 0 1-1.249.594.05.05 0 0 0-.03.03.05.05 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056-.019 13.2 13.2 0 0 0 4.001-2.02.05.05 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.03.03 0 0 0-.02-.019m-8.198 7.307c-.789 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612m5.316 0c-.788 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612"/></svg>
            <span>Continue with Discord</span>
          </button>
        </div>

        <div className="text-center">
          <button onClick={() => navigate('/')} className="text-xs text-gray-600 hover:text-purple-400 transition-colors flex items-center justify-center gap-1 mx-auto">
            <ArrowRight className="w-3 h-3 rotate-180" /> Back to Nights.lol
          </button>
        </div>
      </div>
    </div>
  );
};
