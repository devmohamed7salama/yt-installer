#!/bin/bash

echo "========================================"
echo "  YT Installer - Frontend"
echo "========================================"
echo ""

cd "$(dirname "$0")/frontend"

echo "[1] Starting frontend server..."
echo "    URL: http://localhost:5173"
echo "    Open this URL in your browser"
echo ""
echo "    Make sure backend is running first!"
echo "    Run: ./run-backend.sh"
echo ""

npm run dev