@echo off
setlocal
cd /d "%~dp0.."
start "Pdf Rumos API" cmd /k "npm start"
timeout /t 2 >nul
start "" "http://localhost:3000"
