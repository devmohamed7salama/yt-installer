@echo off
chcp 65001 >nul
title YT Installer Local

echo ========================================
echo   YT Installer - Local Server
echo ========================================
echo.

cd /d "%~dp0backend"

echo [1] Checking prerequisites...
python --version >nul 2>&1
if errorlevel 1 (
    echo   ERROR: Python not found!
    echo   Install Python: https://python.org
    pause
    exit /b 1
)

where yt-dlp >nul 2>&1
if errorlevel 1 (
    echo   Installing yt-dlp...
    pip install yt-dlp
)

echo.
echo [2] Starting backend server...
echo   URL: http://localhost:3001
echo   Press Ctrl+C to stop
echo.

npm start

pause