import React from 'react';
import { Music } from 'lucide-react';

export const SpotifyLyrics = ({ lyrics, currentLyricIdx, colors, onSeek }) => {
  if (!lyrics || lyrics.length === 0) return null;

  return (
    <div className="lyrics-card bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.06] p-4 space-y-2 max-h-48 overflow-y-auto" style={{ '--glow-color': colors[0] }}>
      <div className="flex items-center gap-2 mb-3">
        <Music className="w-3.5 h-3.5" style={{ color: colors[0] }} />
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Lyrics</span>
      </div>
      <div className="space-y-1">
        {lyrics.map((line, i) => (
          <button
            key={i}
            onClick={() => onSeek?.(line.time)}
            className={`w-full text-left px-3 py-1.5 rounded-lg transition-all text-sm font-mono ${i === currentLyricIdx ? 'text-white font-bold' : i < currentLyricIdx ? 'text-gray-500' : 'text-gray-600 hover:text-gray-400 hover:bg-white/[0.03]'}`}
            style={i === currentLyricIdx ? { color: colors[0], textShadow: `0 0 20px ${colors[0]}44` } : {}}
          >
            {line.text}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SpotifyLyrics;
