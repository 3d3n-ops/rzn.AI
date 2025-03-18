import json
import os
import logging
from typing import List, Optional
import httpx
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from PyPDF2 import PdfReader
import io

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Remove the prefix as we'll handle it in the route decorator
router = APIRouter(
    tags=["quiz"]
)

class QuizQuestion(BaseModel):
    id: int
    question: str
    options: List[str]
    correctAnswer: str

class Quiz(BaseModel):
    questions: List[QuizQuestion]

async def extract_text_from_pdf(file: UploadFile) -> str:
    """Extract text from a PDF file using PyPDF2."""
    try:
        # Reset file position to start
        await file.seek(0)
        
        # Read the file content
        content = await file.read()
        logger.info(f"Read PDF file: {file.filename}, size: {len(content)} bytes")

        if len(content) == 0:
            logger.error("Received empty file")
            raise HTTPException(status_code=400, detail="The uploaded file is empty")

        try:
            # Create a PDF reader object
            pdf = PdfReader(io.BytesIO(content))
            logger.info(f"Opened PDF with {len(pdf.pages)} pages")

            # Extract text from all pages
            extracted_text = []
            total_chars = 0
            
            for i, page in enumerate(pdf.pages):
                try:
                    # Extract text from the page
                    text = page.extract_text()
                    chars = len(text) if text else 0
                    logger.info(f"Page {i+1}: extracted {chars} characters")
                    
                    if text:
                        # Clean up the text
                        text = text.strip()
                        text = ' '.join(text.split())  # Normalize whitespace
                        
                        # Remove any non-printable characters
                        text = ''.join(char for char in text if char.isprintable())
                        
                        extracted_text.append(text)
                        total_chars += len(text)
                        
                        # Log a sample of the extracted text for debugging
                        sample = text[:100] + '...' if len(text) > 100 else text
                        logger.debug(f"Sample from page {i+1}: {sample}")
                    else:
                        logger.warning(f"No text extracted from page {i+1}")
                
                except Exception as e:
                    logger.error(f"Error processing page {i+1}: {str(e)}")
                    continue

            # Combine all text
            full_text = '\n\n'.join(extracted_text)  # Use double newline for better separation
            logger.info(f"Total extracted text length: {total_chars} characters")

            if total_chars == 0:
                logger.error("No text extracted from PDF")
                raise HTTPException(status_code=400, detail="Could not extract any text from PDF")

            if total_chars < 50:
                logger.warning(f"Very little text extracted from PDF: {total_chars} characters")

            # Log a sample of the extracted text for debugging
            sample_length = min(200, len(full_text))
            logger.debug(f"Sample of final extracted text: {full_text[:sample_length]}...")

            return full_text

        except Exception as e:
            logger.error(f"Error processing PDF: {str(e)}")
            raise HTTPException(status_code=400, detail=f"Failed to process PDF: {str(e)}")

    except Exception as e:
        logger.error(f"Error extracting text from PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to process PDF file: {str(e)}")

async def generate_quiz_from_text(content: str) -> Quiz:
    """Generate a quiz using Claude API."""
    try:
        system_prompt = """You are a quiz generator that creates multiple choice questions based on provided content. 
You must respond with a valid JSON object containing exactly 5 questions."""

        user_prompt = f"""Create 5 multiple choice questions based on this content:

{content}

Your response must be a JSON object with exactly this structure:
{{
    "questions": [
        {{
            "id": 1,
            "question": "Question text",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswer": "The correct option (must be exactly one of the options)"
        }}
    ]
}}

Requirements:
1. Generate exactly 5 questions
2. Each question MUST have:
   - A unique numeric id (1 through 5)
   - A clear question based on the content
   - Exactly 4 options in the options array
   - A correctAnswer that matches EXACTLY one of the options
3. Questions should test understanding of the content
4. All questions and answers must be based on the provided content
5. Respond ONLY with the JSON object, no other text"""

        logger.info("Sending request to Claude API")
        logger.debug(f"Content length: {len(content)}")

        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "Content-Type": "application/json",
                    "x-api-key": os.getenv("ANTHROPIC_API_KEY"),
                    "anthropic-version": "2023-06-01"
                },
                json={
                    "model": "claude-3-5-sonnet-20240620",
                    "max_tokens": 2000,
                    "temperature": 0.2,
                    "system": system_prompt,
                    "messages": [
                        {
                            "role": "user",
                            "content": user_prompt
                        }
                    ]
                },
                timeout=30.0
            )

            if response.status_code != 200:
                logger.error(f"Claude API error: {response.status_code} - {response.text}")
                raise HTTPException(status_code=500, detail="Failed to generate quiz")

            # Parse Claude's response
            claude_response = response.json()
            logger.info("Received response from Claude API")
            logger.debug(f"Claude response: {claude_response}")
            
            try:
                # Extract the content from Claude's response
                if not claude_response.get("content") or not claude_response["content"]:
                    raise HTTPException(status_code=500, detail="Empty response from Claude API")

                content_text = claude_response["content"][0]["text"]
                logger.debug(f"Raw response text: {content_text}")

                # Try to extract JSON from the response text
                try:
                    # Look for JSON object in the response
                    start_idx = content_text.find('{')
                    end_idx = content_text.rfind('}') + 1
                    if start_idx >= 0 and end_idx > start_idx:
                        json_str = content_text[start_idx:end_idx]
                        quiz_data = json.loads(json_str)
                    else:
                        quiz_data = json.loads(content_text)
                except json.JSONDecodeError as e:
                    logger.error(f"Failed to parse JSON: {e}")
                    logger.error(f"Content text: {content_text}")
                    raise HTTPException(status_code=500, detail="Invalid JSON in response")

                logger.info("Successfully parsed quiz data")
                logger.debug(f"Quiz data: {quiz_data}")

                # Validate the quiz data structure
                if not isinstance(quiz_data, dict) or "questions" not in quiz_data:
                    logger.error(f"Invalid quiz data structure: {quiz_data}")
                    raise HTTPException(status_code=500, detail="Invalid quiz format")

                # Ensure we have exactly 5 questions
                if len(quiz_data["questions"]) != 5:
                    logger.error(f"Wrong number of questions: {len(quiz_data['questions'])}")
                    raise HTTPException(status_code=500, detail="Invalid number of questions")

                # Validate each question
                for q in quiz_data["questions"]:
                    if not all(key in q for key in ["id", "question", "options", "correctAnswer"]):
                        logger.error(f"Missing required fields in question: {q}")
                        raise HTTPException(status_code=500, detail="Invalid question format")
                    if len(q["options"]) != 4:
                        logger.error(f"Wrong number of options in question {q['id']}: {len(q['options'])}")
                        raise HTTPException(status_code=500, detail="Invalid number of options")
                    if q["correctAnswer"] not in q["options"]:
                        logger.error(f"Correct answer not in options for question {q['id']}")
                        raise HTTPException(status_code=500, detail="Invalid correct answer")

                # Create and validate the Quiz object
                quiz = Quiz.model_validate(quiz_data)
                logger.info("Successfully validated quiz data")
                return quiz

            except json.JSONDecodeError as e:
                logger.error(f"JSON decode error: {str(e)}")
                logger.error(f"Response content: {claude_response}")
                raise HTTPException(status_code=500, detail="Invalid JSON response from API")
            except Exception as e:
                logger.error(f"Error processing quiz data: {str(e)}")
                raise HTTPException(status_code=500, detail=str(e))

    except Exception as e:
        logger.error(f"Error generating quiz: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/quiz", summary="Generate a quiz from uploaded file")
@router.post("/quiz/", summary="Generate a quiz from uploaded file")
async def generate_quiz(file: UploadFile = File(...)):
    logger.info(f"Received file: {file.filename}")
    
    try:
        # Reset file position to start
        await file.seek(0)
        
        # Extract text based on file type
        if file.filename.lower().endswith('.pdf'):
            content_str = await extract_text_from_pdf(file)
        else:
            content = await file.read()
            try:
                content_str = content.decode('utf-8')
            except UnicodeDecodeError:
                # Try different encodings if UTF-8 fails
                try:
                    content_str = content.decode('latin-1')
                except UnicodeDecodeError:
                    raise HTTPException(
                        status_code=400,
                        detail="Could not decode file content. Please ensure it's a valid text or PDF file."
                    )

        if not content_str or len(content_str.strip()) == 0:
            raise HTTPException(status_code=400, detail="The file contains no text content")

        logger.info(f"File content length: {len(content_str)}")
        
        # Generate quiz from the extracted text
        quiz = await generate_quiz_from_text(content_str)
        return quiz
        
    except Exception as e:
        logger.error(f"Error in quiz generation endpoint: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e)) 