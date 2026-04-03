import os
import requests
from fastapi import APIRouter, Query , Request
from security import limiter

from mock_data import MOCK_CENTERS, DISPOSAL_INSTRUCTIONS

router = APIRouter()

# Mapping categories to specific Google keywords
CATEGORY_KEYWORDS = {
    "plastic": "plastic recycling center OR municipal dry waste bin",
    "organic": "compost drop off OR organic waste collection green bin",
    "e-waste": "electronics recycling OR battery disposal center",
    "cardboard": "paper and cardboard recycling center",
    "metal": "scrap metal yard OR metal recycling"
}

@router.get("/centers")
@limiter.limit("10/minute")
async def get_centers(
    request: Request,
    lat: float, 
    lng: float, 
    category: str = Query(None)
):
    api_key = os.getenv("GOOGLE_PLACES_API_KEY")
    
    # Determine Search Keyword
    base_keyword = "recycling center"
    if category:
        base_keyword = CATEGORY_KEYWORDS.get(category.lower(), "recycling center")

    # FALLBACK 1: Missing API Key
    if not api_key or api_key == "your_actual_api_key_here":
        return {
            "user_location": {"lat": lat, "lng": lng},
            "results": MOCK_CENTERS,
            "is_fallback": True,
            "reason": "Missing API Key"
        }

    url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    params = {
        "location": f"{lat},{lng}",
        "keyword": base_keyword,
        "key": api_key,
        "rankby": "distance" # Optimization: Finds the absolute closest ones
    }
    
    try:
        response = requests.get(url, params=params, timeout=5)
        data = response.json()
        
        # FALLBACK 2: API Error or EMPTY Results
        # If status is not OK (e.g. Quota Error) OR if results list is empty
        if data.get("status") != "OK" or not data.get("results"):
            return {
                "user_location": {"lat": lat, "lng": lng},
                "results": MOCK_CENTERS,
                "is_fallback": True,
                "reason": "No local results found or API error. Showing major NCR hubs."
            }

        # Success Path: Parse the closest 5
        parsed_results = []
        for place in data.get("results", [])[:5]: 
            parsed_results.append({
                "id": place.get("place_id"),
                "name": place.get("name"),
                "address": place.get("vicinity"),
                "lat": place["geometry"]["location"]["lat"],
                "lng": place["geometry"]["location"]["lng"],
                "rating": place.get("rating", "N/A")
            })

        return {
            "user_location": {"lat": lat, "lng": lng},
            "category_searched": category,
            "results": parsed_results,
            "is_fallback": False
        }
        
    except Exception as e:
        # FALLBACK 3: Network Timeout
        return {
            "user_location": {"lat": lat, "lng": lng},
            "results": MOCK_CENTERS,
            "is_fallback": True,
            "reason": f"Connection error: {str(e)}"
        }