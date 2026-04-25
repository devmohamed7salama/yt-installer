@echo off
chcp 65001 >nul
title YT Installer

echo ========================================
echo   YT Installer - Quick Start
echo ========================================
echo.
echo Starting both servers...
echo.
echo IMPORTANT: Keep both terminals open!
echo.

start "YT Backend" cmd /k "cd /d %~dp0backend && npm start"
timeout /t 3 /nobreak >nul
start "YT Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo ========================================
echo   Both servers should be running now!
echo ========================================
echo.
echo Backend: http://localhost:3001
echo Frontend: http://localhost:5173
echo.
echo Open http://localhost:5173 in your browser
echo.

pause