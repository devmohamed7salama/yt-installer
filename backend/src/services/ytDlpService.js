import { spawn, execSync } from 'child_process';

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
    const output = execSync(`python -m yt_dlp --dump-json --no-playlist "${url}"`, {
      encoding: 'utf-8',
      timeout: 30000
    });
    
    const info = JSON.parse(output);
    return {
      title: info.title,
      duration: info.duration,
      thumbnail: info.thumbnail,
      description: info.description,
      uploader: info.uploader,
      uploadDate: info.upload_date
    };
  } catch (error) {
    if (error.message.includes('private')) {
      throw new Error('Video is private');
    }
    if (error.message.includes('unavailable')) {
      throw new Error('Video is unavailable');
    }
    if (error.message.includes('region')) {
      throw new Error('Video is region-locked');
    }
    throw error;
  }
}

export async function getPlaylistInfo(url) {
  try {
    const output = execSync(`python -m yt_dlp --flat-playlist --dump-json "${url}"`, {
      encoding: 'utf-8',
      timeout: 30000
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
    if (error.message.includes('private')) {
      throw new Error('Playlist contains private videos');
    }
    if (error.message.includes('unavailable')) {
      throw new Error('Playlist contains unavailable videos');
    }
    throw error;
  }
}
