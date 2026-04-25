#!/bin/bash

echo "========================================"
echo "  YT Installer - Local Server"
echo "========================================"
echo ""

cd "$(dirname "$0")/backend"

if ! command -v python3 &> /dev/null; then
    echo "❌ Python not found!"
    echo "Install: https://python.org"
    exit 1
fi

if ! command -v yt-dlp &> /dev/null; then
    echo "Installing yt-dlp..."
    pip3 install yt-dlp
fi

echo "[1] Starting backend server..."
echo "    URL: http://localhost:3001"
echo "    Press Ctrl+C to stop"
echo ""

npm start