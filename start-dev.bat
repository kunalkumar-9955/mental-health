@echo off
echo.
echo  ========================================
echo   MindCare AI - Starting Development
echo  ========================================
echo.

echo [1/2] Starting Backend (port 5000)...
start "MindCare Backend" cmd /k "cd mindcare-backend && npm run dev"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend (port 3000)...
start "MindCare Frontend" cmd /k "cd mindcare-frontend && npm run dev"

echo.
echo  Both servers starting...
echo  Frontend: http://localhost:3000
echo  Backend:  http://localhost:5000
echo  Health:   http://localhost:5000/health
echo.
echo  Make sure MongoDB is running!
echo  MongoDB URI: mongodb://localhost:27017/mindcare
echo.
pause
