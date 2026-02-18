import React from 'react';

const StatCard = ({ title, value }) => (
  <div className="stat-card">
    <div className="stat-title">{title}</div>
    <div className="stat-value">{value}</div>
  </div>
);

export default StatCard;
