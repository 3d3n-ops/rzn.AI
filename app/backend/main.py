# app.py - FastAPI Backend
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Dict, Any
import httpx
import os
from dotenv import load_dotenv
import io

load_dotenv()

app = FastAPI()

origins = [
    "http://localhost:3000",    # Next.js frontend
    "http://127.0.0.1:3000",
]

# Configure CORS to allow requests from your Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")

class Message(BaseModel):
    role: str
    content: str

class ConversationRequest(BaseModel):
    messages: List[Message]
    current_question: str = ""

# Test endpoint to check API keys
@app.get("/api/test-config")
async def test_config():
    return JSONResponse(
        content={
            "openai_key_set": bool(OPENAI_API_KEY),
            "anthropic_key_set": bool(ANTHROPIC_API_KEY)
        },
        headers={
            "Access-Control-Allow-Origin": "http://localhost:3000",
            "Access-Control-Allow-Credentials": "true",
        }
    )

# Endpoint to handle speech-to-text with Whisper
@app.post("/api/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    if not file:
        return JSONResponse(
            status_code=400,
            content={"detail": "No audio file provided"},
            headers={
                "Access-Control-Allow-Origin": "http://localhost:3000",
                "Access-Control-Allow-Credentials": "true",
            }
        )
    
    try:
        # Read file contents
        contents = await file.read()
        
        # Create a form with the audio file
        async with httpx.AsyncClient() as client:
            files = {'file': (file.filename, contents, file.content_type)}
            headers = {
                'Authorization': f'Bearer {OPENAI_API_KEY}'
            }
            response = await client.post(
                'https://api.openai.com/v1/audio/transcriptions',
                files=files,
                data={'model': 'whisper-1'},
                headers=headers,
                timeout=30.0
            )
        
        if response.status_code != 200:
            return JSONResponse(
                status_code=response.status_code,
                content={"detail": "Error transcribing audio"},
                headers={
                    "Access-Control-Allow-Origin": "http://localhost:3000",
                    "Access-Control-Allow-Credentials": "true",
                }
            )
        
        return JSONResponse(
            content=response.json(),
            headers={
                "Access-Control-Allow-Origin": "http://localhost:3000",
                "Access-Control-Allow-Credentials": "true",
            }
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"detail": str(e)},
            headers={
                "Access-Control-Allow-Origin": "http://localhost:3000",
                "Access-Control-Allow-Credentials": "true",
            }
        )

# Endpoint to get a response from Claude
@app.post("/api/chat")
async def get_claude_response(request: ConversationRequest):
    system_prompt = """You are a helpful AI tutor. Ask guiding questions to help students understand
    how to solve problems step by step. Be encouraging but don't give away answers immediately.
    Keep responses concise and clear, as they will be read aloud to the student."""
    
    # Format messages for Claude API
    claude_messages = [{"role": msg.role, "content": msg.content} for msg in request.messages]
    
    # Make request to Claude API
    async with httpx.AsyncClient() as client:
        headers = {
            'Content-Type': 'application/json',
            'x-api-key': ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01'
        }
        payload = {
            "model": "claude-3-7-sonnet-20250219",
            "max_tokens": 1024,
            "messages": claude_messages,
            "system": system_prompt
        }
        
        response = await client.post(
            'https://api.anthropic.com/v1/messages',
            json=payload,
            headers=headers,
            timeout=30.0
        )
    
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail="Error getting AI response")
    
    response_data = response.json()
    return {"response": response_data["content"][0]["text"]}

# Endpoint for text-to-speech
@app.post("/api/text-to-speech")
async def text_to_speech(data: Dict[str, Any]):
    if "text" not in data:
        raise HTTPException(status_code=400, detail="No text provided")
    
    # Call OpenAI TTS API
    async with httpx.AsyncClient() as client:
        headers = {
            'Authorization': f'Bearer {OPENAI_API_KEY}',
            'Content-Type': 'application/json'
        }
        payload = {
            "model": "tts-1",
            "input": data["text"],
            "voice": "echo"  
        }
        
        response = await client.post(
            'https://api.openai.com/v1/audio/speech',
            json=payload,
            headers=headers,
            timeout=30.0
        )
    
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail="Error generating speech")
    
    # Return audio as binary response
    return Response(content=response.content, media_type="audio/mpeg")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)