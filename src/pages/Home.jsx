import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, Cpu, Search, BarChart3 } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col">
      <nav className="border-b border-slate-800/50">
        <div className="container mx-auto px-4 py-4 flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-450 to-blue-500" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-450 to-blue-500 bg-clip-text text-transparent">
            SecureLens
          </h1>
        </div>
      </nav>

      <main className="flex-1 container mx-auto px-4 py-20 flex flex-col items-center text-center max-w-3xl">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-cyan-450/10 border border-cyan-450/20 text-cyan-450 text-sm font-medium mb-6">
          <Shield className="w-4 h-4 mr-2" />
          Network Security Toolkit
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-slate-100 mb-4">
          Detect threats hiding in your network traffic
        </h2>
        <p className="text-slate-400 text-lg mb-10">
          SecureLens is a growing collection of ML-powered detection tools. Start
          with the DNS Tunneling detector to catch covert data exfiltration
          channels hidden inside ordinary-looking DNS queries.
        </p>

        <button
          onClick={() => navigate('/dns-tunneling')}
          className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-cyan-450 to-blue-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity group"
        >
          <Search className="w-5 h-5 mr-3" />
          <span>Open DNS Tunneling Detector</span>
          <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform" />
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 w-full text-left">
          <div className="bg-slate-850/50 border border-slate-700/50 rounded-xl p-4">
            <Cpu className="w-5 h-5 text-purple-400 mb-2" />
            <div className="text-slate-200 font-medium text-sm">3 ML Models</div>
            <div className="text-slate-500 text-xs mt-1">
              Random Forest, SVM and Logistic Regression
            </div>
          </div>
          <div className="bg-slate-850/50 border border-slate-700/50 rounded-xl p-4">
            <Search className="w-5 h-5 text-cyan-450 mb-2" />
            <div className="text-slate-200 font-medium text-sm">Real-time Detection</div>
            <div className="text-slate-500 text-xs mt-1">
              Score DNS queries as they come in
            </div>
          </div>
          <div className="bg-slate-850/50 border border-slate-700/50 rounded-xl p-4">
            <BarChart3 className="w-5 h-5 text-emerald-400 mb-2" />
            <div className="text-slate-200 font-medium text-sm">Model Insights</div>
            <div className="text-slate-500 text-xs mt-1">
              Compare accuracy across trained models
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-800/50 py-6 text-center text-slate-500 text-sm">
        SecureLens &mdash; built for learning and demonstrating ML-based network security tooling.
      </footer>
    </div>
  );
};

export default Home;
