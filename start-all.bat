@echo off
echo =======================================================
echo          Starting NOVA-AI Fullstack on Localhost
echo =======================================================
echo.

echo [1/3] Ensuring Redis is running in WSL...
wsl -d Ubuntu -u root redis-server --daemonize yes >nul 2>&1
echo       Redis is ready on localhost:6379.
echo.

echo [2/3] Starting Backend Microservices + Gateway + Frontend...
echo       Auth Service:    http://localhost:8001
echo       Chat Service:    http://localhost:8002
echo       Agent Service:   http://localhost:8003
echo       Billing Service: http://localhost:8004
echo       API Gateway:     http://localhost:8000
echo       Frontend App:    http://localhost:5173
echo.
echo =======================================================

call npm.cmd run dev
pause
