import React, { useState, useEffect } from "react";
import axios from "axios";
import StatsCards from "../components/StatsCards";
import MaritimeMap from "../components/MaritimeMap";
import DetectionDetailsPanel from "../components/DetectionDetailsPanel";
import UploadSection from "../components/UploadSection";
import DetectionResultSection from "../components/DetectionResultSection";
import NearbyVesselsTable from "../components/NearbyVesselsTable";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";
const API = `${BACKEND_URL}/api`;

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [currentDetection, setCurrentDetection] = useState(null);
  const [vessels, setVessels] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mapCenter, setMapCenter] = useState([14.25, 82.14]);
  const [activeTrack, setActiveTrack] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, vesselsRes] = await Promise.all([
        axios.get(`${API}/dashboard/stats`),
        axios.get(`${API}/ais/vessels`)
      ]);

      setStats(statsRes.data);
      if (statsRes.data.primary_detection) {
        setCurrentDetection(statsRes.data.primary_detection);
        if (statsRes.data.primary_detection.latitude && statsRes.data.primary_detection.longitude) {
          setMapCenter([statsRes.data.primary_detection.latitude, statsRes.data.primary_detection.longitude]);
        }
      }
      if (vesselsRes.data && vesselsRes.data.length > 0) {
        setVessels(vesselsRes.data);
        // Find suspicious vessel track if available
        const susp = vesselsRes.data.find(v => v.status === "Suspicious" || v.mmsi === "563489000");
        if (susp && susp.track && susp.track.length > 0) {
          setActiveTrack(susp.track);
        }
      }
    } catch (e) {
      console.error("Dashboard fetch error:", e);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRunDetection = async (payload) => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      if (payload.file) {
        formData.append("file", payload.file);
      }
      formData.append("satellite", "Sentinel-1C (SAR C-Band)");
      formData.append("min_lat", "14.15");
      formData.append("max_lat", "14.35");
      formData.append("min_lng", "82.00");
      formData.append("max_lng", "82.28");
      formData.append("confidence_threshold", "0.50");

      const res = await axios.post(`${API}/detection/run`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setCurrentDetection(res.data);
      setMapCenter([res.data.latitude, res.data.longitude]);
      
      // Refresh stats
      fetchDashboardData();
    } catch (e) {
      console.error("Run detection error:", e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectVessel = (vessel) => {
    if (vessel.latitude && vessel.longitude) {
      setMapCenter([vessel.latitude, vessel.longitude]);
    }
    if (vessel.track && vessel.track.length > 0) {
      setActiveTrack(vessel.track);
    }
  };

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto" data-testid="main-dashboard-view">
      {/* 1. Top Statistics Row */}
      <StatsCards stats={stats} />

      {/* 2. Middle Row: Map (2/3) + Detection Details Panel (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Interactive Map */}
        <div className="lg:col-span-2 min-h-[460px] h-full flex flex-col">
          <MaritimeMap
            center={mapCenter}
            zoom={9}
            spillPolygon={currentDetection?.polygon}
            spillDetection={currentDetection}
            vessels={vessels}
            activeTrack={activeTrack}
            onSelectVessel={handleSelectVessel}
          />
        </div>

        {/* Right Detection Details Panel */}
        <div className="lg:col-span-1 h-full min-h-[460px]">
          <DetectionDetailsPanel
            detection={currentDetection}
            onViewOnMap={() => {
              if (currentDetection) {
                setMapCenter([currentDetection.latitude, currentDetection.longitude]);
              }
            }}
          />
        </div>
      </div>

      {/* 3. Bottom Row: Upload Satellite Image + Detection Result + Nearby Vessels (AIS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[280px]">
        {/* Upload Satellite Image Card */}
        <UploadSection
          onRunDetection={handleRunDetection}
          isProcessing={isProcessing}
        />

        {/* Detection Result Card */}
        <DetectionResultSection
          detection={currentDetection}
        />

        {/* Nearby Vessels (AIS) Card */}
        <NearbyVesselsTable
          vessels={stats?.nearby_vessels || vessels}
          onSelectVessel={handleSelectVessel}
        />
      </div>
    </div>
  );
}
