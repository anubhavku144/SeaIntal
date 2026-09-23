import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

// Pages
import DashboardPage from "./pages/DashboardPage";
import SatelliteAnalysisPage from "./pages/SatelliteAnalysisPage";
import AisTrackingPage from "./pages/AisTrackingPage";
import DetectionResultsPage from "./pages/DetectionResultsPage";
import AlertsPage from "./pages/AlertsPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/LoginPage";

function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#0a1220] text-slate-100 flex flex-col font-sans">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-5 overflow-y-auto min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route
            path="/"
            element={
              <AppLayout>
                <DashboardPage />
              </AppLayout>
            }
          />

          <Route
            path="/satellite-analysis"
            element={
              <AppLayout>
                <SatelliteAnalysisPage />
              </AppLayout>
            }
          />

          <Route
            path="/ais-tracking"
            element={
              <AppLayout>
                <AisTrackingPage />
              </AppLayout>
            }
          />

          <Route
            path="/detection-results"
            element={
              <AppLayout>
                <DetectionResultsPage />
              </AppLayout>
            }
          />

          <Route
            path="/alerts"
            element={
              <AppLayout>
                <AlertsPage />
              </AppLayout>
            }
          />

          <Route
            path="/reports"
            element={
              <AppLayout>
                <ReportsPage />
              </AppLayout>
            }
          />

          <Route
            path="/settings"
            element={
              <AppLayout>
                <SettingsPage />
              </AppLayout>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
