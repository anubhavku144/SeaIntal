import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import {
  FileText,
  Printer,
  Download,
  ShieldCheck,
  Compass,
  Ship,
  Wind,
  Layers,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";
const API = `${BACKEND_URL}/api`;

export default function ReportsPage() {
  const [searchParams] = useSearchParams();
  const detectionIdParam = searchParams.get("detection_id") || "DET-2026-0902-01";

  const [detections, setDetections] = useState([]);
  const [selectedDetectionId, setSelectedDetectionId] = useState(detectionIdParam);
  const [currentDetection, setCurrentDetection] = useState(null);
  const [driftData, setDriftData] = useState(null);
  const [analystNotes, setAnalystNotes] = useState(
    "High-confidence SAR slick signature verified against historical ship transit corridors. Proximity match confirms MV Ocean Star passed release centroid 1.5h prior to radar acquisition. Notification sent to Maritime Search & Rescue (MRCC)."
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        const [detsRes] = await Promise.all([
          axios.get(`${API}/detections`)
        ]);
        setDetections(detsRes.data);

        // Find matching detection
        let target = detsRes.data.find(d => d.detection_id === selectedDetectionId);
        if (!target && detsRes.data.length > 0) {
          target = detsRes.data[0];
          setSelectedDetectionId(target.detection_id);
        }

        if (target) {
          setCurrentDetection(target);
          // Run drift simulation
          const driftRes = await axios.post(`${API}/drift/simulate`, {
            origin_lat: target.latitude || 14.25,
            origin_lng: target.longitude || 82.14,
            acquisition_time: target.acquisition_time,
            wind_speed_knots: 14.5,
            wind_direction_deg: 230.0,
            current_speed_knots: 1.2,
            current_direction_deg: 190.0
          });
          setDriftData(driftRes.data);
        }
      } catch (e) {
        console.error("Reports loading error:", e);
      }
    };
    loadData();
  }, [selectedDetectionId]);

  const handlePrint = () => {
    window.print();
  };

  const det = currentDetection || {
    detection_id: "DET-2026-0902-01",
    satellite: "Sentinel-1C (SAR C-Band)",
    acquisition_time: "2026-09-02T10:24:00Z",
    latitude: 14.25,
    longitude: 82.14,
    location_name: "Bay of Bengal (East Coast Corridor)",
    area_km2: 2.43,
    confidence: 94.2,
    risk_level: "High",
    possible_source: {
      vessel_name: "MV Ocean Star",
      mmsi: "563489000",
      score: 87.0,
      distance_km: 3.2
    }
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-12" data-testid="maritime-report-view">
      {/* Action Header (Hidden during print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1e3a5f] print:hidden">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-cyan-400" />
            Official Maritime Oil Pollution Incident Dossier
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Generated multi-sensor intelligence report with AIS correlation and ocean current drift vectors
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={selectedDetectionId}
            onChange={(e) => setSelectedDetectionId(e.target.value)}
            className="bg-[#0d1b2e] border border-[#1e3a5f] rounded-lg px-3 py-1.5 text-xs text-white"
            data-testid="report-select-detection"
          >
            {detections.map(d => (
              <option key={d.detection_id} value={d.detection_id}>
                {`${d.detection_id} (${d.area_km2} km² - ${d.risk_level})`}
              </option>
            ))}
          </select>

          <button
            onClick={handlePrint}
            data-testid="print-report-btn"
            className="px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="bg-[#0d1b2e] border border-[#1e3a5f] rounded-xl p-8 shadow-2xl space-y-6 print:bg-white print:text-black print:border-none print:p-0">
        {/* Document Header */}
        <div className="flex justify-between items-start pb-6 border-b border-[#1e3a5f] print:border-gray-400">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 print:text-blue-700 font-bold text-xs uppercase tracking-widest mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>MARITIME POLLUTION SURVEILLANCE DESK</span>
            </div>
            <h1 className="text-2xl font-bold text-white print:text-black">
              INCIDENT ASSESSMENT DOSSIER
            </h1>
            <p className="text-xs text-slate-400 print:text-gray-600 mt-1">
              Reference: <strong className="text-cyan-300 print:text-blue-600 font-mono">{det.detection_id}</strong> | Classification: RESTRICTED
            </p>
          </div>

          <div className="text-right">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/40 print:bg-red-100 print:text-red-700">
              {det.risk_level || "HIGH"} RISK SEVERITY
            </span>
            <p className="text-[11px] text-slate-400 print:text-gray-600 mt-1 font-mono">
              Issued: {new Date().toLocaleDateString("en-GB")} UTC
            </p>
          </div>
        </div>

        {/* 1. Executive Summary */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 print:text-blue-800">
            1. Executive Summary
          </h3>
          <p className="text-xs text-slate-200 print:text-gray-800 leading-relaxed bg-[#070e1a] print:bg-gray-50 p-4 rounded-lg border border-[#1e3a5f] print:border-gray-300">
            Satellite sensor <strong>{det.satellite}</strong> observed an anomalous backscatter attenuation characteristic of an active hydrocarbon slick in the <strong>{det.location_name}</strong> at coordinates <strong>{det.latitude?.toFixed(4)}° N, {det.longitude?.toFixed(4)}° E</strong>. 
            The detected slick encompasses an estimated surface area of <strong>{det.area_km2} km²</strong> with an AI model confidence of <strong>{det.confidence}%</strong>.
            Hydrodynamic back-tracking and AIS track correlation identified <strong>{det.possible_source?.vessel_name || "MV Ocean Star"} (MMSI: {det.possible_source?.mmsi || "563489000"})</strong> as the primary Potential Source Vessel with an explainability rating of <strong>{det.possible_source?.score || 87}/100</strong>.
          </p>
        </div>

        {/* 2. Satellite Evidence Images */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 print:text-blue-800">
            2. Satellite Sensor &amp; AI Segmentation Mask
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#070e1a] print:bg-gray-100 p-2 rounded-lg border border-[#1e3a5f]">
              <div className="aspect-[16/9] rounded overflow-hidden flex items-center justify-center bg-black">
                {det.original_image_url ? (
                  <img src={det.original_image_url} alt="SAR Original" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-slate-500">SAR Raw C-Band</span>
                )}
              </div>
              <p className="text-[11px] text-center text-slate-400 print:text-gray-600 mt-1 font-mono">
                Figure 2.1: Raw SAR Backscatter Intensity
              </p>
            </div>

            <div className="bg-[#070e1a] print:bg-gray-100 p-2 rounded-lg border border-[#1e3a5f]">
              <div className="aspect-[16/9] rounded overflow-hidden flex items-center justify-center bg-black">
                {det.mask_image_url || det.overlay_image_url ? (
                  <img src={det.mask_image_url || det.overlay_image_url} alt="AI Mask" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-red-400">AI Slick Segmentation</span>
                )}
              </div>
              <p className="text-[11px] text-center text-slate-400 print:text-gray-600 mt-1 font-mono">
                Figure 2.2: AI U-Net Slick Boundary Polygon (Red)
              </p>
            </div>
          </div>
        </div>

        {/* 3. Potential Source Vessel Explainable Scoring Engine */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 print:text-blue-800 flex items-center gap-1.5">
            <Ship className="w-4 h-4" />
            <span>3. Potential Source Vessel Scoring &amp; Explainability Factors</span>
          </h3>

          <div className="bg-[#070e1a] print:bg-gray-50 border border-[#1e3a5f] print:border-gray-300 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-[#132742]">
              <div>
                <span className="text-sm font-bold text-white print:text-black">
                  {det.possible_source?.vessel_name || "MV Ocean Star"}
                </span>
                <span className="text-xs text-slate-400 print:text-gray-600 ml-2 font-mono">
                  MMSI: {det.possible_source?.mmsi || "563489000"} | Crude Oil Tanker
                </span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-red-400 print:text-red-600">
                  Source Score: {det.possible_source?.score || 87}/100
                </span>
              </div>
            </div>

            {/* Score Breakdown Indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-[#0d1b2e] print:bg-white p-2.5 rounded border border-[#1e3a5f]">
                <span className="text-[10px] text-slate-400 block">Distance Proximity</span>
                <span className="font-bold text-white print:text-black text-sm">92 / 100</span>
                <span className="text-[10px] text-emerald-400 block mt-0.5">3.2 km from spill</span>
              </div>
              <div className="bg-[#0d1b2e] print:bg-white p-2.5 rounded border border-[#1e3a5f]">
                <span className="text-[10px] text-slate-400 block">Temporal Match</span>
                <span className="font-bold text-white print:text-black text-sm">88 / 100</span>
                <span className="text-[10px] text-emerald-400 block mt-0.5">±1.2 hrs intersection</span>
              </div>
              <div className="bg-[#0d1b2e] print:bg-white p-2.5 rounded border border-[#1e3a5f]">
                <span className="text-[10px] text-slate-400 block">Trajectory Vector</span>
                <span className="font-bold text-white print:text-black text-sm">91 / 100</span>
                <span className="text-[10px] text-emerald-400 block mt-0.5">Direct track corridor</span>
              </div>
              <div className="bg-[#0d1b2e] print:bg-white p-2.5 rounded border border-[#1e3a5f]">
                <span className="text-[10px] text-slate-400 block">Vessel Cargo Risk</span>
                <span className="font-bold text-white print:text-black text-sm">95 / 100</span>
                <span className="text-[10px] text-amber-400 block mt-0.5">Heavy Crude Carrier</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 print:text-gray-500 italic">
              * Legal Disclaimer: Potential Source scoring is an algorithmic probabilistic correlation based on spatial-temporal tracking and does not constitute a judicial polluter determination.
            </p>
          </div>
        </div>

        {/* 4. Ocean Current & Weather Drift Vector */}
        {driftData && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 print:text-blue-800 flex items-center gap-1.5">
              <Wind className="w-4 h-4" />
              <span>4. Hydrodynamic Ocean Drift Trajectory (Forecast &amp; Hindcast)</span>
            </h3>

            <div className="bg-[#070e1a] print:bg-gray-50 border border-[#1e3a5f] rounded-lg p-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 block">Wind Velocity</span>
                  <span className="font-semibold text-white print:text-black">{driftData.environmental_conditions.wind_speed_knots} kn @ {driftData.environmental_conditions.wind_direction_deg}°</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Surface Current</span>
                  <span className="font-semibold text-white print:text-black">{driftData.environmental_conditions.current_speed_knots} kn @ {driftData.environmental_conditions.current_direction_deg}°</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Net Oil Drift Speed</span>
                  <span className="font-semibold text-cyan-400 print:text-blue-600">{driftData.environmental_conditions.net_drift_speed_knots} kn</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Forecast Drift Bearing</span>
                  <span className="font-semibold text-cyan-400 print:text-blue-600">{driftData.environmental_conditions.net_drift_direction_deg}° (SSW)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. Analyst Notes & Verification */}
        <div className="space-y-2 pt-2 border-t border-[#1e3a5f]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 print:text-blue-800">
            5. Maritime Operations Analyst Notes
          </h3>
          <textarea
            value={analystNotes}
            onChange={(e) => setAnalystNotes(e.target.value)}
            className="w-full bg-[#070e1a] print:bg-white border border-[#1e3a5f] print:border-gray-300 rounded-lg p-3 text-xs text-slate-200 print:text-black focus:outline-none"
            rows={3}
            data-testid="analyst-notes-input"
          />
        </div>

        {/* Signature Box */}
        <div className="pt-6 border-t border-[#1e3a5f] flex justify-between items-center text-xs text-slate-400 print:text-gray-600 font-mono">
          <div>
            <span>Verified By: </span>
            <strong className="text-white print:text-black">Capt. Anubhav Kumar (Maritime Ops Command)</strong>
          </div>
          <div>
            <span>System Authority: </span>
            <strong className="text-cyan-400 print:text-blue-600">SAR &amp; AIS Intelligence Network</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
