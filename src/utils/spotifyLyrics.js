export function parseSpotifyUrl(url) {
  if (!url) return null;
  const typeMatch = url.match(/open\.spotify\.com\/(track|album|playlist|artist|episode|show)\/([a-zA-Z0-9]{22})/);
  if (typeMatch) return { type: typeMatch[1], id: typeMatch[2] };
  const shortMatch = url.match(/spotify\.link\/([a-zA-Z0-9]+)/);
  if (shortMatch) return { type: 'track', id: shortMatch[1] };
  return null;
}

function parseLrc(lrcText) {
  if (!lrcText) return [];
  const lines = lrcText.split('\n');
  const result = [];
  for (const line of lines) {
    const match = line.match(/^\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)$/);
    if (match) {
      const min = parseInt(match[1]);
      const sec = parseInt(match[2]);
      const ms = parseInt(match[3].padEnd(3, '0'));
      const time = min * 60 + sec + ms / 1000;
      const text = match[4].trim();
      if (text) result.push({ time, text });
    }
  }
  return result.sort((a, b) => a.time - b.time);
}

export function parseSrt(srtText) {
  if (!srtText) return [];
  const blocks = srtText.trim().replace(/\r\n/g, '\n').split(/\n\n+/);
  const result = [];
  for (const block of blocks) {
    const lines = block.split('\n');
    if (lines.length < 2) continue;
    let timeLine = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('-->')) { timeLine = i; break; }
    }
    if (timeLine === -1) continue;
    const timeMatch = lines[timeLine].match(/(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[,.](\d{3})/);
    if (!timeMatch) continue;
    const start = parseInt(timeMatch[1]) * 3600 + parseInt(timeMatch[2]) * 60 + parseInt(timeMatch[3]) + parseInt(timeMatch[4]) / 1000;
    const text = lines.slice(timeLine + 1).join('\n').trim().replace(/<[^>]+>/g, '');
    if (text) result.push({ time: start, text });
  }
  return result.sort((a, b) => a.time - b.time);
}

async function lrclibGet(params) {
  const res = await fetch(`https://lrclib.net/api/get?${new URLSearchParams(params).toString()}`, {
    headers: { 'User-Agent': 'Nights.lol/1.0' },
  });
  if (!res.ok) return null;
  return res.json();
}

async function lrclibSearch(q) {
  const res = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(q)}`, {
    headers: { 'User-Agent': 'Nights.lol/1.0' },
  });
  if (!res.ok) return [];
  return res.json();
}

export async function fetchLyrics(trackName, artistName) {
  const direct = await lrclibGet({ track_name: trackName, artist_name: artistName });
  if (direct) {
    const lrc = direct.syncedLyrics || direct.plainLyrics;
    if (lrc) return { lyrics: parseLrc(lrc), source: 'synced' };
  }

  const results = await lrclibSearch(`${trackName} ${artistName}`);
  if (results.length > 0) {
    const best = results.find(r => r.syncedLyrics) || results[0];
    const lrc = best.syncedLyrics || best.plainLyrics;
    if (lrc) return { lyrics: parseLrc(lrc), source: 'synced' };
  }

  return { lyrics: [], source: 'none' };
}

export async function fetchLyricsBySpotifyId(trackId, trackName, artistName) {
  if (trackName && artistName) {
    return fetchLyrics(trackName, artistName);
  }

  const data = await lrclibGet({ spotify_id: trackId });
  if (data) {
    const lrc = data.syncedLyrics || data.plainLyrics;
    if (lrc) return { lyrics: parseLrc(lrc), source: 'synced', trackName: data.trackName, artistName: data.artistName };
  }

  return { lyrics: [], source: 'none' };
}
