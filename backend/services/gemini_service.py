import os
import uuid
from typing import AsyncGenerator
from dotenv import load_dotenv
load_dotenv()

from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent, TextDelta, StreamDone

EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY", "sk-emergent-1Da285d92EeA6Bb380")

def get_gemini_chat(model_name: str = "gemini-2.5-flash", system_message: str = None) -> LlmChat:
    sys_prompt = system_message or (
        "You are Gemini Maritime AI, an expert satellite oceanographer and marine environmental intelligence advisor. "
        "You analyze Synthetic Aperture Radar (SAR) and multi-spectral satellite imagery to detect and verify marine oil slicks, "
        "differentiate genuine hydrocarbon discharges from false-positive look-alikes (low wind zones, biogenic films, internal waves), "
        "and evaluate AIS vessel telemetry for forensic pollution source assessment."
    )
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"gemini-maritime-{uuid.uuid4().hex[:8]}",
        system_message=sys_prompt
    ).with_model("gemini", model_name)
    return chat

async def stream_satellite_image_analysis(
    image_base64: str = None,
    metadata: dict = None,
    prompt: str = None,
    model_name: str = "gemini-2.5-flash"
) -> AsyncGenerator[str, None]:
    """
    Multimodal Gemini analysis of satellite SAR / optical scenes.
    """
    chat = get_gemini_chat(model_name=model_name)
    
    meta_text = ""
    if metadata:
        meta_text = (
            f"\nSatellite Mission: {metadata.get('satellite', 'Sentinel-1C SAR')}\n"
            f"Acquisition Time: {metadata.get('acquisition_time', 'N/A')}\n"
            f"Coordinates: {metadata.get('latitude')}°N, {metadata.get('longitude')}°E\n"
            f"Detected Slick Area: {metadata.get('area_km2')} km²\n"
            f"Model Confidence: {metadata.get('confidence')}%\n"
            f"Potential Source Vessel: {metadata.get('possible_source', {}).get('vessel_name', 'Under Investigation')}"
        )

    user_query = prompt or (
        f"Perform an expert maritime intelligence inspection on this satellite observation dataset.{meta_text}\n\n"
        "Please provide:\n"
        "1. **SAR / Optical Signature Interpretation**: Explain backscatter damping, wave attenuation, and morphology.\n"
        "2. **Look-alike & False Positive Verification**: Assess if this could be a low-wind calm patch, biogenic algae film, or confirmed oil spill.\n"
        "3. **Environmental Severity & Containment Strategy**: Recommend operational response measures."
    )

    file_contents = []
    if image_base64:
        # Strip header if present
        clean_b64 = image_base64
        if "base64," in clean_b64:
            clean_b64 = clean_b64.split("base64,")[1]
        file_contents.append(ImageContent(image_base64=clean_b64))

    user_msg = UserMessage(text=user_query, file_contents=file_contents if file_contents else None)

    async for event in chat.stream_message(user_msg):
        if isinstance(event, TextDelta):
            yield event.content
        elif isinstance(event, StreamDone):
            break

async def stream_incident_dossier_ai_summary(
    detection_data: dict,
    model_name: str = "gemini-2.5-flash"
) -> AsyncGenerator[str, None]:
    """
    Generates official Maritime Intelligence Incident Dossier text via Gemini.
    """
    chat = get_gemini_chat(
        model_name=model_name,
        system_message="You are the Senior Scientific Officer for Maritime Emergency Response. Write structured, concise executive summaries for official pollution dossiers."
    )

    query = (
        f"Draft an official Executive Incident Assessment Summary for Incident #{detection_data.get('detection_id')}:\n"
        f"- Satellite Sensor: {detection_data.get('satellite')}\n"
        f"- Observation Time: {detection_data.get('acquisition_time')}\n"
        f"- Centroid Location: {detection_data.get('latitude')}°N, {detection_data.get('longitude')}°E ({detection_data.get('location_name')})\n"
        f"- Slick Surface Area: {detection_data.get('area_km2')} km²\n"
        f"- Algorithm Confidence: {detection_data.get('confidence')}%\n"
        f"- Top Potential Source: {detection_data.get('possible_source', {}).get('vessel_name')} (MMSI: {detection_data.get('possible_source', {}).get('mmsi')}, Score: {detection_data.get('possible_source', {}).get('score')}/100)\n"
        f"- Risk Rating: {detection_data.get('risk_level')}\n\n"
        "Format as a high-level operational intelligence briefing (Executive Summary, Forensic AIS Proximity Findings, Environmental Threat Assessment, Next Action Directives)."
    )

    async for event in chat.stream_message(UserMessage(text=query)):
        if isinstance(event, TextDelta):
            yield event.content
        elif isinstance(event, StreamDone):
            break
