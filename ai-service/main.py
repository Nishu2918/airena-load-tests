"""
GCC FUSION - AI Service
FastAPI service for AI Mentor and AI Analyzer
"""

from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import os
import json
import re
from dotenv import load_dotenv
import openai
from datetime import datetime, timezone

# Load environment variables
# Try to load from current directory first, then parent directory
load_dotenv()
load_dotenv('.env')  # Explicitly load .env from current directory

# Validate environment variables on startup
def validate_environment():
    """Validate required environment variables"""
    ai_service_key = os.getenv("AI_SERVICE_API_KEY")
    if not ai_service_key or ai_service_key == "default-api-key-change-in-production":
        print("⚠️  WARNING: AI_SERVICE_API_KEY not set or using default value.")
        print("   Set AI_SERVICE_API_KEY in .env for production use.")
    
    openai_key = os.getenv("OPENAI_API_KEY")
    if not openai_key:
        print("⚠️  WARNING: OPENAI_API_KEY not set.")
        print("   AI features will work with fallback responses.")
        print("   Get your API key from: https://platform.openai.com/api-keys")
    else:
        print("✅ OpenAI API key configured")

# Validate on import
validate_environment()

app = FastAPI(
    title="GCC FUSION AI Service",
    description="AI-powered mentor and analyzer for hackathon platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI client
openai_client = None
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if OPENAI_API_KEY and OPENAI_API_KEY != "your-openai-api-key-here" and OPENAI_API_KEY.startswith("sk-"):
    try:
        # Initialize OpenAI client - use only api_key parameter to avoid version conflicts
        # Remove any proxy or other parameters that might cause issues
        openai_client = openai.OpenAI(
            api_key=OPENAI_API_KEY
        )
        print("✅ OpenAI API key configured")
    except TypeError as e:
        # Handle version-specific initialization issues
        print(f"⚠️  Warning: OpenAI client version issue: {e}")
        print("   Trying alternative initialization...")
        try:
            # Fallback: try with minimal parameters
            openai_client = openai.OpenAI(api_key=OPENAI_API_KEY)
            print("✅ OpenAI API key configured (fallback method)")
        except Exception as e2:
            print(f"⚠️  Warning: Failed to initialize OpenAI client: {e2}")
            print("   Service will work with fallback responses")
            print("   Try: pip3 install --upgrade openai")
    except Exception as e:
        print(f"⚠️  Warning: Failed to initialize OpenAI client: {e}")
        print("   Service will work with fallback responses")
        print("   Try: pip3 install --upgrade openai")
else:
    if OPENAI_API_KEY and not OPENAI_API_KEY.startswith("sk-"):
        print("⚠️  OpenAI API key format appears incorrect (should start with 'sk-')")
    print("⚠️  OpenAI API key not set. Service will work with fallback responses.")
    print("   Set OPENAI_API_KEY in .env for full AI functionality.")

# API Key validation
API_KEY = os.getenv("AI_SERVICE_API_KEY", "default-api-key-change-in-production")
if API_KEY == "default-api-key-change-in-production":
    print("⚠️  WARNING: Using default AI_SERVICE_API_KEY. This is not secure for production!")
    print("   Set AI_SERVICE_API_KEY in .env file with a secure random string.")
else:
    print("✅ AI Service API key configured")

def verify_api_key(x_api_key: str = Header(...)):
    """Verify API key from header"""
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return x_api_key


# Request/Response Models
class AnalyzeRequest(BaseModel):
    submissionId: str
    hackathonId: str
    title: str
    description: str
    requirements: Dict[str, Any] = Field(default_factory=dict)

class AnalyzeResponse(BaseModel):
    submissionId: str
    matchPercentage: float = Field(ge=0, le=100)
    decision: str  # PASS_TO_OFFLINE_REVIEW, NEEDS_IMPROVEMENT, REJECTED
    explanation: str
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    suggestions: List[str] = Field(default_factory=list)

class MentorMessage(BaseModel):
    role: str  # user or assistant
    content: str
    timestamp: Optional[str] = None

class MentorRequest(BaseModel):
    message: str
    userId: Optional[str] = None
    hackathonId: Optional[str] = None
    conversationHistory: Optional[List[MentorMessage]] = Field(default_factory=list)
    context: Optional[Dict[str, Any]] = Field(default_factory=dict)

class MentorResponse(BaseModel):
    response: str
    suggestions: Optional[List[str]] = Field(default_factory=list)
    timestamp: str


# AI Analyzer Endpoint
@app.post("/analyze", response_model=AnalyzeResponse, dependencies=[Depends(verify_api_key)])
async def analyze_submission(request: AnalyzeRequest):
    """
    Analyze a hackathon submission against requirements
    """
    if not openai_client:
        # Fallback response if OpenAI is not configured
        return AnalyzeResponse(
            submissionId=request.submissionId,
            matchPercentage=10.0,
            decision="PASS_TO_OFFLINE_REVIEW",
            explanation="AI service is not fully configured. Submission passed for manual review.",
            strengths=["Submission structure is complete"],
            weaknesses=["AI analysis unavailable"],
            suggestions=["Configure OpenAI API key for detailed analysis"]
        )
    
    try:
        # Extract requirements from the request
        requirements_text = ""
        if isinstance(request.requirements, dict):
            requirements_text = "\n".join([
                f"{key}: {value}" 
                for key, value in request.requirements.items()
            ])
        else:
            requirements_text = str(request.requirements)
        
        # Create prompt for analysis
        analysis_prompt = f"""You are an expert hackathon judge analyzing a submission. Evaluate the submission against the hackathon requirements.

Hackathon Requirements:
{requirements_text}

Submission Title: {request.title}
Submission Description: {request.description}

Please analyze this submission and provide:
1. A match percentage (0-100) indicating how well the submission meets the requirements
2. A decision: PASS_TO_OFFLINE_REVIEW (if it meets basic requirements), NEEDS_IMPROVEMENT (if it's close but needs work), or REJECTED (if it doesn't meet requirements)
3. A detailed explanation of your decision
4. List of strengths (at least 3)
5. List of weaknesses (at least 2)
6. Actionable suggestions for improvement (at least 3)

Format your response as JSON with these keys: matchPercentage, decision, explanation, strengths, weaknesses, suggestions.
"""
        
        # Call OpenAI
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",  # Using cost-effective model
            messages=[
                {"role": "system", "content": "You are an expert hackathon judge. Provide detailed, constructive feedback in JSON format."},
                {"role": "user", "content": analysis_prompt}
            ],
            temperature=0.7,
            max_tokens=1500
        )
        
        # Parse response
        ai_content = response.choices[0].message.content
        
        # Extract JSON from markdown code blocks if present
        json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', ai_content, re.DOTALL)
        if json_match:
            ai_content = json_match.group(1)
        
        # Try to find JSON object in response
        json_match = re.search(r'\{.*\}', ai_content, re.DOTALL)
        if json_match:
            parsed = json.loads(json_match.group(0))
        else:
            # Fallback: parse the response manually
            parsed = {
                "matchPercentage": 75.0,
                "decision": "PASS_TO_OFFLINE_REVIEW",
                "explanation": ai_content[:500],
                "strengths": ["Well-structured submission", "Clear description"],
                "weaknesses": ["Could use more detail"],
                "suggestions": ["Add more technical details", "Include demo links"]
            }
        
        # Ensure decision is valid
        valid_decisions = ["PASS_TO_OFFLINE_REVIEW", "NEEDS_IMPROVEMENT", "REJECTED"]
        decision = parsed.get("decision", "PASS_TO_OFFLINE_REVIEW")
        if decision not in valid_decisions:
            decision = "PASS_TO_OFFLINE_REVIEW"
        
        return AnalyzeResponse(
            submissionId=request.submissionId,
            matchPercentage=float(parsed.get("matchPercentage", 75.0)),
            decision=decision,
            explanation=parsed.get("explanation", ai_content[:500]),
            strengths=parsed.get("strengths", []),
            weaknesses=parsed.get("weaknesses", []),
            suggestions=parsed.get("suggestions", [])
        )
        
    except Exception as e:
        # Fallback response on error
        return AnalyzeResponse(
            submissionId=request.submissionId,
            matchPercentage=75.0,
            decision="PASS_TO_OFFLINE_REVIEW",
            explanation=f"Error during AI analysis: {str(e)}. Submission passed for manual review.",
            strengths=["Submission received"],
            weaknesses=["AI analysis failed"],
            suggestions=["Manual review recommended"]
        )


# AI Mentor Endpoint
@app.post("/mentor", response_model=MentorResponse, dependencies=[Depends(verify_api_key)])
async def mentor_chat(request: MentorRequest):
    """
    AI Mentor chat endpoint for providing guidance to participants
    """
    if not openai_client:
        # Fallback response if OpenAI is not configured
        return MentorResponse(
            response="I'm your AI Mentor! I can help you with hackathon rules, submission requirements, and provide feedback. Please configure the OpenAI API key to enable full functionality.",
            suggestions=[
                "Review hackathon requirements",
                "Check submission guidelines",
                "Prepare your project documentation"
            ],
            timestamp=datetime.now(timezone.utc).isoformat()
        )
    
    try:
        # Build conversation context
        system_prompt = """You are an AI Mentor for a hackathon platform. Your role is to:
1. Guide participants through hackathon rules and requirements
2. Help with submission preparation and validation
3. Provide constructive feedback and suggestions
4. Answer questions about the hackathon process
5. Be encouraging, helpful, and professional

Keep responses concise (2-3 paragraphs max) and actionable. Always provide specific, helpful suggestions."""
        
        # Build messages for conversation
        messages = [{"role": "system", "content": system_prompt}]
        
        # Add conversation history
        for msg in request.conversationHistory[-10:]:  # Last 10 messages for context
            messages.append({
                "role": msg.role if msg.role in ["user", "assistant"] else "user",
                "content": msg.content
            })
        
        # Add context if provided
        context_text = ""
        if request.context:
            context_text = f"\n\nContext: {json.dumps(request.context, indent=2)}"
        
        if request.hackathonId:
            context_text += f"\n\nHackathon ID: {request.hackathonId}"
        
        # Add current user message
        messages.append({
            "role": "user",
            "content": request.message + context_text
        })
        
        # Call OpenAI
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0.7,
            max_tokens=500
        )
        
        ai_response = response.choices[0].message.content
        
        # Generate suggestions based on the response
        suggestions = []
        if "submission" in request.message.lower():
            suggestions.append("Review submission requirements")
            suggestions.append("Check file upload guidelines")
        if "rule" in request.message.lower() or "requirement" in request.message.lower():
            suggestions.append("Read hackathon guidelines")
            suggestions.append("Contact organizers if unclear")
        if "help" in request.message.lower() or "stuck" in request.message.lower():
            suggestions.append("Check FAQ section")
            suggestions.append("Review example submissions")
        
        if not suggestions:
            suggestions = [
                "Review hackathon requirements",
                "Prepare your project documentation",
                "Test your submission before finalizing"
            ]
        
        return MentorResponse(
            response=ai_response,
            suggestions=suggestions[:3],  # Limit to 3 suggestions
            timestamp=datetime.now(timezone.utc).isoformat()
        )
        
    except Exception as e:
        # Fallback response on error
        return MentorResponse(
            response=f"I apologize, but I encountered an error: {str(e)}. Please try rephrasing your question or contact support.",
            suggestions=[
                "Try rephrasing your question",
                "Check the hackathon guidelines",
                "Contact support if the issue persists"
            ],
            timestamp=datetime.now(timezone.utc).isoformat()
        )


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "GCC FUSION AI Service",
        "openai_configured": openai_client is not None,
        "api_key_configured": API_KEY != "default-api-key-change-in-production",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


if __name__ == "__main__":
    import uvicorn
    
    # Validate environment before starting
    validate_environment()
    
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    
    print(f"\n🚀 Starting GCC FUSION AI Service...")
    print(f"   Host: {host}")
    print(f"   Port: {port}")
    print(f"   OpenAI: {'✅ Configured' if openai_client else '⚠️  Not configured (using fallbacks)'}")
    print(f"   API Key: {'✅ Configured' if API_KEY != 'default-api-key-change-in-production' else '⚠️  Using default (not secure)'}")
    print(f"\n✅ AI Service is running on: http://{host}:{port}")
    print(f"📚 Health check: http://{host}:{port}/health\n")
    
    uvicorn.run(app, host=host, port=port)

