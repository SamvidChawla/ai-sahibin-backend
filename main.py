import logging
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Rate Limiting Imports
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from security import limiter

from mock_data import DISPOSAL_INSTRUCTIONS
import detect 
import centers 

# ==========================================
# LOGGING CONFIGURATION
# ==========================================
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# ==========================================
# APP INITIALIZATION & MIDDLEWARE
# ==========================================
load_dotenv()

app = FastAPI(title="AI-SahiBin API")

# Initialize Rate Limiter (tracks users by IP address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # TODO: Restrict in deployment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(detect.router)
app.include_router(centers.router)

# ==========================================
# STATIC DISPOSAL INFORMATION ENDPOINT
# ==========================================

@app.get("/info/{category}")
@limiter.limit("20/minute") # Limits a single IP to 20 requests per minute
async def get_disposal_info(request: Request, category: str):
    logger.info(f"Disposal info requested for category: {category}")
    
    normalized_category = category.lower()
    if normalized_category not in DISPOSAL_INSTRUCTIONS:
        logger.warning(f"Category not found: {normalized_category}")
        raise HTTPException(status_code=404, detail="Disposal information not found.")
        
    return DISPOSAL_INSTRUCTIONS[normalized_category]