import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, NavLink, useLocation, useNavigate, Navigate } from "react-router-dom";
import { FaCar, FaBell, FaUser, FaMapMarkerAlt, FaSearch, FaUserFriends, FaCog, FaRegBell, FaEnvelope, FaPhone, FaEdit, FaTimes, FaChartPie } from "react-icons/fa";
import "./App.css";
import Login from './components/Login';
import Register from './components/Register';
import MyRides from './components/MyRides';
import Statistics from './components/Dashboard/Statistics';

// Add ProtectedRoute component at the top
const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [navigate]);

  if (!isAuthenticated) return null;
  return children;
};

// Placeholder components
const Home = () => {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('token') !== null;

  const handleRideClick = (path) => {
    if (isAuthenticated) {
      navigate(path);
    } else {
      navigate('/login');
    }
  };

  return (
    <>
      <div className="home-container">
        <div className="hero-section">
          <h1>Find Your Travel Companion</h1>
          <p>Connect with fellow VIT Vellore students for shared rides to airports, cities, and more. Save money, make friends, and travel sustainably.</p>
          <div className="cta-buttons">
            <button onClick={() => handleRideClick('/find-ride')} className="primary-button">Find a Ride</button>
            <button onClick={() => handleRideClick('/offer-ride')} className="secondary-button">Offer a Ride</button>
          </div>
        </div>

        <div className="popular-destinations">
          <h2>Popular Destinations</h2>
          <p className="subtitle">Most frequent travel routes from VIT Vellore</p>
          <div className="destinations-list">
            <div className="destination-card">
              <div className="destination-icon">
                <FaMapMarkerAlt />
              </div>
              <div className="destination-info">
                <h3>Chennai Airport</h3>
                <p>3 hours drive</p>
              </div>
            </div>
            <div className="destination-card">
              <div className="destination-icon">
                <FaMapMarkerAlt />
              </div>
              <div className="destination-info">
                <h3>Bangalore City</h3>
                <p>4 hours drive</p>
              </div>
            </div>
            <div className="destination-card">
              <div className="destination-icon">
                <FaMapMarkerAlt />
              </div>
              <div className="destination-info">
                <h3>Chennai City</h3>
                <p>2.5 hours drive</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="how-it-works-section">
        <h2>How It Works</h2>
        <p className="subtitle">Connect with fellow students for shared rides in just a few simple steps</p>
        
        <div className="steps-container">
          <div className="step-card">
            <div className="step-icon">
              <FaSearch />
            </div>
            <h3>Find a Ride</h3>
            <p>Search for available rides based on your destination and travel date</p>
          </div>

          <div className="step-card">
            <div className="step-icon">
              <FaUserFriends />
            </div>
            <h3>Connect</h3>
            <p>Request to join a ride and connect with the driver through our secure platform</p>
          </div>

          <div className="step-card">
            <div className="step-icon">
              <FaCar />
            </div>
            <h3>Travel Together</h3>
            <p>Share the journey, split the costs, and make new friends along the way</p>
          </div>
        </div>
      </div>
    </>
  );
};

const FindRide = () => {
  const [rides, setRides] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [requestedRides, setRequestedRides] = React.useState(new Set());
  const [searchParams, setSearchParams] = React.useState({
    from: '',
    to: '',
    date: '',
    seats: ''
  });

  // Fetch available rides
  const fetchAvailableRides = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please login to view rides');
      }

      // Fetch available rides
      const ridesResponse = await fetch('http://localhost:5000/api/rides/available', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!ridesResponse.ok) {
        throw new Error('Failed to fetch rides');
      }

      const ridesData = await ridesResponse.json();

      // Fetch user's sent requests
      const requestsResponse = await fetch('http://localhost:5000/api/rides/requests', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!requestsResponse.ok) {
        throw new Error('Failed to fetch requests');
      }

      const requestsData = await requestsResponse.json();
      
      // Get IDs of rides that user has already requested or been rejected from
      const requestedRideIds = new Set(
        requestsData.sent
          .filter(ride => ride.requests.some(req => 
            req.status === 'pending' || req.status === 'rejected'
          ))
          .map(ride => ride._id)
      );

      // Filter out rides with 0 seats and rides that user has already requested or been rejected from
      const availableRides = ridesData.filter(ride => 
        ride.availableSeats > 0 && !requestedRideIds.has(ride._id)
      );

      setRides(availableRides);
      setError(null);
    } catch (err) {
      console.error('Error fetching rides:', err);
      setError(err.message || 'Failed to load rides');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestRide = async (rideId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to request a ride');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/rides/${rideId}/request`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to request ride');
      }

      // Add the ride to requested rides and remove it from available rides
      setRequestedRides(prev => new Set([...prev, rideId]));
      setRides(prevRides => prevRides.filter(ride => ride._id !== rideId));
      setError(null);
    } catch (err) {
      console.error('Error requesting ride:', err);
      setError(err.message || 'An error occurred while requesting the ride');
    }
  };

  React.useEffect(() => {
    fetchAvailableRides();
  }, []);

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // You can implement search filtering here
    fetchAvailableRides();
  };

  return (
    <div className="find-ride-page">
      <div className="find-ride-container">
        <div className="find-ride-content">
          <h1>Find Your Perfect Ride</h1>
          <p className="subtitle">Search for rides to your destination or offer a ride to others.</p>

          <div className="search-form-card">
            <h2>Search for Rides</h2>
            
            <form className="search-form" onSubmit={handleSearch}>
              <div className="form-row">
                <div className="form-group">
                  <label>From</label>
                  <input 
                    type="text" 
                    name="from"
                    value={searchParams.from}
                    onChange={handleSearchChange}
                    placeholder="Enter departure city"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>To</label>
                  <input 
                    type="text" 
                    name="to"
                    value={searchParams.to}
                    onChange={handleSearchChange}
                    placeholder="Enter destination city"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date</label>
                  <input 
                    type="date"
                    name="date"
                    value={searchParams.date}
                    onChange={handleSearchChange}
                    className="form-input"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="form-group">
                  <label>Seats</label>
                  <input 
                    type="number" 
                    name="seats"
                    value={searchParams.seats}
                    onChange={handleSearchChange}
                    placeholder="Number of seats"
                    className="form-input"
                    min="1"
                  />
                </div>
              </div>

              <button type="submit" className="search-button">
                <FaSearch />
                Search Rides
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="available-rides-section">
        <div className="section-content">
          <h2>Available Rides</h2>
          <p className="subtitle">Browse through available rides that match your criteria.</p>

          {loading ? (
            <div className="loading-message">Loading available rides...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : rides.length === 0 ? (
            <div className="no-rides-message">No rides available at the moment.</div>
          ) : (
            <div className="rides-grid">
              {rides.map(ride => (
                <div key={ride._id} className="ride-card">
                  <div className="ride-header">
                    <h3>{ride.from} to {ride.to}</h3>
                    <span className="status-badge active">Available</span>
                  </div>
                  <div className="ride-details">
                    <div className="detail-item">
                      <span>Date:</span>
                      <span>{new Date(ride.date).toLocaleDateString()}</span>
                    </div>
                    <div className="detail-item">
                      <span>Time:</span>
                      <span>{ride.time}</span>
                    </div>
                    <div className="detail-item">
                      <span>Available Seats:</span>
                      <span>{ride.availableSeats}</span>
                    </div>
                    <div className="detail-item">
                      <span>Price:</span>
                      <span>₹{ride.price} per seat</span>
                    </div>
                    <div className="detail-item">
                      <span>Vehicle:</span>
                      <span>{ride.vehicle}</span>
                    </div>
                    <div className="detail-item">
                      <span>Ride Owner:</span>
                      <span>{ride.driver.name}</span>
                    </div>
                  </div>
                  <button 
                    className="view-details-button"
                    onClick={() => handleRequestRide(ride._id)}
                  >
                    Request to Join
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Add SuccessPopup component
function SuccessPopup({ message, onClose }) {
  return (
    <div className="success-popup-overlay">
      <div className="success-popup">
        <div className="success-icon">✓</div>
        <h3>Success!</h3>
        <p>{message}</p>
        <button onClick={onClose} className="success-button">OK</button>
      </div>
    </div>
  );
}

// Update OfferRide component
function OfferRide() {
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    date: '',
    time: '',
    seats: '',
    price: '',
    vehicle: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.from || !formData.to || !formData.date || !formData.time || !formData.seats || !formData.price || !formData.vehicle) {
      setError('All fields are required');
      return false;
    }
    if (parseInt(formData.seats) < 1 || parseInt(formData.seats) > 6) {
      setError('Number of seats must be between 1 and 6');
      return false;
    }
    if (parseFloat(formData.price) < 0) {
      setError('Price cannot be negative');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please login to offer a ride');
      }

      // Format the date and time
      const formattedDate = new Date(formData.date).toISOString().split('T')[0];
      const formattedTime = formData.time + ':00';

      const requestBody = {
        from: formData.from,
        to: formData.to,
        date: formattedDate,
        time: formattedTime,
        availableSeats: parseInt(formData.seats),
        price: parseFloat(formData.price),
        vehicle: formData.vehicle
      };

      const response = await fetch('http://localhost:5000/api/rides/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create ride');
      }

      const data = await response.json();
      console.log('Ride created successfully:', data);

      // Show success popup
      setShowSuccess(true);

      // Reset form
      setFormData({
        from: '',
        to: '',
        date: '',
        time: '',
        seats: '',
        price: '',
        vehicle: ''
      });

    } catch (err) {
      console.error('Error creating ride:', err);
      setError(err.message || 'An error occurred while creating the ride');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="offer-ride-container">
      <h1 className="offer-ride-title">Offer a Ride</h1>
      <p className="offer-ride-subtitle">Share your journey with others</p>
      
      <div className="ride-details-card">
        <h2 className="ride-details-title">Ride Details</h2>
        <p className="ride-details-subtitle">Fill in the details of your ride</p>

        {error && <div className="error-message">{error}</div>}
        
        <form className="ride-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="from">From</label>
              <input
                type="text"
                id="from"
                name="from"
                value={formData.from}
                onChange={handleChange}
                placeholder="Enter departure city"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="to">To</label>
              <input
                type="text"
                id="to"
                name="to"
                value={formData.to}
                onChange={handleChange}
                placeholder="Enter destination city"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Date</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="time">Time</label>
              <input
                type="time"
                id="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="seats">Available Seats</label>
              <input
                type="number"
                id="seats"
                name="seats"
                value={formData.seats}
                onChange={handleChange}
                min="1"
                max="6"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="price">Price per Seat (₹)</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                required
              />
            </div>
          </div>

          <div className="form-group full-width">
            <label htmlFor="vehicle">Vehicle Model</label>
            <input
              type="text"
              id="vehicle"
              name="vehicle"
              value={formData.vehicle}
              onChange={handleChange}
              placeholder="Enter your vehicle model"
              required
            />
          </div>

          <button 
            type="submit" 
            className="submit-button" 
            disabled={loading}
          >
            {loading ? 'Creating Ride...' : 'Create Ride'}
          </button>
        </form>
      </div>

      {showSuccess && (
        <SuccessPopup 
          message="Ride successfully created!" 
          onClose={() => {
            setShowSuccess(false);
          }} 
        />
      )}
    </div>
  );
}

// Add PageTransition component
const PageTransition = ({ children }) => {
  const location = useLocation();
  return (
    <div className="page-transition" key={location.pathname}>
      {children}
    </div>
  );
};

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [user, setUser] = React.useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  React.useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        setIsAuthenticated(true);
        setUser(JSON.parse(userData));
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    window.addEventListener('authChange', checkAuth);

    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('authChange', checkAuth);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    setIsDropdownOpen(false);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <FaCar className="nav-logo" />
        <span>TravelBuddy</span>
      </div>
      <div className="nav-links">
        <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>Home</NavLink>
        {isAuthenticated && (
          <>
            <NavLink to="/find-ride" className={({ isActive }) => isActive ? 'active' : ''}>Find a Ride</NavLink>
            <NavLink to="/offer-ride" className={({ isActive }) => isActive ? 'active' : ''}>Offer a Ride</NavLink>
            <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>Dashboard</NavLink>
          </>
        )}
      </div>
      <div className="nav-actions">
        {isAuthenticated ? (
          <>
            <button className="icon-button" onClick={() => navigate('/dashboard/notifications')}>
              <FaBell />
              <span className="notification-dot"></span>
            </button>
            <div 
              className="profile-dropdown"
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <button className="profile-button">
                {user?.name ? user.name.charAt(0).toUpperCase() : <FaUser />}
              </button>
              <div className={`profile-dropdown-content ${isDropdownOpen ? 'show' : ''}`}>
                <button onClick={() => navigate('/dashboard/profile')}>Profile</button>
                <button onClick={handleLogout}>Logout</button>
              </div>
            </div>
          </>
        ) : (
          <div className="auth-buttons">
            <button className="login-button" onClick={() => navigate('/login')}>Login</button>
            <button className="register-button" onClick={() => navigate('/register')}>Register</button>
          </div>
        )}
      </div>
    </nav>
  );
};

const Notifications = () => {
  const [notifications, setNotifications] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [isFetching, setIsFetching] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const fetchNotifications = React.useCallback(async () => {
    if (isFetching || isDeleting) return;
    
    try {
      setIsFetching(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please login to view notifications');
      }

      const response = await fetch('http://localhost:5000/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      setNotifications(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  }, []);

  const markAsRead = async (notificationId) => {
    if (isDeleting) return;
    
    try {
      setIsDeleting(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please login to mark notifications as read');
      }

      const response = await fetch(`http://localhost:5000/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to mark notification as read');
      }

      // Remove the notification from the state immediately
      setNotifications(prevNotifications => 
        prevNotifications.filter(notification => notification._id !== notificationId)
      );
      
      setError(null);
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError(err.message || 'An error occurred while marking the notification as read');
      // If there's an error, refresh the notifications list
      await fetchNotifications();
    } finally {
      setIsDeleting(false);
    }
  };

  // Only fetch notifications when the component mounts
  React.useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="dashboard-layout">
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

      <main className="dashboard-main">
        <div className="dashboard-header">
          <div className="header-left">
            <h1>Notifications</h1>
          </div>
          <div className="header-right">
            <FaBell />
          </div>
        </div>

        <div className="notifications-card">
          <h2>Recent Notifications</h2>
          
          {loading ? (
            <div className="loading">Loading notifications...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : notifications.length === 0 ? (
            <div className="no-notifications">
              <FaBell className="no-notifications-icon" />
              <p>No new notifications</p>
            </div>
          ) : (
            <div className="notifications-list">
              {notifications.map(notification => (
                <div key={notification._id} className="notification-item">
                  <div className="notification-content">
                    <h3>{notification.title}</h3>
                    <p>{notification.message}</p>
                    <span className="notification-time">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <button 
                    className={`view-btn ${isDeleting ? 'disabled' : ''}`}
                    onClick={() => markAsRead(notification._id)}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Mark as Read'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const Dashboard = () => {
  return (
    <div className="dashboard-layout">
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

      <main className="dashboard-main">
        <div className="dashboard-header">
          <div className="header-left">
            <h1>Dashboard</h1>
          </div>
          <div className="header-right">
            <Link to="/offer-ride" className="offer-ride-btn">
              + Offer a Ride
            </Link>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <h3>Total Rides</h3>
                <FaCar className="stat-icon" />
              </div>
              <div className="stat-value">12</div>
              <div className="stat-trend">+2 from last month</div>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <h3>Active Rides</h3>
                <FaCar className="stat-icon" />
              </div>
              <div className="stat-value">3</div>
              <div className="stat-label">Currently active</div>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <h3>Upcoming Rides</h3>
                <FaCar className="stat-icon" />
              </div>
              <div className="stat-value">5</div>
              <div className="stat-label">Next 7 days</div>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <h3>Completed Rides</h3>
                <FaCar className="stat-icon" />
              </div>
              <div className="stat-value">4</div>
              <div className="stat-label">Last 30 days</div>
            </div>
          </div>

          <div className="dashboard-sections">
            <div className="quick-actions">
              <h2>Quick Actions</h2>
              <p className="section-subtitle">Common actions you might need</p>
              <div className="actions-list">
                <Link to="/find-ride" className="action-item">
                  <FaSearch /> Find a Ride
                </Link>
                <Link to="/offer-ride" className="action-item">
                  <FaCar /> Offer a Ride
                </Link>
                <Link to="/dashboard/my-rides" className="action-item">
                  <FaUserFriends /> View My Rides
                </Link>
              </div>
            </div>

            <div className="recent-activity">
              <h2>Recent Activity</h2>
              <p className="section-subtitle">Your latest ride-related activities</p>
              <div className="activity-list">
                <div className="activity-item">
                  <div className="activity-content">
                    <h4>New ride request</h4>
                    <p>From: X</p>
                  </div>
                  <button className="view-btn">View</button>
                </div>
                <div className="activity-item">
                  <div className="activity-content">
                    <h4>Ride confirmed</h4>
                    <p>To: Y</p>
                  </div>
                  <button className="view-btn">View</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Dispatch auth change event to update navigation state
    window.dispatchEvent(new Event('authChange'));
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="dashboard-layout">
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

      <main className="dashboard-main">
        <div className="dashboard-header">
          <div className="header-left">
            <h1>Profile</h1>
          </div>
        </div>

        <div className="profile-card">
          <div className="profile-info">
            <div className="profile-avatar">
              {user.name ? user.name.charAt(0).toUpperCase() : <FaUser />}
            </div>
            <div className="profile-details">
              <h2>{user.name}</h2>
            </div>
          </div>

          <div className="profile-contact">
            <div className="contact-item">
              <FaEnvelope className="contact-icon" />
              <span>{user.email}</span>
            </div>
            <div className="contact-item">
              <FaPhone className="contact-icon" />
              <span>{user.phoneNumber}</span>
            </div>
          </div>

          <div className="profile-badge">
            <span className="verified-badge">Verified User</span>
          </div>

          <div className="profile-actions">
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

const Requests = () => {
  const [activeTab, setActiveTab] = React.useState('incoming');
  const [requests, setRequests] = React.useState({ incoming: [], sent: [] });
  const [rides, setRides] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [successPopup, setSuccessPopup] = React.useState('');

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please login to view requests');
      }

      const response = await fetch('http://localhost:5000/api/rides/requests', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch requests');
      }

      const data = await response.json();
      setRequests(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError(err.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchRides = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please login to view rides');
      }

      // Fetch available rides
      const ridesResponse = await fetch('http://localhost:5000/api/rides/available', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!ridesResponse.ok) {
        throw new Error('Failed to fetch rides');
      }

      const ridesData = await ridesResponse.json();

      // Fetch user's sent requests
      const requestsResponse = await fetch('http://localhost:5000/api/rides/requests', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!requestsResponse.ok) {
        throw new Error('Failed to fetch requests');
      }

      const requestsData = await requestsResponse.json();
      
      // Get IDs of rides that user has already requested or been rejected from
      const requestedRideIds = new Set(
        requestsData.sent
          .filter(ride => ride.requests.some(req => 
            req.status === 'pending' || req.status === 'rejected'
          ))
          .map(ride => ride._id)
      );

      // Filter out rides with 0 seats and rides that user has already requested or been rejected from
      const availableRides = ridesData.filter(ride => 
        ride.availableSeats > 0 && !requestedRideIds.has(ride._id)
      );

      setRides(availableRides);
      setError(null);
    } catch (err) {
      console.error('Error fetching rides:', err);
      setError(err.message || 'Failed to load rides');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchRequests();
    fetchRides();
  }, []);

  const handleAccept = async (rideId, requestId) => {
    try {
      setIsProcessing(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please login to accept requests');
      }

      const response = await fetch(`http://localhost:5000/api/rides/${rideId}/requests/${requestId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to accept request');
      }

      const result = await response.json();
      
      // Update the ride in the incoming requests list
      setRequests(prevRequests => {
        if (!prevRequests || !prevRequests.incoming) {
          return { incoming: [], sent: [] };
        }
        return {
          ...prevRequests,
          incoming: prevRequests.incoming.map(ride => {
            if (ride._id === rideId) {
              return {
                ...ride,
                requests: ride.requests.map(req => 
                  req._id === requestId ? { ...req, status: 'accepted' } : req
                )
              };
            }
            return ride;
          })
        };
      });

      // If available seats become 0, remove the ride from available rides
      if (result.ride.availableSeats === 0) {
        setRides(prevRides => prevRides.filter(ride => ride._id !== rideId));
      }

      // Show success message
      setError(null);
      setSuccessPopup({ message: 'Ride Booked successfully', type: 'success' });

      // Refresh both requests and rides data
      await Promise.all([
        fetchRequests(),
        fetchRides()
      ]);

      // Dispatch an event to notify MyRides component to refresh
      window.dispatchEvent(new Event('rideAccepted'));
    } catch (error) {
      console.error('Error accepting request:', error);
      setError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (rideId, requestId) => {
    try {
      setIsProcessing(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please login to reject requests');
      }

      const response = await fetch(`http://localhost:5000/api/rides/${rideId}/requests/${requestId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reject request');
      }

      const result = await response.json();
      
      // Update the ride in the incoming requests list
      setRequests(prevRequests => {
        if (!prevRequests || !prevRequests.incoming) {
          return { incoming: [], sent: [] };
        }
        return {
          ...prevRequests,
          incoming: prevRequests.incoming.map(ride => {
            if (ride._id === rideId) {
              return {
                ...ride,
                requests: ride.requests.map(req => 
                  req._id === requestId ? { ...req, status: 'rejected' } : req
                )
              };
            }
            return ride;
          })
        };
      });

      // Show success message with rejection style
      setError(null);
      setSuccessPopup({ message: 'Request rejected successfully', type: 'rejection' });
    } catch (error) {
      console.error('Error rejecting request:', error);
      setError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="dashboard-layout">
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

      <main className="dashboard-main">
        <div className="dashboard-header">
          <div className="header-left">
            <h1>Ride Requests</h1>
          </div>
          <div className="header-right">
            <Link to="/find-ride" className="offer-ride-btn">
              + Find a Ride
            </Link>
          </div>
        </div>

        <div className="rides-tabs">
          <button 
            className={`tab-button ${activeTab === 'incoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('incoming')}
          >
            Incoming Requests
          </button>
          <button 
            className={`tab-button ${activeTab === 'sent' ? 'active' : ''}`}
            onClick={() => setActiveTab('sent')}
          >
            Sent Requests
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading requests...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <>
            {activeTab === 'incoming' && (
              <div className="requests-section">
                <h2>Incoming Requests</h2>
                <p className="section-subtitle">Review and respond to ride requests</p>
                
                <div className="requests-list">
                  {requests.incoming && requests.incoming.map(ride => (
                    ride.requests && ride.requests.map(request => (
                      <div key={request._id} className="request-item">
                        <div className="request-info">
                          <h3>{ride.from} to {ride.to}</h3>
                          <p className="request-date">
                            {new Date(ride.date).toLocaleDateString()} - {ride.time}
                          </p>
                          <p className="request-from">From: {request.passenger.name}</p>
                        </div>
                        <div className="request-status">
                          <span className={`status-badge ${request.status}`}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                          {request.status === 'pending' && (
                            <div className="action-buttons">
                              <button 
                                className="accept-btn"
                                onClick={() => handleAccept(ride._id, request._id)}
                                disabled={isProcessing}
                              >
                                {isProcessing ? 'Processing...' : 'Accept'}
                              </button>
                              <button 
                                className="decline-btn"
                                onClick={() => handleReject(ride._id, request._id)}
                                disabled={isProcessing}
                              >
                                {isProcessing ? 'Processing...' : 'Decline'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'sent' && (
              <div className="requests-section">
                <h2>Sent Requests</h2>
                <p className="section-subtitle">Track your ride requests</p>
                
                <div className="requests-list">
                  {requests.sent && requests.sent.map(ride => (
                    ride.requests && ride.requests.map(request => (
                      <div key={request._id} className="request-item">
                        <div className="request-info">
                          <h3>{ride.from} to {ride.to}</h3>
                          <p className="request-date">
                            {new Date(ride.date).toLocaleDateString()} - {ride.time}
                          </p>
                          <p className="request-to">To: {ride.driver.name}</p>
                        </div>
                        <div className="request-status">
                          <span className={`status-badge ${request.status}`}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                          {request.status === 'pending' && (
                            <button 
                              className="cancel-btn"
                              onClick={() => handleReject(ride._id, request._id)}
                              disabled={isProcessing}
                            >
                              {isProcessing ? 'Processing...' : 'Cancel'}
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {successPopup && (
          <div className={`success-popup ${successPopup.type === 'rejection' ? 'rejection-popup' : ''}`}>
            {successPopup.message}
          </div>
        )}
      </main>
    </div>
  );
};

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-copyright">
          © 2025 TravelBuddy. All rights reserved.
        </div>
        <div className="footer-links">
          <Link to="/terms">Terms</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/contact">Contact</Link>
        </div>
      </div>
    </footer>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    setIsAuthenticated(!!token);
    if (userData) {
      setUser(JSON.parse(userData));
    }

    const handleAuthChange = () => {
      const newToken = localStorage.getItem('token');
      const newUserData = localStorage.getItem('user');
      setIsAuthenticated(!!newToken);
      if (newUserData) {
        setUser(JSON.parse(newUserData));
      }
    };

    window.addEventListener('authChange', handleAuthChange);
    return () => window.removeEventListener('authChange', handleAuthChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    window.dispatchEvent(new Event('authChange'));
  };

  return (
    <BrowserRouter>
      <div className="App">
        <Navigation 
          isAuthenticated={isAuthenticated} 
          user={user}
          showDropdown={showDropdown}
          setShowDropdown={setShowDropdown}
          onLogout={handleLogout}
        />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/find-ride" element={<ProtectedRoute><FindRide /></ProtectedRoute>} />
            <Route path="/offer-ride" element={<ProtectedRoute><OfferRide /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Navigate to="/dashboard/my-rides" replace /></ProtectedRoute>} />
            <Route path="/dashboard/my-rides" element={<ProtectedRoute><MyRides /></ProtectedRoute>} />
            <Route path="/dashboard/requests" element={<ProtectedRoute><Requests /></ProtectedRoute>} />
            <Route path="/dashboard/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/dashboard/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/dashboard/statistics" element={<ProtectedRoute><Statistics /></ProtectedRoute>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
