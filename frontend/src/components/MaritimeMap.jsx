import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Polygon,
  Polyline,
  Marker,
  Popup,
  useMap
} from "react-leaflet";
import L from "leaflet";
import { Navigation, Info, ExternalLink, Compass } from "lucide-react";

// Fix standard Leaflet default icon issues in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom Vessel Arrow Markers
const createVesselIcon = (isSuspicious, course = 0, name = "") => {
  const color = isSuspicious ? "#ef4444" : "#10b981";
  const glow = isSuspicious ? "drop-shadow(0 0 6px rgba(239, 68, 68, 0.9))" : "drop-shadow(0 0 4px rgba(16, 185, 129, 0.7))";
  
  const svgHtml = `
    <div style="transform: rotate(${course}deg); filter: ${glow}; cursor: pointer; transition: transform 0.3s ease;">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="${color}" stroke="#0a1220" stroke-width="1.5">
        <polygon points="12,2 22,22 12,17 2,22" />
      </svg>
    </div>
  `;
  return L.divIcon({
    html: svgHtml,
    className: "custom-vessel-icon",
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -12]
  });
};

function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}

export default function MaritimeMap({
  center = [14.25, 82.14],
  zoom = 9,
  spillPolygon = null,
  spillDetection = null,
  vessels = [],
  activeTrack = null,
  onSelectVessel = null,
  onSelectDetection = null,
  driftForecast = null,
  driftHindcast = null
}) {
  const [mapType, setMapType] = useState("satellite"); // "map" or "satellite"

  const tileUrls = {
    satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    map: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
  };

  const tileAttribution = {
    satellite: "&copy; Esri &mdash; Earthstar Geographics",
    map: "&copy; OpenStreetMap contributors &copy; CARTO"
  };

  // Format spill coordinates for Leaflet [[lat, lng], ...]
  let leafletPolygonCoords = [];
  if (spillPolygon && spillPolygon.coordinates && spillPolygon.coordinates[0]) {
    // GeoJSON is [lng, lat], Leaflet wants [lat, lng]
    leafletPolygonCoords = spillPolygon.coordinates[0].map(pt => [pt[1], pt[0]]);
  } else {
    // Default polygon matching screenshot
    leafletPolygonCoords = [
      [14.240, 82.100],
      [14.262, 82.125],
      [14.270, 82.160],
      [14.255, 82.185],
      [14.238, 82.170],
      [14.232, 82.130],
      [14.240, 82.100]
    ];
  }

  // Vessel track points [[lat, lng], ...]
  let trackCoords = [];
  if (activeTrack && activeTrack.length > 0) {
    trackCoords = activeTrack.map(pt => [pt.latitude, pt.longitude]);
  } else {
    // Default dashed track matching screenshot MV Ocean Star
    trackCoords = [
      [14.180, 81.950],
      [14.215, 82.020],
      [14.248, 82.080],
      [14.272, 82.115],
      [14.250, 82.140]
    ];
  }

  // Drift forecast line
  let driftFwdCoords = [];
  if (driftForecast && driftForecast.length > 0) {
    driftFwdCoords = driftForecast.map(pt => [pt.latitude, pt.longitude]);
  }

  // Drift hindcast line
  let driftBwdCoords = [];
  if (driftHindcast && driftHindcast.length > 0) {
    driftBwdCoords = driftHindcast.map(pt => [pt.latitude, pt.longitude]);
  }

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-lg overflow-hidden border border-[#1e3a5f] bg-[#09131e]" data-testid="maritime-interactive-map">
      {/* Top Left Layer Switcher (Map / Satellite) matching screenshot */}
      <div className="absolute top-3 left-3 z-[1000] flex bg-[#0d1b2e]/90 backdrop-blur-md rounded-md p-1 border border-[#1e3a5f] shadow-lg">
        <button
          onClick={() => setMapType("map")}
          data-testid="map-type-vector-btn"
          className={`px-3 py-1 text-xs font-semibold rounded transition-all ${
            mapType === "map"
              ? "bg-[#0284c7] text-white shadow"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Map
        </button>
        <button
          onClick={() => setMapType("satellite")}
          data-testid="map-type-satellite-btn"
          className={`px-3 py-1 text-xs font-semibold rounded transition-all ${
            mapType === "satellite"
              ? "bg-[#0284c7] text-white shadow"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Satellite
        </button>
      </div>

      {/* Coastal Geographic Annotation */}
      <div className="absolute top-14 left-6 z-[1000] pointer-events-none text-slate-300/80 font-medium text-sm tracking-wider drop-shadow-md">
        India (Coromandel Coast)
      </div>

      {/* Leaflet Map */}
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ width: "100%", height: "100%", minHeight: "420px" }}
        zoomControl={true}
      >
        <ChangeView center={center} zoom={zoom} />

        <TileLayer
          url={tileUrls[mapType]}
          attribution={tileAttribution[mapType]}
          maxZoom={18}
        />

        {/* Oil Spill Polygon */}
        {leafletPolygonCoords.length > 0 && (
          <Polygon
            positions={leafletPolygonCoords}
            pathOptions={{
              color: "#ef4444",
              weight: 2.5,
              fillColor: "#ef4444",
              fillOpacity: 0.45,
              dashArray: ""
            }}
          >
            <Popup>
              <div className="p-1 space-y-1.5 text-xs">
                <div className="font-bold text-red-400 flex items-center justify-between">
                  <span>DETECTED OIL SPILL</span>
                  <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded border border-red-500/40">
                    {spillDetection?.risk_level || "HIGH RISK"}
                  </span>
                </div>
                <div className="text-slate-300">
                  <span className="text-slate-400">ID: </span>
                  <span className="font-mono text-cyan-300">{spillDetection?.detection_id || "DET-2026-0902-01"}</span>
                </div>
                <div className="text-slate-300">
                  <span className="text-slate-400">Location: </span>
                  {spillDetection?.latitude || 14.25}° N, {spillDetection?.longitude || 82.14}° E
                </div>
                <div className="text-slate-300">
                  <span className="text-slate-400">Area: </span>
                  <span className="font-semibold text-white">{spillDetection?.area_km2 || 2.43} km²</span>
                </div>
                <div className="text-slate-300">
                  <span className="text-slate-400">Confidence: </span>
                  <span className="font-semibold text-emerald-400">{spillDetection?.confidence || 94.2}%</span>
                </div>
                <div className="text-slate-300">
                  <span className="text-slate-400">Top Potential Source: </span>
                  <span className="text-amber-300 font-semibold">{spillDetection?.possible_source?.vessel_name || "MV Ocean Star"}</span>
                </div>
                {onSelectDetection && (
                  <button
                    onClick={() => onSelectDetection(spillDetection)}
                    className="w-full mt-2 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-[11px] font-semibold transition-all"
                  >
                    Inspect Detection Data
                  </button>
                )}
              </div>
            </Popup>
          </Polygon>
        )}

        {/* Vessel Track Trajectory */}
        {trackCoords.length > 1 && (
          <Polyline
            positions={trackCoords}
            pathOptions={{
              color: "#38bdf8",
              weight: 2,
              dashArray: "6, 6",
              opacity: 0.85
            }}
          />
        )}

        {/* Drift Simulation Trajectories */}
        {driftFwdCoords.length > 1 && (
          <Polyline
            positions={driftFwdCoords}
            pathOptions={{
              color: "#f59e0b",
              weight: 2,
              dashArray: "4, 4",
              opacity: 0.9
            }}
          />
        )}
        {driftBwdCoords.length > 1 && (
          <Polyline
            positions={driftBwdCoords}
            pathOptions={{
              color: "#a855f7",
              weight: 2,
              dashArray: "4, 4",
              opacity: 0.9
            }}
          />
        )}

        {/* Vessel Markers */}
        {vessels.map((v, idx) => {
          const isSuspicious = v.status === "Suspicious" || v.mmsi === "563489000";
          return (
            <Marker
              key={v.mmsi || idx}
              position={[v.latitude, v.longitude]}
              icon={createVesselIcon(isSuspicious, v.course || 0, v.vessel_name)}
              eventHandlers={{
                click: () => onSelectVessel && onSelectVessel(v)
              }}
            >
              <Popup>
                <div className="p-1 space-y-1 text-xs">
                  <div className="font-bold text-white flex items-center justify-between">
                    <span>{v.vessel_name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                      isSuspicious
                        ? "bg-red-500/20 text-red-400 border border-red-500/40"
                        : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    }`}>
                      {isSuspicious ? "Suspicious" : "Normal"}
                    </span>
                  </div>
                  <div className="text-slate-300">
                    <span className="text-slate-400">MMSI: </span>
                    <span className="font-mono text-cyan-300">{v.mmsi}</span>
                  </div>
                  <div className="text-slate-300">
                    <span className="text-slate-400">Type: </span>
                    <span>{v.vessel_type || "Cargo"}</span>
                  </div>
                  <div className="text-slate-300">
                    <span className="text-slate-400">Speed: </span>
                    <span className="font-semibold text-white">{v.speed} kn</span>
                    <span className="text-slate-400 ml-2">Course: </span>
                    <span>{v.course}°</span>
                  </div>
                  {v.distance_km !== undefined && (
                    <div className="text-slate-300">
                      <span className="text-slate-400">Distance to Spill: </span>
                      <span className="font-semibold text-amber-300">{v.distance_km} km</span>
                    </div>
                  )}
                  {v.source_score !== undefined && (
                    <div className="text-slate-300">
                      <span className="text-slate-400">Potential Source Score: </span>
                      <span className="font-bold text-red-400">{v.source_score}/100</span>
                    </div>
                  )}
                  <div className="text-[10px] text-slate-400 pt-1">
                    Last Update: {v.last_update ? new Date(v.last_update).toLocaleTimeString() + " UTC" : "Live AIS"}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map Legend (Bottom Right matching screenshot) */}
      <div className="absolute bottom-3 right-3 z-[1000] bg-[#0d1b2e]/95 backdrop-blur-md px-3.5 py-2.5 rounded-lg border border-[#1e3a5f] shadow-xl text-xs space-y-1.5" data-testid="map-legend">
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-red-500 inline-block shadow-sm shadow-red-500"></span>
          <span className="text-slate-200">Detected Oil Spill</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[10px] border-b-emerald-500 inline-block"></span>
          <span className="text-slate-200">Vessel (Normal)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[10px] border-b-red-500 inline-block"></span>
          <span className="text-slate-200">Suspicious Vessel</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-5 border-t-2 border-dashed border-sky-400 inline-block"></span>
          <span className="text-slate-200">Vessel Track</span>
        </div>
      </div>

      {/* Bottom Left Scale Indicator */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-[#0d1b2e]/80 backdrop-blur-sm px-2 py-1 rounded text-[11px] text-slate-400 border border-[#1e3a5f]">
        <div className="flex items-center space-x-3 text-[10px] text-slate-400 font-mono">
          <span>0</span>
          <span>25</span>
          <span>50</span>
          <span>100 km</span>
        </div>
        <div className="w-full h-1 bg-slate-600 rounded-sm mt-0.5"></div>
      </div>
    </div>
  );
}
