# PRD — Oil Spill Detection & Maritime Monitoring System

## Original Problem Statement
Build a complete, production-grade web application called "OIL SPILL DETECTION & MARITIME MONITORING SYSTEM" recreating the provided dark maritime command center reference screenshot. It includes live interactive maps (Leaflet), AI-powered SAR satellite oil spill detection with U-Net segmentation, AIS vessel tracking & CSV ingestion, proximity search (50km/6h), potential source vessel explainable scoring (0-100), hydrodynamic ocean current and wind drift simulation (forward and backward), alert notifications, intelligence dossier reports with print/PDF capability, and JWT authentication.

## Architecture & Tasks Completed
- **Backend:** FastAPI, Python, MongoDB, PyJWT, bcrypt, PyTorch U-Net architecture, OpenCV despeckling (CLAHE/Bilateral), Shapely polygon geometries, Haversine geospatial proximity engine.
- **Frontend:** React 19, Tailwind CSS, Leaflet + CartoDB/ESRI Satellite layers, Lucide React icons, Sonner notifications.
- **AI Inference Engine (`/backend/ai/`):**
  - Modular PyTorch U-Net segmentation with SAR backscatter intensity modeling.
  - GeoJSON polygon generation with real-world km² area calculations and centroid coordinates.
  - False-positive look-alike assessment (low wind dampening, biogenic algae blooms, surf reflection).
- **AIS Surveillance Engine (`/backend/services/ais_service.py`):**
  - Vessel tracking, CSV dataset upload, historical trajectories.
  - Spatial proximity search with course heading deviation calculation.
- **Explainable Potential Source Scoring (`/backend/services/scoring_service.py`):**
  - Transparent 0-100 score with distance, time match, trajectory alignment, vessel risk profile, and drift alignment.
- **Ocean Weather & Current Drift Simulation (`/backend/services/drift_service.py`):**
  - Lagrangian drift formulation incorporating surface currents and 3% wind factor with Coriolis deflection.
- **Pages & Routes:**
  1. `/` - Dashboard matching reference screenshot.
  2. `/satellite-analysis` - AI Segmentation studio with Raw/Mask/Overlay modes and parameter sliders.
  3. `/ais-tracking` - Fleet tracking map with vessel search, filter by type/status, and CSV ingestion.
  4. `/detection-results` - Searchable detection archive with risk filters and modal inspector.
  5. `/alerts` - Maritime emergency notification center with severity filter & resolution workflow.
  6. `/reports` - Multi-sensor Incident Dossier with print/PDF view, drift forecast, and analyst notes.
  7. `/settings` - Operational parameters, AIS search radius (50km), time window (6h), and drift vectors.
  8. `/login` - JWT Authentication with preloaded credentials.

## Credentials
- Admin: `admin@maritime.gov` / `admin_maritime_2026`
- Analyst: `analyst@maritime.gov` / `analyst_maritime_2026`

## Next Action Items
- Add real-time WebSocket feed for live AIS message streams.
- Potential Improvement: Integrate automated email/SMS dispatch to Maritime Rescue Coordination Centers (MRCC) when Critical risk spills are confirmed.
