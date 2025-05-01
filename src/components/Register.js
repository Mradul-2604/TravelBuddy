import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaPhone } from 'react-icons/fa';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: ''
  });
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear email error when user starts typing again
    if (name === 'email') {
      setEmailError('');
    }
  };

  const validateVITEmail = async (email) => {
    // First check if it's a VIT email
    if (!email.endsWith('vitstudent.ac.in')) {
      setEmailError('Please use your VIT student email address');
      return false;
    }

    setIsValidating(true);
    try {
      // Using Abstract API's email validation
      const API_KEY = process.env.REACT_APP_ABSTRACT_API_KEY;
      const response = await fetch(`https://emailvalidation.abstractapi.com/v1/?api_key=${API_KEY}&email=${email}`);

      if (!response.ok) {
        throw new Error('Email verification service error');
      }

      const data = await response.json();
      console.log('Email validation response:', data); // For debugging
      
      // Check if the email actually exists
      if (data.deliverability === "UNDELIVERABLE" || data.deliverability === "UNKNOWN") {
        setEmailError('This email address does not exist. Please use your actual VIT email.');
        return false;
      }

      // Check SMTP validity
      if (data.smtp_check === false) {
        setEmailError('This email address appears to be invalid. Please use your actual VIT email.');
        return false;
      }

      return true;

    } catch (err) {
      console.error('Email verification error:', err);
      setEmailError('Unable to verify if this email exists. Please try again later.');
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setEmailError('');

    // Validate email first
    const isEmailValid = await validateVITEmail(formData.email);
    if (!isEmailValid) {
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
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
        setError(data.message || 'Registration failed. Please check your information and try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Network error. Please check your connection and try again.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Account</h2>
        <p className="auth-subtitle">Join TravelBuddy today</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <div className="input-icon">
              <FaUser />
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <div className="input-icon">
              <FaEnvelope />
              <input
                type="email"
                name="email"
                placeholder="VIT Email (e.g., 21BCE1234@vitstudent.ac.in)"
                value={formData.email}
                onChange={handleChange}
                required
                className={emailError ? 'error' : ''}
              />
            </div>
            {emailError && <div className="field-error">{emailError}</div>}
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
                minLength="8"
              />
            </div>
          </div>
          
          <div className="form-group">
            <div className="input-icon">
              <FaPhone />
              <input
                type="tel"
                name="phoneNumber"
                placeholder="Phone Number"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                pattern="[0-9]{10}"
                title="Please enter a valid 10-digit phone number"
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={isValidating}
          >
            {isValidating ? 'Validating...' : 'Create Account'}
          </button>
        </form>
        
        <div className="auth-footer">
          Already have an account? <Link to="/login" className="auth-link">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Register; 