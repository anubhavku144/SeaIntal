import React, { useState, useRef } from "react";
import { UploadCloud, FileImage, Loader2, Sparkles, Check } from "lucide-react";

export default function UploadSection({ onRunDetection, isProcessing = false }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState("sentinel1");
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setSelectedPreset("custom");
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      setSelectedPreset("custom");
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRun = () => {
    if (onRunDetection) {
      onRunDetection({
        file: selectedFile,
        preset: selectedPreset
      });
    }
  };

  return (
    <div className="bg-[#0d1b2e] border border-[#1e3a5f] rounded-lg p-4 flex flex-col justify-between h-full shadow-lg" data-testid="upload-satellite-card">
      <div>
        <h3 className="text-sm font-bold text-slate-100 mb-3 flex items-center justify-between">
          <span>Upload Satellite Image</span>
          <span className="text-[10px] text-cyan-400 font-mono">SAR / OPTICAL</span>
        </h3>

        {/* Drag and Drop Box */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          data-testid="drop-zone-area"
          className="border-2 border-dashed border-[#1e3a5f] hover:border-cyan-500/70 bg-[#070e1a]/70 hover:bg-[#09131e] rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[140px]"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".png,.jpg,.jpeg,.tif,.tiff"
            className="hidden"
            data-testid="file-input-control"
          />

          {previewUrl ? (
            <div className="flex flex-col items-center">
              <img src={previewUrl} alt="Preview" className="h-16 w-28 object-cover rounded border border-cyan-500 mb-1" />
              <p className="text-xs text-emerald-400 font-medium truncate max-w-[180px]">{selectedFile?.name}</p>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-cyan-950/80 border border-cyan-700/50 flex items-center justify-center mb-2">
                <UploadCloud className="w-5 h-5 text-cyan-400" />
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Drag &amp; drop satellite image here
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">or</p>
              <button
                type="button"
                data-testid="choose-file-btn"
                className="mt-1 px-3 py-1 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold rounded transition-all shadow-sm"
              >
                Choose File
              </button>
            </>
          )}

          <p className="text-[10px] text-slate-500 mt-2">
            Supported: .tif, .jpg, .png (Sentinel, Landsat, etc.)
          </p>
        </div>

        {/* Preset Selector */}
        <div className="mt-2.5 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Quick Samples:</span>
          <div className="flex space-x-1.5">
            <button
              type="button"
              onClick={() => setSelectedPreset("sentinel1")}
              data-testid="sample-sentinel-btn"
              className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all ${
                selectedPreset === "sentinel1"
                  ? "bg-cyan-600 text-white"
                  : "bg-[#132742] text-slate-300 hover:text-white"
              }`}
            >
              Sentinel-1 SAR
            </button>
            <button
              type="button"
              onClick={() => setSelectedPreset("landsat")}
              data-testid="sample-landsat-btn"
              className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all ${
                selectedPreset === "landsat"
                  ? "bg-cyan-600 text-white"
                  : "bg-[#132742] text-slate-300 hover:text-white"
              }`}
            >
              Landsat-9
            </button>
          </div>
        </div>
      </div>

      {/* Run Detection Button */}
      <button
        onClick={handleRun}
        disabled={isProcessing}
        data-testid="run-detection-btn"
        className="mt-3 w-full py-2 bg-[#0284c7] hover:bg-[#0369a1] disabled:opacity-50 text-white rounded-lg font-semibold text-xs tracking-wide transition-all shadow-md flex items-center justify-center space-x-2"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Processing PyTorch AI U-Net...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-cyan-300" />
            <span>Run Detection</span>
          </>
        )}
      </button>
    </div>
  );
}
