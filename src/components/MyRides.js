import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FaCar, FaUserFriends, FaUser, FaRegBell, FaSearch, FaExclamationTriangle, FaTimes, FaCalendarAlt, FaClock, FaMoneyBillWave, FaArrowRight, FaPlus, FaEdit, FaChartPie } from 'react-icons/fa';
import { FaTicketAlt } from 'react-icons/fa';
import './MyRides.css';

// Add ConfirmationPopup component
const ConfirmationPopup = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="success-popup-overlay">
      <div className="success-popup">
        <h3>Confirm Cancellation</h3>
        <p>{message}</p>
        <div className="confirmation-buttons">
          <button onClick={onConfirm} className="confirm-button">Yes, Cancel Ride</button>
          <button onClick={onCancel} className="cancel-button">No, Keep Ride</button>
        </div>
      </div>
    </div>
  );
};

// Add EditRidePopup component
const EditRidePopup = ({ ride, onSave, onCancel }) => {
  const [formData, setFormData] = React.useState({
    from: ride.from,
    to: ride.to,
    date: new Date(ride.date).toISOString().split('T')[0],
    time: ride.time,
    availableSeats: ride.availableSeats,
    price: ride.price,
    vehicle: ride.vehicle
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="success-popup-overlay">
      <div className="success-popup edit-ride-popup">
        <h3>Edit Ride Details</h3>
        <form onSubmit={handleSubmit} className="edit-ride-form">
          <div className="form-group">
            <label>From</label>
            <input
              type="text"
              name="from"
              value={formData.from}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>To</label>
            <input
              type="text"
              name="to"
              value={formData.to}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Time</label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Available Seats</label>
              <input
                type="number"
                name="availableSeats"
                value={formData.availableSeats}
                onChange={handleChange}
                min="1"
                required
              />
            </div>
            <div className="form-group">
              <label>Price (₹)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Vehicle</label>
            <input
              type="text"
              name="vehicle"
              value={formData.vehicle}
              onChange={handleChange}
              required
            />
          </div>
          <div className="confirmation-buttons">
            <button type="submit" className="confirm-button">Save Changes</button>
            <button type="button" className="cancel-button" onClick={onCancel}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const MyRides = () => {
  const [activeTab, setActiveTab] = React.useState('offered');
  const [rides, setRides] = React.useState({ offered: [], booked: [] });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [showConfirmation, setShowConfirmation] = React.useState(false);
  const [rideToCancel, setRideToCancel] = React.useState(null);
  const [successMessage, setSuccessMessage] = React.useState(null);
  const [showEditPopup, setShowEditPopup] = React.useState(false);
  const [rideToEdit, setRideToEdit] = React.useState(null);

  const fetchRides = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to view your rides');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/rides/my-rides', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch rides');
      }

      const data = await response.json();
      setRides(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching rides:', err);
      setError('Failed to load rides. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchRides();

    // Add event listener for rideAccepted event
    const handleRideAccepted = () => {
      fetchRides();
    };

    window.addEventListener('rideAccepted', handleRideAccepted);

    // Cleanup event listener
    return () => {
      window.removeEventListener('rideAccepted', handleRideAccepted);
    };
  }, []);

  const handleCancelClick = (ride) => {
    setRideToCancel(ride);
    setShowConfirmation(true);
  };

  const handleCancelConfirm = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to cancel the ride');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/rides/${rideToCancel._id}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to cancel ride');
      }

      // Show success message
      setError(null);
      setSuccessMessage('Ride successfully cancelled');
      // Refresh the rides list
      await fetchRides();
    } catch (err) {
      console.error('Error cancelling ride:', err);
      setError(err.message || 'An error occurred while cancelling the ride');
    } finally {
      setShowConfirmation(false);
      setRideToCancel(null);
    }
  };

  const handleCancelReject = () => {
    setShowConfirmation(false);
    setRideToCancel(null);
  };

  // Add handleEditClick function
  const handleEditClick = (ride) => {
    setRideToEdit(ride);
    setShowEditPopup(true);
  };

  // Add handleEditSave function
  const handleEditSave = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to edit the ride');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/rides/${rideToEdit._id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update ride');
      }

      setSuccessMessage('Ride updated successfully');
      // Update the rides list with the updated ride
      setRides(prevRides => ({
        ...prevRides,
        offered: prevRides.offered.map(ride => 
          ride._id === rideToEdit._id ? data.ride : ride
        )
      }));
    } catch (err) {
      console.error('Error updating ride:', err);
      setError(err.message || 'An error occurred while updating the ride');
    } finally {
      setShowEditPopup(false);
      setRideToEdit(null);
    }
  };

  // Add handleEditCancel function
  const handleEditCancel = () => {
    setShowEditPopup(false);
    setRideToEdit(null);
  };

  const formatStatus = (status) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  if (loading) {
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
          <div className="loading-message">Loading your rides...</div>
        </main>
      </div>
    );
  }

  if (error) {
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
          <div className="error-message">{error}</div>
        </main>
      </div>
    );
  }

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
            <h1>My Rides</h1>
          </div>
          <div className="header-right">
            <Link to="/offer-ride" className="offer-ride-btn">
              + Offer a Ride
            </Link>
          </div>
        </div>

        <div className="rides-tabs">
          <button 
            className={`tab-button ${activeTab === 'offered' ? 'active' : ''}`}
            onClick={() => setActiveTab('offered')}
          >
            Rides Offered
          </button>
          <button 
            className={`tab-button ${activeTab === 'booked' ? 'active' : ''}`}
            onClick={() => setActiveTab('booked')}
          >
            Rides Booked
          </button>
        </div>

        {activeTab === 'offered' && (
          <div className="rides-section">
            <h2>Rides You've Offered</h2>
            <p className="section-subtitle">Manage the rides you're offering to others</p>
            
            {rides.offered.length === 0 ? (
              <div className="no-rides">
                <p>You haven't offered any rides yet.</p>
              </div>
            ) : (
              <div className="rides-list">
                {rides.offered.map(ride => (
                  <div key={ride._id} className="ride-item">
                    <div className="ride-info">
                      <h3>{ride.from} to {ride.to}</h3>
                      <p className="ride-date">{new Date(ride.date).toLocaleDateString()} - {ride.time}</p>
                      <p className="ride-details">
                        Available Seats: {ride.availableSeats} | Price: ₹{ride.price}
                      </p>
                      <p className="ride-vehicle">Vehicle: {ride.vehicle}</p>
                    </div>
                    <div className="ride-status">
                      <span className={`status-badge ${ride.status}`}>{formatStatus(ride.status)}</span>
                      <div className="action-buttons">
                        <button 
                          className="edit-btn"
                          onClick={() => handleEditClick(ride)}
                        >
                          <FaEdit /> Edit
                        </button>
                        <button 
                          className="cancel-btn"
                          onClick={() => handleCancelClick(ride)}
                        >
                          <FaTimes /> Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'booked' && (
          <div className="rides-section">
            <h2>Rides You've Booked</h2>
            <p className="section-subtitle">View and manage your booked rides</p>
            
            {rides.booked.length === 0 ? (
              <div className="no-rides">
                <p>You haven't booked any rides yet.</p>
                <Link to="/find-ride" className="find-ride-link">
                  Find a Ride
                </Link>
              </div>
            ) : (
              <div className="rides-list">
                {rides.booked.map(ride => (
                  <div key={ride._id} className="ride-item">
                    <div className="ride-info">
                      <h3>{ride.from} to {ride.to}</h3>
                      <p className="ride-date">{new Date(ride.date).toLocaleDateString()} - {ride.time}</p>
                      <p className="ride-details">
                        Price: ₹{ride.price}
                      </p>
                      <p className="ride-vehicle">Vehicle: {ride.vehicle}</p>
                      <p className="ride-driver">Driver: {ride.driver.name}</p>
                    </div>
                    <div className="ride-status">
                      <span className={`status-badge ${ride.status}`}>{formatStatus(ride.status)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {showConfirmation && (
          <ConfirmationPopup
            message={`Are you sure you want to cancel the ride from ${rideToCancel?.from} to ${rideToCancel?.to}?`}
            onConfirm={handleCancelConfirm}
            onCancel={handleCancelReject}
          />
        )}

        {showEditPopup && (
          <EditRidePopup
            ride={rideToEdit}
            onSave={handleEditSave}
            onCancel={handleEditCancel}
          />
        )}

        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}
      </main>
    </div>
  );
};

export default MyRides; 