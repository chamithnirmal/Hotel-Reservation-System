@echo off
cd /d "%~dp0"
echo Installing dependencies...
call npm install
echo.
echo Starting development server...
call npm run dev
pause
