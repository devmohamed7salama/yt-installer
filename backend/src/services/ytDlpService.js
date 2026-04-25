import { spawn, execSync } from 'child_process';

const YT_DLP_OPTS = [
  '--no-playlist',
  '--no-warn',
  '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  '--extractor-args', 'youtube:player_client=web,default_client=web',
  '--extractor-args', 'youtube:player_skip=webpage,configs',
  '--geo-bypass',
  '--no-check-certificates'
];

export async function analyzeUrl(url) {
  if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
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
    const args = [...YT_DLP_OPTS, '--dump-json', url];
    const output = execSync(`python3 -m yt_dlp ${args.join(' ')}`, {
      encoding: 'utf-8',
      timeout: 60000,
      maxBuffer: 10 * 1024 * 1024
    });
    
    const info = JSON.parse(output);
    return {
      title: info.title,
      duration: formatDuration(info.duration),
      thumbnail: info.thumbnail,
      description: info.description,
      uploader: info.uploader,
      uploadDate: info.upload_date
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
      throw new Error('YouTube rate limited. Please try again later.');
    }
    if (msg.includes('Sign in to confirm')) {
      throw new Error('YouTube is blocking. Please try a different video.');
    }
    throw new Error('Could not fetch video info. Try again.');
  }
}

export async function getPlaylistInfo(url) {
  try {
    const args = [...YT_DLP_OPTS, '--flat-playlist', '--dump-json', url];
    const output = execSync(`python3 -m yt_dlp ${args.join(' ')}`, {
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
      videos: videos.map(v => ({
        title: v.title,
        id: v.id,
        duration: v.duration,
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

function formatDuration(seconds) {
  if (!seconds) return 'Unknown';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
