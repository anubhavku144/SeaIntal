import React from "react";
import { ArrowRight, Compass, ShieldAlert, Waves, Eye, Wind, Ship } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DetectionDetailsPanel({
  detection,
  onViewOnMap,
  onCompareImage,
  onOpenDrift
}) {
  const navigate = useNavigate();

  const det = detection || {
    detection_id: "DET-2026-0902-01",
    acquisition_time: "2026-09-02T10:24:00Z",
    latitude: 14.25,
    longitude: 82.14,
    area_km2: 2.43,
    confidence: 94.2,
    possible_source: {
      vessel_name: "MV Ocean Star",
      mmsi: "563489000",
      score: 87.0
    },
    risk_level: "High",
    original_image_url: null,
    mask_image_url: null
  };

  const formattedDate = det.acquisition_time
    ? new Date(det.acquisition_time).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }) + `, ${new Date(det.acquisition_time).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} UTC`
    : "02 Sep 2026, 10:24 UTC";

  return (
    <div className="bg-[#0d1b2e] border border-[#1e3a5f] rounded-lg p-4 flex flex-col justify-between h-full shadow-lg" data-testid="detection-details-panel">
      <div>
        {/* Panel Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1e3a5f]">
          <h2 className="text-sm font-bold text-slate-100 tracking-wide flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-cyan-400" />
            Detection Details
          </h2>
          <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
            {det.detection_id || "DET-2026-0902-01"}
          </span>
        </div>

        {/* Thumbnail Preview */}
        <div className="mt-3 relative rounded-lg overflow-hidden border border-[#1e3a5f] bg-[#09131e] aspect-[16/9] flex items-center justify-center">
          {det.overlay_image_url || det.mask_image_url || det.original_image_url ? (
            <img
              src={det.overlay_image_url || det.mask_image_url || det.original_image_url}
              alt="Satellite Oil Slick"
              className="w-full h-full object-cover"
              data-testid="detection-thumbnail-img"
            />
          ) : (
            <div className="w-full h-full bg-[#132742] flex flex-col items-center justify-center text-slate-400 text-xs">
              <Waves className="w-8 h-8 text-cyan-500 mb-1 animate-pulse" />
              <span>SAR C-Band Slick Visualizer</span>
            </div>
          )}
          <div className="absolute bottom-1 right-2 bg-[#09131e]/80 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] text-cyan-300 font-mono">
            SAR C-BAND
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="mt-4 space-y-2.5 text-xs">
          <div className="flex justify-between items-center py-1 border-b border-[#132742]">
            <span className="text-slate-400 font-medium">Date &amp; Time</span>
            <span className="text-slate-100 font-mono" data-testid="det-date-time">{formattedDate}</span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-[#132742]">
            <span className="text-slate-400 font-medium">Location</span>
            <span className="text-slate-100 font-mono" data-testid="det-location">
              {det.latitude?.toFixed(2)}° N, {det.longitude?.toFixed(2)}° E
            </span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-[#132742]">
            <span className="text-slate-400 font-medium">Area</span>
            <span className="text-slate-100 font-bold text-sm" data-testid="det-area">
              {det.area_km2} km²
            </span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-[#132742]">
            <span className="text-slate-400 font-medium">Confidence</span>
            <span className="text-emerald-400 font-bold text-sm" data-testid="det-confidence">
              {det.confidence}%
            </span>
          </div>

          <div className="flex justify-between items-start py-1 border-b border-[#132742]">
            <span className="text-slate-400 font-medium">Possible Source</span>
            <div className="text-right">
              <div className="text-amber-300 font-bold" data-testid="det-source-name">
                {det.possible_source?.vessel_name || "MV Ocean Star"}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                (MMSI: {det.possible_source?.mmsi || "563489000"})
              </div>
              {det.possible_source?.score && (
                <div className="text-[10px] text-red-400 font-semibold">
                  Source Score: {det.possible_source.score}/100
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-[#132742]">
            <span className="text-slate-400 font-medium">Risk Level</span>
            <span
              data-testid="det-risk-level-badge"
              className={`px-3 py-0.5 rounded-full text-xs font-bold ${
                det.risk_level === "Critical"
                  ? "bg-red-600 text-white"
                  : det.risk_level === "High"
                  ? "bg-red-500/90 text-white"
                  : det.risk_level === "Medium"
                  ? "bg-amber-500/90 text-slate-900"
                  : "bg-emerald-500/90 text-white"
              }`}
            >
              {det.risk_level || "High"}
            </span>
          </div>
        </div>

        {/* Look-alike Warning if present */}
        {det.look_alike_warnings && det.look_alike_warnings.length > 0 && (
          <div className="mt-3 p-2 rounded bg-amber-950/40 border border-amber-800/40 text-[11px] text-amber-300">
            <span className="font-semibold">⚠️ Look-alike Notice: </span>
            {det.look_alike_warnings.join(", ")}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-4 space-y-2">
        <button
          onClick={() => navigate(`/reports?detection_id=${det.detection_id || "DET-2026-0902-01"}`)}
          data-testid="view-full-report-btn"
          className="w-full py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-lg font-semibold text-xs transition-all shadow-md flex items-center justify-center space-x-2"
        >
          <span>View Full Report</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <button
            onClick={() => navigate("/satellite-analysis")}
            data-testid="quick-compare-btn"
            className="py-1.5 px-2 bg-[#132742] hover:bg-[#1e3a5f] text-slate-300 rounded border border-[#1e3a5f] flex items-center justify-center gap-1 transition-all"
          >
            <Eye className="w-3 h-3 text-cyan-400" />
            <span>Compare Mask</span>
          </button>
          <button
            onClick={() => navigate("/ais-tracking")}
            data-testid="quick-vessels-btn"
            className="py-1.5 px-2 bg-[#132742] hover:bg-[#1e3a5f] text-slate-300 rounded border border-[#1e3a5f] flex items-center justify-center gap-1 transition-all"
          >
            <Ship className="w-3 h-3 text-emerald-400" />
            <span>Nearby AIS</span>
          </button>
        </div>
      </div>
    </div>
  );
}
