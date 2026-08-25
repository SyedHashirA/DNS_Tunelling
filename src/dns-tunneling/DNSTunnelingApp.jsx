import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import Detection from './Detection';
import Models from './Models';
import Navbar from './Navbar';

const DNSTunnelingApp = () => {
  const navigate = useNavigate();

  const handleBackToDashboard = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Custom Navbar with Back Button */}
      <nav className="bg-slate-950/80 backdrop-blur-lg border-b border-slate-800/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={handleBackToDashboard}>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-450 to-blue-500"></div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-450 to-blue-500 bg-clip-text text-transparent">
                SecureLens
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToDashboard}
                className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors hover:bg-slate-800/30 rounded-lg"
              >
                ← Back to Main Dashboard
              </button>
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                DNS Tool Active
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* DNS Tool Navigation */}
      <Navbar />

      {/* Main Content - Use Routes for internal navigation */}
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="detect" element={<Detection />} />
          <Route path="models" element={<Models />} />
        </Routes>
      </div>
    </div>
  );
};

export default DNSTunnelingApp;