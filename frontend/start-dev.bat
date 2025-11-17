@echo off
echo Starting CuraLink Development Environment...

echo.
echo Starting Backend (FastAPI)...
start "CuraLink Backend" cmd /k "cd backend && python main.py"

echo.
echo Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo.
echo Starting Frontend (Next.js)...
start "CuraLink Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo CuraLink is starting up!
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo.
pause