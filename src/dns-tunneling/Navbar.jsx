import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BarChart3, Search, Cpu } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '', label: 'Dashboard', icon: <BarChart3 className="w-5 h-5" /> },
    { path: 'detect', label: 'Detection', icon: <Search className="w-5 h-5" /> },
    { path: 'models', label: 'ML Models', icon: <Cpu className="w-5 h-5" /> },
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <nav className="bg-slate-850/50 backdrop-blur-xs border-b border-slate-700/30">
      <div className="container mx-auto px-4">
        <div className="flex justify-center items-center h-16">
          <div className="flex space-x-8">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavigation(`/dns-tunneling/${item.path}`)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                  location.pathname === `/dns-tunneling/${item.path}` || 
                  (item.path === '' && location.pathname === '/dns-tunneling')
                    ? 'text-cyan-450 bg-cyan-450/10 border border-cyan-450/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;