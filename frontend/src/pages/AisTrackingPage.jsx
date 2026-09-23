import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Ship,
  Search,
  Filter,
  Compass,
  Navigation,
  Upload,
  Radio,
  FileSpreadsheet,
  AlertCircle,
  Clock,
  ArrowUpRight
} from "lucide-react";
import MaritimeMap from "../components/MaritimeMap";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";
const API = `${BACKEND_URL}/api`;

export default function AisTrackingPage() {
  const navigate = useNavigate();
  const [vessels, setVessels] = useState([]);
  const [search, setSearch] = useState("");
  const [vesselType, setVesselType] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedVessel, setSelectedVessel] = useState(null);
  const [activeTrack, setActiveTrack] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(null);

  const fetchVessels = async () => {
    try {
      const res = await axios.get(`${API}/ais/vessels`, {
        params: {
          search: search || undefined,
          vessel_type: vesselType !== "All" ? vesselType : undefined,
          status: statusFilter !== "All" ? statusFilter : undefined
        }
      });
      setVessels(res.data);
      if (res.data.length > 0 && !selectedVessel) {
        setSelectedVessel(res.data[0]);
        if (res.data[0].track) {
          setActiveTrack(res.data[0].track);
        }
      }
    } catch (e) {
      console.error("Fetch AIS error:", e);
    }
  };

  useEffect(() => {
    fetchVessels();
  }, [search, vesselType, statusFilter]);

  const handleSelectVessel = (v) => {
    setSelectedVessel(v);
    if (v.track && v.track.length > 0) {
      setActiveTrack(v.track);
    } else {
      setActiveTrack([]);
    }
  };

  const handleCsvUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setUploadSuccess(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post(`${API}/ais/upload`, formData);
      setUploadSuccess(res.data.message);
      fetchVessels();
    } catch (err) {
      console.error("CSV Upload failed", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto" data-testid="ais-tracking-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1e3a5f]">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Ship className="w-6 h-6 text-emerald-400" />
            AIS Maritime Fleet Surveillance &amp; Spatial Tracking
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time automatic identification system (AIS) telemetry, historical voyages, and proximity cross-referencing
          </p>
        </div>

        {/* Upload AIS CSV Button */}
        <div className="flex items-center space-x-3">
          <label className="px-3 py-1.5 bg-[#132742] hover:bg-[#1e3a5f] text-cyan-300 hover:text-white rounded-lg border border-[#1e3a5f] text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all">
            <Upload className="w-3.5 h-3.5" />
            <span>Ingest AIS CSV</span>
            <input type="file" accept=".csv" onChange={handleCsvUpload} className="hidden" data-testid="ais-csv-input" />
          </label>
        </div>
      </div>

      {uploadSuccess && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs rounded-lg flex items-center gap-2">
          <Radio className="w-4 h-4 animate-pulse" />
          <span>{uploadSuccess}</span>
        </div>
      )}

      {/* Main Grid: Left Map (7 cols) + Right Vessel Fleet Table & Telemetry (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Map */}
        <div className="lg:col-span-7 h-[600px]">
          <MaritimeMap
            center={selectedVessel ? [selectedVessel.latitude, selectedVessel.longitude] : [14.25, 82.14]}
            zoom={9}
            vessels={vessels}
            activeTrack={activeTrack}
            onSelectVessel={handleSelectVessel}
          />
        </div>

        {/* Right: Search & Vessel Telemetry */}
        <div className="lg:col-span-5 space-y-4">
          {/* Search & Filter Bar */}
          <div className="bg-[#0d1b2e] border border-[#1e3a5f] rounded-lg p-3 space-y-2.5 shadow-lg">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search Vessel Name, MMSI, Destination..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-testid="ais-search-input"
                className="w-full bg-[#070e1a] border border-[#1e3a5f] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Vessel Type</label>
                <select
                  value={vesselType}
                  onChange={(e) => setVesselType(e.target.value)}
                  className="w-full bg-[#070e1a] border border-[#1e3a5f] rounded px-2 py-1 text-xs text-white focus:outline-none"
                >
                  <option value="All">All Vessel Types</option>
                  <option value="Crude Oil Tanker">Crude Oil Tanker</option>
                  <option value="Oil Products Tanker">Oil Products Tanker</option>
                  <option value="Chemical Tanker">Chemical Tanker</option>
                  <option value="Bulk Carrier">Bulk Carrier</option>
                  <option value="Container Ship">Container Ship</option>
                  <option value="General Cargo">General Cargo</option>
                  <option value="Offshore Supply">Offshore Supply</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Status Flag</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-[#070e1a] border border-[#1e3a5f] rounded px-2 py-1 text-xs text-white focus:outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Suspicious">Suspicious Only</option>
                  <option value="Normal">Normal</option>
                </select>
              </div>
            </div>
          </div>

          {/* Selected Vessel Detailed Telemetry */}
          {selectedVessel && (
            <div className="bg-[#0d1b2e] border border-[#1e3a5f] rounded-lg p-4 shadow-lg space-y-3" data-testid="selected-vessel-telemetry">
              <div className="flex items-center justify-between pb-2 border-b border-[#1e3a5f]">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>{selectedVessel.vessel_name}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                        selectedVessel.status === "Suspicious" || selectedVessel.mmsi === "563489000"
                          ? "bg-red-500/20 text-red-400 border border-red-500/30"
                          : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      }`}
                    >
                      {selectedVessel.status || "Normal"}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    MMSI: {selectedVessel.mmsi} | IMO: {selectedVessel.imo || "N/A"}
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/reports?vessel_mmsi=${selectedVessel.mmsi}`)}
                  className="p-1.5 rounded bg-[#132742] hover:bg-[#1e3a5f] text-cyan-300 text-xs flex items-center gap-1"
                >
                  <span>Report</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-[#070e1a] p-2 rounded border border-[#1e3a5f]">
                  <span className="text-[10px] text-slate-400 block">Vessel Classification</span>
                  <span className="font-semibold text-slate-200">{selectedVessel.vessel_type || "Cargo"}</span>
                </div>
                <div className="bg-[#070e1a] p-2 rounded border border-[#1e3a5f]">
                  <span className="text-[10px] text-slate-400 block">Speed / Course</span>
                  <span className="font-semibold text-white">{selectedVessel.speed} kn / {selectedVessel.course}°</span>
                </div>
                <div className="bg-[#070e1a] p-2 rounded border border-[#1e3a5f]">
                  <span className="text-[10px] text-slate-400 block">Position</span>
                  <span className="font-mono text-cyan-300 text-[11px]">
                    {selectedVessel.latitude?.toFixed(3)}°N, {selectedVessel.longitude?.toFixed(3)}°E
                  </span>
                </div>
                <div className="bg-[#070e1a] p-2 rounded border border-[#1e3a5f]">
                  <span className="text-[10px] text-slate-400 block">Destination</span>
                  <span className="font-semibold text-slate-200">{selectedVessel.destination || "En Route"}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-1">
                <button
                  onClick={() => {
                    if (selectedVessel.track && selectedVessel.track.length > 0) {
                      setActiveTrack(selectedVessel.track);
                    }
                  }}
                  data-testid="show-vessel-track-btn"
                  className="flex-1 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-semibold transition-all"
                >
                  Show Track History
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="flex-1 py-1.5 bg-[#132742] hover:bg-[#1e3a5f] text-slate-200 rounded text-xs font-semibold transition-all"
                >
                  Find Nearby Oil Spills
                </button>
              </div>
            </div>
          )}

          {/* Vessel List */}
          <div className="bg-[#0d1b2e] border border-[#1e3a5f] rounded-lg p-3 shadow-lg max-h-[260px] overflow-y-auto">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Active Maritime Vessels ({vessels.length})
            </h4>
            <div className="space-y-1">
              {vessels.map((v) => (
                <div
                  key={v.mmsi}
                  onClick={() => handleSelectVessel(v)}
                  className={`p-2 rounded-lg flex items-center justify-between cursor-pointer text-xs transition-colors ${
                    selectedVessel?.mmsi === v.mmsi ? "bg-[#0284c7]/30 border border-cyan-500" : "bg-[#070e1a] hover:bg-[#132742] border border-transparent"
                  }`}
                  data-testid={`vessel-item-${v.mmsi}`}
                >
                  <div>
                    <span className="font-semibold text-white block">{v.vessel_name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">MMSI: {v.mmsi} | {v.vessel_type}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-cyan-300 font-mono text-[11px] block">{v.speed} kn</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                      v.status === "Suspicious" ? "text-red-400 bg-red-950" : "text-emerald-400 bg-emerald-950"
                    }`}>
                      {v.status || "Normal"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
