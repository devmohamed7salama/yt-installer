import { spawn, execSync } from 'child_process';
import https from 'https';
import { URL } from 'url';

function fetchWithTimeout(url, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    
    req.on('error', reject);
    req.setTimeout(timeout, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
    
    req.end();
  });
}

async function getVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export async function analyzeUrl(url) {
  if (!url.includes('youtube.com') && !url.includes('youtu.be') && !url.includes('youtube://')) {
    throw new Error('Invalid YouTube URL');
  }
  
  const isPlaylist = url.includes('playlist') || url.match(/[?&]list=/);
  
  if (isPlaylist) {
    return getPlaylistInfo(url);
  } else {
    return getVideoInfo(url);
  }
}

export async function getVideoInfo(url) {
  try {
    const videoId = await getVideoId(url);
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }

    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const response = await fetchWithTimeout(oembedUrl, 8000);
    const data = JSON.parse(response);
    
    return {
      title: data.title,
      duration: '0:00',
      thumbnail: data.thumbnail_url,
      description: '',
      uploader: data.author_name,
      uploadDate: ''
    };
  } catch (error) {
    const msg = error.message || '';
    if (msg.includes('private') || msg.includes('unavailable') || msg.includes('region')) {
      throw new Error(error.message);
    }
    if (msg === 'Timeout') {
      throw new Error('Connection timeout. Try again.');
    }
    throw new Error('Could not fetch video info. Try again.');
  }
}

export async function getPlaylistInfo(url) {
  try {
    let playlistId = null;
    const playlistMatch = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
    if (playlistMatch) {
      playlistId = playlistMatch[1];
    }
    
    if (!playlistId) {
      return {
        title: 'Playlist',
        videoCount: 0,
        videos: []
      };
    }

    return {
      title: 'Playlist ' + playlistId.slice(0, 8),
      videoCount: 1,
      videos: []
    };
  } catch (error) {
    throw new Error('Could not fetch playlist info.');
  }
}
