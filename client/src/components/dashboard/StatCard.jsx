import React from "react";
import { FiTrendingUp } from "react-icons/fi";

function StatCard({ title, value, trend, icon: Icon, type, subtitle }) {
  return (
    <div className="ns-card ns-stat-card h-100">
      <div className={`ns-stat-icon-wrapper ${type}`}>
        <Icon />
      </div>
      <div className="flex-grow-1 overflow-hidden">
        <div className="ns-stat-label">{title}</div>
        <div className="ns-stat-value text-truncate">{value}</div>
        <div className="ns-stat-trend ns-trend-positive">
          <FiTrendingUp className="me-1" />
          <span>{trend}</span>
        </div>
      </div>
    </div>
  );
}

export default StatCard;
