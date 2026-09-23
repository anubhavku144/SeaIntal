import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  Clock,
  ShieldAlert,
  ArrowRight,
  Filter,
  Check
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";
const API = `${BACKEND_URL}/api`;

export default function AlertsPage() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [severityFilter, setSeverityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchAlerts = async () => {
    try {
      const res = await axios.get(`${API}/alerts`, {
        params: {
          severity: severityFilter !== "All" ? severityFilter : undefined,
          status: statusFilter !== "All" ? statusFilter : undefined
        }
      });
      setAlerts(res.data);
    } catch (e) {
      console.error("Fetch alerts error:", e);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [severityFilter, statusFilter]);

  const handleResolve = async (alertId) => {
    try {
      await axios.patch(`${API}/alerts/${alertId}/resolve`);
      fetchAlerts();
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkRead = async (alertId) => {
    try {
      await axios.patch(`${API}/alerts/${alertId}/read`);
      fetchAlerts();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto" data-testid="alerts-management-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1e3a5f]">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-red-400" />
            Maritime Emergency Alerts &amp; Pollution Notifications
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Automated notifications triggered by high-confidence slicks, sensitive ecological zones, or high-risk AIS vessels
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#0d1b2e] border border-[#1e3a5f] rounded-lg p-3 flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-300 font-medium">Severity:</span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-[#070e1a] border border-[#1e3a5f] rounded px-2.5 py-1 text-xs text-white"
            data-testid="alerts-severity-filter"
          >
            <option value="All">All Severities</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-slate-300 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#070e1a] border border-[#1e3a5f] rounded px-2.5 py-1 text-xs text-white"
            data-testid="alerts-status-filter"
          >
            <option value="All">All Statuses</option>
            <option value="Unread">Unread</option>
            <option value="Read">Read</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Alert Feed */}
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="p-8 bg-[#0d1b2e] border border-[#1e3a5f] rounded-lg text-center text-slate-400 text-xs">
            No active alerts matching the selected filters.
          </div>
        ) : (
          alerts.map((alert) => {
            const isCritical = alert.severity === "CRITICAL";
            const isHigh = alert.severity === "HIGH";
            const isResolved = alert.status === "Resolved";
            return (
              <div
                key={alert.alert_id || alert.id}
                className={`bg-[#0d1b2e] border rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all shadow-lg ${
                  isResolved
                    ? "border-[#1e3a5f] opacity-75"
                    : isCritical
                    ? "border-red-500/60 bg-red-950/10"
                    : isHigh
                    ? "border-amber-500/60"
                    : "border-[#1e3a5f]"
                }`}
                data-testid={`alert-card-${alert.alert_id}`}
              >
                <div className="flex items-start space-x-3.5">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      isCritical
                        ? "bg-red-500/20 text-red-400 border border-red-500/40"
                        : isHigh
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                        : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                    }`}
                  >
                    <ShieldAlert className="w-5 h-5" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          isCritical
                            ? "bg-red-600 text-white"
                            : isHigh
                            ? "bg-amber-500 text-slate-900"
                            : "bg-cyan-600 text-white"
                        }`}
                      >
                        {alert.severity}
                      </span>
                      <h4 className="text-sm font-bold text-white">{alert.title}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {alert.created_at ? new Date(alert.created_at).toLocaleTimeString() + " UTC" : "Recent"}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 max-w-3xl">{alert.reason}</p>

                    <div className="flex items-center space-x-3 text-[11px] text-slate-400 font-mono pt-1">
                      <span>Location: {alert.location}</span>
                      {alert.detection_id && (
                        <span>• Ref: <strong className="text-cyan-400">{alert.detection_id}</strong></span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center space-x-2 shrink-0">
                  {alert.detection_id && (
                    <button
                      onClick={() => navigate(`/reports?detection_id=${alert.detection_id}`)}
                      className="px-3 py-1.5 bg-[#132742] hover:bg-[#1e3a5f] text-cyan-300 rounded text-xs font-semibold flex items-center gap-1 transition-all"
                    >
                      <span>Open Dossier</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}

                  {!isResolved ? (
                    <button
                      onClick={() => handleResolve(alert.alert_id || alert.id)}
                      data-testid={`resolve-alert-btn-${alert.alert_id}`}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-xs font-semibold flex items-center gap-1 transition-all"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Resolve</span>
                    </button>
                  ) : (
                    <span className="text-emerald-400 text-xs font-medium flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Resolved
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
