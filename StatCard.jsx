import React from 'react';

const StatCard = ({ label, value, icon }) => {
  return (
    <div className="stat-card glass">
      <div className="stat-info">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
      </div>
      <div className="stat-icon-wrapper">
        {icon}
      </div>
    </div>
  );
};

export default StatCard;
