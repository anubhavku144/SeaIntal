def calculate_source_score(
    distance_km: float,
    time_diff_hours: float,
    vessel_type: str,
    heading_diff_deg: float,
    speed_knots: float,
    drift_alignment: float = 0.8
) -> dict:
    """
    Transparent Potential Source Vessel Scoring Engine.
    Evaluates:
    - Distance proximity (0-100)
    - Temporal match (0-100)
    - Trajectory/Course match (0-100)
    - Vessel risk profile / type (Tanker/Crude vs Cargo vs Fishing) (0-100)
    - Drift vector alignment (0-100)
    """
    # 1. Distance Score: 100 at 0km, decreasing to 0 at 50km
    dist_score = max(0.0, 100.0 - (distance_km / 50.0) * 100.0)
    
    # 2. Time Score: 100 at 0h difference, decreasing to 0 at 12h
    time_score = max(0.0, 100.0 - (time_diff_hours / 12.0) * 100.0)

    # 3. Trajectory Score: based on heading towards/away along slick axis
    # Low heading difference to spill axis indicates direct passage through slick origin
    traj_score = max(0.0, 100.0 - (heading_diff_deg / 180.0) * 80.0)
    
    # 4. Vessel Type Risk Profile
    v_type_lower = vessel_type.lower()
    if "tanker" in v_type_lower or "oil" in v_type_lower or "chemical" in v_type_lower:
        type_score = 95.0
    elif "cargo" in v_type_lower or "container" in v_type_lower or "bulk" in v_type_lower:
        type_score = 80.0
    elif "tug" in v_type_lower or "offshore" in v_type_lower:
        type_score = 65.0
    elif "fishing" in v_type_lower:
        type_score = 50.0
    else:
        type_score = 40.0

    # 5. Speed / Operational factor (cruising speed 8-16 kn typical for transiting polluters)
    if 6.0 <= speed_knots <= 18.0:
        speed_factor = 90.0
    else:
        speed_factor = 60.0

    # 6. Drift Alignment Score
    drift_score = round(drift_alignment * 100.0, 1)

    # Weighted Composite Score
    # Weights: Distance (30%), Time (25%), Trajectory (20%), Vessel Type (15%), Drift (10%)
    total_score = (
        dist_score * 0.30 +
        time_score * 0.25 +
        traj_score * 0.20 +
        type_score * 0.15 +
        drift_score * 0.10
    )
    total_score = round(min(99.0, max(5.0, total_score)), 1)

    # Risk level classification
    if total_score >= 80.0:
        risk_level = "High"
    elif total_score >= 60.0:
        risk_level = "Medium"
    elif total_score >= 40.0:
        risk_level = "Low"
    else:
        risk_level = "Negligible"

    return {
        "overall_score": total_score,
        "risk_level": risk_level,
        "disclaimer": "Potential Source Vessel based on spatial-temporal correlation. Not a legal liability determination.",
        "breakdown": {
            "distance": {
                "score": round(dist_score, 1),
                "label": "Distance Proximity",
                "detail": f"{distance_km} km from spill centroid"
            },
            "time": {
                "score": round(time_score, 1),
                "label": "Time Window Match",
                "detail": f"±{time_diff_hours} hrs from satellite acquisition"
            },
            "trajectory": {
                "score": round(traj_score, 1),
                "label": "Trajectory Alignment",
                "detail": f"{heading_diff_deg}° course deviation from spill axis"
            },
            "vessel_type": {
                "score": round(type_score, 1),
                "label": "Vessel Risk Profile",
                "detail": f"{vessel_type} classification rating"
            },
            "drift_alignment": {
                "score": drift_score,
                "label": "Ocean Drift Vector Match",
                "detail": "Hydrodynamic hindcast convergence"
            }
        }
    }
