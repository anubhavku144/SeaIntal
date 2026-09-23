import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Waves, Lock, Mail, ShieldAlert, KeyRound, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("admin@maritime.gov");
  const [password, setPassword] = useState("admin_maritime_2026");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.detail || "Authentication failed. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (role) => {
    if (role === "admin") {
      setEmail("admin@maritime.gov");
      setPassword("admin_maritime_2026");
    } else {
      setEmail("analyst@maritime.gov");
      setPassword("analyst_maritime_2026");
    }
  };

  return (
    <div className="min-h-screen bg-[#070e1a] flex flex-col justify-center items-center px-4" data-testid="login-page">
      <div className="max-w-md w-full space-y-6">
        {/* Logo & Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mx-auto shadow-xl shadow-cyan-500/20">
            <Waves className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-lg font-bold text-white tracking-wider">
            OIL SPILL DETECTION &amp; MARITIME MONITORING SYSTEM
          </h1>
          <p className="text-xs text-slate-400">
            Satellite Intelligence <span className="text-cyan-500">|</span> AIS Integration <span className="text-cyan-500">|</span> Safer Oceans
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-[#0d1b2e] border border-[#1e3a5f] rounded-xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1e3a5f]">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-cyan-400" />
              Operator Authentication
            </h2>
            <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
              JWT SECURE
            </span>
          </div>

          {error && (
            <div className="p-3 bg-red-950/40 border border-red-800 text-red-300 text-xs rounded-lg flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="text-[11px] text-slate-300 font-medium block mb-1">Operator Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid="login-email-input"
                  className="w-full bg-[#070e1a] border border-[#1e3a5f] rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-300 font-medium block mb-1">Passcode / Key</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-testid="login-password-input"
                  className="w-full bg-[#070e1a] border border-[#1e3a5f] rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              data-testid="login-submit-btn"
              className="w-full py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-lg font-semibold text-xs tracking-wide transition-all shadow-md flex items-center justify-center space-x-2"
            >
              <span>{loading ? "Authenticating..." : "Access Maritime Console"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="pt-3 border-t border-[#1e3a5f] text-center space-y-2">
            <span className="text-[11px] text-slate-400">1-Click Demo Credentials:</span>
            <div className="flex justify-center space-x-2">
              <button
                type="button"
                onClick={() => handleQuickDemo("admin")}
                data-testid="quick-admin-demo-btn"
                className="px-2.5 py-1 bg-[#132742] hover:bg-[#1e3a5f] text-cyan-300 rounded text-[10px] font-mono border border-cyan-800/40"
              >
                Capt. Anubhav (Admin)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
