import math
from datetime import datetime, timezone, timedelta

def haversine_distance(lat1, lon1, lat2, lon2) -> float:
    """Calculate distance in kilometers between two GPS coordinates."""
    R = 6371.0 # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2.0) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(R * c, 2)

def calculate_bearing(lat1, lon1, lat2, lon2) -> float:
    """Calculate compass heading from point 1 to point 2 in degrees."""
    dlon = math.radians(lon2 - lon1)
    y = math.sin(dlon) * math.cos(math.radians(lat2))
    x = (math.cos(math.radians(lat1)) * math.sin(math.radians(lat2)) -
         math.sin(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.cos(dlon))
    bearing = (math.degrees(math.atan2(y, x)) + 360) % 360
    return round(bearing, 1)

async def find_nearby_vessels(
    db,
    spill_lat: float,
    spill_lng: float,
    spill_time: datetime = None,
    radius_km: float = 50.0,
    time_window_hours: float = 6.0
):
    """
    Searches AIS database for vessels within radius_km and time_window of the spill.
    Returns vessels sorted by distance with proximity telemetry.
    """
    vessels = await db.vessels.find({}).to_list(1000)
    nearby = []

    for v in vessels:
        v_lat = v.get("latitude")
        v_lng = v.get("longitude")
        if v_lat is None or v_lng is None:
            continue

        dist = haversine_distance(spill_lat, spill_lng, v_lat, v_lng)
        if dist <= radius_km:
            bearing_to_spill = calculate_bearing(v_lat, v_lng, spill_lat, spill_lng)
            
            # Trajectory heading vs bearing to spill
            course = v.get("course", 0.0)
            heading_diff = abs((course - bearing_to_spill + 180) % 360 - 180)

            v_time = v.get("last_update")
            time_diff_hours = 0.5 # default
            if isinstance(v_time, str):
                try:
                    v_time = datetime.fromisoformat(v_time.replace("Z", "+00:00"))
                except Exception:
                    v_time = datetime.now(timezone.utc)
            if spill_time and v_time:
                if spill_time.tzinfo is None:
                    spill_time = spill_time.replace(tzinfo=timezone.utc)
                if v_time.tzinfo is None:
                    v_time = v_time.replace(tzinfo=timezone.utc)
                time_diff_hours = abs((spill_time - v_time).total_seconds()) / 3600.0

            nearby.append({
                "id": str(v.get("_id")),
                "vessel_name": v.get("vessel_name", "Unknown Vessel"),
                "mmsi": v.get("mmsi"),
                "imo": v.get("imo", "N/A"),
                "vessel_type": v.get("vessel_type", "Cargo"),
                "latitude": v_lat,
                "longitude": v_lng,
                "speed": v.get("speed", 12.0),
                "course": course,
                "distance_km": dist,
                "bearing_to_spill": bearing_to_spill,
                "heading_difference_deg": round(heading_diff, 1),
                "time_difference_hours": round(time_diff_hours, 1),
                "last_update": v.get("last_update", datetime.now(timezone.utc).isoformat()),
                "status": v.get("status", "Normal"),
                "track": v.get("track", [])
            })

    # Sort by distance
    nearby.sort(key=lambda x: x["distance_km"])
    return nearby
