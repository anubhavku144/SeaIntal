from datetime import datetime, timezone, timedelta
import bcrypt
import os

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

# Sample SAR satellite image base64 or SVG thumbnail for high fidelity UI
SAMPLE_SAR_BASE64 = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'><rect width='400' height='200' fill='%23132742'/><path d='M80,100 Q150,40 240,70 T350,110 Q280,160 180,140 Z' fill='%2309131e' stroke='%2338bdf8' stroke-width='1'/><text x='20' y='30' fill='%2338bdf8' font-family='monospace' font-size='12'>SENTINEL-1C SAR C-BAND (VV)</text><text x='20' y='50' fill='%2394a3b8' font-family='monospace' font-size='10'>LAT: 14.25° N | LNG: 82.14° E</text></svg>"

SAMPLE_MASK_BASE64 = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'><rect width='400' height='200' fill='%23132742'/><path d='M80,100 Q150,40 240,70 T350,110 Q280,160 180,140 Z' fill='rgba(239,68,68,0.45)' stroke='%23ef4444' stroke-width='3'/><circle cx='210' cy='105' r='4' fill='%23ef4444'/><text x='20' y='30' fill='%23ef4444' font-family='monospace' font-size='12'>AI MASK: SLICK IDENTIFIED (2.43 km²)</text><text x='20' y='50' fill='%23fca5a5' font-family='monospace' font-size='10'>CONFIDENCE: 94.2% | RISK: HIGH</text></svg>"

async def seed_initial_data(db):
    """Seed initial demo users, detections, AIS vessels, alerts, and reports."""
    # 1. Users
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@maritime.gov")
    admin_pw = os.environ.get("ADMIN_PASSWORD", "admin_maritime_2026")
    
    existing_admin = await db.users.find_one({"email": admin_email})
    if not existing_admin:
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hash_password(admin_pw),
            "name": "Anubhav Kumar",
            "role": "admin",
            "organization": "Maritime Coast Guard & SAR Intelligence",
            "created_at": datetime.now(timezone.utc)
        })
        print("Admin user seeded.")

    # 2. Vessels (Exact match with screenshot + surrounding realistic fleet)
    vessels_count = await db.vessels.count_documents({})
    if vessels_count == 0:
        base_vessels = [
            {
                "vessel_name": "MV Ocean Star",
                "mmsi": "563489000",
                "imo": "9482011",
                "vessel_type": "Crude Oil Tanker",
                "latitude": 14.272,
                "longitude": 82.115,
                "speed": 12.4,
                "course": 68.0,
                "heading": 68.0,
                "status": "Suspicious",
                "last_update": (datetime.now(timezone.utc) - timedelta(minutes=14)).isoformat(),
                "destination": "Visakhapatnam Port",
                "flag": "Panama",
                "track": [
                    {"latitude": 14.180, "longitude": 81.950, "time": "2026-09-02T08:00:00Z", "speed": 12.8},
                    {"latitude": 14.215, "longitude": 82.020, "time": "2026-09-02T08:45:00Z", "speed": 12.6},
                    {"latitude": 14.248, "longitude": 82.080, "time": "2026-09-02T09:30:00Z", "speed": 12.2},
                    {"latitude": 14.272, "longitude": 82.115, "time": "2026-09-02T10:24:00Z", "speed": 12.4}
                ]
            },
            {
                "vessel_name": "Sea Voyager",
                "mmsi": "563421000",
                "imo": "9314562",
                "vessel_type": "Bulk Carrier",
                "latitude": 14.310,
                "longitude": 82.205,
                "speed": 14.1,
                "course": 45.0,
                "heading": 45.0,
                "status": "Normal",
                "last_update": (datetime.now(timezone.utc) - timedelta(minutes=8)).isoformat(),
                "destination": "Paradip",
                "flag": "Liberia",
                "track": []
            },
            {
                "vessel_name": "Global Trader",
                "mmsi": "563788000",
                "imo": "9652130",
                "vessel_type": "Container Ship",
                "latitude": 14.185,
                "longitude": 82.052,
                "speed": 16.8,
                "course": 110.0,
                "heading": 110.0,
                "status": "Normal",
                "last_update": (datetime.now(timezone.utc) - timedelta(minutes=22)).isoformat(),
                "destination": "Colombo",
                "flag": "Singapore",
                "track": []
            },
            {
                "vessel_name": "Ocean Pearl",
                "mmsi": "564112000",
                "imo": "9287341",
                "vessel_type": "Oil Products Tanker",
                "latitude": 14.382,
                "longitude": 82.254,
                "speed": 11.2,
                "course": 215.0,
                "heading": 215.0,
                "status": "Normal",
                "last_update": (datetime.now(timezone.utc) - timedelta(minutes=5)).isoformat(),
                "destination": "Chennai",
                "flag": "Marshall Islands",
                "track": []
            },
            {
                "vessel_name": "Blue Wave",
                "mmsi": "563995000",
                "imo": "9554018",
                "vessel_type": "General Cargo",
                "latitude": 14.120,
                "longitude": 82.280,
                "speed": 9.5,
                "course": 300.0,
                "heading": 300.0,
                "status": "Normal",
                "last_update": (datetime.now(timezone.utc) - timedelta(minutes=19)).isoformat(),
                "destination": "Haldia",
                "flag": "India",
                "track": []
            },
            # Additional surrounding vessels in the maritime corridor
            {"vessel_name": "Maratha Pride", "mmsi": "419001240", "imo": "9812450", "vessel_type": "Bulk Carrier", "latitude": 14.42, "longitude": 81.85, "speed": 13.2, "course": 55.0, "status": "Normal", "last_update": datetime.now(timezone.utc).isoformat(), "destination": "Kakinada", "flag": "India", "track": []},
            {"vessel_name": "Ever Zenith", "mmsi": "352002340", "imo": "9731200", "vessel_type": "Container Ship", "latitude": 14.05, "longitude": 82.15, "speed": 18.4, "course": 80.0, "status": "Normal", "last_update": datetime.now(timezone.utc).isoformat(), "destination": "Port Klang", "flag": "Panama", "track": []},
            {"vessel_name": "Pacific Explorer", "mmsi": "538004520", "imo": "9642981", "vessel_type": "Offshore Supply", "latitude": 14.50, "longitude": 82.35, "speed": 8.1, "course": 160.0, "status": "Normal", "last_update": datetime.now(timezone.utc).isoformat(), "destination": "KG Basin Rig 4", "flag": "Marshall Islands", "track": []},
            {"vessel_name": "Atlantic Spirit", "mmsi": "636015780", "imo": "9504112", "vessel_type": "Chemical Tanker", "latitude": 13.95, "longitude": 81.90, "speed": 11.5, "course": 35.0, "status": "Normal", "last_update": datetime.now(timezone.utc).isoformat(), "destination": "Ennore", "flag": "Liberia", "track": []},
            {"vessel_name": "Golden Horizon", "mmsi": "477089120", "imo": "9421890", "vessel_type": "LPG Tanker", "latitude": 14.33, "longitude": 82.42, "speed": 15.0, "course": 210.0, "status": "Normal", "last_update": datetime.now(timezone.utc).isoformat(), "destination": "Tuticorin", "flag": "Hong Kong", "track": []},
            {"vessel_name": "Brahmaputra Leader", "mmsi": "419000880", "imo": "9215000", "vessel_type": "Tug / Towing", "latitude": 14.20, "longitude": 81.70, "speed": 6.8, "course": 90.0, "status": "Normal", "last_update": datetime.now(timezone.utc).isoformat(), "destination": "Machilipatnam", "flag": "India", "track": []},
            {"vessel_name": "Southern Cross", "mmsi": "563009910", "imo": "9387401", "vessel_type": "Crude Oil Tanker", "latitude": 13.80, "longitude": 82.50, "speed": 12.0, "course": 25.0, "status": "Normal", "last_update": datetime.now(timezone.utc).isoformat(), "destination": "Paradip", "flag": "Singapore", "track": []}
        ]
        await db.vessels.insert_many(base_vessels)
        print("Vessels seeded.")

    # 3. Detections (Matching screenshot exact values)
    det_count = await db.detections.count_documents({})
    if det_count == 0:
        primary_det = {
            "detection_id": "DET-2026-0902-01",
            "satellite": "Sentinel-1C (SAR C-Band)",
            "acquisition_time": "2026-09-02T10:24:00Z",
            "latitude": 14.25,
            "longitude": 82.14,
            "location_name": "Bay of Bengal (East Coast Corridor)",
            "area_km2": 2.43,
            "confidence": 94.2,
            "risk_level": "High",
            "status": "Active Spill",
            "possible_source": {
                "vessel_name": "MV Ocean Star",
                "mmsi": "563489000",
                "score": 87.0,
                "distance_km": 3.2,
                "details": "Direct trajectory intersection 1.5h prior to SAR acquisition"
            },
            "polygon": {
                "type": "Polygon",
                "coordinates": [[
                    [82.100, 14.240],
                    [82.125, 14.262],
                    [82.160, 14.270],
                    [82.185, 14.255],
                    [82.170, 14.238],
                    [82.130, 14.232],
                    [82.100, 14.240]
                ]]
            },
            "model_version": "PyTorch U-Net SAR v2.4",
            "original_image_url": SAMPLE_SAR_BASE64,
            "mask_image_url": SAMPLE_MASK_BASE64,
            "overlay_image_url": SAMPLE_MASK_BASE64,
            "look_alike_warnings": [],
            "created_at": datetime.now(timezone.utc).isoformat()
        }

        other_dets = [
            {
                "detection_id": "DET-2026-0901-04",
                "satellite": "Landsat-9 OLI-2",
                "acquisition_time": "2026-09-01T06:15:00Z",
                "latitude": 2.85,
                "longitude": 101.40,
                "location_name": "Strait of Malacca (Traffic Separation Scheme)",
                "area_km2": 5.12,
                "confidence": 91.8,
                "risk_level": "Critical",
                "status": "Confirmed",
                "possible_source": {
                    "vessel_name": "MT Titan Voyager",
                    "mmsi": "538008910",
                    "score": 92.5,
                    "distance_km": 1.8,
                    "details": "Discharge streak aligned with wake vector"
                },
                "polygon": {
                    "type": "Polygon",
                    "coordinates": [[
                        [101.38, 2.82], [101.41, 2.88], [101.43, 2.86], [101.39, 2.81], [101.38, 2.82]
                    ]]
                },
                "model_version": "PyTorch U-Net SAR v2.4",
                "original_image_url": SAMPLE_SAR_BASE64,
                "mask_image_url": SAMPLE_MASK_BASE64,
                "overlay_image_url": SAMPLE_MASK_BASE64,
                "look_alike_warnings": ["Near shallow coastal reef boundary"],
                "created_at": (datetime.now(timezone.utc) - timedelta(days=1)).isoformat()
            },
            {
                "detection_id": "DET-2026-0830-02",
                "satellite": "Sentinel-2B MSI",
                "acquisition_time": "2026-08-30T11:45:00Z",
                "latitude": 20.45,
                "longitude": 71.85,
                "location_name": "Gulf of Khambhat (Arabian Sea)",
                "area_km2": 1.15,
                "confidence": 88.5,
                "risk_level": "Medium",
                "status": "Under Review",
                "possible_source": {
                    "vessel_name": "Sea Pioneer",
                    "mmsi": "419008770",
                    "score": 64.0,
                    "distance_km": 7.4,
                    "details": "Moderate proximity match"
                },
                "polygon": {
                    "type": "Polygon",
                    "coordinates": [[
                        [71.83, 20.44], [71.86, 20.47], [71.88, 20.45], [71.84, 20.43], [71.83, 20.44]
                    ]]
                },
                "model_version": "PyTorch U-Net SAR v2.4",
                "original_image_url": SAMPLE_SAR_BASE64,
                "mask_image_url": SAMPLE_MASK_BASE64,
                "overlay_image_url": SAMPLE_MASK_BASE64,
                "look_alike_warnings": ["Turbid water plume look-alike potential"],
                "created_at": (datetime.now(timezone.utc) - timedelta(days=3)).isoformat()
            }
        ]
        await db.detections.insert_one(primary_det)
        await db.detections.insert_many(other_dets)
        print("Detections seeded.")

    # 4. Alerts
    alert_count = await db.alerts.count_documents({})
    if alert_count == 0:
        base_alerts = [
            {
                "alert_id": "ALT-2026-0902-1",
                "severity": "CRITICAL",
                "detection_id": "DET-2026-0902-01",
                "title": "Major Oil Slick Detected Near Coromandel Shipping Lane",
                "location": "14.25° N, 82.14° E (Bay of Bengal)",
                "reason": "AI confidence 94.2% with active trajectory matching MV Ocean Star (MMSI 563489000). Area: 2.43 km².",
                "status": "Unread",
                "created_at": "2026-09-02T10:28:00Z"
            },
            {
                "alert_id": "ALT-2026-0901-2",
                "severity": "HIGH",
                "detection_id": "DET-2026-0901-04",
                "title": "High Risk Spill within Malacca Strait TSS Zone",
                "location": "2.85° N, 101.40° E",
                "reason": "5.12 km² slick in designated sensitive marine sanctuary proximity.",
                "status": "Unread",
                "created_at": "2026-09-01T06:30:00Z"
            },
            {
                "alert_id": "ALT-2026-0830-3",
                "severity": "MEDIUM",
                "detection_id": "DET-2026-0830-02",
                "title": "Look-alike Verification Required - Gulf of Khambhat",
                "location": "20.45° N, 71.85° E",
                "reason": "Spectral backscatter attenuation requires analyst false-positive filtering.",
                "status": "Resolved",
                "created_at": "2026-08-30T12:00:00Z"
            }
        ]
        await db.alerts.insert_many(base_alerts)
        print("Alerts seeded.")
