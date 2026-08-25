import React from 'react';

const StatsCard = ({ name, value, description, icon, color }) => {
  return (
    <div className="bg-slate-850/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-xs hover:border-slate-600/50 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <span className={`${color}`}>{icon}</span>
        <span className={`text-3xl font-bold ${color}`}>{value}</span>
      </div>
      <h3 className="text-slate-200 font-semibold">{name}</h3>
      <p className="text-slate-500 text-sm mt-1">{description}</p>
    </div>
  );
};

export default StatsCard;
