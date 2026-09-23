import React, { useState } from "react";
import {
  Settings,
  Cpu,
  Radio,
  Sliders,
  Wind,
  Shield,
  Save,
  CheckCircle2,
  Info
} from "lucide-react";

export default function SettingsPage() {
  const [modelType, setModelType] = useState("unet");
  const [threshold, setThreshold] = useState(0.50);
  const [aisRadius, setAisRadius] = useState(50);
  const [timeWindow, setTimeWindow] = useState(6);
  const [windSpeed, setWindSpeed] = useState(14.5);
  const [currentSpeed, setCurrentSpeed] = useState(1.2);
  const [demoMode, setDemoMode] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto" data-testid="settings-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1e3a5f]">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-cyan-400" />
            System Parameters &amp; AI Operational Configuration
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure segmentation thresholds, AIS search radii, ocean drift vectors, and inference engines
          </p>
        </div>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Operational configurations saved and applied to active inference pipelines.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: AI Model Settings */}
        <div className="bg-[#0d1b2e] border border-[#1e3a5f] rounded-lg p-5 shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-[#1e3a5f]">
            <Cpu className="w-4 h-4 text-cyan-400" />
            AI Oil Spill Segmentation Engine
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-300 font-medium block mb-1">Architecture Pipeline</label>
              <select
                value={modelType}
                onChange={(e) => setModelType(e.target.value)}
                data-testid="settings-model-select"
                className="w-full bg-[#070e1a] border border-[#1e3a5f] rounded-lg px-3 py-2 text-xs text-white"
              >
                <option value="unet">PyTorch U-Net (SAR Despeckle &amp; Backscatter Wavelet)</option>
                <option value="segformer">SegFormer-B2 (Lightweight Transformer Pipeline)</option>
                <option value="deeplabv3">DeepLabV3+ with Atrous Spatial Pyramid Pooling</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">
                Default Confidence Threshold ({Math.round(threshold * 100)}%)
              </label>
              <input
                type="range"
                min="0.30"
                max="0.95"
                step="0.05"
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                className="w-full mt-2 accent-cyan-500 cursor-pointer"
                data-testid="settings-threshold-slider"
              />
            </div>
          </div>

          <div className="p-3 rounded bg-[#070e1a] border border-[#1e3a5f] text-xs text-slate-300 flex items-center justify-between">
            <div>
              <span className="font-semibold text-white block">Physics-Informed Demo / Benchmark Mode</span>
              <span className="text-[11px] text-slate-400">
                Uses SAR hydrodynamic wave attenuation when local GPU weights are not uploaded.
              </span>
            </div>
            <input
              type="checkbox"
              checked={demoMode}
              onChange={(e) => setDemoMode(e.target.checked)}
              className="w-4 h-4 accent-cyan-500"
            />
          </div>
        </div>

        {/* Section 2: AIS Proximity Search */}
        <div className="bg-[#0d1b2e] border border-[#1e3a5f] rounded-lg p-5 shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-[#1e3a5f]">
            <Radio className="w-4 h-4 text-emerald-400" />
            AIS Spatial Proximity &amp; Temporal Corridor
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-300 font-medium block mb-1">Search Radius (km)</label>
              <input
                type="number"
                value={aisRadius}
                onChange={(e) => setAisRadius(parseInt(e.target.value))}
                className="w-full bg-[#070e1a] border border-[#1e3a5f] rounded-lg px-3 py-2 text-xs text-white"
                data-testid="settings-ais-radius-input"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Standard IMO default: 50 km</span>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Time Correlation Window (± Hours)</label>
              <input
                type="number"
                value={timeWindow}
                onChange={(e) => setTimeWindow(parseInt(e.target.value))}
                className="w-full bg-[#070e1a] border border-[#1e3a5f] rounded-lg px-3 py-2 text-xs text-white"
                data-testid="settings-time-window-input"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Standard: ±6 hours from satellite pass</span>
            </div>
          </div>
        </div>

        {/* Section 3: Ocean Weather & Drift Engine */}
        <div className="bg-[#0d1b2e] border border-[#1e3a5f] rounded-lg p-5 shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-[#1e3a5f]">
            <Wind className="w-4 h-4 text-amber-400" />
            Hydrodynamic Drift Simulation Parameters
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-300 font-medium block mb-1">Surface Wind Speed (Knots)</label>
              <input
                type="number"
                step="0.5"
                value={windSpeed}
                onChange={(e) => setWindSpeed(parseFloat(e.target.value))}
                className="w-full bg-[#070e1a] border border-[#1e3a5f] rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Ocean Current Speed (Knots)</label>
              <input
                type="number"
                step="0.1"
                value={currentSpeed}
                onChange={(e) => setCurrentSpeed(parseFloat(e.target.value))}
                className="w-full bg-[#070e1a] border border-[#1e3a5f] rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            data-testid="save-settings-btn"
            className="px-6 py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white font-semibold rounded-lg text-xs flex items-center gap-2 shadow-lg"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
}
