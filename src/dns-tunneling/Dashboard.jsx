import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Cpu, Shield, Zap, Search } from 'lucide-react';
import StatsCard from './components/StatsCard';
import FeatureCard from './components/FeatureCard';

const Dashboard = () => {
  const navigate = useNavigate();

  const stats = [
    { 
      name: 'ML Models', 
      value: '3', 
      description: 'Different algorithms trained',
      icon: <Cpu className="w-6 h-6" />,
      color: 'text-purple-400'
    },
    { 
      name: 'Detection Accuracy', 
      value: '85%+', 
      description: 'Average across models',
      icon: <Shield className="w-6 h-6" />,
      color: 'text-green-400'
    },
    { 
      name: 'Features Analyzed', 
      value: '9', 
      description: 'Per DNS query',
      icon: <Search className="w-6 h-6" />,
      color: 'text-cyan-450'
    },
  ];

  const features = [
    {
      title: 'Multiple ML Models',
      description: 'Random Forest, SVM, Logistic Regression',
      icon: '🤖',
      gradient: 'from-purple-500/20 to-pink-500/20'
    },
    {
      title: 'Real-time Detection',
      description: 'Instant analysis of DNS queries for tunneling patterns',
      icon: '⚡',
      gradient: 'from-blue-500/20 to-cyan-500/20'
    },
    {
      title: 'Comprehensive Features',
      description: 'Analyze query length, entropy, character distribution, and more',
      icon: '🔍',
      gradient: 'from-green-500/20 to-emerald-500/20'
    },
    {
      title: 'User-friendly Interface',
      description: 'Clean, modern UI built with React and Tailwind CSS',
      icon: '🎨',
      gradient: 'from-orange-500/20 to-yellow-500/20'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-100 mb-4">
          DNS Tunneling <span className="text-cyan-450">Attack Detection</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-3xl mx-auto">
          Identify hidden communication channels in DNS queries using advanced machine learning classifiers
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {features.map((feature, index) => (
          <FeatureCard key={index} {...feature} />
        ))}
      </div>

      {/* Call to Action */}
      <div className="text-center">
        <div className="inline-flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/dns-tunneling/detect')}
            className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-cyan-450 to-blue-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity group"
          >
            <Search className="w-5 h-5 mr-3" />
            <span>Start Detection</span>
            <span className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
          </button>
          <button
            onClick={() => navigate('/dns-tunneling/models')}
            className="inline-flex items-center justify-center px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl border border-slate-700 transition-colors group"
          >
            <Cpu className="w-5 h-5 mr-3" />
            <span>Manage Models</span>
            <span className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
          </button>
        </div>
      </div>

      {/* Background Effects */}
      <div className="fixed top-0 left-0 right-0 bottom-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default Dashboard;