import requests
import json
import uuid
from datetime import datetime

# Backend URL from frontend/.env
BACKEND_URL = "https://67680f7c-41fe-4a45-ae77-567353ef9877.preview.emergentagent.com/api"

def test_root_endpoint():
    print("\n=== Testing Root Endpoint ===")
    response = requests.get(f"{BACKEND_URL}/")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    return response.status_code == 200

def test_status_endpoints():
    print("\n=== Testing Status Endpoints ===")
    
    # Test POST /api/status
    client_name = f"test-client-{uuid.uuid4()}"
    post_data = {"client_name": client_name}
    post_response = requests.post(f"{BACKEND_URL}/status", json=post_data)
    print(f"POST Status Code: {post_response.status_code}")
    print(f"POST Response: {post_response.json()}")
    
    # Test GET /api/status
    get_response = requests.get(f"{BACKEND_URL}/status")
    print(f"GET Status Code: {get_response.status_code}")
    print(f"GET Response contains {len(get_response.json())} status checks")
    
    return post_response.status_code == 200 and get_response.status_code == 200

def test_tmdb_endpoints():
    print("\n=== Testing TMDB Endpoints ===")
    
    # Test movie ID to use for testing
    movie_id = "550"  # Fight Club
    
    endpoints = [
        {"name": "Movie Recommendations", "url": f"{BACKEND_URL}/movies/recommendations/{movie_id}"},
        {"name": "Similar Movies", "url": f"{BACKEND_URL}/movies/similar/{movie_id}"},
        {"name": "Trending Movies", "url": f"{BACKEND_URL}/movies/trending"},
        {"name": "Popular Movies", "url": f"{BACKEND_URL}/movies/popular"},
        {"name": "Top Rated Movies", "url": f"{BACKEND_URL}/movies/top-rated"},
        {"name": "Upcoming Movies", "url": f"{BACKEND_URL}/movies/upcoming"},
        {"name": "Now Playing Movies", "url": f"{BACKEND_URL}/movies/now-playing"},
        {"name": "Movie Search", "url": f"{BACKEND_URL}/movies/search?query=inception"},
        {"name": "Movie Discover", "url": f"{BACKEND_URL}/movies/discover?genre=28&sort_by=popularity.desc"},
        {"name": "Movie Details", "url": f"{BACKEND_URL}/movies/{movie_id}"},
        {"name": "Movie Genres", "url": f"{BACKEND_URL}/genres"}
    ]
    
    results = {}
    all_successful = True
    
    for endpoint in endpoints:
        try:
            response = requests.get(endpoint["url"])
            status_code = response.status_code
            results[endpoint["name"]] = {
                "status_code": status_code,
                "success": 200 <= status_code < 300
            }
            
            if status_code != 200:
                all_successful = False
                print(f"❌ {endpoint['name']}: Status Code {status_code}")
                print(f"Response: {response.text[:200]}...")
            else:
                print(f"✅ {endpoint['name']}: Status Code {status_code}")
        except Exception as e:
            results[endpoint["name"]] = {
                "status_code": None,
                "success": False,
                "error": str(e)
            }
            all_successful = False
            print(f"❌ {endpoint['name']}: Error - {str(e)}")
    
    return all_successful, results

def test_user_profile_endpoints():
    print("\n=== Testing User Profile Endpoints ===")
    
    # Generate test user data
    user_id = f"test-user-{uuid.uuid4()}"
    
    # Test profile creation
    create_data = {
        "user_id": user_id,
        "display_name": "Test User",
        "bio": "This is a test user profile",
        "avatar_url": "https://example.com/avatar.jpg",
        "favorite_genres": ["28", "12"],
        "language": "en",
        "theme": "dark",
        "notifications_enabled": True
    }
    
    create_response = requests.post(f"{BACKEND_URL}/profile", json=create_data)
    print(f"Create Profile Status Code: {create_response.status_code}")
    
    if create_response.status_code != 200:
        print(f"Create Profile Error: {create_response.text}")
        return False, {}
    
    print(f"Created Profile: {create_response.json()}")
    
    # Test get profile
    get_response = requests.get(f"{BACKEND_URL}/profile/{user_id}")
    print(f"Get Profile Status Code: {get_response.status_code}")
    
    if get_response.status_code != 200:
        print(f"Get Profile Error: {get_response.text}")
        return False, {}
    
    print(f"Retrieved Profile: {get_response.json()}")
    
    # Test update profile
    update_data = {
        "display_name": "Updated Test User",
        "bio": "This is an updated test user profile",
        "theme": "light"
    }
    
    update_response = requests.put(f"{BACKEND_URL}/profile/{user_id}", json=update_data)
    print(f"Update Profile Status Code: {update_response.status_code}")
    
    if update_response.status_code != 200:
        print(f"Update Profile Error: {update_response.text}")
        return False, {}
    
    updated_profile = update_response.json()
    print(f"Updated Profile: {updated_profile}")
    
    # Verify updates were applied
    success = (
        updated_profile["display_name"] == update_data["display_name"] and
        updated_profile["bio"] == update_data["bio"] and
        updated_profile["theme"] == update_data["theme"]
    )
    
    if not success:
        print("❌ Profile update verification failed")
        return False, {}
    
    print("✅ Profile update verification successful")
    
    # Test get non-existent profile
    nonexistent_response = requests.get(f"{BACKEND_URL}/profile/nonexistent-user-id")
    print(f"Get Non-existent Profile Status Code: {nonexistent_response.status_code}")
    
    if nonexistent_response.status_code != 404:
        print(f"❌ Non-existent profile should return 404, got {nonexistent_response.status_code}")
        return False, {}
    
    print("✅ Non-existent profile correctly returns 404")
    
    return True, {
        "create": create_response.status_code == 200,
        "get": get_response.status_code == 200,
        "update": update_response.status_code == 200,
        "get_nonexistent": nonexistent_response.status_code == 404
    }

def test_comments_endpoints():
    print("\n=== Testing Comments Endpoints ===")
    
    # Generate test data
    movie_id = "550"  # Fight Club
    user_id = f"test-user-{uuid.uuid4()}"
    
    # Test comment creation
    create_data = {
        "movie_id": movie_id,
        "user_id": user_id,
        "user_name": "Test Commenter",
        "user_avatar": "https://example.com/avatar.jpg",
        "content": "This is a test comment"
    }
    
    create_response = requests.post(f"{BACKEND_URL}/comments", json=create_data)
    print(f"Create Comment Status Code: {create_response.status_code}")
    
    if create_response.status_code != 200:
        print(f"Create Comment Error: {create_response.text}")
        return False, {}
    
    comment = create_response.json()
    comment_id = comment["id"]
    print(f"Created Comment: {comment}")
    
    # Test get comments for movie
    get_response = requests.get(f"{BACKEND_URL}/comments/{movie_id}")
    print(f"Get Comments Status Code: {get_response.status_code}")
    
    if get_response.status_code != 200:
        print(f"Get Comments Error: {get_response.text}")
        return False, {}
    
    comments = get_response.json()
    print(f"Retrieved {len(comments)} comments for movie {movie_id}")
    
    # Test update comment
    update_data = {
        "content": "This is an updated test comment"
    }
    
    update_response = requests.put(f"{BACKEND_URL}/comments/{comment_id}", json=update_data)
    print(f"Update Comment Status Code: {update_response.status_code}")
    
    if update_response.status_code != 200:
        print(f"Update Comment Error: {update_response.text}")
        return False, {}
    
    updated_comment = update_response.json()
    print(f"Updated Comment: {updated_comment}")
    
    # Verify update was applied
    if updated_comment["content"] != update_data["content"]:
        print("❌ Comment update verification failed")
        return False, {}
    
    print("✅ Comment update verification successful")
    
    # Test like comment
    like_response = requests.post(f"{BACKEND_URL}/comments/{comment_id}/like?user_id={user_id}")
    print(f"Like Comment Status Code: {like_response.status_code}")
    
    if like_response.status_code != 200:
        print(f"Like Comment Error: {like_response.text}")
        return False, {}
    
    print(f"Like Comment Response: {like_response.json()}")
    
    # Test delete comment
    delete_response = requests.delete(f"{BACKEND_URL}/comments/{comment_id}")
    print(f"Delete Comment Status Code: {delete_response.status_code}")
    
    if delete_response.status_code != 200:
        print(f"Delete Comment Error: {delete_response.text}")
        return False, {}
    
    print(f"Delete Comment Response: {delete_response.json()}")
    
    # Verify comment was deleted
    get_comments_after_delete = requests.get(f"{BACKEND_URL}/comments/{movie_id}")
    comments_after_delete = get_comments_after_delete.json()
    
    comment_still_exists = any(c["id"] == comment_id for c in comments_after_delete)
    if comment_still_exists:
        print("❌ Comment deletion verification failed")
        return False, {}
    
    print("✅ Comment deletion verification successful")
    
    # Test non-existent comment
    nonexistent_response = requests.put(f"{BACKEND_URL}/comments/nonexistent-comment-id", json=update_data)
    print(f"Update Non-existent Comment Status Code: {nonexistent_response.status_code}")
    
    if nonexistent_response.status_code != 404:
        print(f"❌ Non-existent comment should return 404, got {nonexistent_response.status_code}")
        return False, {}
    
    print("✅ Non-existent comment correctly returns 404")
    
    return True, {
        "create": create_response.status_code == 200,
        "get": get_response.status_code == 200,
        "update": update_response.status_code == 200,
        "like": like_response.status_code == 200,
        "delete": delete_response.status_code == 200,
        "get_nonexistent": nonexistent_response.status_code == 404
    }

def run_all_tests():
    print("\n===== SAYN Movie App Backend API Testing =====")
    
    results = {}
    
    # Test root endpoint
    results["root_endpoint"] = test_root_endpoint()
    
    # Test status endpoints
    results["status_endpoints"] = test_status_endpoints()
    
    # Test TMDB endpoints
    tmdb_success, tmdb_results = test_tmdb_endpoints()
    results["tmdb_endpoints"] = {
        "success": tmdb_success,
        "details": tmdb_results
    }
    
    # Test user profile endpoints
    profile_success, profile_results = test_user_profile_endpoints()
    results["user_profile_endpoints"] = {
        "success": profile_success,
        "details": profile_results
    }
    
    # Test comments endpoints
    comments_success, comments_results = test_comments_endpoints()
    results["comments_endpoints"] = {
        "success": comments_success,
        "details": comments_results
    }
    
    # Print summary
    print("\n===== Test Results Summary =====")
    for category, result in results.items():
        if isinstance(result, dict) and "success" in result:
            success = result["success"]
            print(f"{category}: {'✅ Success' if success else '❌ Failed'}")
        else:
            print(f"{category}: {'✅ Success' if result else '❌ Failed'}")
    
    return results

if __name__ == "__main__":
    run_all_tests()