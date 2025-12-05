#!/usr/bin/env bash

# LinkedIn Job Scraper - Quick Start Guide
# This script helps you get started quickly

echo "═══════════════════════════════════════════════════════"
echo "  LinkedIn Job Scraper - Full Stack Setup"
echo "═══════════════════════════════════════════════════════"
echo ""

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Please run this script from the root project directory"
    exit 1
fi

echo "📦 Starting Setup..."
echo ""

# 1. Backend Setup
echo "1️⃣  Setting up Backend (Flask API)..."
echo "────────────────────────────────────────────"
cd backend

# Check if Python is installed
if ! command -v python &> /dev/null; then
    echo "❌ Python not found. Please install Python 3.7+"
    exit 1
fi

echo "✓ Python found"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
source venv/Scripts/activate 2>/dev/null || source venv/bin/activate

echo "✓ Virtual environment activated"

# Install dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt -q

echo "✓ Backend dependencies installed"
echo ""

# 2. Frontend Setup
echo "2️⃣  Setting up Frontend (Next.js)..."
echo "────────────────────────────────────────────"
cd ../frontend

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

echo "✓ Node.js $(node -v) found"

# Install dependencies
echo "Installing Node.js dependencies..."
npm install -q

echo "✓ Frontend dependencies installed"
echo ""

# 3. Environment Setup
echo "3️⃣  Checking Environment Configuration..."
echo "────────────────────────────────────────────"

if [ ! -f ".env.local" ]; then
    echo "Creating .env.local from template..."
    cp .env.example .env.local
    echo "✓ .env.local created"
else
    echo "✓ .env.local already exists"
fi

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  ✅ Setup Complete!"
echo "═══════════════════════════════════════════════════════"
echo ""

echo "🚀 Next Steps:"
echo ""
echo "Terminal 1 - Start Backend:"
echo "  cd backend"
echo "  source venv/Scripts/activate  # On Windows"
echo "  python linkedin.py"
echo ""
echo "Terminal 2 - Start Frontend:"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo "Then open http://localhost:3000 in your browser"
echo ""
echo "For more information, see:"
echo "  - Backend: backend/README.md"
echo "  - Frontend: frontend/README.md"
echo "  - Project: PROJECT_SUMMARY.md"
echo ""
