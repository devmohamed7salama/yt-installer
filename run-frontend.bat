@echo off
chcp 65001 >nul
title YT Installer Frontend

echo ========================================
echo   YT Installer - Frontend
echo ========================================
echo.

cd /d "%~dp0frontend"

echo [1] Starting frontend server...
echo   URL: http://localhost:5173
echo   Open this URL in your browser
echo.
echo   Make sure backend is running first!
echo   Run: run-backend.bat
echo.

npm run dev

pause