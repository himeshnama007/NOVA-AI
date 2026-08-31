# NOVA-AI Fullstack Startup Script for Windows PowerShell
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "         Starting NOVA-AI Fullstack on Localhost       " -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Redis
Write-Host "[1/3] Checking & Starting Redis..." -ForegroundColor Yellow
try {
    $ping = wsl -d Ubuntu redis-cli ping 2>$null
    if ($ping -notmatch "PONG") {
        wsl -d Ubuntu -u root redis-server --daemonize yes | Out-Null
    }
    Write-Host "      ✅ Redis is active on redis://localhost:6379" -ForegroundColor Green
} catch {
    Write-Host "      ⚠️  Could not start Redis in WSL automatically. Ensure Redis is running on localhost:6379." -ForegroundColor Yellow
}
Write-Host ""

# Step 2: Show Service Map
Write-Host "[2/3] Services Map:" -ForegroundColor Yellow
Write-Host "      • Auth Service:    http://localhost:8001" -ForegroundColor Gray
Write-Host "      • Chat Service:    http://localhost:8002" -ForegroundColor Gray
Write-Host "      • Agent Service:   http://localhost:8003" -ForegroundColor Gray
Write-Host "      • Billing Service: http://localhost:8004" -ForegroundColor Gray
Write-Host "      • API Gateway:     http://localhost:8000" -ForegroundColor Gray
Write-Host "      • Frontend App:    http://localhost:5173" -ForegroundColor Cyan
Write-Host ""

# Step 3: Launch
Write-Host "[3/3] Launching all services..." -ForegroundColor Yellow
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""

& npm.cmd run dev
