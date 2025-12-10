# Docker Setup Guide for LinkedIn Job Scraper

## Overview

This guide covers containerizing the LinkedIn Job Scraper with Docker. The project consists of three microservices:
- **Backend**: Flask API for job scraping (Port 5000)
- **AI Service**: Gemini chatbot service (Port 5001)
- **Frontend**: Next.js application (Port 3000)

## Prerequisites

- Docker Desktop installed (https://www.docker.com/products/docker-desktop)
- Docker Compose (included with Docker Desktop)
- GEMINI_API_KEY environment variable set

## Project Structure

```
JobScope_LinkedIn/
├── backend/
│   ├── Dockerfile                 # Backend container
│   ├── Dockerfile.ai              # AI service container
│   ├── .dockerignore              # Files to exclude from build
│   ├── linkedin.py
│   ├── ai_service.py
│   └── requirements.txt
├── frontend/
│   ├── Dockerfile                 # Frontend container
│   ├── .dockerignore              # Files to exclude from build
│   ├── package.json
│   └── ...
├── docker-compose.yml             # Production setup
├── docker-compose.dev.yml         # Development setup
├── .env.example                   # Environment template
└── DOCKER_SETUP.md               # This file
```

## Quick Start

### 1. Setup Environment

Create `.env` file in project root:

```bash
cp .env.example .env
```

Update `.env` with your GEMINI_API_KEY:

```bash
GEMINI_API_KEY=your-actual-api-key-here
```

### 2. Production Setup

Build and run all containers:

```bash
# Navigate to project root
cd JobScope_LinkedIn

# Build images
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### 3. Development Setup

For development with hot-reload:

```bash
# Using development compose file
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down
```

## Individual Container Management

### Build Individual Containers

```bash
# Backend
docker build -t linkedin-scraper-backend ./backend

# AI Service
docker build -f ./backend/Dockerfile.ai -t linkedin-chatbot-ai ./backend

# Frontend
docker build -t linkedin-scraper-frontend ./frontend
```

### Run Individual Containers

```bash
# Backend (standalone)
docker run -p 5000:5000 \
  --name linkedin-backend \
  linkedin-scraper-backend

# AI Service (requires GEMINI_API_KEY)
docker run -p 5001:5001 \
  -e GEMINI_API_KEY=your-key \
  --name linkedin-ai \
  linkedin-chatbot-ai

# Frontend
docker run -p 3000:3000 \
  --name linkedin-frontend \
  linkedin-scraper-frontend
```

## Container Details

### Backend Container
- **Image**: `linkedin-scraper-backend`
- **Port**: 5000
- **Base**: Python 3.11-slim
- **Dependencies**: Chromium, ChromeDriver, Python packages
- **Health Check**: Every 30s, timeout 10s
- **Volume Mount**: `./backend:/app` (production) or dev with hot-reload

### AI Service Container
- **Image**: `linkedin-chatbot-ai`
- **Port**: 5001
- **Base**: Python 3.11-slim
- **Dependencies**: Python packages, Gemini API
- **Environment**: `GEMINI_API_KEY` required
- **Health Check**: Every 30s, timeout 10s

### Frontend Container
- **Image**: `linkedin-scraper-frontend`
- **Port**: 3000
- **Base**: Node 18-alpine (builder) → Node 18-alpine (runtime)
- **Build**: Multi-stage for optimized size (~200MB)
- **Health Check**: Every 30s, timeout 10s

## Network Communication

All containers are connected via `linkedin-network` bridge:

```
Frontend (3000)
    ↓
Backend (5000) ←→ AI Service (5001)
```

Access between containers (container-to-container):
- Frontend → Backend: `http://backend:5000`
- Backend → AI Service: `http://ai-service:5001`
- Frontend → AI Service: `http://ai-service:5001`

Access from host machine:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- AI Service: `http://localhost:5001`

## Environment Variables

### Backend
```
FLASK_ENV=production|development
PYTHONUNBUFFERED=1
```

### AI Service
```
FLASK_ENV=production|development
PYTHONUNBUFFERED=1
GEMINI_API_KEY=<your-api-key>
```

### Frontend
```
NODE_ENV=production|development
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Useful Docker Commands

### Container Management
```bash
# View all containers
docker ps -a

# View running containers
docker ps

# View container logs
docker logs <container-id>

# Follow logs in real-time
docker logs -f <container-id>

# Execute command in container
docker exec -it <container-id> bash
docker exec -it <container-id> sh

# View container stats (CPU, memory)
docker stats

# Remove container
docker rm <container-id>

# Stop container
docker stop <container-id>

# Start container
docker start <container-id>

# Restart container
docker restart <container-id>
```

### Image Management
```bash
# List images
docker images

# Remove image
docker rmi <image-id>

# Remove unused images
docker image prune -a

# Tag image
docker tag <image-id> <new-tag>

# View image history
docker history <image-id>
```

### System Management
```bash
# Prune unused resources
docker system prune -a

# Check Docker disk usage
docker system df

# View Docker version
docker --version

# Check Docker info
docker info
```

## Docker Compose Commands

```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build backend

# Build without cache
docker-compose build --no-cache

# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d backend

# Start and view logs
docker-compose up

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Restart services
docker-compose restart

# Restart specific service
docker-compose restart frontend

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend

# View service status
docker-compose ps

# Pull latest images
docker-compose pull

# Remove services and networks
docker-compose rm -f

# Validate compose file
docker-compose config
```

## Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs <service-name>

# Rebuild images
docker-compose build --no-cache

# Check service health
docker-compose ps

# Inspect container
docker inspect <container-id>
```

### Port already in use
```bash
# Find process using port (Linux/Mac)
lsof -i :<port>

# Find process using port (Windows)
netstat -ano | findstr :<port>

# Kill process
kill -9 <pid>  # Linux/Mac
taskkill /PID <pid> /F  # Windows

# Or change port in docker-compose.yml
# ports: "5000:5000" → "5005:5000"
```

### API connection issues
```bash
# Test backend from frontend container
docker-compose exec frontend curl http://backend:5000/health

# Test AI service
docker-compose exec backend curl http://ai-service:5001/health

# Check network
docker network inspect linkedin-network

# Test DNS resolution
docker-compose exec frontend nslookup backend
```

### Gemini API errors
```bash
# Check API key is set
docker-compose config | grep GEMINI_API_KEY

# Verify in running container
docker-compose exec ai-service env | grep GEMINI_API_KEY

# View AI service logs
docker-compose logs -f ai-service

# Test API key
docker-compose exec ai-service python -c "import os; print(os.getenv('GEMINI_API_KEY'))"
```

### Out of disk space
```bash
# Clean up Docker
docker system prune -a

# Remove specific images
docker rmi <image-id>

# Remove volumes
docker volume prune
```

## Performance Optimization

### Reduce Image Size

```dockerfile
# Use alpine images (much smaller)
FROM python:3.11-alpine

# Multi-stage builds (already implemented in frontend)
FROM node:18-alpine AS builder
...
FROM node:18-alpine
```

### Caching Strategies

```dockerfile
# Copy requirements first (cache layer)
COPY requirements.txt .
RUN pip install -r requirements.txt

# Then copy code (changes frequently)
COPY . .
```

### Resource Limits

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

## Production Deployment

### Docker Hub

```bash
# Login
docker login

# Tag image
docker tag linkedin-scraper-backend:latest yourusername/linkedin-scraper-backend:latest

# Push image
docker push yourusername/linkedin-scraper-backend:latest

# Pull on production
docker pull yourusername/linkedin-scraper-backend:latest
```

### AWS ECR

```bash
# Get login token
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account>.dkr.ecr.us-east-1.amazonaws.com

# Tag image
docker tag linkedin-scraper-backend:latest <account>.dkr.ecr.us-east-1.amazonaws.com/linkedin-scraper-backend:latest

# Push to ECR
docker push <account>.dkr.ecr.us-east-1.amazonaws.com/linkedin-scraper-backend:latest
```

### Azure Container Registry

```bash
# Login
az acr login --name <registry-name>

# Tag image
docker tag linkedin-scraper-backend:latest <registry-name>.azurecr.io/linkedin-scraper-backend:latest

# Push
docker push <registry-name>.azurecr.io/linkedin-scraper-backend:latest
```

### Kubernetes Deployment

```bash
# Install kompose (converts docker-compose to k8s)
curl -L https://github.com/kubernetes/kompose/releases/download/v1.28.0/kompose-linux-amd64 -o kompose
chmod +x kompose

# Convert
./kompose convert -f docker-compose.yml

# Deploy to cluster
kubectl apply -f .
```

## Monitoring & Logging

### Docker Compose with Logging

```yaml
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### Health Checks

All containers include health checks that run every 30 seconds.

View health status:
```bash
docker-compose ps
```

### View Real-time Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend

# Follow with timestamps
docker-compose logs -f --timestamps

# Last 100 lines
docker-compose logs --tail 100 backend
```

## Security Best Practices

### 1. Environment Variables

**Never commit .env file**
```bash
# Add to .gitignore
echo ".env" >> .gitignore
```

**Use .env.example as template**
```bash
cp .env.example .env
# Edit .env with real values
```

### 2. Use Secrets Management

**Docker Secrets (Swarm mode)**
```bash
docker secret create gemini_key ./secret.txt
```

**Kubernetes Secrets**
```bash
kubectl create secret generic gemini-key --from-literal=key=your-key
```

**AWS Secrets Manager**
```bash
aws secretsmanager create-secret --name gemini-key --secret-string your-key
```

### 3. Keep Images Updated

```bash
# Pull latest base images
docker pull python:3.11-slim
docker pull node:18-alpine

# Rebuild with latest
docker-compose build --no-cache
```

### 4. Scan for Vulnerabilities

```bash
# Using Docker Scout (built-in)
docker scout cves linkedin-scraper-backend

# Using Trivy (third-party)
trivy image linkedin-scraper-backend
```

### 5. Don't Run as Root

```dockerfile
RUN useradd -m appuser
USER appuser
```

### 6. Use Private Registries

```bash
# Tag with registry
docker tag linkedin-scraper-backend:latest my-registry.com/linkedin-scraper-backend:latest

# Configure credentials in ~/.docker/config.json
```

## Maintenance Tasks

### Update Base Images

```bash
# Check for latest versions
docker images

# Update and rebuild
docker pull python:3.11-slim
docker pull node:18-alpine
docker-compose build --no-cache --pull

# Restart services
docker-compose up -d
```

### Clean Up Old Images and Containers

```bash
# Remove stopped containers
docker container prune -f

# Remove dangling images
docker image prune -f

# Remove all unused resources
docker system prune -af
```

### Backup Volume Data

```bash
# Create backup
docker run --rm -v linkedin-data:/data -v $(pwd):/backup alpine tar czf /backup/data-backup.tar.gz -C /data .

# Restore backup
docker run --rm -v linkedin-data:/data -v $(pwd):/backup alpine tar xzf /backup/data-backup.tar.gz -C /data
```

## Common Issues and Solutions

### Issue: "Cannot connect to Docker daemon"
```bash
# Solution: Start Docker Desktop
# Windows: Open Docker Desktop application
# Mac: Open Docker.app
# Linux: sudo systemctl start docker
```

### Issue: "Service 'backend' failed to build"
```bash
# Solution: Clear build cache
docker-compose build --no-cache backend

# Or check for syntax errors in Dockerfile
docker build -f backend/Dockerfile --rm backend/
```

### Issue: "Port 5000 is already allocated"
```bash
# Solution: Find and stop container
docker ps -a | grep 5000
docker stop <container-id>

# Or use different port in docker-compose.yml
ports:
  - "5005:5000"
```

### Issue: "Insufficient memory"
```bash
# Solution: Allocate more memory to Docker
# Docker Desktop Settings → Resources → Memory

# Or limit container memory
deploy:
  resources:
    limits:
      memory: 512M
```

## Next Steps

1. ✅ Setup Docker and Docker Compose
2. ✅ Create .env file with GEMINI_API_KEY
3. ✅ Build and test locally: `docker-compose build && docker-compose up`
4. 📦 Push images to Docker Hub or ECR
5. 🚀 Deploy to production environment (AWS ECS, Kubernetes, etc.)
6. 📊 Set up monitoring and logging
7. 🔄 Implement CI/CD pipeline with Docker

## Support and Resources

- Docker Documentation: https://docs.docker.com/
- Docker Compose Reference: https://docs.docker.com/compose/compose-file/
- Best Practices: https://docs.docker.com/develop/dev-best-practices/
- Security: https://docs.docker.com/engine/security/

---

**Last Updated**: December 10, 2025
