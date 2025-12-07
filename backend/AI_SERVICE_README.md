# AI/Gemini Chat Microservice

## Overview

The AI/Gemini Chat Microservice is a Python-based REST API that provides intelligent conversation capabilities about job search results. It uses Google's Gemini AI model to analyze found jobs and provide personalized career advice.

## Architecture

```
┌──────────────────────────┐
│        Frontend          │
│        Next.js           │
└────────────┬─────────────┘
             │ (Chat Messages)
             ▼
┌──────────────────────────┐
│     API GATEWAY (BFF)    │
│   Next.js API Routes     │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│  AI/Gemini Microservice  │
│    (This Service)        │
│    Python + Flask        │
└────────────┬─────────────┘
             │
             ▼
    ┌────────────────┐
    │ Google Gemini  │
    │   API          │
    └────────────────┘
```

## Features

✅ **Intelligent Job Analysis** - Understands job requirements and market trends
✅ **Context-Aware Responses** - Uses search history and current jobs as context
✅ **Conversation History** - Maintains chat history for multi-turn conversations
✅ **Career Guidance** - Provides personalized career advice based on user profile
✅ **Multi-Language Support** - Can respond in multiple languages
✅ **Error Handling** - Graceful error handling with informative messages

## Prerequisites

- Python 3.8+
- Google Gemini API Key
- Flask and dependencies

## Installation

1. **Get a Gemini API Key**
   - Visit https://ai.google.dev/
   - Sign up and generate your API key
   - Keep it safe!

2. **Install Dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Set Environment Variable**
   ```bash
   # Windows (PowerShell)
   $env:GEMINI_API_KEY = "your-api-key-here"
   
   # Windows (CMD)
   set GEMINI_API_KEY=your-api-key-here
   
   # Linux/Mac
   export GEMINI_API_KEY="your-api-key-here"
   ```

## Running the Service

```bash
# Start the AI service
python ai_service.py
```

The service will start on `http://localhost:5001`

## API Endpoints

### 1. Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "AI/Gemini Chat Service",
  "timestamp": "2025-12-07T10:30:00.000Z"
}
```

### 2. Send Message
```http
POST /chat
Content-Type: application/json

{
  "message": "What's the best job for a Python developer?",
  "conversation_id": "optional-id",
  "jobs": [
    {
      "job_title": "Senior Python Developer",
      "company_name": "Tech Corp",
      "location": "Remote",
      ...
    }
  ],
  "search_history": [
    {
      "searchParams": {...},
      "jobs": [...],
      "totalJobs": 10,
      "timestamp": "2025-12-07T10:00:00.000Z",
      "dateAdded": "2025-12-07T10:00:00.000Z"
    }
  ]
}
```

**Response:**
```json
{
  "status": "success",
  "conversation_id": "conv_1733548200000",
  "message": "Based on the jobs found, I recommend focusing on the Senior Python Developer role...",
  "timestamp": "2025-12-07T10:30:00.000Z",
  "history_length": 2
}
```

### 3. Get Conversation
```http
GET /conversation/{conversation_id}
```

**Response:**
```json
{
  "status": "success",
  "conversation_id": "conv_1733548200000",
  "created_at": "2025-12-07T10:00:00.000Z",
  "history": [
    {
      "role": "user",
      "content": "What jobs match my skills?",
      "timestamp": "2025-12-07T10:00:00.000Z"
    },
    {
      "role": "assistant",
      "content": "Based on the current search results...",
      "timestamp": "2025-12-07T10:00:30.000Z"
    }
  ]
}
```

### 4. Delete Conversation
```http
DELETE /conversation/{conversation_id}
```

**Response:**
```json
{
  "status": "success",
  "message": "Conversation deleted"
}
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API Key | Yes |
| `FLASK_ENV` | Environment (development/production) | No |
| `FLASK_DEBUG` | Enable debug mode | No |

## System Prompt

The AI assistant uses a system prompt that includes:

1. **Role Definition** - Job search assistant specialization
2. **Current Jobs Context** - Up to 10 most recent job listings
3. **Search History** - Last 5 searches performed
4. **Guidelines** - Professional, friendly, actionable advice

## Error Handling

The service returns appropriate HTTP status codes:

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request (missing fields, validation errors) |
| 404 | Not Found (conversation not found) |
| 500 | Server Error |
| 503 | Service Unavailable (Gemini API not configured) |

## Example Usage from Frontend

```typescript
import { aiChatService } from "@/lib/services/aiChatService";

// Send a message
const response = await aiChatService.sendMessage(
  "What skills do I need for these jobs?",
  currentJobs,
  searchHistory,
  conversationId
);

if (response.status === "success") {
  console.log(response.message); // AI response
  console.log(response.conversation_id); // For future messages
}
```

## Production Deployment

### Docker

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY ai_service.py .

ENV GEMINI_API_KEY=${GEMINI_API_KEY}
ENV FLASK_ENV=production

CMD ["gunicorn", "-b", "0.0.0.0:5001", "ai_service:app"]
```

### Heroku

```bash
heroku create your-ai-service
heroku config:set GEMINI_API_KEY=your-key
git push heroku main
```

### AWS / GCP

Deploy as a Cloud Run service or Lambda function with the same environment variables.

## Limits

- **Conversation Storage**: Up to 50 conversations (in-memory, use database for persistence)
- **History Context**: Last 5 searches per conversation
- **Job Context**: Up to 10 jobs per message
- **Max Requests**: Depends on Gemini API tier

## Security

⚠️ **Important:**
- Never commit your `GEMINI_API_KEY` to version control
- Use environment variables or secure secret management
- In production, use a proper database instead of in-memory storage
- Implement rate limiting and authentication
- Validate all inputs on the backend

## Troubleshooting

### "GEMINI_API_KEY environment variable not set"
Make sure you've set the environment variable before running the service.

### "Failed to initialize Gemini model"
- Check if your API key is valid
- Verify you have internet connection
- Check your Gemini API quota

### Timeout errors
- The service might be slow due to API latency
- Increase timeout settings in your frontend

## Roadmap

- [ ] Database integration for persistent conversation storage
- [ ] User authentication and multi-user support
- [ ] Advanced job matching algorithms
- [ ] Resume analysis integration
- [ ] Interview preparation features
- [ ] Job market analytics
- [ ] Rate limiting and usage analytics

## Support

For issues related to:
- **Gemini API**: Visit https://ai.google.dev/support
- **This Service**: Check the main project repository

## License

Same as the main JobScope project
