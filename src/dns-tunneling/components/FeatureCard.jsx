import React from 'react';

const FeatureCard = ({ title, description, icon, gradient }) => {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-6 border border-slate-700/50 bg-gradient-to-br ${gradient} bg-slate-850/50 backdrop-blur-xs hover:border-slate-600/50 transition-colors`}
    >
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="text-slate-100 font-semibold mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
};

export default FeatureCard;
