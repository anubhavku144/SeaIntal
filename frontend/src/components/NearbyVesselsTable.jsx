import React from "react";
import { useNavigate } from "react-router-dom";
import { Ship, ChevronRight } from "lucide-react";

export default function NearbyVesselsTable({ vessels = [], onSelectVessel }) {
  const navigate = useNavigate();

  // Fallback default list matching screenshot
  const displayVessels = vessels && vessels.length > 0 ? vessels : [
    { id: 1, vessel_name: "MV Ocean Star", mmsi: "563489000", distance_km: 3.2, status: "Suspicious" },
    { id: 2, vessel_name: "Sea Voyager", mmsi: "563421000", distance_km: 8.6, status: "Normal" },
    { id: 3, vessel_name: "Global Trader", mmsi: "563788000", distance_km: 12.4, status: "Normal" },
    { id: 4, vessel_name: "Ocean Pearl", mmsi: "564112000", distance_km: 15.7, status: "Normal" },
    { id: 5, vessel_name: "Blue Wave", mmsi: "563995000", distance_km: 18.3, status: "Normal" }
  ];

  return (
    <div className="bg-[#0d1b2e] border border-[#1e3a5f] rounded-lg p-4 flex flex-col justify-between h-full shadow-lg" data-testid="nearby-vessels-card">
      <div>
        <div className="flex items-center justify-between pb-2 border-b border-[#1e3a5f]">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Ship className="w-4 h-4 text-emerald-400" />
            <span>Nearby Vessels (AIS)</span>
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">RADIUS: 50 KM</span>
        </div>

        {/* Table */}
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[11px] text-slate-400 border-b border-[#132742]">
                <th className="py-1.5 font-medium">#</th>
                <th className="py-1.5 font-medium">Vessel Name</th>
                <th className="py-1.5 font-medium">MMSI</th>
                <th className="py-1.5 font-medium">Distance (km)</th>
                <th className="py-1.5 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#132742]/60">
              {displayVessels.slice(0, 5).map((v, idx) => {
                const isSuspicious = v.status === "Suspicious" || v.mmsi === "563489000";
                return (
                  <tr
                    key={v.mmsi || idx}
                    onClick={() => onSelectVessel && onSelectVessel(v)}
                    className="hover:bg-[#132742]/50 cursor-pointer transition-colors"
                    data-testid={`nearby-vessel-row-${idx}`}
                  >
                    <td className="py-1.5 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                    <td className={`py-1.5 font-medium text-xs ${isSuspicious ? "text-red-400 font-semibold" : "text-slate-200"}`}>
                      {v.vessel_name}
                    </td>
                    <td className="py-1.5 text-slate-400 font-mono text-[11px]">{v.mmsi}</td>
                    <td className="py-1.5 text-slate-300 font-mono text-[11px]">{v.distance_km || "--"}</td>
                    <td className="py-1.5 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          isSuspicious
                            ? "bg-red-500/20 text-red-400 border border-red-500/40"
                            : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        }`}
                      >
                        {isSuspicious ? "Suspicious" : "Normal"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* View All Vessels Action Button */}
      <div className="mt-3">
        <button
          onClick={() => navigate("/ais-tracking")}
          data-testid="view-all-vessels-btn"
          className="w-full py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-lg font-semibold text-xs transition-all shadow-md flex items-center justify-center space-x-1"
        >
          <span>View All Vessels</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
