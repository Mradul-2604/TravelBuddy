import React from "react";
import { Link } from "react-router-dom";

function OfferRide() {
  return (
    <div className="page-container">
      <h1>Offer a Ride</h1>
      <div className="form-section">
        <p>Share your journey and help fellow travelers reach their destination</p>
        {/* We'll add the ride offer form later */}
      </div>
      <Link to="/" className="back-link">Back to Home</Link>
    </div>
  );
}

export default OfferRide; 