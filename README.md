# YT Installer

A full-stack web application for downloading YouTube videos and playlists.

## ⚠️ Cloud Deployment Note

Deploying to free cloud services (Railway, Render, Vercel) is currently blocked by YouTube's rate limiting (HTTP 429). For production use, please run locally or use a VPS.

## Local Setup (Recommended)

### Prerequisites

1. **Node.js 18+**: https://nodejs.org
2. **Python 3.8+**: https://python.org
3. **yt-dlp**: `pip install yt-dlp`
4. **ffmpeg**: Required for video conversion

#### Install yt-dlp:
```bash
# Windows
pip install yt-dlp

# macOS
brew install yt-dlp

# Linux
sudo apt install yt-dlp
```

#### Install ffmpeg:
```bash
# Windows (via scoop)
scoop install ffmpeg

# macOS
brew install ffmpeg

# Linux
sudo apt install ffmpeg
```

### Setup

```bash
# Clone the repo
git clone https://github.com/devmohamed7salama/yt-installer.git
cd yt-installer

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Running

**Terminal 1 - Backend:**
```bash
cd backend
npm start
# Server runs on http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# App runs on http://localhost:5173
```

### Usage

1. Open http://localhost:5173
2. Enter YouTube URL
3. Click "Analyze"
4. Select format (MP4/MP3) and quality
5. Click "Download"

## Cloud Deployment (Limited)

For deployment on cloud services, you'll need:
- A VPS with dedicated IP (DigitalOcean, AWS, etc.)
- Or use a YouTube API key

Railway/Render free tiers are blocked by YouTube.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/analyze-url | Get video info |
| POST | /api/download-video | Start download |
| POST | /api/download-playlist | Start playlist |
| GET | /api/progress/:id | Progress stream |
| GET | /api/files | List downloads |
| POST | /api/cancel/:id | Cancel download |

## Project Structure

```
yt-installer/
├── backend/
│   ├── src/
│   │   ├── index.js
│   │   ├── config/paths.js
│   │   └── services/
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── services/api.js
│   ├── package.json
│   └── vite.config.js
├── README.md
└── deployment.md
```

## Troubleshooting

### "python not found"
Make sure Python is in your PATH. Verify with: `python --version`

### "yt-dlp not found"
Install: `pip install yt-dlp`

### YouTube 429 Error
YouTube blocks cloud IPs. Run locally for best results.