from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import os
from dotenv import load_dotenv
from api.quiz.quiz import router as quiz_router

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI(debug=True)

# Configure CORS
logger.info("Configuring CORS middleware...")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Mount routers
logger.info("Mounting quiz router at /api prefix...")
app.include_router(quiz_router, prefix="/api")

@app.get("/")
async def root():
    routes = [{"path": route.path, "methods": route.methods} for route in app.routes]
    logger.info(f"Available routes: {routes}")
    return {"status": "ok", "routes": routes}

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting FastAPI server...")
    uvicorn.run(app, host="0.0.0.0", port=8001, log_level="info") 