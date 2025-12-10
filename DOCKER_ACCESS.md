# Docker Containers - Access Guide

## ✅ All Containers Running and Healthy

```
linkedin-chatbot-ai         ✅ Healthy   (AI Service)
linkedin-scraper-backend    ✅ Healthy   (Job Scraper)
linkedin-scraper-frontend   ✅ Healthy   (Next.js App)
```

## 🌐 Access Your Application

### From Your Browser/Local Machine
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **AI Service**: http://localhost:5001

### Container-to-Container (Inside Docker Network)
- Frontend → Backend: `http://backend:5000`
- Frontend → AI Service: `http://ai-service:5001`
- Backend → AI Service: `http://ai-service:5001`

## ⚠️ Important Notes

### Why http://172.18.0.4:3000 doesn't work
- `172.18.0.4` is the container's internal IP
- You must use `localhost:3000` from your host machine
- This is the port mapped: `0.0.0.0:3000->3000/tcp`

### Environment Variables
The frontend uses these environment variables for API communication:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:5001
```

## 🔧 Useful Docker Commands

### View Container Status
```bash
docker-compose ps
```

### View Live Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f ai-service
```

### Stop All Containers
```bash
docker-compose down
```

### Start All Containers
```bash
docker-compose up -d
```

### Restart a Service
```bash
docker-compose restart frontend
```

### View Container IP/Network Info
```bash
docker inspect linkedin-scraper-frontend | findstr IPAddress
docker network inspect jobscope_linkedin_linkedin-network
```

## 📝 Architecture

```
Your Computer (Host Machine)
├── Browser: http://localhost:3000 ──┐
├── Browser: http://localhost:5000 ──┤
└── Browser: http://localhost:5001 ──┤
                                       │
        Docker Network Bridge          │
        ├─────────────────────────────┤
        │                             │
        │  ┌──────────────────────┐  │
        │  │  Frontend Container  │  │
        │  │  Port: 3000          │  │
        │  │  IP: 172.18.0.4      │  │
        │  └──────────────────────┘  │
        │           ↓                 │
        │  ┌──────────────────────┐  │
        │  │  Backend Container   │  │
        │  │  Port: 5000          │  │
        │  │  IP: 172.18.0.2      │  │
        │  └──────────────────────┘  │
        │           ↓                 │
        │  ┌──────────────────────┐  │
        │  │  AI Service Container│  │
        │  │  Port: 5001          │  │
        │  │  IP: 172.18.0.3      │  │
        │  └──────────────────────┘  │
        └─────────────────────────────┘
```

## ✨ What's Working

✅ Frontend container running on port 3000
✅ Backend API container running on port 5000
✅ AI Service container running on port 5001
✅ All containers connected via Docker network
✅ API environment variables configured
✅ Health checks passing

## 🚀 Next Steps

1. Open your browser
2. Go to: **http://localhost:3000**
3. The frontend should load successfully
4. Test job search functionality
5. Test AI chatbot features

---

**Container Status**: All Healthy ✅
**Last Updated**: December 10, 2025 22:11
