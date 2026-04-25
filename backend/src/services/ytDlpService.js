import { execSync } from 'child_process';

function getVideoId(url) {
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

function formatDuration(seconds) {
  if (!seconds) return 'N/A';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export async function getVideoInfo(url) {
  try {
    const videoId = getVideoId(url);
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }

    const output = execSync(`python -m yt_dlp --dump-json --no-playlist "${url}"`, {
      encoding: 'utf-8',
      timeout: 30000,
      maxBuffer: 10 * 1024 * 1024
    });
    
    const info = JSON.parse(output);
    return {
      title: info.title,
      duration: formatDuration(info.duration),
      thumbnail: info.thumbnail,
      description: info.description || '',
      uploader: info.uploader || '',
      uploadDate: info.upload_date || ''
    };
  } catch (error) {
    const msg = error.message || '';
    if (msg.includes('private')) {
      throw new Error('Video is private');
    }
    if (msg.includes('unavailable')) {
      throw new Error('Video is unavailable');
    }
    if (msg.includes('region')) {
      throw new Error('Video is region-locked');
    }
    if (msg.includes('429') || msg.includes('Too Many Requests')) {
      throw new Error('YouTube rate limited. Try again later.');
    }
    throw new Error('Could not fetch video info. Check yt-dlp is installed.');
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

    const output = execSync(`python -m yt_dlp --flat-playlist --dump-json "${url}"`, {
      encoding: 'utf-8',
      timeout: 60000,
      maxBuffer: 20 * 1024 * 1024
    });
    
    const videos = output.split('\n').filter(line => line.trim()).map(line => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    }).filter(Boolean);
    
    const playlistTitle = videos[0]?.playlist_title || 'Playlist';
    
    return {
      title: playlistTitle,
      videoCount: videos.length,
      videos: videos.slice(0, 20).map(v => ({
        title: v.title,
        id: v.id,
        duration: formatDuration(v.duration),
        thumbnail: v.thumbnail
      }))
    };
  } catch (error) {
    const msg = error.message || '';
    if (msg.includes('private')) {
      throw new Error('Playlist contains private videos');
    }
    if (msg.includes('unavailable')) {
      throw new Error('Playlist contains unavailable videos');
    }
    throw new Error('Could not fetch playlist info.');
  }
}