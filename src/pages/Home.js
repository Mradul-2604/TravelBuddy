import React from "react";
import { Link } from "react-router-dom";
import { FaCar, FaMapMarkerAlt } from "react-icons/fa";

function Home() {
  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Find Your Travel Companion</h1>
        <p>Connect with fellow VIT Vellore students for shared rides to airports, cities, and more. Save money, make friends, and travel sustainably.</p>
        <div className="cta-buttons">
          <Link to="/find-ride" className="primary-button">Find a Ride</Link>
          <Link to="/offer-ride" className="secondary-button">Offer a Ride</Link>
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
  );
}

export default Home; 