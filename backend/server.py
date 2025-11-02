from fastapi import FastAPI, APIRouter, HTTPException, Query, BackgroundTasks
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
import requests
import asyncio
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# API configuration
TMDB_API_KEY = os.environ.get('TMDB_API_KEY', 'demo-key-replace-with-real')
TMDB_BASE_URL = "https://api.themoviedb.org/3"
IMDB_API_KEY = os.environ.get('IMDB_API_KEY')
IMDB_HOST = os.environ.get('IMDB_HOST', 'imdb8.p.rapidapi.com')

# Create the main app without a prefix
app = FastAPI(
    title="SAYN Movie App API",
    description="Advanced Movie Discovery Platform with AI Recommendations",
    version="2.0.0"
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Enhanced Models
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
    is_premium: bool = False
    subscription_expires: Optional[datetime] = None
    watch_time: int = 0  # in minutes
    favorite_movies: List[str] = []
    watchlist: List[str] = []
    watched_history: List[Dict] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class MultipleProfile(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    parent_user_id: str
    profile_name: str
    avatar_url: Optional[str] = None
    age_group: str = "adult"  # kid, teen, adult
    content_filter: str = "none"  # none, mild, strict
    allowed_genres: List[str] = []
    watch_time_limit: Optional[int] = None  # minutes per day
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class MovieRating(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    movie_id: str
    user_id: str
    profile_id: Optional[str] = None
    rating: float = Field(ge=0, le=10)
    review: Optional[str] = None
    is_public: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class MovieReview(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    movie_id: str
    user_id: str
    user_name: str
    user_avatar: Optional[str] = None
    title: str
    content: str
    rating: float = Field(ge=0, le=10)
    likes: int = 0
    dislikes: int = 0
    liked_by: List[str] = []
    disliked_by: List[str] = []
    is_verified_review: bool = False
    spoiler_alert: bool = False
    helpful_votes: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class WatchHistory(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    profile_id: Optional[str] = None
    movie_id: str
    movie_title: str
    watch_duration: int = 0  # minutes watched
    total_duration: int = 0  # total movie duration
    progress_percentage: float = 0.0
    completed: bool = False
    watched_at: datetime = Field(default_factory=datetime.utcnow)

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

class IMDbMovieData(BaseModel):
    imdb_id: str
    title: str
    year: Optional[int] = None
    imdb_rating: Optional[float] = None
    imdb_votes: Optional[int] = None
    metacritic_score: Optional[int] = None
    plot: Optional[str] = None
    director: Optional[str] = None
    cast: List[str] = []
    genres: List[str] = []
    runtime: Optional[str] = None
    age_rating: Optional[str] = None
    poster_url: Optional[str] = None
    trailer_url: Optional[str] = None
    awards: Optional[str] = None
    box_office: Optional[str] = None
    language: Optional[str] = None
    country: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# Helper functions for APIs
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

async def get_imdb_data(endpoint: str, params: dict = None):
    """Fetch data from IMDb RapidAPI"""
    if params is None:
        params = {}
    
    headers = {
        "X-RapidAPI-Key": IMDB_API_KEY,
        "X-RapidAPI-Host": IMDB_HOST
    }
    
    try:
        response = requests.get(f"https://{IMDB_HOST}/{endpoint}", headers=headers, params=params)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        logger.error(f"IMDb API error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch IMDb data")

async def process_imdb_movie_data(imdb_data: dict) -> dict:
    """Process IMDb API response into standardized format"""
    try:
        return {
            "imdb_id": imdb_data.get("id", "").replace("/title/", "").replace("/", ""),
            "title": imdb_data.get("title", {}).get("title", ""),
            "year": imdb_data.get("title", {}).get("year"),
            "imdb_rating": imdb_data.get("ratings", {}).get("rating"),
            "imdb_votes": imdb_data.get("ratings", {}).get("ratingCount"),
            "metacritic_score": imdb_data.get("metacritic", {}).get("metaScore"),
            "plot": imdb_data.get("plot", {}).get("plotText", {}).get("plainText", ""),
            "director": ", ".join([d.get("name", "") for d in imdb_data.get("directors", [])[:3]]),
            "cast": [actor.get("name", "") for actor in imdb_data.get("cast", [])[:10]],
            "genres": [g.get("text", "") for g in imdb_data.get("genres", [])],
            "runtime": imdb_data.get("runtime", {}).get("displayableProperty", {}).get("value", {}).get("plainText"),
            "age_rating": imdb_data.get("certificate", {}).get("rating"),
            "poster_url": imdb_data.get("primaryImage", {}).get("url"),
            "awards": imdb_data.get("wins", {}).get("total", 0),
            "language": imdb_data.get("spokenLanguages", {}).get("spokenLanguages", [{}])[0].get("text", ""),
            "country": imdb_data.get("countriesOfOrigin", {}).get("countries", [{}])[0].get("text", "")
        }
    except Exception as e:
        logger.error(f"Error processing IMDb data: {e}")
        return {}

async def calculate_user_recommendations(user_id: str, limit: int = 20) -> List[Dict]:
    """AI-powered movie recommendations based on user behavior"""
    try:
        # Get user's watch history and ratings
        user_profile = await db.user_profiles.find_one({"user_id": user_id})
        if not user_profile:
            return []
        
        watched_movies = await db.watch_history.find({"user_id": user_id}).to_list(100)
        user_ratings = await db.movie_ratings.find({"user_id": user_id}).to_list(100)
        
        # Get user's favorite genres
        favorite_genres = user_profile.get("favorite_genres", [])
        
        # If user has limited history, recommend popular movies in their favorite genres
        if len(watched_movies) < 5:
            if favorite_genres:
                genre_string = "|".join(favorite_genres)
                recommendations = await get_tmdb_data("discover/movie", {
                    "with_genres": genre_string,
                    "sort_by": "popularity.desc",
                    "vote_average.gte": 7.0,
                    "page": 1
                })
                return recommendations.get("results", [])[:limit]
        
        # Advanced recommendation logic for users with history
        watched_movie_ids = [movie["movie_id"] for movie in watched_movies]
        high_rated_movies = [rating["movie_id"] for rating in user_ratings if rating["rating"] >= 7.5]
        
        recommendations = []
        
        # Get similar movies for high-rated ones
        for movie_id in high_rated_movies[:5]:
            try:
                similar_data = await get_tmdb_data(f"movie/{movie_id}/similar")
                similar_movies = similar_data.get("results", [])
                for movie in similar_movies:
                    if movie["id"] not in watched_movie_ids:
                        recommendations.append(movie)
            except:
                continue
        
        # Remove duplicates and limit results
        seen_ids = set()
        unique_recommendations = []
        for movie in recommendations:
            if movie["id"] not in seen_ids and len(unique_recommendations) < limit:
                seen_ids.add(movie["id"])
                unique_recommendations.append(movie)
        
        return unique_recommendations
        
    except Exception as e:
        logger.error(f"Error calculating recommendations: {e}")
        return []

# Existing routes
@api_router.get("/")
async def root():
    return {"message": "SAYN Movie App API v2.0 - Enhanced with AI Features"}

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

# Enhanced TMDB Movie endpoints
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
    vote_average_lte: Optional[float] = None,
    with_original_language: Optional[str] = None,
    with_keywords: Optional[str] = None
):
    """Advanced movie discovery with filters"""
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
    if with_original_language:
        params["with_original_language"] = with_original_language
    if with_keywords:
        params["with_keywords"] = with_keywords
    
    data = await get_tmdb_data("discover/movie", params)
    return data

@api_router.get("/movies/{movie_id}")
async def get_movie_details(movie_id: str):
    """Get detailed information about a specific movie with IMDb integration"""
    # Get TMDB data
    tmdb_data = await get_tmdb_data(f"movie/{movie_id}", {"append_to_response": "credits,videos,keywords,reviews"})
    
    # Try to get IMDb data if available
    imdb_data = None
    try:
        if tmdb_data.get("imdb_id"):
            imdb_id = tmdb_data["imdb_id"]
            # Check cache first
            cached_imdb = await db.imdb_cache.find_one({"imdb_id": imdb_id})
            if cached_imdb:
                imdb_data = cached_imdb
            else:
                # Fetch from IMDb API
                imdb_response = await get_imdb_data(f"title/get-details", {"tconst": imdb_id})
                if imdb_response:
                    processed_imdb = await process_imdb_movie_data(imdb_response)
                    if processed_imdb:
                        # Cache the result
                        await db.imdb_cache.update_one(
                            {"imdb_id": imdb_id},
                            {"$set": processed_imdb},
                            upsert=True
                        )
                        imdb_data = processed_imdb
    except Exception as e:
        logger.warning(f"Could not fetch IMDb data: {e}")
    
    # Combine TMDB and IMDb data
    result = tmdb_data.copy()
    if imdb_data:
        result["imdb_details"] = imdb_data
    
    return result

@api_router.get("/genres")
async def get_movie_genres():
    """Get list of movie genres"""
    data = await get_tmdb_data("genre/movie/list")
    return data

# Enhanced User Profile endpoints
@api_router.post("/profile", response_model=UserProfile)
async def create_user_profile(profile: UserProfileCreate):
    """Create a new user profile"""
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

# NEW: Multiple Profiles Management
@api_router.post("/profile/{user_id}/multiple-profiles", response_model=MultipleProfile)
async def create_multiple_profile(user_id: str, profile_data: dict):
    """Create additional profile for family members"""
    profile_obj = MultipleProfile(
        parent_user_id=user_id,
        **profile_data
    )
    await db.multiple_profiles.insert_one(profile_obj.dict())
    return profile_obj

@api_router.get("/profile/{user_id}/multiple-profiles", response_model=List[MultipleProfile])
async def get_multiple_profiles(user_id: str):
    """Get all profiles for a user"""
    profiles = await db.multiple_profiles.find({"parent_user_id": user_id}).to_list(10)
    return [MultipleProfile(**profile) for profile in profiles]

@api_router.delete("/multiple-profiles/{profile_id}")
async def delete_multiple_profile(profile_id: str):
    """Delete a multiple profile"""
    result = await db.multiple_profiles.delete_one({"id": profile_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Profile not found")
    return {"message": "Profile deleted successfully"}

# NEW: AI-Powered User Recommendations
@api_router.get("/recommendations/{user_id}")
async def get_user_recommendations(user_id: str, limit: int = Query(20, le=50)):
    """Get AI-powered movie recommendations for user"""
    recommendations = await calculate_user_recommendations(user_id, limit)
    return {"recommendations": recommendations}

# NEW: Movie Rating System
@api_router.post("/movies/{movie_id}/rate", response_model=MovieRating)
async def rate_movie(movie_id: str, rating_data: dict):
    """Rate a movie"""
    # Check if user already rated this movie
    existing = await db.movie_ratings.find_one({
        "movie_id": movie_id,
        "user_id": rating_data["user_id"]
    })
    
    if existing:
        # Update existing rating
        await db.movie_ratings.update_one(
            {"id": existing["id"]},
            {"$set": {**rating_data, "updated_at": datetime.utcnow()}}
        )
        updated = await db.movie_ratings.find_one({"id": existing["id"]})
        return MovieRating(**updated)
    else:
        # Create new rating
        rating_obj = MovieRating(movie_id=movie_id, **rating_data)
        await db.movie_ratings.insert_one(rating_obj.dict())
        return rating_obj

@api_router.get("/movies/{movie_id}/ratings")
async def get_movie_ratings(movie_id: str, page: int = Query(1, ge=1), limit: int = Query(20, le=100)):
    """Get all ratings for a movie"""
    skip = (page - 1) * limit
    ratings = await db.movie_ratings.find({"movie_id": movie_id}).skip(skip).limit(limit).to_list(limit)
    
    # Calculate average rating
    all_ratings = await db.movie_ratings.find({"movie_id": movie_id}).to_list(1000)
    avg_rating = sum(r["rating"] for r in all_ratings) / len(all_ratings) if all_ratings else 0
    
    return {
        "ratings": [MovieRating(**rating) for rating in ratings],
        "average_rating": round(avg_rating, 1),
        "total_ratings": len(all_ratings)
    }

# NEW: Enhanced Review System
@api_router.post("/movies/{movie_id}/reviews", response_model=MovieReview)
async def create_movie_review(movie_id: str, review_data: dict):
    """Create a movie review"""
    review_obj = MovieReview(movie_id=movie_id, **review_data)
    await db.movie_reviews.insert_one(review_obj.dict())
    return review_obj

@api_router.get("/movies/{movie_id}/reviews")
async def get_movie_reviews(
    movie_id: str, 
    page: int = Query(1, ge=1), 
    limit: int = Query(10, le=50),
    sort_by: str = "created_at"
):
    """Get movie reviews with sorting"""
    skip = (page - 1) * limit
    sort_direction = -1 if sort_by in ["created_at", "likes", "helpful_votes"] else 1
    
    reviews = await db.movie_reviews.find({"movie_id": movie_id}).sort(sort_by, sort_direction).skip(skip).limit(limit).to_list(limit)
    return [MovieReview(**review) for review in reviews]

@api_router.post("/reviews/{review_id}/like")
async def like_review(review_id: str, user_id: str):
    """Like or unlike a review"""
    review = await db.movie_reviews.find_one({"id": review_id})
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    liked_by = review.get("liked_by", [])
    disliked_by = review.get("disliked_by", [])
    
    if user_id in liked_by:
        # Unlike
        await db.movie_reviews.update_one(
            {"id": review_id},
            {
                "$pull": {"liked_by": user_id},
                "$inc": {"likes": -1}
            }
        )
        action = "unliked"
    else:
        # Remove from dislikes if present
        if user_id in disliked_by:
            await db.movie_reviews.update_one(
                {"id": review_id},
                {
                    "$pull": {"disliked_by": user_id},
                    "$inc": {"dislikes": -1}
                }
            )
        
        # Like
        await db.movie_reviews.update_one(
            {"id": review_id},
            {
                "$push": {"liked_by": user_id},
                "$inc": {"likes": 1}
            }
        )
        action = "liked"
    
    return {"message": f"Review {action} successfully"}

# NEW: Watch History Tracking
@api_router.post("/watch-history", response_model=WatchHistory)
async def add_watch_history(history_data: dict):
    """Add or update watch history"""
    existing = await db.watch_history.find_one({
        "user_id": history_data["user_id"],
        "movie_id": history_data["movie_id"]
    })
    
    if existing:
        # Update existing record
        await db.watch_history.update_one(
            {"id": existing["id"]},
            {"$set": {**history_data, "watched_at": datetime.utcnow()}}
        )
        updated = await db.watch_history.find_one({"id": existing["id"]})
        return WatchHistory(**updated)
    else:
        # Create new record
        history_obj = WatchHistory(**history_data)
        await db.watch_history.insert_one(history_obj.dict())
        return history_obj

@api_router.get("/watch-history/{user_id}")
async def get_watch_history(user_id: str, limit: int = Query(50, le=200)):
    """Get user's watch history"""
    history = await db.watch_history.find({"user_id": user_id}).sort("watched_at", -1).limit(limit).to_list(limit)
    return [WatchHistory(**item) for item in history]

# NEW: Advanced Search with Filters
@api_router.get("/movies/advanced-search")
async def advanced_movie_search(
    query: Optional[str] = None,
    genres: Optional[str] = None,
    year_from: Optional[int] = None,
    year_to: Optional[int] = None,
    rating_from: Optional[float] = None,
    rating_to: Optional[float] = None,
    language: Optional[str] = None,
    sort_by: str = "popularity.desc",
    page: int = Query(1, ge=1)
):
    """Advanced search with multiple filters"""
    if query:
        # Text search
        params = {"query": query, "page": page}
        data = await get_tmdb_data("search/movie", params)
    else:
        # Discovery with filters
        params = {"page": page, "sort_by": sort_by}
        
        if genres:
            params["with_genres"] = genres
        if year_from:
            params["primary_release_date.gte"] = f"{year_from}-01-01"
        if year_to:
            params["primary_release_date.lte"] = f"{year_to}-12-31"
        if rating_from:
            params["vote_average.gte"] = rating_from
        if rating_to:
            params["vote_average.lte"] = rating_to
        if language:
            params["with_original_language"] = language
        
        data = await get_tmdb_data("discover/movie", params)
    
    return data

# Existing Comments endpoints (enhanced)
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

# NEW: Statistics and Analytics
@api_router.get("/stats/{user_id}")
async def get_user_stats(user_id: str):
    """Get comprehensive user statistics"""
    profile = await db.user_profiles.find_one({"user_id": user_id})
    watch_history = await db.watch_history.find({"user_id": user_id}).to_list(1000)
    ratings = await db.movie_ratings.find({"user_id": user_id}).to_list(1000)
    
    total_watch_time = sum(item.get("watch_duration", 0) for item in watch_history)
    completed_movies = len([item for item in watch_history if item.get("completed", False)])
    avg_rating = sum(r.get("rating", 0) for r in ratings) / len(ratings) if ratings else 0
    
    # Genre preferences
    genre_counts = {}
    for item in watch_history:
        # This would require movie genre data to be stored
        pass
    
    return {
        "total_watch_time_hours": round(total_watch_time / 60, 1),
        "movies_completed": completed_movies,
        "movies_rated": len(ratings),
        "average_rating_given": round(avg_rating, 1),
        "favorite_genres": profile.get("favorite_genres", []) if profile else [],
        "join_date": profile.get("created_at") if profile else None
    }

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
