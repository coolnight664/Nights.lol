import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { parseSpotifyUrl, fetchLyricsBySpotifyId } from '../utils/spotifyLyrics';
import { ArrowLeft, Copy, Check } from 'lucide-react';

const brandSocialIcons = {
  github: ({ className }) => <svg className={className} viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>,
  twitter: ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  instagram: ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>,
  youtube: ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>,
  spotify: ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>,
  tiktok: ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/></svg>,
  discord: ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286z"/></svg>,
  twitch: ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg>,
};

export const PublicBioPage = ({ username: propUsername }) => {
  const { username: paramUsername } = useParams();
  const navigate = useNavigate();
  const { getSiteByUsername, sites, viewCount, incrementViewCount } = useApp();
  const username = propUsername || paramUsername;

  const [entered, setEntered] = useState(false);
  const [splashDone, setSplashDone] = useState(false);
  const [bioText, setBioText] = useState('');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [currentLyricIdx, setCurrentLyricIdx] = useState(-1);
  const [copiedLink, setCopiedLink] = useState(false);
  const [bgLoaded, setBgLoaded] = useState(false);
  const [lyrics, setLyrics] = useState([]);
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const [gatePulse, setGatePulse] = useState(0);
  const lyricsScrollRef = useRef(null);
  const audioRef = useRef(null);
  const spotifyFrameRef = useRef(null);

  const siteData = getSiteByUsername?.(username) || sites?.find(s => s.username === username) || null;
  const displayName = siteData?.displayName || siteData?.name || username || 'Unknown';
  const bio = siteData?.bio || 'Welcome to my nights.lol site ✨';
  const avatarUrl = siteData?.avatar || siteData?.avatarUrl || `https://api.dicebear.com/7.x/glass/svg?seed=${username}`;
  const bgType = siteData?.bgType || 'gradient';
  const bgUrl = siteData?.bgUrl || siteData?.videoUrl || '';
  const imageUrl = siteData?.imageUrl || '';
  const colors = siteData?.siteColors || siteData?.colors || ['#8b5cf6', '#ec4899'];
  const socials = siteData?.socials || {};
  const audioType = siteData?.audioType || 'none';
  const audioUrl = siteData?.audioUrl || '';
  const audioFileData = siteData?.audioFileData || '';
  const spotifyUrl = siteData?.spotifyUrl || '';
  const audioTitle = siteData?.audioTitle || '';
  const audioArtist = siteData?.audioArtist || '';
  const enableSplash = siteData?.enableSplash ?? true;
  const enableTypewriter = siteData?.enableTypewriter ?? true;
  const badges = siteData?.badges || [];
  const storedLyrics = siteData?.lyrics || [];

  const spotifyParsed = parseSpotifyUrl(spotifyUrl);
  const hasSpotify = !!spotifyParsed && spotifyParsed.type === 'track';
  const hasAudioFile = !!(audioFileData && audioType === 'file');
  const hasDirectAudio = !!(audioUrl && audioType === 'url');
  const actualAudioSrc = hasAudioFile ? audioFileData : (hasDirectAudio ? audioUrl : '');
  const hasAnyAudio = hasSpotify || hasAudioFile || hasDirectAudio;

  useEffect(() => { if (username) incrementViewCount?.(username); }, [username]);
  useEffect(() => { if (storedLyrics.length > 0 && lyrics.length === 0) setLyrics(storedLyrics); }, [storedLyrics]);

  useEffect(() => {
    if (!hasSpotify || lyrics.length > 0 || lyricsLoading) return;
    setLyricsLoading(true);
    fetchLyricsBySpotifyId(spotifyParsed.id, audioTitle, audioArtist).then(result => {
      if (result && result.lyrics.length > 0) setLyrics(result.lyrics);
      setLyricsLoading(false);
    });
  }, [hasSpotify, spotifyParsed?.id, audioTitle, audioArtist]);

  useEffect(() => {
    if (!entered) return;
    if (enableSplash) { setSplashDone(false); setTimeout(() => setSplashDone(true), 2200); }
    else setSplashDone(true);
  }, [entered]);

  useEffect(() => {
    if (hasSpotify && spotifyFrameRef.current) {
      try {
        const iframe = spotifyFrameRef.current;
        iframe.style.width = '100%';
        iframe.style.height = '80px';
        iframe.style.position = 'fixed';
        iframe.style.bottom = '0';
        iframe.style.left = '0';
        iframe.style.zIndex = '9999';
        iframe.style.opacity = '0';
        iframe.style.pointerEvents = 'auto';
      } catch (e) {}
    }
    if (actualAudioSrc && audioRef.current) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [entered]);

  const enterSite = useCallback(() => {
    if (entered) return;
    setEntered(true);
  }, [entered]);

  useEffect(() => {
    if (entered) return;
    const h = (e) => { e.preventDefault(); enterSite(); };
    window.addEventListener('keydown', h);
    window.addEventListener('click', h);
    return () => { window.removeEventListener('keydown', h); window.removeEventListener('click', h); };
  }, [entered, enterSite]);

  useEffect(() => {
    if (!splashDone || !enableTypewriter) return;
    if (currentIdx >= bio.length) return;
    const t = setTimeout(() => { setBioText(bio.slice(0, currentIdx + 1)); setCurrentIdx(currentIdx + 1); }, 25 + Math.random() * 25);
    return () => clearTimeout(t);
  }, [currentIdx, bio, splashDone, enableTypewriter]);

  useEffect(() => { if (!splashDone || !enableTypewriter) setBioText(bio); }, [splashDone, bio, enableTypewriter]);

  useEffect(() => {
    if (!audioRef.current || !actualAudioSrc) return;
    const a = audioRef.current;
    const onTime = () => {
      setAudioProgress(a.currentTime);
      setAudioDuration(a.duration || 0);
      const idx = lyrics.findIndex((l, i) => { const next = lyrics[i + 1]; return a.currentTime >= l.time && (!next || a.currentTime < next.time); });
      setCurrentLyricIdx(idx);
    };
    a.addEventListener('timeupdate', onTime);
    a.addEventListener('loadedmetadata', () => setAudioDuration(a.duration));
    return () => a.removeEventListener('timeupdate', onTime);
  }, [actualAudioSrc, lyrics]);

  useEffect(() => {
    if (!lyricsScrollRef.current || currentLyricIdx < 0) return;
    const el = lyricsScrollRef.current.querySelector('[data-active="true"]');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [currentLyricIdx]);

  const seekAudio = useCallback((time) => {
    if (audioRef.current && actualAudioSrc) {
      audioRef.current.currentTime = time;
      if (!isPlaying) { audioRef.current.play(); setIsPlaying(true); }
    }
  }, [actualAudioSrc, isPlaying]);

  const copyLink = () => { navigator.clipboard.writeText(window.location.href); setCopiedLink(true); setTimeout(() => setCopiedLink(false), 1500); };
  const getSocialEntries = () => Object.entries(socials).filter(([, v]) => v && v.trim());

  const renderBackground = () => {
    if (bgType === 'video' && bgUrl) return <video src={bgUrl} className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${bgLoaded ? 'opacity-50' : 'opacity-0'}`} autoPlay muted loop playsInline onLoadedData={() => setBgLoaded(true)} />;
    if (bgType === 'image' && imageUrl) return <img src={imageUrl} className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${bgLoaded ? 'opacity-50' : 'opacity-0'}`} onLoad={() => setBgLoaded(true)} />;
    return <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${colors[0]}33, ${(colors[1] || colors[0])}22, ${colors[0]}11)` }} />;
  };

  if (!siteData && username !== 'owner') {
    return (
      <div className="min-h-screen bg-nights-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl">👻</div>
          <h1 className="text-xl font-bold text-white">User not found</h1>
          <p className="text-sm text-gray-400">coolnight664.github.io/Nights.lol/{username} doesn't exist yet</p>
          <button onClick={() => navigate('/')} className="px-4 py-2 rounded-xl bg-white/[0.06] text-white text-xs font-semibold hover:bg-white/[0.1] transition-all">Go Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
      {renderBackground()}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />

      {hasSpotify && (
        <iframe ref={spotifyFrameRef} src={`https://open.spotify.com/embed/track/${spotifyParsed.id}?utm_source=generator&theme=0&autoplay=1`}
          className="fixed -left-[9999px] -top-[9999px] w-[1px] h-[1px] opacity-0 pointer-events-none" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" title="audio" />
      )}
      {actualAudioSrc && <audio ref={audioRef} src={actualAudioSrc} preload="auto" />}

      {!entered && (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center cursor-pointer" style={{ userSelect: 'none' }}>
          <div className="absolute inset-0">
            <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(circle at 50% 50%, ${colors[0]}44, transparent 70%)`, transform: `scale(${1 + Math.sin(gatePulse * 0.05) * 0.1})` }} />
            {[...Array(20)].map((_, i) => (
              <div key={i} className="absolute rounded-full opacity-10" style={{ width: `${20 + Math.random() * 40}px`, height: `${20 + Math.random() * 40}px`, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, background: colors[i % colors.length], filter: 'blur(30px)', animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`, animationDelay: `${Math.random() * 3}s` }} />
            ))}
          </div>
          <div className="relative z-10 text-center space-y-8 px-4">
            <div className="space-y-2">
              <div className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter" style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1] || colors[0]}, ${colors[0]})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundSize: '200% 200%', animation: 'gradientShift 3s ease infinite' }}>{displayName}</div>
              {audioTitle && <div className="text-sm text-white/30 font-mono">{audioTitle}{audioArtist ? ` — ${audioArtist}` : ''}</div>}
            </div>
            <div className="space-y-3">
              <div className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl border text-white font-bold text-lg md:text-xl tracking-wide" style={{ borderColor: `${colors[0]}44`, background: `${colors[0]}11`, boxShadow: `0 0 ${30 + Math.sin(gatePulse * 0.08) * 15}px ${colors[0]}22`, animation: 'pulse 2s ease-in-out infinite' }}>
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>
                PRESS ANY KEY
              </div>
              <div className="text-xs text-white/20 font-mono">to enter & play music</div>
            </div>
          </div>
        </div>
      )}

      {!splashDone && entered && enableSplash && (
        <div className="absolute inset-0 z-50 bg-black flex items-center justify-center">
          <div className="text-center space-y-4">
            {displayName.split('').map((char, i) => (
              <span key={i} className="splash-char inline-block text-4xl md:text-6xl font-black" style={{ animationDelay: `${i * 0.08}s`, color: colors[i % colors.length] }}>{char === ' ' ? '\u00A0' : char}</span>
            ))}
          </div>
        </div>
      )}

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="flex flex-row items-stretch gap-5 max-w-[980px] w-full" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>

          <div className="w-[460px] max-w-[92vw] rounded-3xl p-8 text-left" style={{ background: 'hsla(0,0%,4%,0.6)', backdropFilter: 'blur(30px)', border: '1px solid hsla(0,0%,100%,0.1)', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
            <div className="mb-5">
              <div className="relative w-[120px] h-[120px] rounded-full overflow-hidden border-2 border-white/10 transition-all hover:scale-105 hover:border-white/30">
                <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="flex items-center gap-2.5 mb-1">
              <h1 className="text-[1.8rem] font-bold text-white leading-tight">{displayName}</h1>
              {badges.includes('Verified') && <div className="w-[22px] h-[22px] rounded-md bg-cyan-500 flex items-center justify-center"><svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></div>}
              {badges.includes('OG') && <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold border border-amber-500/30">OG</span>}
            </div>

            <div className="text-[0.8rem] text-white/50 mb-4 tracking-wide">@{username}</div>

            <div className="flex justify-center items-center mb-6 min-h-[30px]">
              <div className="inline-block relative">
                <span className="text-[0.85rem] font-bold text-white/85 tracking-wide whitespace-nowrap">{enableTypewriter ? bioText : bio}</span>
                {enableTypewriter && currentIdx < bio.length && <div className="absolute w-[2px] h-[18px] bg-white/70 animate-pulse" style={{ top: '50%', transform: 'translateY(-50%)', left: '100%' }} />}
              </div>
            </div>

            {getSocialEntries().length > 0 && (
              <div className="flex gap-6 flex-wrap justify-center mb-5">
                {getSocialEntries().map(([platform, value]) => {
                  const Icon = brandSocialIcons[platform];
                  if (!Icon) return null;
                  const url = platform === 'github' ? `https://github.com/${value}` : platform === 'twitter' ? `https://x.com/${value}` : platform === 'instagram' ? `https://instagram.com/${value}` : platform === 'tiktok' ? `https://tiktok.com/@${value}` : platform === 'twitch' ? `https://twitch.tv/${value}` : value;
                  return (
                    <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white hover:-translate-y-[3px] transition-all duration-300">
                      <Icon className="w-8 h-8" />
                    </a>
                  );
                })}
              </div>
            )}

            <div className="flex justify-center gap-2 mt-4">
              <button onClick={copyLink} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] text-gray-300 text-xs font-semibold hover:bg-white/[0.1] transition-all">
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedLink ? 'Copied!' : 'Share'}
              </button>
            </div>
          </div>

          <div className="w-[460px] max-w-[92vw] rounded-3xl flex flex-col justify-between min-h-[200px] pb-0" style={{ background: 'hsla(0,0%,4%,0.6)', backdropFilter: 'blur(30px)', border: '1px solid hsla(0,0%,100%,0.1)', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
            {(lyrics.length > 0 || lyricsLoading) && entered ? (
              <div className="w-full relative overflow-hidden flex-1" style={{ height: '280px', maskImage: 'linear-gradient(180deg, transparent 0, #000 20%, #000 80%, transparent)', WebkitMaskImage: 'linear-gradient(180deg, transparent 0, #000 20%, #000 80%, transparent)' }}>
                <div ref={lyricsScrollRef} className="w-full flex flex-col items-center gap-4 overflow-y-auto scroll-smooth" style={{ height: '280px', padding: '120px 16px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  <style>{`.lyrics-scroll::-webkit-scrollbar { display: none; }`}</style>
                  {lyrics.map((line, i) => {
                    const isActive = i === currentLyricIdx;
                    const isPast = i < currentLyricIdx;
                    const isBacking = line.text.startsWith('(') && line.text.endsWith(')');
                    let className = 'w-full text-center px-2 py-1 rounded-lg cursor-pointer transition-all duration-500 flex-shrink-0 ';
                    let style = {};

                    if (isActive) {
                      className += 'text-white font-bold opacity-100';
                      style = { transform: 'scale(1.08)', filter: 'blur(0)', textShadow: '0 0 12px rgba(255,255,255,0.55), 0 0 30px rgba(255,255,255,0.3), 0 0 60px rgba(255,255,255,0.15)', animation: 'lyricGlowPulse 2.4s ease-in-out infinite' };
                      if (isBacking) { className += ' text-[0.82rem] italic tracking-wide -mt-2'; style.opacity = '1'; style.transform = 'scale(1.02)'; style.textShadow = '0 0 8px rgba(255,255,255,0.3), 0 0 20px rgba(255,255,255,0.15)'; }
                    } else if (isPast) {
                      className += ' text-white/30 opacity-50';
                      style = { transform: 'scale(0.95)', filter: 'blur(0.4px)' };
                      if (isBacking) { className += ' text-[0.82rem] italic tracking-wide -mt-2 opacity-40'; style.transform = 'scale(0.93)'; }
                    } else {
                      className += ' text-white/45 opacity-60';
                      style = { transform: 'scale(0.97)', filter: 'blur(0.3px)' };
                      if (isBacking) { className += ' text-[0.82rem] italic tracking-wide -mt-2 opacity-50'; style.transform = 'scale(0.95)'; }
                    }

                    return (
                      <button key={i} data-active={isActive} onClick={() => seekAudio(line.time)} className={className} style={style}>
                        {line.text}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[280px]">
                {lyricsLoading ? (
                  <div className="flex gap-2 items-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0s' }} />
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.8s' }} />
                  </div>
                ) : (
                  <div className="text-sm text-white/30 font-mono">No lyrics available</div>
                )}
              </div>
            )}

            {audioTitle && (
              <div className="px-5 pb-4">
                <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'hsla(0,0%,100%,0.05)', border: '1px solid hsla(0,0%,100%,0.1)' }}>
                  <div className="flex items-end gap-[3px] h-4">
                    {[0, 0.15, 0.3, 0.45].map((d, i) => (
                      <div key={i} className="w-[3px] rounded-full" style={{ background: 'hsla(0,0%,100%,0.5)', height: isPlaying ? `${6 + Math.sin(Date.now() * 0.003 + i * 1.5) * 8}px` : '4px', animation: isPlaying ? `nowPlayingBar 1.2s ease-in-out infinite ${d}s` : 'none' }} />
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[0.72rem] font-semibold text-white truncate">{audioTitle}</div>
                    <div className="text-[0.64rem] text-white/50 truncate">{audioArtist}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      <style>{`
        @keyframes lyricGlowPulse {
          0%, 100% { text-shadow: 0 0 12px rgba(255,255,255,0.55), 0 0 30px rgba(255,255,255,0.3), 0 0 60px rgba(255,255,255,0.15); }
          50% { text-shadow: 0 0 18px rgba(255,255,255,0.8), 0 0 45px rgba(255,255,255,0.5), 0 0 90px rgba(255,255,255,0.25); }
        }
        @keyframes nowPlayingBar {
          0%, 100% { transform: scaleY(0.4); opacity: 0.4; }
          50% { transform: scaleY(1); opacity: 1; }
        }
      `}</style>

      <button onClick={() => navigate('/')} className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 text-white/20 text-xs hover:text-purple-400 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Create your own
      </button>
    </div>
  );
};

export default PublicBioPage;
