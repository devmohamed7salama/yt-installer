import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { paths, config } from './config/paths.js';
import { analyzeUrl, getVideoInfo, getPlaylistInfo } from './services/ytDlpService.js';
import { addToQueue, getQueue, cancelDownload, getHistory, clearHistory } from './services/queueService.js';
import { startProgressStream, updateProgress, cancelProgress } from './services/progressService.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const downloads = new Map();

function detectUrlType(url) {
  const playlistPatterns = [
    /youtube\.com\/playlist\?list=/i,
    /youtube\.com\/watch\?.*list=/i,
    /youtu\.be\/.*\?list=/i,
  ];
  for (const pattern of playlistPatterns) {
    if (pattern.test(url)) return 'playlist';
  }
  if (url.includes('youtube.com/watch') || url.includes('youtu.be/')) {
    return 'video';
  }
  return null;
}

app.post('/api/analyze-url', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const type = detectUrlType(url);
    if (!type) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    if (type === 'video') {
      const info = await getVideoInfo(url);
      return res.json({
        type: 'video',
        url,
        title: info.title,
        duration: info.duration,
        thumbnail: info.thumbnail,
        availableFormats: ['MP4', 'MP3', 'WebM'],
        availableQualities: ['144p', '360p', '720p', '1080p', 'Best']
      });
    } else {
      const info = await getPlaylistInfo(url);
      return res.json({
        type: 'playlist',
        url,
        title: info.title,
        videoCount: info.videoCount,
        videos: info.videos,
        availableFormats: ['MP4', 'MP3', 'WebM'],
        availableQualities: ['144p', '360p', '720p', '1080p', 'Best']
      });
    }
  } catch (error) {
    console.error('Analyze error:', error.message);
    if (error.message.includes('private')) {
      return res.status(403).json({ error: 'Video is private' });
    }
    if (error.message.includes('unavailable')) {
      return res.status(403).json({ error: 'Video is unavailable' });
    }
    if (error.message.includes('region')) {
      return res.status(403).json({ error: 'Video is region-locked' });
    }
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/download-video', async (req, res) => {
  try {
    const { url, format, quality } = req.body;
    if (!url || !format || !quality) {
      return res.status(400).json({ error: 'URL, format, and quality are required' });
    }
    
    console.log('Download request:', { url, format, quality });

    const id = uuidv4();
    const download = {
      id,
      url,
      format,
      quality,
      status: 'queued',
      progress: 0,
      createdAt: new Date().toISOString()
    };
    
    downloads.set(id, download);
    addToQueue(download);
    
    res.json({ id, message: 'Download started' });
    
    await processDownload(id, url, format, quality);
  } catch (error) {
    console.error('Download error:', error.message);
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/download-playlist', async (req, res) => {
  try {
    const { url, format, quality } = req.body;
    if (!url || !format || !quality) {
      return res.status(400).json({ error: 'URL, format, and quality are required' });
    }

    const id = uuidv4();
    const download = {
      id,
      url,
      format,
      quality,
      type: 'playlist',
      status: 'queued',
      progress: 0,
      createdAt: new Date().toISOString()
    };
    
    downloads.set(id, download);
    addToQueue(download);
    
    res.json({ id, message: 'Playlist download queued' });
    
    processPlaylistDownload(id, url, format, quality);
  } catch (error) {
    console.error('Playlist download error:', error.message);
    res.status(400).json({ error: error.message });
  }
});

async function processDownload(id, url, format, quality) {
  const download = downloads.get(id);
  if (!download) return;
  
  download.status = 'downloading';
  updateProgress(id, { status: 'downloading', progress: 0 });
  
  console.log('=== DOWNLOAD STARTED ===');
  console.log('URL:', url);
  console.log('Format:', format, 'Quality:', quality);
  console.log('Downloads folder:', paths.downloads);
  console.log('========================');
  
  try {
    const { spawn } = await import('child_process');
    
    const outputPath = paths.downloads;
    
    let finalArgs;
    
    if (format === 'MP3') {
      finalArgs = [
        '-m', 'yt_dlp',
        '--extract-audio',
        '--audio-format', 'mp3',
        '--audio-quality', '0',
        '-o', path.join(outputPath, '%(title)s.%(ext)s'),
        url
      ];
    } else {
      let formatStr = 'best';
      if (quality === '1080p') formatStr = 'bestvideo[height<=1080]+bestaudio/best';
      else if (quality === '720p') formatStr = 'bestvideo[height<=720]+bestaudio/best';
      else if (quality === '360p') formatStr = 'bestvideo[height<=360]+bestaudio/best';
      
      finalArgs = [
        '-m', 'yt_dlp',
        '-f', formatStr,
        '-o', path.join(outputPath, '%(title)s.%(ext)s'),
        url
      ];
    }
    
    console.log('Command: python', finalArgs.join(' '));
    
    const proc = spawn('python', finalArgs, { 
      cwd: paths.root,
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    download.process = proc;
    
    let stderrBuffer = '';
    
    proc.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('[yt-dlp out]', output.trim());
      
      const progressMatch = output.match(/(\d+\.?\d*)%/);
      if (progressMatch) {
        const progress = parseFloat(progressMatch[1]);
        download.progress = progress;
        updateProgress(id, { progress, status: 'downloading' });
      }
    });
    
    proc.stderr.on('data', (data) => {
      stderrBuffer += data.toString();
      console.log('[yt-dlp err]', data.toString().trim());
    });
    
    proc.on('close', (code) => {
      console.log('Download process exit code:', code);
      if (code === 0) {
        download.status = 'completed';
        download.progress = 100;
        updateProgress(id, { status: 'completed', progress: 100 });
      } else if (download.status !== 'cancelled') {
        download.status = 'failed';
        updateProgress(id, { status: 'failed', error: 'Exit code: ' + code });
      }
    });
    
    proc.on('error', (err) => {
      console.error('Process ERROR:', err.message);
      download.status = 'failed';
      updateProgress(id, { status: 'failed', error: err.message });
    });
    
  } catch (error) {
    console.error('Download ERROR:', error.message);
    download.status = 'failed';
    updateProgress(id, { status: 'failed', error: error.message });
  }
}

async function processPlaylistDownload(id, url, format, quality) {
  const download = downloads.get(id);
  if (!download) return;
  
  download.status = 'downloading';
  updateProgress(id, { status: 'downloading', progress: 0 });
  
  try {
    const { spawn } = await import('child_process');
    
const formatArgs = getFormatArgs(format, quality);
    const args = [
      '-m', 'yt_dlp',
      '--quiet',
      '--progress',
      '--yes-playlist',
      '--no-warn',
      '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      '--extractor-args', 'youtube:player_client=web',
      '-o', `${paths.downloads}/%(playlist_title)s/%(title)s.%(ext)s`,
      '-f', formatArgs,
      url
    ];
    
    if (format === 'MP3') {
      args.push('--extract-audio', '--audio-format', 'mp3');
    }
    
    const proc = spawn('python', args, { cwd: paths.root });
    download.process = proc;
    
    let currentVideo = 0;
    let totalVideos = 0;
    
    proc.stdout.on('data', (data) => {
      const output = data.toString();
      const videoMatch = output.match(/Downloading (\d+) of (\d+) videos?/);
      if (videoMatch) {
        currentVideo = parseInt(videoMatch[1]);
        totalVideos = parseInt(videoMatch[2]);
        download.currentVideo = currentVideo;
        download.totalVideos = totalVideos;
        const progress = ((currentVideo / totalVideos) * 100);
        download.progress = progress;
        updateProgress(id, { progress, currentVideo, totalVideos, status: 'downloading' });
      }
      const progressMatch = output.match(/(\d+\.?\d*)%/);
      if (progressMatch && totalVideos > 0) {
        const videoProgress = parseFloat(progressMatch[1]);
        const overallProgress = (((currentVideo - 1) / totalVideos) * 100) + (videoProgress / totalVideos);
        download.progress = overallProgress;
        updateProgress(id, { progress: overallProgress, currentVideo, totalVideos, status: 'downloading' });
      }
    });
    
    proc.stderr.on('data', (data) => {
      console.error('python stderr:', data.toString());
    });
    
    proc.on('close', (code) => {
      if (code === 0) {
        download.status = 'completed';
        download.progress = 100;
        updateProgress(id, { status: 'completed', progress: 100 });
      } else if (download.status !== 'cancelled') {
        download.status = 'failed';
        updateProgress(id, { status: 'failed', error: 'Download failed' });
      }
    });
    
  } catch (error) {
    download.status = 'failed';
    updateProgress(id, { status: 'failed', error: error.message });
  }
}

function getFormatArgs(format, quality) {
  const qualityMap = {
    '144p': 'worstvideo[height<=144]',
    '360p': 'bestvideo[height<=360]',
    '720p': 'bestvideo[height<=720]',
    '1080p': 'bestvideo[height<=1080]',
    'Best': 'bestvideo'
  };
  
  const videoFormat = qualityMap[quality] || 'bestvideo';
  
  if (format === 'MP3') {
    return 'bestaudio';
  } else if (format === 'WebM') {
    return `${videoFormat}[ext=webm]+bestaudio[ext=webm]/best[ext=webm]`;
  } else {
    return `${videoFormat}+bestaudio/best`;
  }
}

app.get('/api/progress/:id', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  const { id } = req.params;
  startProgressStream(id, res);
  
  res.write(': keepalive\n\n');
  
  req.on('close', () => {
    cancelProgress(id);
  });
});

app.get('/api/files', (req, res) => {
  try {
    const fs = require('fs');
    let files = [];
    
    if (fs.existsSync(paths.downloads)) {
      const items = fs.readdirSync(paths.downloads, { withFileTypes: true });
      for (const item of items) {
        const fullPath = `${paths.downloads}/${item.name}`;
        try {
          if (item.isFile()) {
            const stats = fs.statSync(fullPath);
            if (!item.name.startsWith('.')) {
              files.push({
                name: item.name,
                path: fullPath,
                size: stats.size,
                createdAt: stats.birthtime
              });
            }
          } else if (item.isDirectory()) {
            const subItems = fs.readdirSync(fullPath);
            for (const subItem of subItems) {
              const subFullPath = `${fullPath}/${subItem}`;
              const stats = fs.statSync(subFullPath);
              files.push({
                name: subItem,
                path: subFullPath,
                size: stats.size,
                createdAt: stats.birthtime,
                folder: item.name
              });
            }
          }
        } catch (err) {
          console.error('Error reading file:', err.message);
        }
      }
    }
    
    files.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ files });
  } catch (error) {
    console.error('Files error:', error.message);
    res.json({ files: [] });
  }
});

app.get('/api/queue', (req, res) => {
  res.json({ queue: getQueue() });
});

app.post('/api/cancel/:id', (req, res) => {
  const { id } = req.params;
  const download = downloads.get(id);
  
  if (!download) {
    return res.status(404).json({ error: 'Download not found' });
  }
  
  if (download.process) {
    download.process.kill();
  }
  
  download.status = 'cancelled';
  cancelDownload(id);
  cancelProgress(id);
  
  res.json({ message: 'Download cancelled' });
});

app.get('/api/history', (req, res) => {
  const history = getHistory();
  res.json({ history });
});

app.delete('/api/history', (req, res) => {
  clearHistory();
  res.json({ message: 'History cleared' });
});

app.use('/api/files/download', express.static(paths.downloads));

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
