@echo off
setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════╗
echo ║   LinkedIn Job Scraper - Docker Setup  ║
echo ╚════════════════════════════════════════╝
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed
    echo 📥 Download from: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

REM Check if Docker daemon is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker daemon is not running
    echo 🚀 Please start Docker Desktop
    pause
    exit /b 1
)

echo ✅ Docker is installed and running
echo.

REM Check for .env file
if not exist ".env" (
    echo ⚠️  .env file not found
    echo 📝 Creating from .env.example...
    copy .env.example .env >nul
    echo ⚠️  Please update .env with your GEMINI_API_KEY
    echo    Edit: .env
    pause
    exit /b 1
)

echo ✅ .env file found
echo.

REM Ask for mode
echo Select mode:
echo 1) Production (optimized)
echo 2) Development (with hot-reload)
set /p mode="Enter choice [1-2]: "

if "%mode%"=="1" (
    echo.
    echo 🔨 Building production images...
    call docker-compose build --no-cache
    
    echo.
    echo 🚀 Starting services...
    call docker-compose up -d
    
    echo.
    echo ✅ Services started!
    echo.
    echo 📍 Access points:
    echo    Frontend:   http://localhost:3000
    echo    Backend:    http://localhost:5000
    echo    AI Service: http://localhost:5001
    echo.
    echo 📊 View logs:
    echo    docker-compose logs -f
) else if "%mode%"=="2" (
    echo.
    echo 🔨 Building development images...
    call docker-compose -f docker-compose.dev.yml build --no-cache
    
    echo.
    echo 🚀 Starting services in development mode...
    call docker-compose -f docker-compose.dev.yml up -d
    
    echo.
    echo ✅ Development services started!
    echo.
    echo 📍 Access points:
    echo    Frontend:   http://localhost:3000
    echo    Backend:    http://localhost:5000
    echo    AI Service: http://localhost:5001
    echo.
    echo 📊 View logs:
    echo    docker-compose -f docker-compose.dev.yml logs -f
) else (
    echo ❌ Invalid choice
    pause
    exit /b 1
)

echo.
echo ⏳ Waiting for services to be healthy...
timeout /t 10 /nobreak

echo.
echo 🔍 Service status:
call docker-compose ps

echo.
echo ✨ Setup complete!
pause
