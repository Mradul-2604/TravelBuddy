import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEnvelope, FaLock } from 'react-icons/fa';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Dispatch auth change event
        window.dispatchEvent(new Event('authChange'));
        
        navigate('/dashboard');
      } else {
        setError(data.message || 'Login failed. Please check your credentials and try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error. Please check your connection and try again.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Sign in to continue to TravelBuddy</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <div className="input-icon">
              <FaEnvelope />
              <input
                type="email"
                name="email"
                placeholder="VIT Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <div className="input-icon">
              <FaLock />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <button type="submit" className="auth-button">
            Sign In
          </button>
        </form>
        
        <div className="auth-footer">
          Don't have an account? <Link to="/register" className="auth-link">Register</Link>
        </div>
      </div>
    </div>
  );
};

export default Login; 