@echo off
chcp 65001 >nul
title YT Installer - Local Setup

echo ========================================
echo   YT Installer - Local Setup Script
echo ========================================
echo.

echo [1/4] Checking prerequisites...
python --version >nul 2>&1
if errorlevel 1 (
    echo   ❌ Python not found! Please install Python 3.8+
    echo   Download: https://python.org
    pause
    exit /b 1
)
echo   ✓ Python found

node --version >nul 2>&1
if errorlevel 1 (
    echo   ❌ Node.js not found! Please install Node.js 18+
    echo   Download: https://nodejs.org
    pause
    exit /b 1
)
echo   ✓ Node.js found

where yt-dlp >nul 2>&1
if errorlevel 1 (
    echo   Installing yt-dlp...
    pip install yt-dlp
    if errorlevel 1 (
        echo   ❌ Failed to install yt-dlp
        pause
        exit /b 1
    )
)
echo   ✓ yt-dlp found

echo.
echo [2/4] Installing backend dependencies...
cd backend
call npm install
if errorlevel 1 (
    echo   ❌ Backend install failed
    pause
    exit /b 1
)
echo   ✓ Backend ready

echo.
echo [3/4] Installing frontend dependencies...
cd ..\frontend
call npm install
if errorlevel 1 (
    echo   ❌ Frontend install failed
    pause
    exit /b 1
)
cd ..
echo   ✓ Frontend ready

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo To run the app:
echo.
echo   Terminal 1: cd backend ^& npm start
echo   Terminal 2: cd frontend ^& npm run dev
echo.
echo   Then open: http://localhost:5173
echo.
echo ========================================
pause