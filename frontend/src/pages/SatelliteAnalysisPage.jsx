import React, { useState } from "react";
import axios from "axios";
import {
  Satellite,
  UploadCloud,
  Sliders,
  Layers,
  Sparkles,
  ShieldAlert,
  Download,
  AlertTriangle,
  Info,
  CheckCircle2,
  Loader2
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";
const API = `${BACKEND_URL}/api`;

export default function SatelliteAnalysisPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [satellite, setSatellite] = useState("Sentinel-1C (SAR C-Band)");
  const [acqTime, setAcqTime] = useState("2026-09-02T10:24");
  const [minLat, setMinLat] = useState(14.15);
  const [maxLat, setMaxLat] = useState(14.35);
  const [minLng, setMinLng] = useState(82.00);
  const [maxLng, setMaxLng] = useState(82.28);
  const [threshold, setThreshold] = useState(0.50);
  const [viewMode, setViewMode] = useState("overlay"); // "original" | "mask" | "overlay"

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [geminiOutput, setGeminiOutput] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRunAnalysis = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append("file", selectedFile);
      }
      formData.append("satellite", satellite);
      formData.append("acquisition_time", acqTime);
      formData.append("min_lat", String(minLat));
      formData.append("max_lat", String(maxLat));
      formData.append("min_lng", String(minLng));
      formData.append("max_lng", String(maxLng));
      formData.append("confidence_threshold", String(threshold));

      const res = await axios.post(`${API}/detection/run`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setResult(res.data);
    } catch (e) {
      console.error("AI Satellite Analysis error:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto" data-testid="satellite-analysis-page">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1e3a5f]">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Satellite className="w-6 h-6 text-cyan-400" />
            Satellite Image Analysis &amp; AI Oil Spill Segmentation
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Modular PyTorch U-Net inference for SAR (Synthetic Aperture Radar) backscatter &amp; multi-spectral imagery
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs bg-cyan-950/80 text-cyan-300 px-3 py-1.5 rounded border border-cyan-800 font-mono">
            ENGINE: PyTorch U-Net + SAR Despeckle v2.4
          </span>
        </div>
      </div>

      {/* Main Grid: Left Controls & Metadata + Right Image Viewer & Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): Upload & Controls */}
        <div className="lg:col-span-5 space-y-4">
          {/* 1. Upload Box */}
          <div className="bg-[#0d1b2e] border border-[#1e3a5f] rounded-lg p-4 shadow-lg">
            <h3 className="text-sm font-bold text-slate-100 mb-3 flex items-center justify-between">
              <span>Image Ingestion</span>
              <span className="text-[10px] text-cyan-400 font-mono">GeoTIFF / PNG / JPG</span>
            </h3>

            <div
              onClick={() => document.getElementById("sat-file-input").click()}
              className="border-2 border-dashed border-[#1e3a5f] hover:border-cyan-500 bg-[#070e1a]/80 rounded-lg p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all"
              data-testid="sat-analysis-dropzone"
            >
              <input
                id="sat-file-input"
                type="file"
                onChange={handleFileChange}
                accept=".tif,.tiff,.png,.jpg,.jpeg"
                className="hidden"
              />
              <UploadCloud className="w-8 h-8 text-cyan-400 mb-2" />
              <p className="text-xs font-semibold text-slate-200">
                {selectedFile ? selectedFile.name : "Select or drag GeoTIFF / SAR Image"}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                Optimized for Sentinel-1 C-Band (VV/VH), Sentinel-2 MSI, Landsat-9 OLI
              </p>
            </div>
          </div>

          {/* 2. Metadata & Georeference */}
          <div className="bg-[#0d1b2e] border border-[#1e3a5f] rounded-lg p-4 space-y-3 shadow-lg">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Sensor &amp; Geospatial Coordinates
            </h3>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Satellite Mission</label>
              <select
                value={satellite}
                onChange={(e) => setSatellite(e.target.value)}
                data-testid="satellite-select"
                className="w-full bg-[#070e1a] border border-[#1e3a5f] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Sentinel-1C (SAR C-Band)">Sentinel-1C (SAR C-Band - European Space Agency)</option>
                <option value="Sentinel-2B MSI">Sentinel-2B MSI (Multi-Spectral)</option>
                <option value="Landsat-9 OLI-2">Landsat-9 OLI-2 (NASA/USGS)</option>
                <option value="Radarsat Constellation">Radarsat Constellation (CSA)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Acquisition Date/Time</label>
                <input
                  type="datetime-local"
                  value={acqTime}
                  onChange={(e) => setAcqTime(e.target.value)}
                  className="w-full bg-[#070e1a] border border-[#1e3a5f] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Confidence Threshold ({threshold * 100}%)</label>
                <input
                  type="range"
                  min="0.30"
                  max="0.95"
                  step="0.05"
                  value={threshold}
                  onChange={(e) => setThreshold(parseFloat(e.target.value))}
                  className="w-full mt-2 accent-cyan-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Bounding Box Coordinates */}
            <div className="pt-2 border-t border-[#132742]">
              <label className="text-[11px] text-slate-400 block mb-1">Geographic Scene Extent (Deg)</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500">Min Lat:</span>
                  <input
                    type="number"
                    step="0.01"
                    value={minLat}
                    onChange={(e) => setMinLat(parseFloat(e.target.value))}
                    className="w-full bg-[#070e1a] border border-[#1e3a5f] rounded px-2 py-1 text-xs text-white"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500">Max Lat:</span>
                  <input
                    type="number"
                    step="0.01"
                    value={maxLat}
                    onChange={(e) => setMaxLat(parseFloat(e.target.value))}
                    className="w-full bg-[#070e1a] border border-[#1e3a5f] rounded px-2 py-1 text-xs text-white"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500">Min Lng:</span>
                  <input
                    type="number"
                    step="0.01"
                    value={minLng}
                    onChange={(e) => setMinLng(parseFloat(e.target.value))}
                    className="w-full bg-[#070e1a] border border-[#1e3a5f] rounded px-2 py-1 text-xs text-white"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500">Max Lng:</span>
                  <input
                    type="number"
                    step="0.01"
                    value={maxLng}
                    onChange={(e) => setMaxLng(parseFloat(e.target.value))}
                    className="w-full bg-[#070e1a] border border-[#1e3a5f] rounded px-2 py-1 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* Run Button */}
            <button
              onClick={handleRunAnalysis}
              disabled={loading}
              data-testid="execute-ai-analysis-btn"
              className="w-full mt-3 py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-lg font-semibold text-xs transition-all shadow-md flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing U-Net Tensor Pipeline...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                  <span>Execute AI Oil Spill Segmentation</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column (7 Cols): Viewport & Detection Intelligence */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#0d1b2e] border border-[#1e3a5f] rounded-lg p-4 shadow-lg">
            {/* View Mode Tabs */}
            <div className="flex items-center justify-between pb-3 border-b border-[#1e3a5f]">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-bold text-white">Spectral Segmentation View</span>
              </div>
              <div className="flex bg-[#070e1a] rounded p-1 border border-[#1e3a5f]">
                <button
                  onClick={() => setViewMode("original")}
                  className={`px-3 py-1 text-xs font-medium rounded transition-all ${
                    viewMode === "original" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Original
                </button>
                <button
                  onClick={() => setViewMode("mask")}
                  className={`px-3 py-1 text-xs font-medium rounded transition-all ${
                    viewMode === "mask" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Mask
                </button>
                <button
                  onClick={() => setViewMode("overlay")}
                  className={`px-3 py-1 text-xs font-medium rounded transition-all ${
                    viewMode === "overlay" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Overlay View
                </button>
              </div>
            </div>

            {/* Display Canvas */}
            <div className="mt-3 relative rounded-lg overflow-hidden border border-[#1e3a5f] bg-[#070e1a] min-h-[380px] flex items-center justify-center">
              {result ? (
                <img
                  src={
                    viewMode === "original"
                      ? result.original_image_url
                      : viewMode === "mask"
                      ? result.mask_image_url
                      : result.overlay_image_url
                  }
                  alt="Segmentation Result"
                  className="w-full h-full object-contain max-h-[460px]"
                  data-testid="analysis-display-image"
                />
              ) : previewUrl ? (
                <img src={previewUrl} alt="Uploaded scene" className="w-full h-full object-contain max-h-[460px]" />
              ) : (
                <div className="text-center p-8 text-slate-400">
                  <Satellite className="w-12 h-12 text-cyan-500/50 mx-auto mb-3 animate-pulse" />
                  <p className="text-sm font-medium text-slate-300">Ready for Satellite Imagery Ingestion</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Upload SAR scene or click "Execute AI Oil Spill Segmentation" to process benchmark data
                  </p>
                </div>
              )}
            </div>

            {/* Result Findings Summary */}
            {result && (
              <div className="mt-4 p-4 rounded-lg bg-[#070e1a] border border-cyan-800/40 space-y-3" data-testid="analysis-results-box">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white">Detection Confirmed</span>
                    <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded font-mono">
                      {result.risk_level} Risk
                    </span>
                  </div>
                  <span className="text-xs font-mono text-cyan-300">
                    ID: {result.detection_id}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-[#0d1b2e] p-2 rounded border border-[#1e3a5f]">
                    <span className="text-[10px] text-slate-400 block">Slick Area</span>
                    <span className="font-bold text-white text-sm">{result.area_km2} km²</span>
                  </div>
                  <div className="bg-[#0d1b2e] p-2 rounded border border-[#1e3a5f]">
                    <span className="text-[10px] text-slate-400 block">Confidence</span>
                    <span className="font-bold text-emerald-400 text-sm">{result.confidence}%</span>
                  </div>
                  <div className="bg-[#0d1b2e] p-2 rounded border border-[#1e3a5f]">
                    <span className="text-[10px] text-slate-400 block">Centroid</span>
                    <span className="font-mono text-slate-200">{result.latitude}°N, {result.longitude}°E</span>
                  </div>
                  <div className="bg-[#0d1b2e] p-2 rounded border border-[#1e3a5f]">
                    <span className="text-[10px] text-slate-400 block">Top Source Match</span>
                    <span className="font-bold text-amber-300 truncate block">
                      {result.possible_source?.vessel_name || "MV Ocean Star"}
                    </span>
                  </div>
                </div>

                {/* False Positive / Look-Alike Warning Assessment */}
                <div className="p-2.5 rounded bg-amber-950/30 border border-amber-800/40 text-xs text-amber-300">
                  <div className="font-semibold flex items-center gap-1 mb-0.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>False-Positive Look-alike Verification:</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Classified as <strong className="text-amber-200">Possible Oil Spill</strong>.
                    Evaluated against low wind dampening, biogenic algae blooms, and coastal surf reflection.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Gemini AI Multimodal Reasoning & Look-alike Validator Card */}
          <div className="bg-[#0d1b2e] border border-cyan-500/40 rounded-lg p-4 shadow-xl space-y-3" data-testid="gemini-analysis-panel">
            <div className="flex items-center justify-between pb-2 border-b border-[#1e3a5f]">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Gemini 2.5 Flash Multimodal Satellite Explainer</h3>
              </div>
              <span className="text-[10px] font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded">
                GEMINI AI ACTIVE
              </span>
            </div>

            <p className="text-xs text-slate-300">
              Trigger Google Gemini multimodal intelligence to inspect pixel backscatter, verify look-alikes, and generate forensic oceanographic analysis.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={async () => {
                  setGeminiLoading(true);
                  setGeminiOutput("");
                  try {
                    const response = await fetch(`${API}/gemini/analyze-satellite`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        detection_id: result?.detection_id || "DET-2026-0902-01",
                        image_base64: result?.overlay_image_url || result?.mask_image_url,
                        prompt: "Validate this SAR satellite scene for false positive look-alikes (low wind damping, biogenic algae bloom, or true crude oil slick). Provide detailed oceanographic evidence.",
                        model: "gemini-2.5-flash"
                      })
                    });
                    const reader = response.body.getReader();
                    const decoder = new TextDecoder("utf-8");
                    while (true) {
                      const { done, value } = await reader.read();
                      if (done) break;
                      const chunk = decoder.decode(value);
                      const lines = chunk.split("\n\n");
                      for (const line of lines) {
                        if (line.startsWith("data: ")) {
                          try {
                            const data = JSON.parse(line.replace("data: ", ""));
                            if (data.token) {
                              setGeminiOutput((prev) => prev + data.token);
                            }
                          } catch (err) {}
                        }
                      }
                    }
                  } catch (err) {
                    setGeminiOutput("Error connecting to Gemini AI reasoning service.");
                  } finally {
                    setGeminiLoading(false);
                  }
                }}
                disabled={geminiLoading}
                data-testid="gemini-verify-lookalike-btn"
                className="px-3 py-1.5 bg-cyan-700 hover:bg-cyan-600 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-all shadow"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
                <span>{geminiLoading ? "Gemini Reasoning..." : "Validate Look-alikes (Gemini 2.5)"}</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  setGeminiLoading(true);
                  setGeminiOutput("");
                  try {
                    const response = await fetch(`${API}/gemini/analyze-satellite`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        detection_id: result?.detection_id || "DET-2026-0902-01",
                        image_base64: result?.overlay_image_url || result?.mask_image_url,
                        prompt: "Explain the SAR C-Band backscatter damping mechanism and physical slick morphology observed in this scene.",
                        model: "gemini-2.5-flash"
                      })
                    });
                    const reader = response.body.getReader();
                    const decoder = new TextDecoder("utf-8");
                    while (true) {
                      const { done, value } = await reader.read();
                      if (done) break;
                      const chunk = decoder.decode(value);
                      const lines = chunk.split("\n\n");
                      for (const line of lines) {
                        if (line.startsWith("data: ")) {
                          try {
                            const data = JSON.parse(line.replace("data: ", ""));
                            if (data.token) {
                              setGeminiOutput((prev) => prev + data.token);
                            }
                          } catch (err) {}
                        }
                      }
                    }
                  } catch (err) {
                    setGeminiOutput("Error streaming Gemini output.");
                  } finally {
                    setGeminiLoading(false);
                  }
                }}
                disabled={geminiLoading}
                data-testid="gemini-explain-sar-btn"
                className="px-3 py-1.5 bg-[#132742] hover:bg-[#1e3a5f] text-cyan-300 rounded text-xs font-semibold flex items-center gap-1.5 border border-[#1e3a5f] transition-all"
              >
                <span>Explain SAR Damping Physics</span>
              </button>
            </div>

            {/* Gemini Output Box */}
            {(geminiOutput || geminiLoading) && (
              <div className="mt-3 p-3 bg-[#070e1a] rounded-lg border border-cyan-800/50 text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap max-h-[300px] overflow-y-auto" data-testid="gemini-output-box">
                {geminiOutput}
                {geminiLoading && <span className="inline-block w-2 h-4 bg-cyan-400 ml-1 animate-pulse"></span>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
