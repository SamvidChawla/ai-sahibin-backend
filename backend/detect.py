import os
import io
import traceback
import numpy as np
from PIL import Image
from fastapi import APIRouter, File, UploadFile, Request
from security import limiter 

try:
    import onnxruntime as ort
    ONNX_AVAILABLE = True
except ImportError:
    ONNX_AVAILABLE = False

router = APIRouter()

# ==========================================
# ML CLASS MAPPING (Internal Normalizer)
# ==========================================
ML_TO_BACKEND_MAP = {
    "charger": "e-waste", "pcb": "e-waste", "battery": "e-waste", "smartphone": "e-waste",
    "pet_bottle": "plastic", "polythene": "plastic", "pvc_pipe": "plastic",
    "food_waste": "organic", "fruit": "organic", "leaves": "organic",
    "carton": "cardboard", "newspaper": "cardboard", "paper": "cardboard",
    "aluminum_can": "metal", "tin_can": "metal", "scrap_metal": "metal"
}

# ==========================================
# ONNX MODEL INITIALIZATION
# ==========================================
MODEL_PATH = "models/best.onnx"
ort_session = None
input_name = None

if ONNX_AVAILABLE and os.path.exists(MODEL_PATH):
    try:
        ort_session = ort.InferenceSession(MODEL_PATH, providers=['CPUExecutionProvider'])
        input_name = ort_session.get_inputs()[0].name
    except Exception as e:
        print(f"❌ Model Load Error: {e}")

# ==========================================
# DETECTION ENDPOINT
# ==========================================

@router.post("/detect")
@limiter.limit("20/minute")
def detect_waste(request: Request, file: UploadFile = File(...)):
    
    # CASE 1: Model file is missing or failed to load
    if ort_session is None:
        return {
            "success": False,
            "message": "AI System is currently offline. Please try again later.",
            "is_fallback": False 
        }

    try:
        # Validate File Type
        if not file.content_type.startswith("image/"):
            return {
                "success": False,
                "message": "Please upload a valid image (JPG/PNG).",
            }

        contents = file.file.read()
        try:
            image = Image.open(io.BytesIO(contents)).convert("RGB")
        except Exception:
            return {
                "success": False,
                "message": "Could not read the photo. Please take another one.",
            }

        # --- ML INFERENCE (CPU Optimized) ---
        image_resized = image.resize((640, 640))
        img_array = np.array(image_resized).astype(np.float32) / 255.0
        img_array = np.transpose(img_array, (2, 0, 1))
        img_array = np.expand_dims(img_array, axis=0)
        
        outputs = ort_session.run(None, {input_name: img_array})

        # --- ML ENGINEER HANDOFF ---
        # Note: raw_label extraction logic goes here.
        # This must match the ML Engineer's class list.
        raw_label = "pcb" 
        confidence = 0.92
        
        # Confidence Guard
        if confidence < 0.45:
            return {
                "success": False,
                "message": "AI is unsure. Please get closer to the object and ensure good lighting.",
            }

        # Normalize to UI category
        detected_category = ML_TO_BACKEND_MAP.get(raw_label, "plastic")

        return {
            "success": True,
            "category": detected_category,
            "confidence": round(confidence * 100, 1),
            "message": "Waste identified successfully!"
        }

    except Exception as e:
        print(f"🚨 SERVER ERROR: {e}")
        traceback.print_exc()
        return {
            "success": False,
            "message": "An unexpected error occurred. Please try again.",
        }