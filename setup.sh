#!/bin/bash

echo "========================================"
echo "  YT Installer - Local Setup Script"
echo "========================================"
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python not found! Please install Python 3.8+"
    echo "Download: https://python.org"
    exit 1
fi
echo "✓ Python found: $(python3 --version)"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found! Please install Node.js 18+"
    echo "Download: https://nodejs.org"
    exit 1
fi
echo "✓ Node.js found: $(node --version)"

# Check yt-dlp
if ! command -v yt-dlp &> /dev/null; then
    echo "Installing yt-dlp..."
    pip3 install yt-dlp
fi
echo "✓ yt-dlp found"

# Install backend
echo ""
echo "[1/2] Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Backend install failed"
    exit 1
fi
echo "✓ Backend ready"

# Install frontend
echo ""
echo "[2/2] Installing frontend dependencies..."
cd ../frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Frontend install failed"
    exit 1
fi
echo "✓ Frontend ready"

echo ""
echo "========================================"
echo "  Setup Complete!"
echo "========================================"
echo ""
echo "To run the app:"
echo ""
echo "  Terminal 1: cd backend && npm start"
echo "  Terminal 2: cd frontend && npm run dev"
echo ""
echo "  Then open: http://localhost:5173"
echo "========================================"