"""
AI/Gemini Microservice for Job Chat
Handles conversations about found jobs using Google Gemini API
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
from datetime import datetime
import json
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("Warning: GEMINI_API_KEY environment variable not set")
else:
    print(f"GEMINI_API_KEY loaded: {GEMINI_API_KEY[:10]}...{GEMINI_API_KEY[-10:]}")
    genai.configure(api_key=GEMINI_API_KEY)
    
    # List available models for debugging
    try:
        print("Available Gemini models:")
        models = genai.list_models()
        for model in models:
            print(f"  - {model.name}")
    except Exception as e:
        print(f"Error listing models: {str(e)}")

# Store conversation history (in production, use a database)
conversations = {}

def create_system_prompt(jobs_context: str, search_history: str) -> str:
    """Create a system prompt with job context and search history"""
    return f"""You are a helpful job search assistant powered by AI. Your role is to:
1. Help users understand and analyze job opportunities
2. Provide insights about job requirements, salaries, and career paths
3. Suggest which jobs match their skills and interests
4. Answer questions about the job market and trends
5. Help users prepare for interviews

Current Job Context:
{jobs_context}

Previous Search History:
{search_history}

Guidelines:
- Be friendly and professional
- Provide actionable advice
- Consider the user's experience level and preferences
- Suggest next steps for applications
- Be honest about job market conditions

Always respond in a clear, concise manner and ask clarifying questions when needed."""


def format_jobs_for_context(jobs: list) -> str:
    """Format jobs into a readable context string"""
    if not jobs:
        return "No jobs available."
    
    formatted_jobs = []
    for idx, job in enumerate(jobs[:10], 1):  # Limit to first 10 jobs
        formatted_jobs.append(f"""
Job {idx}:
- Title: {job.get('job_title', 'N/A')}
- Company: {job.get('company_name', 'N/A')}
- Location: {job.get('location', 'N/A')}
- Posted: {job.get('posted', 'N/A')}
- Benefits: {job.get('benefit', 'N/A')}
- Description: {job.get('job_description', 'N/A')[:200]}...
""")
    return "\n".join(formatted_jobs)


def format_search_history(history: list) -> str:
    """Format search history for context"""
    if not history:
        return "No previous searches."
    
    formatted_history = []
    for idx, search in enumerate(history[:5], 1):  # Last 5 searches
        params = search.get('searchParams', {})
        formatted_history.append(f"""
Search {idx}:
- Keyword: {params.get('job_keyword', 'N/A')}
- Countries: {', '.join(params.get('countries', []))}
- Date Posted: {params.get('date_posted', 'any')}
- Experience Levels: {len(params.get('experience_levels', []))} selected
- Workplace Types: {len(params.get('workplace_types', []))} selected
- Found: {search.get('totalJobs', 0)} jobs
- Search Date: {search.get('timestamp', 'N/A')}
""")
    return "\n".join(formatted_history)


@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "AI/Gemini Chat Service",
        "timestamp": datetime.now().isoformat(),
    })


@app.route("/chat", methods=["POST"])
def chat():
    """
    Chat endpoint for job-related conversations
    
    Request body:
    {
        "conversation_id": "unique-id",
        "message": "user message",
        "jobs": [job objects],
        "search_history": [search history items]
    }
    """
    if not GEMINI_API_KEY:
        return jsonify({
            "status": "error",
            "error": "AI service not configured. Please set GEMINI_API_KEY environment variable.",
            "code": "GEMINI_NOT_CONFIGURED"
        }), 503

    try:
        data = request.json
        
        # Validate required fields
        if not data or "message" not in data:
            return jsonify({
                "status": "error",
                "error": "Message is required",
                "code": "MISSING_MESSAGE"
            }), 400

        conversation_id = data.get("conversation_id", f"conv_{datetime.now().timestamp()}")
        user_message = data.get("message", "").strip()
        jobs = data.get("jobs", [])
        search_history = data.get("search_history", [])

        if not user_message:
            return jsonify({
                "status": "error",
                "error": "Message cannot be empty",
                "code": "EMPTY_MESSAGE"
            }), 400

        # Initialize conversation if new
        if conversation_id not in conversations:
            conversations[conversation_id] = {
                "history": [],
                "created_at": datetime.now().isoformat(),
            }

        # Create or get chat session
        try:
            model = genai.GenerativeModel(
                model_name="gemini-2.5-flash",
                system_instruction=create_system_prompt(
                    format_jobs_for_context(jobs),
                    format_search_history(search_history)
                )
            )
        except Exception as e:
            return jsonify({
                "status": "error",
                "error": f"Failed to initialize Gemini model: {str(e)}",
                "code": "MODEL_INIT_ERROR"
            }), 500

        # Build chat history for context
        chat_history = []
        for msg in conversations[conversation_id]["history"]:
            if msg["role"] == "user":
                chat_history.append({
                    "role": "user",
                    "parts": [msg["content"]]
                })
            else:
                chat_history.append({
                    "role": "model",
                    "parts": [msg["content"]]
                })

        try:
            # Start chat with history
            chat_session = model.start_chat(history=chat_history)
            
            # Send user message
            response = chat_session.send_message(user_message)
            
            assistant_message = response.text

            # Store conversation
            conversations[conversation_id]["history"].append({
                "role": "user",
                "content": user_message,
                "timestamp": datetime.now().isoformat()
            })
            conversations[conversation_id]["history"].append({
                "role": "assistant",
                "content": assistant_message,
                "timestamp": datetime.now().isoformat()
            })

            return jsonify({
                "status": "success",
                "conversation_id": conversation_id,
                "message": assistant_message,
                "timestamp": datetime.now().isoformat(),
                "history_length": len(conversations[conversation_id]["history"])
            }), 200

        except Exception as e:
            return jsonify({
                "status": "error",
                "error": f"Failed to generate response: {str(e)}",
                "code": "GENERATION_ERROR"
            }), 500

    except json.JSONDecodeError:
        return jsonify({
            "status": "error",
            "error": "Invalid JSON in request body",
            "code": "INVALID_JSON"
        }), 400
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": f"An unexpected error occurred: {str(e)}",
            "code": "INTERNAL_ERROR"
        }), 500


@app.route("/conversation/<conversation_id>", methods=["GET"])
def get_conversation(conversation_id):
    """Get conversation history"""
    if conversation_id not in conversations:
        return jsonify({
            "status": "error",
            "error": "Conversation not found",
            "code": "NOT_FOUND"
        }), 404

    return jsonify({
        "status": "success",
        "conversation_id": conversation_id,
        "created_at": conversations[conversation_id]["created_at"],
        "history": conversations[conversation_id]["history"]
    }), 200


@app.route("/conversation/<conversation_id>", methods=["DELETE"])
def delete_conversation(conversation_id):
    """Delete conversation"""
    if conversation_id in conversations:
        del conversations[conversation_id]
        return jsonify({
            "status": "success",
            "message": "Conversation deleted"
        }), 200
    
    return jsonify({
        "status": "error",
        "error": "Conversation not found",
        "code": "NOT_FOUND"
    }), 404


if __name__ == "__main__":
    app.run(debug=True, port=5001)
