import React, { useState } from "react";
import { Eye, Layers, CheckCircle2, AlertTriangle } from "lucide-react";

export default function DetectionResultSection({ detection }) {
  const [viewMode, setViewMode] = useState("side_by_side"); // "side_by_side" | "mask" | "overlay" | "original"

  const det = detection || {
    area_km2: 2.43,
    confidence: 94.2,
    latitude: 14.25,
    longitude: 82.14,
    original_image_url: null,
    mask_image_url: null,
    overlay_image_url: null
  };

  return (
    <div className="bg-[#0d1b2e] border border-[#1e3a5f] rounded-lg p-4 flex flex-col justify-between h-full shadow-lg" data-testid="detection-result-card">
      <div>
        {/* Header with View Toggle */}
        <div className="flex items-center justify-between pb-2 border-b border-[#1e3a5f]">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
            <span>Detection Result</span>
            {det.confidence >= 90 ? (
              <span className="text-[10px] text-emerald-400 font-normal flex items-center">
                <CheckCircle2 className="w-3 h-3 mr-0.5" /> High AI Confidence
              </span>
            ) : null}
          </h3>
          <div className="flex bg-[#070e1a] rounded p-0.5 border border-[#1e3a5f]">
            <button
              onClick={() => setViewMode("side_by_side")}
              data-testid="view-side-by-side-btn"
              className={`px-2 py-0.5 text-[10px] font-medium rounded ${
                viewMode === "side_by_side" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Split
            </button>
            <button
              onClick={() => setViewMode("overlay")}
              data-testid="view-overlay-btn"
              className={`px-2 py-0.5 text-[10px] font-medium rounded ${
                viewMode === "overlay" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Overlay
            </button>
          </div>
        </div>

        {/* Images Display */}
        <div className="mt-3">
          {viewMode === "side_by_side" ? (
            <div className="grid grid-cols-2 gap-2">
              {/* Original */}
              <div>
                <div className="relative rounded overflow-hidden border border-[#1e3a5f] bg-[#070e1a] aspect-[4/3] flex items-center justify-center">
                  {det.original_image_url ? (
                    <img
                      src={det.original_image_url}
                      alt="Original Satellite SAR"
                      className="w-full h-full object-cover"
                      data-testid="result-original-img"
                    />
                  ) : (
                    <div className="text-center p-2 text-slate-500 text-[11px]">Original SAR</div>
                  )}
                  <span className="absolute top-1 left-1 bg-black/70 px-1.5 py-0.5 rounded text-[9px] text-slate-300 font-mono">
                    RAW
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 text-center mt-1">Original Image</p>
              </div>

              {/* Detected Mask */}
              <div>
                <div className="relative rounded overflow-hidden border border-[#1e3a5f] bg-[#070e1a] aspect-[4/3] flex items-center justify-center">
                  {det.mask_image_url || det.overlay_image_url ? (
                    <img
                      src={det.mask_image_url || det.overlay_image_url}
                      alt="Detected Oil Spill Mask"
                      className="w-full h-full object-cover"
                      data-testid="result-mask-img"
                    />
                  ) : (
                    <div className="text-center p-2 text-red-400 text-[11px]">Slick Mask</div>
                  )}
                  <span className="absolute top-1 left-1 bg-red-950/80 border border-red-500/50 px-1.5 py-0.5 rounded text-[9px] text-red-300 font-mono">
                    SLICK MASK
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 text-center mt-1">Detected Oil Spill (Mask)</p>
              </div>
            </div>
          ) : (
            <div className="relative rounded overflow-hidden border border-[#1e3a5f] bg-[#070e1a] aspect-[16/9] flex items-center justify-center">
              {det.overlay_image_url || det.mask_image_url ? (
                <img
                  src={det.overlay_image_url || det.mask_image_url}
                  alt="Overlay Mask"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-2 text-slate-400 text-xs">SAR Slick Overlay</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Metrics Row matching screenshot */}
      <div className="mt-3 grid grid-cols-3 gap-2 pt-2 border-t border-[#1e3a5f] text-xs">
        <div>
          <span className="text-[10px] text-slate-400 block">Detected Area</span>
          <span className="text-slate-100 font-bold" data-testid="result-area-value">
            {det.area_km2 || 2.43} km²
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block">Confidence</span>
          <span className="text-emerald-400 font-bold" data-testid="result-confidence-value">
            {det.confidence || 94.2}%
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block">Latitude / Longitude</span>
          <span className="text-slate-100 font-mono text-[11px]" data-testid="result-coords-value">
            {det.latitude?.toFixed(2)}° N, {det.longitude?.toFixed(2)}° E
          </span>
        </div>
      </div>
    </div>
  );
}
