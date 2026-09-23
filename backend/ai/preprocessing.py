import cv2
import numpy as np
from PIL import Image
import io

def preprocess_satellite_image(image_bytes: bytes, target_size=(512, 512)):
    """
    Reads satellite imagery (PNG, JPG, TIFF), applies SAR despeckling,
    contrast enhancement and normalization.
    """
    # Open with PIL
    pil_img = Image.open(io.BytesIO(image_bytes))
    if pil_img.mode != 'RGB':
        pil_img = pil_img.convert('RGB')
    
    orig_np = np.array(pil_img)
    orig_h, orig_w = orig_np.shape[:2]

    # Resize for inference
    resized = cv2.resize(orig_np, target_size, interpolation=cv2.INTER_AREA)

    # Convert to grayscale / SAR backscatter intensity simulation
    gray = cv2.cvtColor(resized, cv2.COLOR_RGB2GRAY)
    
    # Fast bilateral/median filter for SAR speckle noise reduction
    despeckled = cv2.medianBlur(gray, 3)
    
    # Adaptive histogram equalization (CLAHE)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(despeckled)

    # Normalized float tensor (1, 3, H, W)
    norm_rgb = resized.astype(np.float32) / 255.0
    # Mean and std normalization
    mean = np.array([0.485, 0.456, 0.406])
    std = np.array([0.229, 0.224, 0.225])
    norm_tensor = (norm_rgb - mean) / std
    norm_tensor = np.transpose(norm_tensor, (2, 0, 1))
    norm_tensor = np.expand_dims(norm_tensor, axis=0)

    return {
        "original_np": orig_np,
        "orig_size": (orig_w, orig_h),
        "target_size": target_size,
        "enhanced_gray": enhanced,
        "tensor": norm_tensor
    }
