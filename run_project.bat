@echo off
echo ==========================================
echo    JusticeBridge - Project Starter
echo ==========================================

:: Start Backend
echo Starting Backend (FastAPI)...
start cmd /k "cd backend && (if not exist venv (python -m venv venv)) && venv\Scripts\activate && pip install -r requirements.txt && uvicorn main:app --reload --port 8000"

:: Start Frontend
echo Starting Frontend (Vite)...
start cmd /k "cd frontend && npm install && npm run dev"

echo ==========================================
echo Both servers are starting in separate windows.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo ==========================================
pause

