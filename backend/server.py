from fastapi import FastAPI, APIRouter, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
import requests
import asyncio


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# TMDB API configuration
TMDB_API_KEY = os.environ.get('TMDB_API_KEY', 'demo-key-replace-with-real')
TMDB_BASE_URL = "https://api.themoviedb.org/3"

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

class UserProfile(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    display_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    favorite_genres: List[str] = []
    language: str = "en"
    theme: str = "dark"
    notifications_enabled: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class UserProfileCreate(BaseModel):
    user_id: str
    display_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    favorite_genres: List[str] = []
    language: str = "en"
    theme: str = "dark"
    notifications_enabled: bool = True

class UserProfileUpdate(BaseModel):
    display_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    favorite_genres: Optional[List[str]] = None
    language: Optional[str] = None
    theme: Optional[str] = None
    notifications_enabled: Optional[bool] = None

class Comment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    movie_id: str
    user_id: str
    user_name: str
    user_avatar: Optional[str] = None
    content: str
    likes: int = 0
    liked_by: List[str] = []
    parent_id: Optional[str] = None  # For replies
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class CommentCreate(BaseModel):
    movie_id: str
    user_id: str
    user_name: str
    user_avatar: Optional[str] = None
    content: str
    parent_id: Optional[str] = None

class CommentUpdate(BaseModel):
    content: str


# Helper functions for TMDB API
async def get_tmdb_data(endpoint: str, params: dict = None):
    """Fetch data from TMDB API"""
    if params is None:
        params = {}
    params['api_key'] = TMDB_API_KEY
    
    try:
        response = requests.get(f"{TMDB_BASE_URL}/{endpoint}", params=params)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        logger.error(f"TMDB API error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch movie data")


# Existing routes
@api_router.get("/")
async def root():
    return {"message": "SAYN Movie App API"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]


# TMDB Movie endpoints
@api_router.get("/movies/recommendations/{movie_id}")
async def get_movie_recommendations(movie_id: str, page: int = Query(1, ge=1)):
    """Get movie recommendations based on a specific movie"""
    data = await get_tmdb_data(f"movie/{movie_id}/recommendations", {"page": page})
    return data

@api_router.get("/movies/similar/{movie_id}")
async def get_similar_movies(movie_id: str, page: int = Query(1, ge=1)):
    """Get movies similar to a specific movie"""
    data = await get_tmdb_data(f"movie/{movie_id}/similar", {"page": page})
    return data

@api_router.get("/movies/trending")
async def get_trending_movies(time_window: str = "day", page: int = Query(1, ge=1)):
    """Get trending movies (day or week)"""
    data = await get_tmdb_data(f"trending/movie/{time_window}", {"page": page})
    return data

@api_router.get("/movies/popular")
async def get_popular_movies(page: int = Query(1, ge=1)):
    """Get popular movies"""
    data = await get_tmdb_data("movie/popular", {"page": page})
    return data

@api_router.get("/movies/top-rated")
async def get_top_rated_movies(page: int = Query(1, ge=1)):
    """Get top rated movies"""
    data = await get_tmdb_data("movie/top_rated", {"page": page})
    return data

@api_router.get("/movies/upcoming")
async def get_upcoming_movies(page: int = Query(1, ge=1)):
    """Get upcoming movies"""
    data = await get_tmdb_data("movie/upcoming", {"page": page})
    return data

@api_router.get("/movies/now-playing")
async def get_now_playing_movies(page: int = Query(1, ge=1)):
    """Get now playing movies"""
    data = await get_tmdb_data("movie/now_playing", {"page": page})
    return data

@api_router.get("/movies/search")
async def search_movies(
    query: str = Query(..., min_length=1),
    page: int = Query(1, ge=1),
    year: Optional[int] = None
):
    """Search for movies"""
    params = {"query": query, "page": page}
    if year:
        params["year"] = year
    data = await get_tmdb_data("search/movie", params)
    return data

@api_router.get("/movies/discover")
async def discover_movies(
    page: int = Query(1, ge=1),
    genre: Optional[str] = None,
    year: Optional[int] = None,
    sort_by: str = "popularity.desc",
    vote_average_gte: Optional[float] = None,
    vote_average_lte: Optional[float] = None
):
    """Discover movies with filters"""
    params = {
        "page": page,
        "sort_by": sort_by
    }
    if genre:
        params["with_genres"] = genre
    if year:
        params["year"] = year
    if vote_average_gte:
        params["vote_average.gte"] = vote_average_gte
    if vote_average_lte:
        params["vote_average.lte"] = vote_average_lte
    
    data = await get_tmdb_data("discover/movie", params)
    return data

@api_router.get("/movies/{movie_id}")
async def get_movie_details(movie_id: str):
    """Get detailed information about a specific movie"""
    data = await get_tmdb_data(f"movie/{movie_id}", {"append_to_response": "credits,videos,keywords"})
    return data

@api_router.get("/genres")
async def get_movie_genres():
    """Get list of movie genres"""
    data = await get_tmdb_data("genre/movie/list")
    return data


# User Profile endpoints
@api_router.post("/profile", response_model=UserProfile)
async def create_user_profile(profile: UserProfileCreate):
    """Create a new user profile"""
    # Check if profile already exists
    existing = await db.user_profiles.find_one({"user_id": profile.user_id})
    if existing:
        raise HTTPException(status_code=400, detail="Profile already exists")
    
    profile_obj = UserProfile(**profile.dict())
    await db.user_profiles.insert_one(profile_obj.dict())
    return profile_obj

@api_router.get("/profile/{user_id}", response_model=UserProfile)
async def get_user_profile(user_id: str):
    """Get user profile by user ID"""
    profile = await db.user_profiles.find_one({"user_id": user_id})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return UserProfile(**profile)

@api_router.put("/profile/{user_id}", response_model=UserProfile)
async def update_user_profile(user_id: str, updates: UserProfileUpdate):
    """Update user profile"""
    profile = await db.user_profiles.find_one({"user_id": user_id})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    update_data = {k: v for k, v in updates.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    await db.user_profiles.update_one(
        {"user_id": user_id},
        {"$set": update_data}
    )
    
    updated_profile = await db.user_profiles.find_one({"user_id": user_id})
    return UserProfile(**updated_profile)


# Comments endpoints
@api_router.post("/comments", response_model=Comment)
async def create_comment(comment: CommentCreate):
    """Create a new comment"""
    comment_obj = Comment(**comment.dict())
    await db.comments.insert_one(comment_obj.dict())
    return comment_obj

@api_router.get("/comments/{movie_id}", response_model=List[Comment])
async def get_movie_comments(
    movie_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """Get comments for a specific movie"""
    skip = (page - 1) * limit
    comments = await db.comments.find(
        {"movie_id": movie_id, "parent_id": None}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(length=limit)
    
    # Get replies for each comment
    for comment in comments:
        replies = await db.comments.find(
            {"parent_id": comment["id"]}
        ).sort("created_at", 1).to_list(length=50)
        comment["replies"] = [Comment(**reply) for reply in replies]
    
    return [Comment(**comment) for comment in comments]

@api_router.put("/comments/{comment_id}", response_model=Comment)
async def update_comment(comment_id: str, updates: CommentUpdate):
    """Update a comment"""
    comment = await db.comments.find_one({"id": comment_id})
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    await db.comments.update_one(
        {"id": comment_id},
        {"$set": {"content": updates.content, "updated_at": datetime.utcnow()}}
    )
    
    updated_comment = await db.comments.find_one({"id": comment_id})
    return Comment(**updated_comment)

@api_router.delete("/comments/{comment_id}")
async def delete_comment(comment_id: str):
    """Delete a comment and its replies"""
    comment = await db.comments.find_one({"id": comment_id})
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # Delete the comment and all its replies
    await db.comments.delete_many({"$or": [{"id": comment_id}, {"parent_id": comment_id}]})
    return {"message": "Comment deleted successfully"}

@api_router.post("/comments/{comment_id}/like")
async def like_comment(comment_id: str, user_id: str):
    """Like or unlike a comment"""
    comment = await db.comments.find_one({"id": comment_id})
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    liked_by = comment.get("liked_by", [])
    
    if user_id in liked_by:
        # Unlike
        await db.comments.update_one(
            {"id": comment_id},
            {
                "$pull": {"liked_by": user_id},
                "$inc": {"likes": -1}
            }
        )
        action = "unliked"
    else:
        # Like
        await db.comments.update_one(
            {"id": comment_id},
            {
                "$push": {"liked_by": user_id},
                "$inc": {"likes": 1}
            }
        )
        action = "liked"
    
    return {"message": f"Comment {action} successfully"}


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()