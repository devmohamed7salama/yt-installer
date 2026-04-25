# YT Installer

A **local-only** YouTube video and playlist downloader.

## Requirements

1. **Node.js 18+**: https://nodejs.org
2. **Python 3.8+**: https://python.org
3. **yt-dlp**: `pip install yt-dlp`
4. **ffmpeg** (optional): Needed for video conversion

## Quick Start (Windows)

### Method 1: Click start.bat

Double-click `start.bat` - it will open both servers automatically!

### Method 2: Manual

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Then open: **http://localhost:5173**

## Features

- Download YouTube videos (MP4, MP3, WebM)
- Download playlists
- Quality selection (360p, 720p, 1080p, Best)
- Download progress tracking
- Dark mode support
- Responsive design

## Project Structure

```
yt-installer/
├── backend/
│   ├── src/
│   │   ├── index.js          # Express server
│   │   ├── config/paths.js  # Path config
│   │   └── services/      # yt-dlp, queue, progress
│   ├── package.json
│   └── downloads/         # Downloaded files
├── frontend/
│   ├── src/
│   │   ├── App.jsx       # Main app
│   │   └── services/api.js
│   ├── package.json
│   └── index.html
├── start.bat            # Quick start script
├── setup-local.bat     # Dependency checker
└── README.md
```

## Troubleshooting

### "python not found"
- Install Python from https://python.org
- Restart terminal after install

### "yt-dlp not found"
```bash
pip install yt-dlp
```

### Download fails on some videos
- YouTube may block certain videos
- Try a different video format or quality