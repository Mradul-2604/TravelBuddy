import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { FaChartPie, FaCar, FaUserFriends, FaUser, FaRegBell } from 'react-icons/fa';
import { NavLink } from 'react-router-dom';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const Statistics = () => {
  const [rideStats, setRideStats] = useState({
    active: 0,
    completed: 0,
    cancelled: 0,
    totalRides: 0,
    upcomingRides: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRideStats = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/rides/stats');
        if (!response.ok) {
          throw new Error('Failed to fetch ride statistics');
        }
        const data = await response.json();
        setRideStats(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchRideStats();
  }, []);

  const chartData = {
    labels: ['Active Rides', 'Completed Rides', 'Cancelled Rides'],
    datasets: [
      {
        data: [rideStats.active || 0, rideStats.completed || 0, rideStats.cancelled || 0],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 99, 132, 0.6)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#ffffff',
          font: {
            size: 14
          }
        }
      }
    }
  };

  const renderSidebar = () => (
    <aside className="dashboard-sidebar">
      <h2 className="sidebar-title">Dashboard</h2>
      <nav className="sidebar-nav">
        <NavLink to="/dashboard/my-rides" className="nav-item">
          <FaCar /> My Rides
        </NavLink>
        <NavLink to="/dashboard/requests" className="nav-item">
          <FaUserFriends /> Requests
        </NavLink>
        <NavLink to="/dashboard/profile" className="nav-item">
          <FaUser /> Profile
        </NavLink>
        <NavLink to="/dashboard/notifications" className="nav-item">
          <FaRegBell /> Notifications
        </NavLink>
        <NavLink to="/dashboard/statistics" className="nav-item">
          <FaChartPie /> Statistics
        </NavLink>
      </nav>
    </aside>
  );

  if (loading) {
    return (
      <div className="dashboard-layout">
        {renderSidebar()}
        <main className="dashboard-main">
          <div className="loading">Loading statistics...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-layout">
        {renderSidebar()}
        <main className="dashboard-main">
          <div className="error">{error}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      {renderSidebar()}
      <main className="dashboard-main">
        <div className="dashboard-header">
          <div className="header-left">
            <h1>Ride Statistics</h1>
          </div>
          <div className="header-right">
            <FaChartPie className="stat-icon" />
          </div>
        </div>

        <div className="stats-container">
          <div className="chart-container">
            <Pie data={chartData} options={options} />
          </div>
          <div className="stats-summary">
            <div className="stat-item">
              <span className="stat-label">Total Rides</span>
              <span className="stat-value">{rideStats.totalRides || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Active Rides</span>
              <span className="stat-value">{rideStats.active || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Upcoming Rides</span>
              <span className="stat-value">{rideStats.upcomingRides || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Completed Rides</span>
              <span className="stat-value">{rideStats.completed || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Cancelled Rides</span>
              <span className="stat-value">{rideStats.cancelled || 0}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Statistics; 