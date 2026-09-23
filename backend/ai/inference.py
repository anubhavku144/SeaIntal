import torch
import numpy as np
import cv2
import os
from .model import get_model
from .preprocessing import preprocess_satellite_image
from .postprocessing import postprocess_oil_mask

class OilSpillInferenceEngine:
    def __init__(self, model_path=None):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model_path = model_path or os.environ.get("MODEL_PATH", "/app/backend/ai/oil_spill_model.pt")
        self.model, self.is_trained = get_model(self.model_path, self.device)
        self.model.to(self.device)

    def detect(self, image_bytes: bytes, metadata: dict = None) -> dict:
        metadata = metadata or {}
        bounds = metadata.get("bounds", {
            "min_lat": 14.15,
            "max_lat": 14.35,
            "min_lng": 82.00,
            "max_lng": 82.28
        })
        threshold = metadata.get("confidence_threshold", 0.50)

        # 1. Preprocess
        prep = preprocess_satellite_image(image_bytes)
        norm_tensor = torch.from_numpy(prep["tensor"]).to(self.device)

        # 2. Inference
        with torch.no_grad():
            if self.is_trained:
                pred = self.model(norm_tensor)
                prob_map = pred.squeeze().cpu().numpy()
            else:
                # Physics-informed SAR segmentation algorithm:
                # In SAR/optical images, oil slicks dampen capillary gravity waves, causing low backscatter (dark pixels)
                # surrounded by ocean texture. We calculate local contrast, thresholding, and morphological coherence.
                gray = prep["enhanced_gray"]
                blurred = cv2.GaussianBlur(gray, (7, 7), 0)
                
                # Otsu thresholding + local contrast
                _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
                
                # Distance transform & gradient
                dist = cv2.distanceTransform(thresh, cv2.DIST_L2, 5)
                norm_dist = cv2.normalize(dist, None, 0, 1.0, cv2.NORM_MINMAX)
                
                # Dark formation probability
                dark_prob = (255 - blurred) / 255.0
                prob_map = 0.6 * dark_prob + 0.4 * norm_dist
                prob_map = np.clip(prob_map, 0.0, 1.0)

        # 3. Postprocess & extract polygons
        result = postprocess_oil_mask(
            prob_mask=prob_map,
            original_np=prep["original_np"],
            bounds=bounds,
            confidence_threshold=threshold
        )

        result["model_loaded"] = self.is_trained
        result["model_mode"] = "Trained PyTorch U-Net Model" if self.is_trained else "SAR Backscatter U-Net Pipeline (Demo/Physics Engine)"
        result["device"] = self.device
        return result

inference_engine = OilSpillInferenceEngine()
