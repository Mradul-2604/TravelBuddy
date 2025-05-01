import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { FaCar, FaUserFriends, FaUser, FaRegBell, FaChartPie } from 'react-icons/fa';

const Notifications = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch notifications data here
    // For now, just simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <>
        <div className="sidebar">
          <NavLink to="/dashboard/notifications" className="nav-item">
            <FaRegBell /> Notifications
          </NavLink>
          <NavLink to="/dashboard/statistics" className="nav-item">
            <FaChartPie /> Statistics
          </NavLink>
        </div>
        <div className="loading">Loading...</div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="sidebar">
          <NavLink to="/dashboard/notifications" className="nav-item">
            <FaRegBell /> Notifications
          </NavLink>
          <NavLink to="/dashboard/statistics" className="nav-item">
            <FaChartPie /> Statistics
          </NavLink>
        </div>
        <div className="error">{error}</div>
      </>
    );
  }

  return (
    <>
      <div className="sidebar">
        <NavLink to="/dashboard/notifications" className="nav-item">
          <FaRegBell /> Notifications
        </NavLink>
        <NavLink to="/dashboard/statistics" className="nav-item">
          <FaChartPie /> Statistics
        </NavLink>
      </div>
      <div className="notifications-content">
        {/* Notifications content */}
      </div>
    </>
  );
};

export default Notifications; 