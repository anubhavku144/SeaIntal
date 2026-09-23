import React from "react";
import { useAuth } from "../context/AuthContext";
import { Shield, Bell, ChevronDown, Radio, Waves } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ unreadAlertsCount = 3 }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-[#0a1220] border-b border-[#1e3a5f] px-6 flex items-center justify-between z-30 sticky top-0">
      {/* Brand & System Title */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Waves className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-base sm:text-lg font-bold text-white tracking-wider flex items-center gap-2">
            OIL SPILL DETECTION &amp; MARITIME MONITORING SYSTEM
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse"></span>
              LIVE OPS
            </span>
          </h1>
          <p className="text-xs text-slate-400 tracking-wide">
            Satellite Intelligence <span className="text-cyan-500">|</span> AIS Integration <span className="text-cyan-500">|</span> Safer Oceans
          </p>
        </div>
      </div>

      {/* Right User & Live Status Bar */}
      <div className="flex items-center space-x-4">
        {/* Alerts quick badge */}
        <Link
          to="/alerts"
          data-testid="nav-alerts-btn"
          className="relative p-2 rounded-lg bg-[#0d1b2e] hover:bg-[#132742] text-slate-300 hover:text-white border border-[#1e3a5f] transition-all"
        >
          <Bell className="w-4 h-4" />
          {unreadAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {unreadAlertsCount}
            </span>
          )}
        </Link>

        {/* User profile dropdown */}
        <div className="flex items-center space-x-2 bg-[#0d1b2e] border border-[#1e3a5f] px-3 py-1.5 rounded-lg text-sm">
          <div className="w-6 h-6 rounded-full bg-cyan-600/30 text-cyan-400 flex items-center justify-center text-xs font-bold">
            {user?.name ? user.name.charAt(0) : "A"}
          </div>
          <span className="text-slate-200 text-xs font-medium" data-testid="nav-user-name">
            Welcome, {user?.name || "Anubhav Kumar"}
          </span>
          <button
            onClick={() => {
              if (user) {
                logout();
              } else {
                navigate("/login");
              }
            }}
            data-testid="nav-auth-action-btn"
            className="text-[11px] text-cyan-400 hover:text-cyan-300 ml-2 underline"
          >
            {user ? "Sign Out" : "Sign In"}
          </button>
        </div>
      </div>
    </header>
  );
}
