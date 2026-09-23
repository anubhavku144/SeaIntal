"""Regression coverage for maritime auth, detection, AIS, alerts, and reports APIs."""
import os
import requests
import pytest
from dotenv import load_dotenv

load_dotenv("/app/frontend/.env")
BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")


@pytest.fixture(scope="module")
def client():
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    response = session.post(f"{BASE_URL}/api/auth/login", json={
        "email": "admin@maritime.gov", "password": "admin_maritime_2026"
    })
    assert response.status_code == 200, response.text
    payload = response.json()
    assert payload["user"]["role"] == "admin"
    assert response.cookies.get("access_token")
    return session


def test_auth_me_and_cookie(client):
    response = client.get(f"{BASE_URL}/api/auth/me")
    assert response.status_code == 200
    assert response.json()["email"] == "admin@maritime.gov"


def test_dashboard_stats_shape(client):
    response = client.get(f"{BASE_URL}/api/dashboard/stats")
    assert response.status_code == 200
    data = response.json()
    for field in ("satellite_images_count", "vessels_tracked_count", "oil_spills_detected_count", "primary_detection", "nearby_vessels"):
        assert field in data
    assert isinstance(data["nearby_vessels"], list)


def test_list_detections_and_get_seeded(client):
    response = client.get(f"{BASE_URL}/api/detections")
    assert response.status_code == 200
    detections = response.json()
    assert detections and detections[0]["detection_id"]
    detail = client.get(f"{BASE_URL}/api/detections/{detections[0]['detection_id']}")
    assert detail.status_code == 200
    assert detail.json()["detection_id"] == detections[0]["detection_id"]


def test_detection_run_sample(client):
    response = client.post(f"{BASE_URL}/api/detection/run", data={
        "satellite": "Sentinel-1C (SAR C-Band)", "confidence_threshold": "0.50"
    }, timeout=60)
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["detection_id"].startswith("DET-")
    assert data["polygon"] and data["geojson"]
    assert isinstance(data["confidence"], (int, float))
    assert "drift_simulation" in data


def test_ais_list_track_and_nearby(client):
    response = client.get(f"{BASE_URL}/api/ais/vessels")
    assert response.status_code == 200
    vessels = response.json()
    assert vessels and vessels[0]["mmsi"]
    mmsi = vessels[0]["mmsi"]
    track = client.get(f"{BASE_URL}/api/ais/track/{mmsi}")
    assert track.status_code == 200
    assert track.json()["mmsi"] == mmsi
    nearby = client.get(f"{BASE_URL}/api/ais/nearby", params={"lat": 14.25, "lng": 82.14})
    assert nearby.status_code == 200
    assert isinstance(nearby.json(), list)


def test_ais_csv_upload(client):
    csv = "MMSI,latitude,longitude,speed,course,vessel_name,vessel_type\nTEST-990001,14.25,82.14,10,90,TEST Vessel,TEST Cargo\n"
    client.headers.pop("Content-Type", None)
    response = client.post(f"{BASE_URL}/api/ais/upload", files={"file": ("test.csv", csv, "text/csv")})
    assert response.status_code == 200
    assert response.json()["records_processed"] == 1


def test_scoring_and_drift(client):
    score = client.post(f"{BASE_URL}/api/scoring/calculate", json={
        "distance_km": 3.2, "time_diff_hours": 1.5, "vessel_type": "Crude Oil Tanker",
        "heading_diff_deg": 12, "speed_knots": 12
    })
    assert score.status_code == 200
    assert 0 < score.json()["overall_score"] <= 99
    assert "breakdown" in score.json()
    drift = client.post(f"{BASE_URL}/api/drift/simulate", json={"origin_lat": 14.25, "origin_lng": 82.14})
    assert drift.status_code == 200
    assert drift.json()["forward_trajectory"] and drift.json()["backward_trajectory"]


def test_alert_resolve_and_reports(client):
    alerts = client.get(f"{BASE_URL}/api/alerts").json()
    assert alerts
    alert_id = alerts[0]["alert_id"]
    resolved = client.patch(f"{BASE_URL}/api/alerts/{alert_id}/resolve")
    assert resolved.status_code == 200
    assert resolved.json()["status"] == "success"
    detections = client.get(f"{BASE_URL}/api/detections").json()
    report = client.post(f"{BASE_URL}/api/reports/generate", json={"detection_id": detections[0]["detection_id"]})
    assert report.status_code == 200
    assert report.json()["report_id"].startswith("REP-")