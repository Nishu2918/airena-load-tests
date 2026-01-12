# GCC FUSION - AI Service

FastAPI service providing AI-powered mentor guidance and submission analysis for the hackathon platform.

## 🚀 Features

- **AI Analyzer**: Automatic submission review and scoring
- **AI Mentor**: Chat-based guidance for participants
- OpenAI GPT integration
- RESTful API with API key authentication

## 📋 Prerequisites

- Python 3.10+
- OpenAI API key (optional - service works with fallback responses)

## 🛠️ Setup

1. **Install dependencies**:
```bash
pip3 install -r requirements.txt
# Or: python3 -m pip install -r requirements.txt
```

2. **Configure environment**:
```bash
cp .env.example .env
# Edit .env and add your OpenAI API key
```

3. **Run the service**:
```bash
python3 main.py
# Or with uvicorn:
uvicorn main:app --reload --port 8000
# Or: python3 -m uvicorn main:app --reload --port 8000
```

The service will run on `http://localhost:8000`

## 📡 API Endpoints

### Health Check
```
GET /health
```

### AI Analyzer
```
POST /analyze
Headers:
  X-API-Key: your-ai-service-api-key

Body:
{
  "submissionId": "uuid",
  "hackathonId": "uuid",
  "title": "Submission Title",
  "description": "Submission description...",
  "requirements": {
    "category": "Web Development",
    "techStack": ["React", "Node.js"]
  }
}

Response:
{
  "submissionId": "uuid",
  "matchPercentage": 85.5,
  "decision": "PASS_TO_OFFLINE_REVIEW",
  "explanation": "Detailed explanation...",
  "strengths": ["Strength 1", "Strength 2"],
  "weaknesses": ["Weakness 1", "Weakness 2"],
  "suggestions": ["Suggestion 1", "Suggestion 2"]
}
```

### AI Mentor
```
POST /mentor
Headers:
  X-API-Key: your-ai-service-api-key

Body:
{
  "message": "How do I submit my project?",
  "userId": "optional-user-id",
  "hackathonId": "optional-hackathon-id",
  "conversationHistory": [
    {
      "role": "user",
      "content": "Previous message",
      "timestamp": "2024-01-01T00:00:00"
    }
  ],
  "context": {
    "role": "participant",
    "hackathonStatus": "IN_PROGRESS"
  }
}

Response:
{
  "response": "AI mentor response...",
  "suggestions": ["Suggestion 1", "Suggestion 2"],
  "timestamp": "2024-01-01T00:00:00"
}
```

## 🔐 Authentication

All endpoints (except `/health`) require an API key in the `X-API-Key` header. Configure this in your `.env` file as `AI_SERVICE_API_KEY`.

## 🔄 Integration with Backend Core

The backend core (NestJS) calls this service via HTTP:
- Backend sets `AI_SERVICE_URL` environment variable
- Backend sets `AI_SERVICE_API_KEY` environment variable
- Backend includes `X-API-Key` header in requests

## 📝 Notes

- The service works without OpenAI API key (returns fallback responses)
- For production, always configure OpenAI API key for full functionality
- The service uses `gpt-4o-mini` model for cost-effectiveness
- Conversation history is limited to last 10 messages for context management

