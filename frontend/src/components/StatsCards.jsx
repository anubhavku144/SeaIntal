import React from "react";
import { Satellite, Ship, Droplets, AlertTriangle } from "lucide-react";

export default function StatsCards({ stats }) {
  const data = stats || {
    satellite_images_count: 1248,
    satellite_images_change: "+12% this month",
    vessels_tracked_count: 356,
    vessels_status: "Live from AIS",
    oil_spills_detected_count: 18,
    oil_spills_change: "+2 new today",
    high_risk_areas_count: 5,
    high_risk_status: "Under Monitoring"
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="dashboard-stats-grid">
      {/* Card 1: Satellite Images */}
      <div className="bg-[#0d1b2e] border border-[#1e3a5f] rounded-lg p-4 flex items-center justify-between shadow-lg hover:border-cyan-500/40 transition-all">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-lg bg-cyan-950/80 border border-cyan-800/40 flex items-center justify-center text-cyan-400">
            <Satellite className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Satellite Images</p>
            <h3 className="text-xl font-bold text-white font-mono" data-testid="stat-satellite-count">
              {data.satellite_images_count.toLocaleString()}
            </h3>
            <p className="text-[11px] text-emerald-400 font-medium mt-0.5">
              ↑ {data.satellite_images_change}
            </p>
          </div>
        </div>
      </div>

      {/* Card 2: Vessels Tracked */}
      <div className="bg-[#0d1b2e] border border-[#1e3a5f] rounded-lg p-4 flex items-center justify-between shadow-lg hover:border-cyan-500/40 transition-all">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-lg bg-blue-950/80 border border-blue-800/40 flex items-center justify-center text-blue-400">
            <Ship className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Vessels Tracked</p>
            <h3 className="text-xl font-bold text-white font-mono" data-testid="stat-vessels-count">
              {data.vessels_tracked_count.toLocaleString()}
            </h3>
            <p className="text-[11px] text-cyan-400 font-medium mt-0.5">
              {data.vessels_status}
            </p>
          </div>
        </div>
      </div>

      {/* Card 3: Oil Spills Detected */}
      <div className="bg-[#0d1b2e] border border-[#1e3a5f] rounded-lg p-4 flex items-center justify-between shadow-lg hover:border-red-500/40 transition-all">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-lg bg-red-950/80 border border-red-800/40 flex items-center justify-center text-red-400">
            <Droplets className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Oil Spills Detected</p>
            <h3 className="text-xl font-bold text-white font-mono" data-testid="stat-spills-count">
              {data.oil_spills_detected_count}
            </h3>
            <p className="text-[11px] text-red-400 font-medium mt-0.5">
              ↑ {data.oil_spills_change}
            </p>
          </div>
        </div>
      </div>

      {/* Card 4: High Risk Areas */}
      <div className="bg-[#0d1b2e] border border-[#1e3a5f] rounded-lg p-4 flex items-center justify-between shadow-lg hover:border-amber-500/40 transition-all">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-lg bg-amber-950/80 border border-amber-800/40 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">High Risk Areas</p>
            <h3 className="text-xl font-bold text-white font-mono" data-testid="stat-high-risk-count">
              {data.high_risk_areas_count}
            </h3>
            <p className="text-[11px] text-amber-400 font-medium mt-0.5">
              {data.high_risk_status}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
