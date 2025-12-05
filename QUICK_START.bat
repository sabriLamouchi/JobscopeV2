@echo off
REM LinkedIn Job Scraper - Quick Start Guide (Windows)
REM This script helps you get started quickly on Windows

echo.
echo ===============================================
echo   LinkedIn Job Scraper - Full Stack Setup
echo ===============================================
echo.

REM Check if we're in the right directory
if not exist "backend\" goto error_dir
if not exist "frontend\" goto error_dir

echo 2. Starting Setup...
echo.

REM 1. Backend Setup
echo 1. Setting up Backend (Flask API)...
echo -----------------------------------------------
cd backend

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Python not found. Please install Python 3.7+
    exit /b 1
)

echo OK - Python found

REM Create virtual environment if it doesn't exist
if not exist "venv\" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

echo OK - Virtual environment activated

REM Install dependencies
echo Installing Python dependencies...
pip install -r requirements.txt -q

echo OK - Backend dependencies installed
echo.

REM 2. Frontend Setup
echo 2. Setting up Frontend (Next.js)...
echo -----------------------------------------------
cd ..\frontend

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js not found. Please install Node.js 18+
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo OK - Node.js %NODE_VERSION% found

REM Install dependencies
echo Installing Node.js dependencies...
call npm install --silent

echo OK - Frontend dependencies installed
echo.

REM 3. Environment Setup
echo 3. Checking Environment Configuration...
echo -----------------------------------------------

if not exist ".env.local" (
    echo Creating .env.local from template...
    copy .env.example .env.local >nul
    echo OK - .env.local created
) else (
    echo OK - .env.local already exists
)

echo.
echo ===============================================
echo   OK - Setup Complete!
echo ===============================================
echo.

echo Start Frontend:
echo.
echo   Option 1 - Using npm:
echo     cd frontend
echo     npm run dev
echo.
echo   Option 2 - Open in VS Code terminal:
echo     code .
echo.
echo Then open http://localhost:3000 in your browser
echo.
echo ===============================================
echo.

goto :end

:error_dir
echo Error: Please run this script from the root project directory
exit /b 1

:end
