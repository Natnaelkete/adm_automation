@echo off
echo Starting ADM Document Automation Platform...

:: Start Backend in a new window
start cmd /k "python api_main.py"

:: Start Frontend in a new window
cd frontend
start cmd /k "npm run dev"

echo.
echo ===================================================
echo Backend running at: http://localhost:8000
echo Frontend running at: http://localhost:3000
echo ===================================================
echo.
pause
