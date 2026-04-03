import random
from fastapi import APIRouter, File, UploadFile, Request
from security import limiter # Importing the global rate limiter

# ==========================================
# ML ROUTER CONFIGURATION
# ==========================================

router = APIRouter()

# ==========================================
# ML CLASS MAPPING (The "Normalizer")
# ==========================================
# This maps specific ML model predictions to our 5 core backend categories.
# The ML Engineer should update these keys based on their final model's 'data.yaml'.

ML_TO_BACKEND_MAP = {
    # --- E-Waste ---
    "charger": "e-waste",
    "pcb": "e-waste",
    "battery": "e-waste",
    "smartphone": "e-waste",
    "laptop": "e-waste",
    "wire": "e-waste",
    "electronics": "e-waste",
    "cable": "e-waste",
    
    # --- Plastic ---
    "pet_bottle": "plastic",
    "plastic_bottle": "plastic",
    "polythene": "plastic",
    "plastic_bag": "plastic",
    "pvc_pipe": "plastic",
    "disposable_cup": "plastic",
    "plastic_wrapper": "plastic",
    
    # --- Organic ---
    "food_waste": "organic",
    "vegetable_peel": "organic",
    "fruit": "organic",
    "leaves": "organic",
    "biological": "organic",
    
    # --- Cardboard ---
    "carton": "cardboard",
    "corrugated_box": "cardboard",
    "newspaper": "cardboard",
    "paper": "cardboard",
    "magazine": "cardboard",
    
    # --- Metal ---
    "aluminum_can": "metal",
    "tin_can": "metal",
    "drink_can": "metal",
    "iron_utensil": "metal",
    "scrap_metal": "metal"
}

# ==========================================
# DETECTION ENDPOINT
# ==========================================

@router.post("/detect")
@limiter.limit("20/minute") # Protects RAM from image upload spam
async def detect_waste(request: Request, file: UploadFile = File(...)):
    
    # --- MOCK ML LOGIC ---
    # TODO: ML ENGINEER - Replace this block with your actual inference code.
    # Example:
    # result = model.predict(file.file)
    # mock_raw_label = result[0].names[result[0].probs.top1]
    
    # Simulating the ML Engineer's specific classes for testing
    ml_sub_classes = list(ML_TO_BACKEND_MAP.keys())
    mock_raw_label = random.choice(ml_sub_classes)
    
    # Map the specific ML label to our broader backend category
    # Defaults to 'plastic' if the label isn't found in our map
    detected_category = ML_TO_BACKEND_MAP.get(mock_raw_label, "plastic")
    
    # --- END MOCK LOGIC ---
    
    return {
        "filename": file.filename,
        "category": detected_category,     # Broad category (e.g., "e-waste")
        "confidence": round(random.uniform(0.70, 0.98), 2),
        "is_fallback": True                # Set to False once real ML is connected
    }