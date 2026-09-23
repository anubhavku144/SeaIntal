import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Satellite,
  Ship,
  Search,
  Bell,
  FileText,
  Settings,
  Waves
} from "lucide-react";

export default function Sidebar({ alertCount = 3 }) {
  const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard, testId: "sidebar-dashboard-link" },
    { path: "/satellite-analysis", label: "Satellite Analysis", icon: Satellite, testId: "sidebar-satellite-link" },
    { path: "/ais-tracking", label: "AIS Tracking", icon: Ship, testId: "sidebar-ais-link" },
    { path: "/detection-results", label: "Detection Results", icon: Search, testId: "sidebar-results-link" },
    { path: "/alerts", label: "Alerts", icon: Bell, badge: alertCount, testId: "sidebar-alerts-link" },
    { path: "/reports", label: "Reports", icon: FileText, testId: "sidebar-reports-link" },
    { path: "/settings", label: "Settings", icon: Settings, testId: "sidebar-settings-link" },
  ];

  return (
    <aside className="w-60 bg-[#070e1a] border-r border-[#1e3a5f] flex flex-col justify-between py-4 select-none shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Top Nav List */}
      <div className="space-y-1 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              data-testid={item.testId}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#0284c7] text-white shadow-md shadow-cyan-900/40"
                    : "text-slate-400 hover:text-slate-200 hover:bg-[#0d1b2e]"
                }`
              }
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
              {item.badge && item.badge > 0 && (
                <span className="bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Bottom Maritime Ocean Branding */}
      <div className="px-4 py-6 border-t border-[#132742]/50 text-center">
        <div className="flex items-center justify-center space-x-2 text-cyan-400/80 mb-1">
          <Waves className="w-4 h-4" />
        </div>
        <p className="text-xs font-serif italic text-cyan-200/90 tracking-wider">
          Clean Seas
        </p>
        <p className="text-xs font-serif italic text-cyan-400/80 tracking-wider">
          Safer Tomorrow
        </p>
      </div>
    </aside>
  );
}
