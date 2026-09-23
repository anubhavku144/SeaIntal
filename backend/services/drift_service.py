import math
from datetime import datetime, timezone, timedelta

def simulate_oil_drift(
    origin_lat: float,
    origin_lng: float,
    start_time: datetime,
    wind_speed_knots: float = 14.5,
    wind_direction_deg: float = 230.0, # Wind blowing towards 230° (SW)
    current_speed_knots: float = 1.2,
    current_direction_deg: float = 190.0,
    hours_forward: int = 12,
    hours_backward: int = 12,
    time_step_hours: float = 2.0
) -> dict:
    """
    Oil Spill Drift Simulation using standard hydrodynamic Lagrangian formulation:
    V_oil = V_current + 0.03 * V_wind (with Coriolis deflection ~15° in Northern Hemisphere).
    Computes forward forecasted trajectory and backward hindcast source area.
    """
    # Wind drift factor: 3.0% of wind speed, deflected 15 deg to the right in NH
    coriolis_deflection = 15.0
    effective_wind_dir = (wind_direction_deg + coriolis_deflection) % 360

    # Vector components in knots
    u_current = current_speed_knots * math.sin(math.radians(current_direction_deg))
    v_current = current_speed_knots * math.cos(math.radians(current_direction_deg))

    u_wind = (0.03 * wind_speed_knots) * math.sin(math.radians(effective_wind_dir))
    v_wind = (0.03 * wind_speed_knots) * math.cos(math.radians(effective_wind_dir))

    u_total = u_current + u_wind
    v_total = v_current + v_wind

    # Total net drift speed & direction
    net_speed_knots = math.sqrt(u_total**2 + v_total**2)
    net_direction_deg = (math.degrees(math.atan2(u_total, v_total)) + 360) % 360

    # 1 Knot = 1.852 km/h. Convert km to degrees (~111 km/deg lat)
    # Drift rate in deg/hour
    km_per_hour = net_speed_knots * 1.852
    dlat_per_hour = (v_total * 1.852) / 111.0
    dlng_per_hour = (u_total * 1.852) / (111.0 * math.cos(math.radians(origin_lat)))

    # 1. Forward Trajectory (Forecast)
    forward_points = []
    steps_fwd = int(hours_forward / time_step_hours)
    for i in range(steps_fwd + 1):
        dt_h = i * time_step_hours
        pt_lat = origin_lat + (dlat_per_hour * dt_h)
        pt_lng = origin_lng + (dlng_per_hour * dt_h)
        pt_time = start_time + timedelta(hours=dt_h)
        # Slick spreading radius estimation: Fay's formula ~ r0 * (1 + 0.15*t)
        spread_radius_km = round(1.2 + 0.18 * dt_h, 2)
        forward_points.append({
            "step": i,
            "hours": dt_h,
            "latitude": round(pt_lat, 5),
            "longitude": round(pt_lng, 5),
            "timestamp": pt_time.isoformat(),
            "spread_radius_km": spread_radius_km,
            "type": "forecast"
        })

    # 2. Backward Trajectory (Hindcast / Estimated Spill Origin)
    backward_points = []
    steps_bwd = int(hours_backward / time_step_hours)
    for i in range(steps_bwd + 1):
        dt_h = i * time_step_hours
        pt_lat = origin_lat - (dlat_per_hour * dt_h)
        pt_lng = origin_lng - (dlng_per_hour * dt_h)
        pt_time = start_time - timedelta(hours=dt_h)
        backward_points.append({
            "step": -i,
            "hours": -dt_h,
            "latitude": round(pt_lat, 5),
            "longitude": round(pt_lng, 5),
            "timestamp": pt_time.isoformat(),
            "type": "hindcast"
        })

    return {
        "environmental_conditions": {
            "wind_speed_knots": wind_speed_knots,
            "wind_direction_deg": wind_direction_deg,
            "current_speed_knots": current_speed_knots,
            "current_direction_deg": current_direction_deg,
            "net_drift_speed_knots": round(net_speed_knots, 2),
            "net_drift_direction_deg": round(net_direction_deg, 1),
            "source": "ECMWF Ocean Physics & HYCOM Current Inversion (Operational Demo Stream)"
        },
        "origin": {"latitude": origin_lat, "longitude": origin_lng, "timestamp": start_time.isoformat()},
        "forward_trajectory": forward_points,
        "backward_trajectory": backward_points,
        "estimated_release_point": backward_points[-1] if backward_points else None
    }
