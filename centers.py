import os
import requests
from fastapi import APIRouter, Query # Added Query for better param handling

from mock_data import MOCK_CENTERS

router = APIRouter()

# ==========================================
# CATEGORY-TO-KEYWORD MAPPING
# ==========================================

# TODO: Refine these keywords based on local search testing to ensure high-quality results.
CATEGORY_KEYWORDS = {
    "plastic": "plastic recycling center OR municipal recycling bin",
    "organic": "compost drop off OR organic waste collection",
    "e-waste": "electronics recycling OR battery disposal OR e-waste hub",
    "cardboard": "paper recycling OR cardboard collection center",
    "metal": "scrap metal yard OR metal recycling center"
}

@router.get("/centers")
async def get_centers(
    lat: float, 
    lng: float, 
    category: str = Query(None) # Make category optional to prevent crashes
):
    api_key = os.getenv("GOOGLE_PLACES_API_KEY")
    
    # 1. Determine Search Keyword
    # Default to a broad search if no category is provided
    base_keyword = "recycling center"
    if category:
        base_keyword = CATEGORY_KEYWORDS.get(category.lower(), "recycling center")

    # FALLBACK 1: Missing API Key
    if not api_key or api_key == "your_actual_api_key_here":
        return {
            "user_location": {"lat": lat, "lng": lng},
            "category_searched": category,
            "results": MOCK_CENTERS,
            "is_fallback": True
        }

    url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    params = {
        "location": f"{lat},{lng}",
        "radius": 5000,
        "keyword": base_keyword, # Now using the specific category keyword
        "key": api_key
    }
    
    try:
        response = requests.get(url, params=params, timeout=5)
        data = response.json()
        
        # FALLBACK 2: Google API Error
        if data.get("status") not in ["OK", "ZERO_RESULTS"]:
            return {
                "results": MOCK_CENTERS,
                "is_fallback": True,
                "message": "Google API Error. Showing general centers."
            }

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
        # FALLBACK 3: Network error
        return {
            "results": MOCK_CENTERS,
            "is_fallback": True,
            "error": str(e)
        }