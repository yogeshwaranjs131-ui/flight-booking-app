import React from 'react';

function StatsCard({ title, value, icon, colorClass = 'bg-white' }) {
  return (
    <div className={`${colorClass} p-6 rounded-lg shadow-md flex items-center`}>
      <div className="text-4xl mr-4">{icon}</div>
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

export default StatsCard;