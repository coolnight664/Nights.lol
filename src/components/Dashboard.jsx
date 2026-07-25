import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { parseSpotifyUrl, fetchLyricsBySpotifyId, fetchLyrics, parseSrt } from '../utils/spotifyLyrics';
import { Eye, Save, Palette, Music, Image, Code, Globe, Type, Upload, X, Plus, Film, Link as LinkIcon } from 'lucide-react';

const DEFAULT_COLORS = ['#8b5cf6','#ec4899','#06b6d4','#10b981','#f59e0b','#ef4444','#6366f1','#14b8a6'];

const fileToDataURL = (file) => new Promise((resolve) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.readAsDataURL(file);
});

const SocialInput = ({ icon: Icon, color, placeholder, value, onChange }) => (
  <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5 focus-within:border-white/[0.12] transition-colors">
    <Icon className="w-4 h-4 shrink-0" style={{ color }} />
    <input type="text" placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} className="w-full bg-transparent text-white text-xs focus:outline-none placeholder-gray-600" />
  </div>
);

const FileUpload = ({ accept, label, icon: Icon, currentPreview, onFile, onClear, color, maxSize }) => {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (file) => {
    if (!file) return;
    if (maxSize && file.size > maxSize) {
      setError(`File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max ${(maxSize / 1024 / 1024).toFixed(0)}MB.`);
      return;
    }
    setError('');
    const dataUrl = await fileToDataURL(file);
    onFile(dataUrl, file.type, file.name);
  };

  return (
    <div
      className={`relative rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden ${dragOver ? 'border-purple-400 bg-purple-500/10' : 'border-white/[0.08] hover:border-white/[0.15] bg-white/[0.02]'}`}
      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
      onClick={() => inputRef.current?.click()}
    >
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={e => handleFile(e.target.files[0])} />
      {currentPreview ? (
        <div className="relative">
          {accept.includes('video') ? (
            <video src={currentPreview} className="w-full h-28 object-cover" muted />
          ) : accept.includes('audio') ? (
            <div className="w-full h-16 flex items-center gap-3 px-4" style={{ background: `${color}15` }}>
              <Icon className="w-5 h-5 shrink-0" style={{ color }} />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white truncate">Audio loaded</div>
                <div className="text-[10px] text-gray-500 font-mono">Click to replace</div>
              </div>
            </div>
          ) : (
            <img src={currentPreview} className="w-full h-28 object-cover" alt="" />
          )}
          <button onClick={e => { e.stopPropagation(); onClear(); }} className="absolute top-2 right-2 p-1 rounded-lg bg-black/60 text-white hover:bg-red-500/60 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
          <div className="py-6 flex flex-col items-center gap-2 text-gray-500">
          <Icon className="w-6 h-6" />
          <div className="text-xs font-semibold">{label}</div>
          <div className="text-[10px] text-gray-600">Drag & drop or click to browse</div>
          {maxSize && <div className="text-[10px] text-gray-600">Max {(maxSize / 1024 / 1024).toFixed(0)}MB</div>}
          {error && <div className="text-[10px] text-red-400 font-semibold">{error}</div>}
        </div>
      )}
    </div>
  );
};

export const Dashboard = () => {
  const { currentUser, updateSite, getSiteByUsername } = useApp();
  const [form, setForm] = useState(() => {
    const site = getSiteByUsername(currentUser?.siteUsername) || {};
    return {
      displayName: site.displayName || currentUser?.username || '',
      bio: site.bio || 'Welcome to my nights.lol site ✨',
      avatarUrl: site.avatarUrl || currentUser?.avatar || '',
      bgType: site.bgType || 'gradient',
      bgUrl: site.bgUrl || site.videoUrl || '',
      imageUrl: site.imageUrl || '',
      videoFileData: site.videoFileData || '',
      imageFileData: site.imageFileData || '',
      colors: site.siteColors || site.colors || ['#8b5cf6', '#ec4899'],
      audioSource: site.audioFileData ? 'file' : 'url',
      audioUrl: site.audioUrl || '',
      audioFileData: site.audioFileData || '',
      audioFileType: site.audioFileType || '',
      audioTitle: site.audioTitle || '',
      audioArtist: site.audioArtist || '',
      spotifyUrl: site.spotifyUrl || '',
      lyrics: site.lyrics || [],
      socials: site.socials || {
        github: '', twitter: '', instagram: '', youtube: '',
        spotify: '', tiktok: '', discord: '', twitch: '',
      },
      layoutStyle: site.layoutStyle || 'lyrics',
      enableSplash: site.enableSplash ?? true,
      enableTypewriter: site.enableTypewriter ?? true,
    };
  });
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');
  const [spotifyLoading, setSpotifyLoading] = useState(false);
  const [spotifyError, setSpotifyError] = useState('');
  const [manualLyrics, setManualLyrics] = useState(false);
  const [fetchingLyrics, setFetchingLyrics] = useState(false);

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    const siteUpdate = {
      displayName: form.displayName,
      bio: form.bio,
      avatarUrl: form.avatarUrl,
      bgType: form.bgType,
      bgUrl: form.bgType === 'video' ? (form.videoFileData || form.bgUrl) : (form.bgType === 'image' ? (form.imageFileData || form.imageUrl) : ''),
      videoUrl: form.bgType === 'video' ? (form.videoFileData || form.bgUrl) : '',
      imageUrl: form.bgType === 'image' ? (form.imageFileData || form.imageUrl) : '',
      videoFileData: form.videoFileData,
      imageFileData: form.imageFileData,
      siteColors: form.colors,
      audioType: form.audioSource === 'file' ? 'file' : (form.spotifyUrl ? 'spotify' : 'url'),
      audioUrl: form.audioSource === 'file' ? '' : form.audioUrl,
      audioFileData: form.audioFileData,
      audioFileType: form.audioFileType,
      audioTitle: form.audioTitle,
      audioArtist: form.audioArtist,
      spotifyUrl: form.spotifyUrl,
      lyrics: form.lyrics,
      socials: form.socials,
      layoutStyle: form.layoutStyle,
      enableSplash: form.enableSplash,
      enableTypewriter: form.enableTypewriter,
    };
    updateSite(siteUpdate);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleColorChange = (index, value) => {
    const newColors = [...form.colors];
    newColors[index] = value;
    handleChange('colors', newColors);
  };

  const addColor = () => {
    if (form.colors.length < 5) handleChange('colors', [...form.colors, DEFAULT_COLORS[form.colors.length % DEFAULT_COLORS.length]]);
  };

  const removeColor = (index) => {
    if (form.colors.length > 1) handleChange('colors', form.colors.filter((_, i) => i !== index));
  };

  const addLyricLine = () => {
    handleChange('lyrics', [...form.lyrics, { time: 0, text: '' }]);
  };

  const updateLyricLine = (index, field, value) => {
    const newLyrics = [...form.lyrics];
    newLyrics[index] = { ...newLyrics[index], [field]: value };
    handleChange('lyrics', newLyrics);
  };

  const removeLyricLine = (index) => {
    handleChange('lyrics', form.lyrics.filter((_, i) => i !== index));
  };

  const handleSpotifyUrl = async (url) => {
    handleChange('spotifyUrl', url);
    const parsed = parseSpotifyUrl(url);
    if (!parsed) {
      setSpotifyError('Paste any Spotify link (track, album, playlist, artist, episode, show)');
      return;
    }
    setSpotifyError('');
    setSpotifyLoading(true);
    setFetchingLyrics(true);
    try {
      const res = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(`https://open.spotify.com/${parsed.type}/${parsed.id}`)}&format=json`);
      const data = await res.json();
      if (data.title) {
        handleChange('audioTitle', data.title);
        setForm(prev => ({ ...prev, audioTitle: data.title }));
      }
      if (data.author_name) {
        setForm(prev => ({ ...prev, audioArtist: data.author_name }));
      }
      setForm(prev => ({ ...prev, spotifyEmbedType: parsed.type, spotifyEmbedId: parsed.id }));

      if (parsed.type === 'track') {
        const lyricResult = await fetchLyricsBySpotifyId(parsed.id, data.title, data.author_name);
        if (lyricResult && lyricResult.lyrics.length > 0) {
          handleChange('lyrics', lyricResult.lyrics);
        }
      }
    } catch (e) {
      setSpotifyError('Could not fetch info — embed will still work');
    }
    setSpotifyLoading(false);
    setFetchingLyrics(false);
  };

  const sections = [
    { id: 'profile', label: 'Profile', icon: Type },
    { id: 'background', label: 'Background', icon: Image },
    { id: 'theme', label: 'Theme', icon: Palette },
    { id: 'audio', label: 'Audio', icon: Music },
    { id: 'socials', label: 'Socials', icon: Globe },
    { id: 'advanced', label: 'Advanced', icon: Code },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">Site Studio</h1>
          <p className="text-xs text-gray-500 font-mono">coolnight664.github.io/Nights.lol/{currentUser?.siteUsername || 'user'}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => window.open(`/${currentUser?.siteUsername || 'owner'}`, '_blank')} className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-gray-400 text-xs font-semibold hover:bg-white/[0.08] transition-all flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" /> Preview
          </button>
          <button onClick={handleSave} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg ${saved ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white shadow-purple-500/20'}`}>
            {saved ? 'Saved!' : <><Save className="w-3.5 h-3.5" /> Save Changes</>}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-48 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible shrink-0 pb-1 lg:pb-0">
          {sections.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveSection(id)} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${activeSection === id ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]'}`}>
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>

        <div className="flex-1 min-w-0 space-y-4">

          {activeSection === 'profile' && (
            <Section title="Profile">
              <Field label="Display Name">
                <input type="text" value={form.displayName} onChange={e => handleChange('displayName', e.target.value)} className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-purple-500/40 transition-colors" />
              </Field>
              <Field label="Bio">
                <textarea value={form.bio} onChange={e => handleChange('bio', e.target.value)} rows={3} className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-purple-500/40 transition-colors resize-none" />
              </Field>
              <Field label="Avatar URL">
                <div className="flex items-center gap-2">
                  <input type="text" value={form.avatarUrl} onChange={e => handleChange('avatarUrl', e.target.value)} placeholder="https://..." className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-purple-500/40 transition-colors" />
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.06] shrink-0">
                    {form.avatarUrl ? <img src={form.avatarUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-600"><Image className="w-4 h-4" /></div>}
                  </div>
                </div>
              </Field>
            </Section>
          )}

          {activeSection === 'background' && (
            <Section title="Background">
              <Field label="Type">
                <div className="grid grid-cols-3 gap-2">
                  {[{id:'gradient', label:'Gradient', icon:Palette}, {id:'image', label:'Image', icon:Image}, {id:'video', label:'Video', icon:Film}].map(t => (
                    <button key={t.id} onClick={() => handleChange('bgType', t.id)} className={`px-3 py-2.5 rounded-xl text-xs font-semibold transition-all border flex items-center justify-center gap-1.5 ${form.bgType === t.id ? 'bg-purple-500/15 border-purple-500/30 text-purple-300' : 'bg-white/[0.03] border-white/[0.06] text-gray-400 hover:border-white/[0.1]'}`}>
                      <t.icon className="w-3.5 h-3.5" /> {t.label}
                    </button>
                  ))}
                </div>
              </Field>

              {form.bgType === 'gradient' && (
                <Field label="Gradient Colors">
                  <div className="grid grid-cols-3 gap-2">
                    {[['#8b5cf6','#ec4899'], ['#06b6d4','#10b981'], ['#f59e0b','#ef4444'], ['#6366f1','#8b5cf6'], ['#ec4899','#f97316'], ['#14b8a6','#06b6d4']].map(([a, b], i) => (
                      <button key={i} onClick={() => handleChange('colors', [a, b])} className="h-8 rounded-lg overflow-hidden flex border border-white/[0.06] hover:border-white/[0.12] transition-all">
                        <div className="flex-1" style={{ background: a }} /><div className="flex-1" style={{ background: b }} />
                      </button>
                    ))}
                  </div>
                </Field>
              )}

              {form.bgType === 'image' && (
                <>
                  <Field label="Image URL">
                    <input type="text" value={form.imageUrl} onChange={e => handleChange('imageUrl', e.target.value)} placeholder="https://..." className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-purple-500/40 transition-colors" />
                  </Field>
                  <Field label="Or Upload Image">
                    <FileUpload accept="image/*" label="Upload background image" icon={Image} currentPreview={form.imageFileData || form.imageUrl} onFile={(data) => handleChange('imageFileData', data)} onClear={() => { handleChange('imageFileData', ''); handleChange('imageUrl', ''); }} color={form.colors[0]} />
                  </Field>
                </>
              )}

              {form.bgType === 'video' && (
                <>
                  <Field label="Video URL">
                    <input type="text" value={form.bgUrl} onChange={e => handleChange('bgUrl', e.target.value)} placeholder="https://example.com/video.mp4" className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-purple-500/40 transition-colors" />
                  </Field>
                  <Field label="Or Upload Video">
                    <FileUpload accept="video/mp4,video/webm,video/*" label="Upload background video" icon={Film} currentPreview={form.videoFileData || form.bgUrl} onFile={(data) => handleChange('videoFileData', data)} onClear={() => { handleChange('videoFileData', ''); handleChange('bgUrl', ''); }} color={form.colors[0]} />
                  </Field>
                </>
              )}

              <Field label="Preview">
                <div className="w-full h-32 rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.06]">
                  {form.bgType === 'video' && (form.videoFileData || form.bgUrl) ? (
                    <video src={form.videoFileData || form.bgUrl} className="w-full h-full object-cover" muted loop autoPlay playsInline />
                  ) : form.bgType === 'image' && (form.imageFileData || form.imageUrl) ? (
                    <img src={form.imageFileData || form.imageUrl} className="w-full h-full object-cover" alt="" />
                  ) : form.bgType === 'gradient' ? (
                    <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${form.colors[0]}, ${form.colors[1] || form.colors[0]})` }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">No background set</div>
                  )}
                </div>
              </Field>
            </Section>
          )}

          {activeSection === 'theme' && (
            <Section title="Theme">
              <Field label="Colors">
                <div className="space-y-2">
                  {form.colors.map((color, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input type="color" value={color} onChange={e => handleColorChange(i, e.target.value)} className="w-8 h-8 rounded-lg border-0 cursor-pointer bg-transparent" />
                      <input type="text" value={color} onChange={e => handleColorChange(i, e.target.value)} className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none" />
                      {form.colors.length > 1 && <button onClick={() => removeColor(i)} className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"><X className="w-3.5 h-3.5" /></button>}
                    </div>
                  ))}
                  {form.colors.length < 5 && (
                    <button onClick={addColor} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.03] border border-dashed border-white/[0.08] text-gray-400 text-xs hover:border-purple-500/30 hover:text-purple-300 transition-all">
                      <Plus className="w-3.5 h-3.5" /> Add Color
                    </button>
                  )}
                </div>
              </Field>
              <Field label="Layout Style">
                <div className="grid grid-cols-2 gap-2">
                  {[{id: 'lyrics', label: 'Lyrics Card'}, {id: 'minimal', label: 'Minimal'}, {id: 'gallery', label: 'Gallery'}, {id: 'retro', label: 'Retro'}].map(s => (
                    <button key={s.id} onClick={() => handleChange('layoutStyle', s.id)} className={`px-3 py-2.5 rounded-xl text-xs font-semibold transition-all border ${form.layoutStyle === s.id ? 'bg-purple-500/15 border-purple-500/30 text-purple-300' : 'bg-white/[0.03] border-white/[0.06] text-gray-400 hover:border-white/[0.1]'}`}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Features">
                <div className="space-y-2">
                  <Toggle label="Enable Splash Screen" checked={form.enableSplash} onChange={v => handleChange('enableSplash', v)} />
                  <Toggle label="Enable Typewriter Bio" checked={form.enableTypewriter} onChange={v => handleChange('enableTypewriter', v)} />
                </div>
              </Field>
            </Section>
          )}

          {activeSection === 'audio' && (
            <Section title="Audio">
              <Field label="Audio Source">
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => handleChange('audioSource', 'url')} className={`px-3 py-2.5 rounded-xl text-xs font-semibold transition-all border flex items-center justify-center gap-1.5 ${form.audioSource === 'url' ? 'bg-purple-500/15 border-purple-500/30 text-purple-300' : 'bg-white/[0.03] border-white/[0.06] text-gray-400 hover:border-white/[0.1]'}`}>
                    <LinkIcon className="w-3.5 h-3.5" /> URL / Spotify
                  </button>
                  <button onClick={() => handleChange('audioSource', 'file')} className={`px-3 py-2.5 rounded-xl text-xs font-semibold transition-all border flex items-center justify-center gap-1.5 ${form.audioSource === 'file' ? 'bg-purple-500/15 border-purple-500/30 text-purple-300' : 'bg-white/[0.03] border-white/[0.06] text-gray-400 hover:border-white/[0.1]'}`}>
                    <Upload className="w-3.5 h-3.5" /> Upload MP3
                  </button>
                </div>
              </Field>

              {form.audioSource === 'url' && (
                <>
                  <Field label="Spotify Track URL">
                    <input type="text" value={form.spotifyUrl} onChange={e => handleSpotifyUrl(e.target.value)} placeholder="Any Spotify URL (track, album, playlist, artist...)" className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-green-500/40 transition-colors" />
                    {spotifyLoading && <div className="text-[10px] text-green-400 font-mono mt-1">Fetching track info...</div>}
                    {fetchingLyrics && <div className="text-[10px] text-purple-400 font-mono mt-1">Auto-fetching lyrics...</div>}
                    {spotifyError && <div className="text-[10px] text-red-400 font-mono mt-1">{spotifyError}</div>}
                    {form.spotifyUrl && parseSpotifyUrl(form.spotifyUrl) && !spotifyLoading && (
                      <div className="mt-2 rounded-xl overflow-hidden border border-white/[0.06]">
                        <iframe
                          src={`https://open.spotify.com/embed/${parseSpotifyUrl(form.spotifyUrl).type}/${parseSpotifyUrl(form.spotifyUrl).id}?utm_source=generator&theme=0`}
                          width="100%" height="80" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                          loading="lazy" className="rounded-xl"
                        />
                      </div>
                    )}
                  </Field>
                  <Field label="Or Direct Audio URL">
                    <input type="text" value={form.audioUrl} onChange={e => handleChange('audioUrl', e.target.value)} placeholder="https://example.com/song.mp3" className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-purple-500/40 transition-colors" />
                  </Field>
                </>
              )}

              {form.audioSource === 'file' && (
                <Field label="Upload Audio File (MP3, WAV, OGG)">
                  <FileUpload accept="audio/mpeg,audio/wav,audio/ogg,audio/mp3,audio/*" label="Upload audio file" icon={Music} currentPreview={form.audioFileData ? 'loaded' : ''} onFile={(data, type) => { handleChange('audioFileData', data); handleChange('audioFileType', type); }} onClear={() => { handleChange('audioFileData', ''); handleChange('audioFileType', ''); }} color={form.colors[0]} maxSize={4 * 1024 * 1024} />
                </Field>
              )}

              <Field label="Track Title">
                <input type="text" value={form.audioTitle} onChange={e => handleChange('audioTitle', e.target.value)} placeholder="Song name" className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-purple-500/40 transition-colors" />
              </Field>
              <Field label="Artist">
                <input type="text" value={form.audioArtist} onChange={e => handleChange('audioArtist', e.target.value)} placeholder="Artist name" className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-purple-500/40 transition-colors" />
              </Field>

              <Field label="Lyrics">
                <div className="flex items-center gap-2 mb-2">
                  <button onClick={() => setManualLyrics(!manualLyrics)} className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${manualLyrics ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30' : 'bg-white/[0.03] border border-white/[0.06] text-gray-400'}`}>
                    {manualLyrics ? 'Manual Entry' : 'Paste / Edit'}
                  </button>
                  <label className="px-3 py-1.5 rounded-lg text-[10px] font-semibold bg-white/[0.03] border border-white/[0.06] text-gray-400 cursor-pointer hover:border-purple-500/30 hover:text-purple-300 transition-all">
                    <input type="file" accept=".srt,.vtt,.lrc" className="hidden" onChange={e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        const text = reader.result;
                        if (file.name.endsWith('.srt') || file.name.endsWith('.vtt')) {
                          handleChange('lyrics', parseSrt(text));
                        } else {
                          const lines = text.split('\n').filter(Boolean).map(line => {
                            const match = line.match(/^\[?([\d:.]+)\]?\s*(.*)$/);
                            return match ? { time: parseFloat(match[1]) || 0, text: match[2] } : { time: 0, text: line };
                          });
                          handleChange('lyrics', lines);
                        }
                      };
                      reader.readAsText(file);
                      e.target.value = '';
                    }} />
                    Upload .srt
                  </label>
                  <span className="text-[10px] text-gray-600">{form.lyrics.length} lines</span>
                </div>
                {manualLyrics ? (
                  <textarea
                    value={form.lyrics.map(l => `${l.time} ${l.text}`).join('\n')}
                    onChange={e => {
                      const lines = e.target.value.split('\n').filter(Boolean).map(line => {
                        const match = line.match(/^([\d.]+)\s+(.*)$/);
                        return match ? { time: parseFloat(match[1]), text: match[2] } : { time: 0, text: line };
                      });
                      handleChange('lyrics', lines);
                    }}
                    placeholder={"0 Intro line\n5 First line of lyrics\n10 Second line..."}
                    rows={6}
                    className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5 text-white text-xs font-mono focus:outline-none focus:border-purple-500/40 transition-colors resize-none"
                  />
                ) : (
                  <div className="space-y-2">
                    {form.lyrics.map((line, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input type="number" step="0.1" value={line.time} onChange={e => updateLyricLine(i, 'time', parseFloat(e.target.value) || 0)} className="w-20 bg-white/[0.03] border border-white/[0.06] rounded-lg px-2 py-1.5 text-white text-[10px] font-mono focus:outline-none text-center" />
                        <input type="text" value={line.text} onChange={e => updateLyricLine(i, 'text', e.target.value)} placeholder="lyrics text..." className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none" />
                        <button onClick={() => removeLyricLine(i)} className="p-1 rounded-md text-gray-600 hover:text-red-400 transition-colors"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                    <button onClick={addLyricLine} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.03] border border-dashed border-white/[0.08] text-gray-400 text-xs hover:border-purple-500/30 hover:text-purple-300 transition-all">
                      <Plus className="w-3.5 h-3.5" /> Add Lyric
                    </button>
                  </div>
                )}
              </Field>
            </Section>
          )}

          {activeSection === 'socials' && (
            <Section title="Social Links">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <SocialInput icon={({className}) => <svg className={className} viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>} color="#8b5cf6" placeholder="GitHub username" value={form.socials.github} onChange={v => handleChange('socials', { ...form.socials, github: v })} />
                <SocialInput icon={({className}) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>} color="#06b6d4" placeholder="X / Twitter handle" value={form.socials.twitter} onChange={v => handleChange('socials', { ...form.socials, twitter: v })} />
                <SocialInput icon={({className}) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>} color="#ec4899" placeholder="Instagram username" value={form.socials.instagram} onChange={v => handleChange('socials', { ...form.socials, instagram: v })} />
                <SocialInput icon={({className}) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>} color="#ef4444" placeholder="YouTube channel URL" value={form.socials.youtube} onChange={v => handleChange('socials', { ...form.socials, youtube: v })} />
                <SocialInput icon={({className}) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>} color="#10b981" placeholder="Spotify profile URL" value={form.socials.spotify} onChange={v => handleChange('socials', { ...form.socials, spotify: v })} />
                <SocialInput icon={({className}) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/></svg>} color="#06b6d4" placeholder="TikTok username" value={form.socials.tiktok} onChange={v => handleChange('socials', { ...form.socials, tiktok: v })} />
                <SocialInput icon={({className}) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286z"/></svg>} color="#5865F2" placeholder="Discord ID" value={form.socials.discord} onChange={v => handleChange('socials', { ...form.socials, discord: v })} />
                <SocialInput icon={({className}) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg>} color="#9146FF" placeholder="Twitch username" value={form.socials.twitch} onChange={v => handleChange('socials', { ...form.socials, twitch: v })} />
              </div>
            </Section>
          )}

          {activeSection === 'advanced' && (
            <Section title="Advanced Settings">
              <Field label="Site URL">
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5 text-xs font-mono">
                  <span className="text-gray-500">coolnight664.github.io/Nights.lol/</span>
                  <span className="text-white">{currentUser?.siteUsername || 'user'}</span>
                </div>
              </Field>
            </Section>
          )}
        </div>

        <div className="w-full lg:w-64 shrink-0">
          <div className="sticky top-20 bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.06] p-4 space-y-3">
            <h3 className="text-xs font-bold text-white">Live Preview</h3>
            <div className="aspect-[9/16] rounded-xl overflow-hidden bg-black/40 border border-white/[0.06] relative">
              {form.bgType === 'video' && (form.videoFileData || form.bgUrl) ? (
                <video src={form.videoFileData || form.bgUrl} className="absolute inset-0 w-full h-full object-cover opacity-40" muted loop autoPlay playsInline />
              ) : form.bgType === 'image' && (form.imageFileData || form.imageUrl) ? (
                <img src={form.imageFileData || form.imageUrl} className="absolute inset-0 w-full h-full object-cover opacity-40" alt="" />
              ) : (
                <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${form.colors[0]}22, ${(form.colors[1] || form.colors[0])}22)` }} />
              )}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-10">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 mb-2">
                  {form.avatarUrl ? <img src={form.avatarUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-white/10 flex items-center justify-center text-white text-xs font-bold">{form.displayName?.[0]?.toUpperCase()}</div>}
                </div>
                <div className="text-[10px] font-bold text-white truncate max-w-full">{form.displayName}</div>
                <div className="text-[8px] text-gray-300 line-clamp-2 mt-0.5">{form.bio}</div>
                {form.lyrics.length > 0 && (
                  <div className="mt-2 text-[8px] text-gray-400 italic line-clamp-3">"{form.lyrics[0]?.text}"</div>
                )}
              </div>
            </div>
            <div className="flex gap-1 flex-wrap">
              {form.colors.map((c, i) => (
                <div key={i} className="w-5 h-5 rounded-md border border-white/20" style={{ background: c }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, children }) => (
  <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.06] p-5 space-y-4">
    <h3 className="text-sm font-bold text-white">{title}</h3>
    {children}
  </div>
);

const Field = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</label>
    {children}
  </div>
);

const Toggle = ({ label, checked, onChange }) => (
  <label className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] cursor-pointer hover:bg-white/[0.05] transition-colors">
    <span className="text-xs text-gray-300">{label}</span>
    <div className={`w-9 h-5 rounded-full transition-colors relative ${checked ? 'bg-purple-500' : 'bg-white/10'}`} onClick={() => onChange(!checked)}>
      <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-[3px] transition-transform ${checked ? 'translate-x-[18px]' : 'translate-x-[3px]'}`} />
    </div>
  </label>
);

export default Dashboard;
