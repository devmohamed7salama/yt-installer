@echo off
chcp 65001 >nul
title YT Installer Setup

echo ========================================
echo   YT Installer - Dependency Checker
echo ========================================
echo.

echo [1/5] Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo   ERROR: Node.js not found!
    echo   Download: https://nodejs.org
    pause
    exit /b 1
)
echo   ✓ Node.js found

echo [2/5] Checking Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo   ERROR: Python not found!
    echo   Download: https://python.org
    pause
    exit /b 1
)
echo   ✓ Python found

echo [3/5] Checking yt-dlp...
where yt-dlp >nul 2>&1
if errorlevel 1 (
    echo   Installing yt-dlp...
    pip install yt-dlp
    if errorlevel 1 (
        echo   ERROR: Failed to install yt-dlp
        pause
        exit /b 1
    )
)
echo   ✓ yt-dlp found

echo [4/5] Checking ffmpeg...
where ffmpeg >nul 2>&1
if errorlevel 1 (
    echo   WARNING: ffmpeg not found (needed for video conversion)
    echo   Install with: pip install ffmpeg or scoop install ffmpeg
    echo.
)

echo [5/5] Installing backend dependencies...
cd /d "%~dp0backend"
call npm install
if errorlevel 1 (
    echo   ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)
echo   ✓ Backend dependencies installed

echo.
cd /d "%~dp0frontend"
call npm install
if errorlevel 1 (
    echo   ERROR: Failed to install frontend dependencies
    pause
    exit /b 1
)
echo   ✓ Frontend dependencies installed

echo.
echo ========================================
echo   All Set! Ready to run.
echo ========================================
echo.
echo Run these in separate terminals:
echo.
echo Terminal 1: cd backend ^& npm start
echo Terminal 2: cd frontend ^& npm run dev
echo.
echo Then open: http://localhost:5173
echo.
echo ========================================
pause