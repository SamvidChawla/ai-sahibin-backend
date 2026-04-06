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

# ML CLASS MAPPING
ML_CLASSES = ['organic', 'plastic', 'metal', 'glass', 'battery', 'Lightbulb', 'cables', 'phones']

ML_TO_BACKEND_MAP = {
    "organic": "organic",
    "plastic": "plastic",
    "metal": "metal",
    "glass": "glass",
    "battery": "e-waste",
    "Lightbulb": "e-waste",
    "cables": "e-waste",
    "phones": "e-waste"
}

# ONNX MODEL INITIALIZATION
MODEL_PATH = "models/best.onnx"
ort_session = None
input_name = None

if ONNX_AVAILABLE and os.path.exists(MODEL_PATH):
    try:
        ort_session = ort.InferenceSession(MODEL_PATH, providers=['CPUExecutionProvider'])
        input_name = ort_session.get_inputs()[0].name
    except Exception as e:
        print(f"❌ Model Load Error: {e}")

# DETECTION ENDPOINT
@router.post("/detect")
@limiter.limit("20/minute")
def detect_waste(request: Request, file: UploadFile = File(...)):
    
    if ort_session is None:
        return {
            "success": False,
            "message": "AI System is currently offline. Please try again later.",
            "is_fallback": False 
        }

    try:
        if not file.content_type.startswith("image/"):
            return {"success": False, "message": "Please upload a valid image (JPG/PNG)."}

        contents = file.file.read()
        try:
            image = Image.open(io.BytesIO(contents)).convert("RGB")
        except Exception:
            return {"success": False, "message": "Could not read the photo. Please take another one."}

        # Image preprocessing for ML Inference
        image_resized = image.resize((640, 640))
        img_array = np.array(image_resized).astype(np.float32) / 255.0
        img_array = np.transpose(img_array, (2, 0, 1))
        img_array = np.expand_dims(img_array, axis=0)
        
        outputs = ort_session.run(None, {input_name: img_array})
        out_array = outputs[0]

        # Parse ONNX output (handles both YOLOv8 Detection and Classification shapes)
        if len(out_array.shape) == 3: 
            predictions = out_array[0]
            class_scores = predictions[4:, :] 
            max_scores_per_box = np.max(class_scores, axis=0)
            best_box_idx = np.argmax(max_scores_per_box)
            confidence = float(max_scores_per_box[best_box_idx])
            class_id = int(np.argmax(class_scores[:, best_box_idx]))
            
        elif len(out_array.shape) == 2:
            scores = out_array[0]
            class_id = int(np.argmax(scores))
            confidence = float(scores[class_id])
            
        else:
            raise ValueError(f"Unexpected model output shape: {out_array.shape}")

        raw_label = ML_CLASSES[class_id]
        
        if confidence < 0.45:
            return {"success": False, "message": "AI is unsure. Please get closer to the object and ensure good lighting."}

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
        return {"success": False, "message": "An unexpected error occurred. Please try again."}