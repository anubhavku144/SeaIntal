import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Search,
  Filter,
  Download,
  Eye,
  ShieldAlert,
  ArrowUpDown,
  FileText,
  Calendar,
  ExternalLink,
  Layers
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";
const API = `${BACKEND_URL}/api`;

export default function DetectionResultsPage() {
  const navigate = useNavigate();
  const [detections, setDetections] = useState([]);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");
  const [satelliteFilter, setSatelliteFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedDetection, setSelectedDetection] = useState(null);

  const fetchDetections = async () => {
    try {
      const res = await axios.get(`${API}/detections`, {
        params: {
          risk_level: riskFilter !== "All" ? riskFilter : undefined,
          satellite: satelliteFilter !== "All" ? satelliteFilter : undefined,
          search: search || undefined,
          sort_by: sortBy
        }
      });
      setDetections(res.data);
    } catch (e) {
      console.error("Fetch detections error:", e);
    }
  };

  useEffect(() => {
    fetchDetections();
  }, [search, riskFilter, satelliteFilter, sortBy]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto" data-testid="detection-results-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1e3a5f]">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-cyan-400" />
            Historical Oil Spill Detection Archive
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Searchable repository of satellite SAR detections, slick contours, and AIS correlation data
          </p>
        </div>
        <div className="text-xs font-mono text-slate-300 bg-[#0d1b2e] px-3 py-1.5 rounded border border-[#1e3a5f]">
          Total Detections Logged: <span className="font-bold text-cyan-400">{detections.length}</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#0d1b2e] border border-[#1e3a5f] rounded-lg p-4 shadow-lg space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by ID, Location, Vessel..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="results-search-input"
              className="w-full bg-[#070e1a] border border-[#1e3a5f] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Risk Level */}
          <div>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              data-testid="results-risk-filter"
              className="w-full bg-[#070e1a] border border-[#1e3a5f] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value="All">All Risk Levels</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Satellite */}
          <div>
            <select
              value={satelliteFilter}
              onChange={(e) => setSatelliteFilter(e.target.value)}
              data-testid="results-satellite-filter"
              className="w-full bg-[#070e1a] border border-[#1e3a5f] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value="All">All Satellites</option>
              <option value="Sentinel-1">Sentinel-1 (SAR)</option>
              <option value="Landsat">Landsat-9</option>
              <option value="Sentinel-2">Sentinel-2 (MSI)</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              data-testid="results-sort-by"
              className="w-full bg-[#070e1a] border border-[#1e3a5f] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="highest_confidence">Sort: Highest Confidence</option>
              <option value="largest_area">Sort: Largest Spill Area</option>
              <option value="oldest">Sort: Oldest</option>
            </select>
          </div>
        </div>
      </div>

      {/* Detections Data Table */}
      <div className="bg-[#0d1b2e] border border-[#1e3a5f] rounded-lg overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#070e1a] text-slate-400 border-b border-[#1e3a5f]">
              <tr>
                <th className="py-3 px-4 font-semibold">Detection ID</th>
                <th className="py-3 px-4 font-semibold">Acquisition Time</th>
                <th className="py-3 px-4 font-semibold">Satellite</th>
                <th className="py-3 px-4 font-semibold">Location / Centroid</th>
                <th className="py-3 px-4 font-semibold">Area</th>
                <th className="py-3 px-4 font-semibold">Confidence</th>
                <th className="py-3 px-4 font-semibold">Potential Source</th>
                <th className="py-3 px-4 font-semibold">Risk</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#132742]/60">
              {detections.map((det) => {
                const dateStr = det.acquisition_time
                  ? new Date(det.acquisition_time).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric"
                    })
                  : "02 Sep 2026";
                return (
                  <tr
                    key={det.detection_id || det.id}
                    className="hover:bg-[#132742]/50 transition-colors"
                    data-testid={`detection-row-${det.detection_id}`}
                  >
                    <td className="py-3 px-4 font-mono text-cyan-300 font-semibold">
                      {det.detection_id}
                    </td>
                    <td className="py-3 px-4 text-slate-300">{dateStr}</td>
                    <td className="py-3 px-4 text-slate-300">{det.satellite}</td>
                    <td className="py-3 px-4 text-slate-200">
                      <div>{det.location_name || "Bay of Bengal"}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {det.latitude?.toFixed(2)}°N, {det.longitude?.toFixed(2)}°E
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-white">{det.area_km2} km²</td>
                    <td className="py-3 px-4 font-semibold text-emerald-400">{det.confidence}%</td>
                    <td className="py-3 px-4">
                      {det.possible_source ? (
                        <div>
                          <div className="text-amber-300 font-medium">{det.possible_source.vessel_name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            MMSI: {det.possible_source.mmsi} ({det.possible_source.score}/100)
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-500">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          det.risk_level === "Critical"
                            ? "bg-red-600 text-white"
                            : det.risk_level === "High"
                            ? "bg-red-500/20 text-red-400 border border-red-500/40"
                            : det.risk_level === "Medium"
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                            : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        }`}
                      >
                        {det.risk_level}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedDetection(det)}
                        data-testid={`inspect-btn-${det.detection_id}`}
                        className="px-2 py-1 bg-[#132742] hover:bg-[#1e3a5f] text-cyan-300 rounded text-[11px] font-medium"
                      >
                        View Modal
                      </button>
                      <button
                        onClick={() => navigate(`/reports?detection_id=${det.detection_id}`)}
                        className="px-2 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-[11px] font-medium"
                      >
                        Report
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Inspection Modal */}
      {selectedDetection && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d1b2e] border border-[#1e3a5f] rounded-lg max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e3a5f]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-400" />
                Detection File: {selectedDetection.detection_id}
              </h3>
              <button
                onClick={() => setSelectedDetection(null)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative rounded overflow-hidden border border-[#1e3a5f] bg-[#070e1a] aspect-[4/3] flex items-center justify-center">
                {selectedDetection.overlay_image_url || selectedDetection.mask_image_url ? (
                  <img
                    src={selectedDetection.overlay_image_url || selectedDetection.mask_image_url}
                    alt="Mask"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-slate-400 text-xs">SAR Slick Mask</div>
                )}
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400">Sensor: </span>
                  <span className="text-white font-semibold">{selectedDetection.satellite}</span>
                </div>
                <div>
                  <span className="text-slate-400">Coordinates: </span>
                  <span className="font-mono text-cyan-300">
                    {selectedDetection.latitude}° N, {selectedDetection.longitude}° E
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Area Extent: </span>
                  <span className="text-white font-bold">{selectedDetection.area_km2} km²</span>
                </div>
                <div>
                  <span className="text-slate-400">AI Confidence: </span>
                  <span className="text-emerald-400 font-bold">{selectedDetection.confidence}%</span>
                </div>
                <div>
                  <span className="text-slate-400">Model Engine: </span>
                  <span className="text-slate-200 font-mono text-[11px]">{selectedDetection.model_version || "PyTorch U-Net SAR v2.4"}</span>
                </div>
                {selectedDetection.possible_source && (
                  <div className="pt-2 border-t border-[#1e3a5f]">
                    <span className="text-slate-400 block mb-0.5">Top Potential Source Vessel:</span>
                    <span className="text-amber-300 font-bold">{selectedDetection.possible_source.vessel_name}</span>
                    <span className="text-slate-400 text-[11px] block font-mono">
                      Score: {selectedDetection.possible_source.score}/100 (MMSI: {selectedDetection.possible_source.mmsi})
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-[#1e3a5f]">
              <button
                onClick={() => setSelectedDetection(null)}
                className="px-4 py-2 bg-[#132742] hover:bg-[#1e3a5f] text-slate-300 rounded text-xs"
              >
                Close
              </button>
              <button
                onClick={() => {
                  navigate(`/reports?detection_id=${selectedDetection.detection_id}`);
                  setSelectedDetection(null);
                }}
                className="px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded text-xs font-semibold"
              >
                Open Full Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
