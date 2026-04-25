# YT Installer

A full-stack web application for downloading YouTube videos and playlists with multiple formats and quality options.

## Features

- Download YouTube videos and playlists
- Multiple formats: MP4, MP3, WebM
- Multiple quality options: 144p, 360p, 720p, 1080p, Best
- Automatic URL type detection (video vs playlist)
- Download progress tracking
- Download queue system
- Download history
- Dark mode support

## Prerequisites

- Node.js 18+
- yt-dlp installed on system

Install yt-dlp:
```bash
# Windows (using scoop)
scoop install yt-dlp

# Windows (via pip)
pip install yt-dlp

# macOS
brew install yt-dlp

# Linux
sudo apt install yt-dlp  # or your distro's package manager
```

## Setup

1. Navigate to the project directory:
```bash
cd yt-installer
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

## Running

1. Start the backend server (in one terminal):
```bash
cd backend
npm start
```
Server runs on http://localhost:3001

2. Start the frontend (in another terminal):
```bash
cd frontend
npm run dev
```
Frontend runs on http://localhost:5173

## Usage

1. Open http://localhost:5173 in your browser
2. Enter a YouTube video or playlist URL
3. Click "Analyze" to get video/playlist info
4. Select format and quality
5. Click "Download" to start download
6. Downloaded files appear in the "Files" tab

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/analyze-url | Analyze video/playlist URL |
| POST | /api/download-video | Start video download |
| POST | /api/download-playlist | Start playlist download |
| GET | /api/progress/:id | Get download progress (SSE) |
| GET | /api/files | List downloaded files |
| GET | /api/history | Get download history |
| POST | /api/cancel/:id | Cancel download |

## Project Structure

```
yt-installer/
+-- backend/
¦   +-- src/
¦   ¦   +-- index.js           # Express server
¦   ¦   +-- config/paths.js  # Path configuration
¦   ¦   +-- services/       # yt-dlp, queue, progress services
¦   +-- package.json
¦   +-- .env
+-- frontend/
    +-- src/
    ¦   +-- App.jsx         # Main React component
    ¦   +-- main.jsx        # React entry point
    ¦   +-- components/      # UI components
    ¦   +-- hooks/          # Custom React hooks
    ¦   +-- services/       # API service
    +-- package.json
    +-- vite.config.js
```
