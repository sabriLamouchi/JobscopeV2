#!/bin/bash

# Docker Quick Start Script for LinkedIn Job Scraper

set -e

echo "╔════════════════════════════════════════╗"
echo "║   LinkedIn Job Scraper - Docker Setup  ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed"
    echo "📥 Download from: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    echo "❌ Docker daemon is not running"
    echo "🚀 Please start Docker Desktop"
    exit 1
fi

echo "✅ Docker is installed and running"
echo ""

# Check for .env file
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found"
    echo "📝 Creating from .env.example..."
    cp .env.example .env
    echo "⚠️  Please update .env with your GEMINI_API_KEY"
    echo "   Edit: .env"
    exit 1
fi

echo "✅ .env file found"
echo ""

# Ask for mode
echo "Select mode:"
echo "1) Production (optimized)"
echo "2) Development (with hot-reload)"
read -p "Enter choice [1-2]: " mode

case $mode in
    1)
        echo ""
        echo "🔨 Building production images..."
        docker-compose build --no-cache
        
        echo ""
        echo "🚀 Starting services..."
        docker-compose up -d
        
        echo ""
        echo "✅ Services started!"
        echo ""
        echo "📍 Access points:"
        echo "   Frontend:   http://localhost:3000"
        echo "   Backend:    http://localhost:5000"
        echo "   AI Service: http://localhost:5001"
        echo ""
        echo "📊 View logs:"
        echo "   docker-compose logs -f"
        ;;
    2)
        echo ""
        echo "🔨 Building development images..."
        docker-compose -f docker-compose.dev.yml build --no-cache
        
        echo ""
        echo "🚀 Starting services in development mode..."
        docker-compose -f docker-compose.dev.yml up -d
        
        echo ""
        echo "✅ Development services started!"
        echo ""
        echo "📍 Access points:"
        echo "   Frontend:   http://localhost:3000"
        echo "   Backend:    http://localhost:5000"
        echo "   AI Service: http://localhost:5001"
        echo ""
        echo "📊 View logs:"
        echo "   docker-compose -f docker-compose.dev.yml logs -f"
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 10

echo ""
echo "🔍 Service status:"
docker-compose ps

echo ""
echo "✨ Setup complete!"
