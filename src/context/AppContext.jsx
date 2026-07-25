import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AppContext = createContext();

export const OWNER_DISCORD_ID = '1530317959661228162';

const INITIAL_SITES = [
  {
    id: 'site-owner',
    username: 'owner',
    ownerDiscordId: OWNER_DISCORD_ID,
    displayName: 'NightLord',
    bio: 'Creator & Administrator of Nights.lol',
    avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    bannerUrl: '',
    useDiscordProfile: true,
    badges: ['Owner', 'Staff', 'Verified', 'VIP'],
    isBanned: false,
    banReason: '',
    bgType: 'video',
    bgUrl: 'https://assets.mixkit.co/videos/preview/mixkit-abstract-glowing-neon-lines-41551-large.mp4',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-abstract-glowing-neon-lines-41551-large.mp4',
    imageUrl: '',
    accentColor: '#8b5cf6',
    siteColors: ['#8b5cf6', '#ec4899'],
    cardOpacity: 75,
    blurIntensity: 18,
    glowSpots: [
      { id: 'spot-1', color: '#8b5cf6', size: 320, top: 15, left: 10, blur: 85, pulse: true },
      { id: 'spot-2', color: '#ec4899', size: 280, top: 55, left: 75, blur: 90, pulse: true },
    ],
    audioType: 'url',
    audioTitle: 'STARBOY',
    audioArtist: 'The Weeknd ft. Daft Punk',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
    audioFileData: '',
    audioFileType: '',
    spotifyUrl: '',
    autoPlayOnEnter: true,
    volume: 85,
    showAudioSlider: true,
    showEqualizerWave: true,
    enableSplash: true,
    enableTypewriter: true,
    layoutStyle: 'lyrics',
    lyrics: [
      { time: 0, text: "(Intro - Synth Wave Pulse)" },
      { time: 6, text: "I'm tryna put you in the worst mood, ah" },
      { time: 10, text: "P1 cleaner than your church shoes, ah" },
      { time: 14, text: "Milli point two just to hurt you, ah" },
      { time: 18, text: "All red Lamb' just to tease you, ah" },
      { time: 22, text: "None of these toys on lease too, ah" },
      { time: 26, text: "Made your whole year in a week too, yah" },
      { time: 30, text: "Main bitch out your league too, ah" },
      { time: 34, text: "Side bitch out of your league too, ah" },
      { time: 38, text: "Look what you've done! I'm a starboy" },
      { time: 43, text: "Every day a nigga try to test me, ah" },
      { time: 47, text: "Every day a nigga try to end me, ah" },
      { time: 52, text: "Pull up in the Roadster SV, ah" },
      { time: 56, text: "Look what you've done! I'm a starboy" }
    ],
    socials: {
      github: '', twitter: '', instagram: '', youtube: '',
      spotify: '', tiktok: '', discord: '', twitch: '',
    },
    layoutMode: 'canvas',
    gridSnapSize: 10,
    links: [
      { id: 'l1', title: 'Discord Server', url: 'https://discord.gg', icon: 'discord', x: 0, y: 0, glowColor: '#5865F2' },
      { id: 'l2', title: 'Spotify', url: 'https://spotify.com', icon: 'spotify', x: 0, y: 65, glowColor: '#1DB954' },
      { id: 'l3', title: 'Twitter / X', url: 'https://twitter.com', icon: 'twitter', x: 0, y: 130, glowColor: '#1DA1F2' },
      { id: 'l4', title: 'YouTube', url: 'https://youtube.com', icon: 'youtube', x: 0, y: 195, glowColor: '#FF0000' }
    ],
    advanced: { customHtml: '', customCss: '', customJs: '', importedAssets: [] }
  },
  {
    id: 'site-cyber',
    username: 'cyber',
    ownerDiscordId: '987654321012345678',
    displayName: 'CyberViper',
    bio: 'Digital nomad & synthwave enthusiast.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    bannerUrl: '',
    useDiscordProfile: false,
    badges: ['OG', 'Artist'],
    isBanned: false,
    banReason: '',
    bgType: 'gradient',
    bgUrl: '',
    videoUrl: '',
    imageUrl: '',
    accentColor: '#06b6d4',
    siteColors: ['#06b6d4', '#10b981'],
    cardOpacity: 80,
    blurIntensity: 20,
    glowSpots: [
      { id: 'spot-1', color: '#06b6d4', size: 300, top: 30, left: 50, blur: 80, pulse: true }
    ],
    audioType: 'url',
    audioTitle: 'Cyberpunk Chill',
    audioArtist: 'synth_master',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a8e1b0.mp3?filename=synthwave-80s-110045.mp3',
    audioFileData: '',
    audioFileType: '',
    spotifyUrl: '',
    autoPlayOnEnter: true,
    volume: 75,
    showAudioSlider: true,
    showEqualizerWave: true,
    enableSplash: true,
    enableTypewriter: true,
    layoutStyle: 'minimal',
    lyrics: [
      { time: 0, text: "(Cyber Synth Beats)" },
      { time: 5, text: "Neon lights reflecting on the rainy street" },
      { time: 10, text: "Midnight runners moving to the electric beat" },
      { time: 15, text: "Welcome to the digital frontier" }
    ],
    socials: {
      github: '', twitter: '', instagram: '', youtube: '',
      spotify: '', tiktok: '', discord: '', twitch: '',
    },
    layoutMode: 'stack',
    gridSnapSize: 20,
    links: [
      { id: 'cl1', title: 'Twitch', url: 'https://twitch.tv', icon: 'twitch', x: 0, y: 0, glowColor: '#9146FF' },
      { id: 'cl2', title: 'TikTok', url: 'https://tiktok.com', icon: 'tiktok', x: 0, y: 60, glowColor: '#00F2FE' }
    ],
    advanced: { customHtml: '', customCss: '', customJs: '', importedAssets: [] }
  }
];

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('nights_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [sites, setSites] = useState(() => {
    const saved = localStorage.getItem('nights_sites');
    return saved ? JSON.parse(saved) : INITIAL_SITES;
  });

  const [bannedDiscordIds, setBannedDiscordIds] = useState(() => {
    const saved = localStorage.getItem('nights_banned_discords');
    return saved ? JSON.parse(saved) : [];
  });

  const [viewCount, setViewCount] = useState(() => {
    const saved = localStorage.getItem('nights_views');
    return saved ? JSON.parse(saved) : {};
  });

  const [activeSiteUsername, setActiveSiteUsername] = useState('owner');

  const safeSet = (key, value) => {
    try { localStorage.setItem(key, value); }
    catch (e) { console.warn(`localStorage full (${key})`); }
  };

  useEffect(() => {
    safeSet('nights_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    safeSet('nights_sites', JSON.stringify(sites));
  }, [sites]);

  useEffect(() => {
    safeSet('nights_banned_discords', JSON.stringify(bannedDiscordIds));
  }, [bannedDiscordIds]);

  useEffect(() => {
    safeSet('nights_views', JSON.stringify(viewCount));
  }, [viewCount]);

  const loginWithDiscordData = (id, username, avatar, discriminator) => {
    if (bannedDiscordIds.includes(id)) {
      alert('Your Discord account has been banned from Nights.lol.');
      return false;
    }

    const isOwner = id === OWNER_DISCORD_ID;

    const user = {
      id,
      username,
      avatar,
      discriminator,
      isOwner,
      siteUsername: isOwner ? 'owner' : 'user' + id.slice(-4),
    };

    setCurrentUser(user);
    setActiveSiteUsername(user.siteUsername);

    const existingSite = sites.find(s => s.ownerDiscordId === id);
    if (!existingSite) {
      const newSite = {
        id: 'site-' + Date.now(),
        username: user.siteUsername,
        ownerDiscordId: id,
        displayName: username,
        bio: 'Welcome to my Nights.lol page!',
        avatarUrl: avatar,
        bannerUrl: '',
        useDiscordProfile: true,
        badges: isOwner ? ['Owner', 'Staff', 'Verified'] : ['Member'],
        isBanned: false,
        banReason: '',
        bgType: 'gradient',
        bgUrl: '',
        videoUrl: '',
        imageUrl: '',
        accentColor: '#8b5cf6',
        siteColors: ['#8b5cf6', '#ec4899'],
        cardOpacity: 75,
        blurIntensity: 16,
        glowSpots: [],
        audioType: 'none',
        audioTitle: '',
        audioArtist: '',
        audioUrl: '',
        audioFileData: '',
        audioFileType: '',
        spotifyUrl: '',
        autoPlayOnEnter: true,
        volume: 80,
        showAudioSlider: true,
        showEqualizerWave: true,
        enableSplash: true,
        enableTypewriter: true,
        layoutStyle: 'lyrics',
        lyrics: [],
        socials: {
          github: '', twitter: '', instagram: '', youtube: '',
          spotify: '', tiktok: '', discord: '', twitch: '',
        },
        layoutMode: 'canvas',
        gridSnapSize: 10,
        links: [],
        advanced: { customHtml: '', customCss: '', customJs: '', importedAssets: [] }
      };
      setSites(prev => [...prev, newSite]);
    }

    return true;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const getSiteByUsername = useCallback((username) => {
    return sites.find(s => s.username === username) || null;
  }, [sites]);

  const getSiteByUserId = useCallback((userId) => {
    return sites.find(s => s.ownerDiscordId === userId) || null;
  }, [sites]);

  const incrementViewCount = useCallback((username) => {
    setViewCount(prev => ({
      ...prev,
      [username]: (prev[username] || 0) + 1
    }));
  }, []);

  const updateSite = (usernameOrFields, maybeFields) => {
    if (typeof usernameOrFields === 'string' && maybeFields) {
      setSites(prev => prev.map(site => {
        if (site.username === usernameOrFields) {
          return { ...site, ...maybeFields };
        }
        return site;
      }));
    } else if (typeof usernameOrFields === 'object' && currentUser) {
      const username = currentUser.siteUsername;
      setSites(prev => prev.map(site => {
        if (site.username === username) {
          return { ...site, ...usernameOrFields };
        }
        return site;
      }));
    }
  };

  const updateUser = (userId, updatedFields) => {
    setSites(prev => prev.map(site => {
      if (site.ownerDiscordId === userId || site.id === userId) {
        return { ...site, ...updatedFields };
      }
      return site;
    }));
  };

  const deleteUser = (userId) => {
    setSites(prev => prev.filter(s => s.ownerDiscordId !== userId && s.id !== userId));
  };

  const toggleBanSite = (username, reason = 'TOS Violation') => {
    setSites(prev => prev.map(site => {
      if (site.username === username) {
        const nextBanned = !site.isBanned;
        if (nextBanned && site.ownerDiscordId) {
          setBannedDiscordIds(b => [...new Set([...b, site.ownerDiscordId])]);
        } else if (!nextBanned && site.ownerDiscordId) {
          setBannedDiscordIds(b => b.filter(id => id !== site.ownerDiscordId));
        }
        return { ...site, isBanned: nextBanned, banReason: reason };
      }
      return site;
    }));
  };

  const addBadgeToSite = (username, badge) => {
    setSites(prev => prev.map(site => {
      if (site.username === username && !site.badges.includes(badge)) {
        return { ...site, badges: [...site.badges, badge] };
      }
      return site;
    }));
  };

  const removeBadgeFromSite = (username, badge) => {
    setSites(prev => prev.map(site => {
      if (site.username === username) {
        return { ...site, badges: site.badges.filter(b => b !== badge) };
      }
      return site;
    }));
  };

  const deleteSite = (username) => {
    setSites(prev => prev.filter(s => s.username !== username));
  };

  const checkUsernameAvailable = (requestedName) => {
    const clean = requestedName.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
    const taken = sites.some(s => s.username.toLowerCase() === clean);
    if (!taken) return { available: true, name: clean, suggestions: [] };
    return {
      available: false,
      name: clean,
      suggestions: [`${clean}_og`, `real_${clean}`, `the_${clean}`, `${clean}x`, `${clean}lol`]
    };
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      sites,
      siteDatabase: sites,
      users: sites,
      bannedDiscordIds,
      viewCount,
      activeSiteUsername,
      setActiveSiteUsername,
      loginWithDiscordData,
      logout,
      updateSite,
      updateUser,
      deleteUser,
      toggleBanSite,
      addBadgeToSite,
      removeBadgeFromSite,
      deleteSite,
      checkUsernameAvailable,
      getSiteByUsername,
      getSiteByUserId,
      incrementViewCount,
      OWNER_DISCORD_ID,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
