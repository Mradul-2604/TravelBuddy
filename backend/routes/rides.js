const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Ride = require('../models/Ride');
const User = require('../models/User');
const Notification = require('../models/Notification');
const rideController = require('../controllers/rideController');

// Create a new ride
router.post('/create', auth, async (req, res) => {
  try {
    const ride = new Ride({
      ...req.body,
      driver: req.user.id,
      status: 'active'
    });
    await ride.save();
    res.status(201).json(ride);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all active rides
router.get('/available', auth, async (req, res) => {
  try {
    const rides = await Ride.find({ 
      status: 'active',
      date: { $gte: new Date() },
      driver: { $ne: req.user.id }
    })
    .populate('driver', 'name')
    .sort({ date: 1 });
    res.json(rides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get rides created by the logged-in user
router.get('/my-rides', auth, async (req, res) => {
  try {
    // Get rides where the user is the driver and status is not cancelled
    const offeredRides = await Ride.find({ 
      driver: req.user.id,
      status: { $ne: 'cancelled' }
    })
    .populate('driver', 'name')
    .populate('requests.passenger', 'name email')
    .populate('acceptedPassengers', 'name email')
    .sort({ date: -1 });

    // Get rides where the user is an accepted passenger and status is not cancelled
    const bookedRides = await Ride.find({
      'acceptedPassengers': req.user.id,
      status: { $ne: 'cancelled' }
    })
    .populate('driver', 'name')
    .populate('acceptedPassengers', 'name email')
    .sort({ date: -1 });

    res.json({
      offered: offeredRides,
      booked: bookedRides
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Request to join a ride
router.post('/:rideId/request', auth, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.rideId).populate('driver');
    
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Check if there are available seats
    if (ride.availableSeats <= 0) {
      return res.status(400).json({ message: 'No seats available' });
    }

    // Add the request
    ride.requests.push({
      passenger: req.user.id,
      status: 'pending'
    });

    await ride.save();

    // Create notification for the ride owner
    const notification = new Notification({
      recipient: ride.driver._id,
      title: 'New Ride Request',
      message: `${req.user.name} has requested to join your ride from ${ride.from} to ${ride.to}`,
      type: 'ride_request',
      rideId: ride._id
    });

    await notification.save();

    res.json({ message: 'Ride request sent successfully' });
  } catch (error) {
    console.error('Error requesting ride:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Accept a ride request
router.post('/:rideId/requests/:requestId/accept', auth, async (req, res) => {
  try {
    console.log("Step 1: Request received - Ride ID:", req.params.rideId, "Request ID:", req.params.requestId);
    console.log("User ID:", req.user.id);
    
    const ride = await Ride.findById(req.params.rideId)
      .populate('driver', 'name')
      .populate('requests.passenger', 'name email');
   
    console.log("Step 2: Ride data:", ride);
    if (!ride) {
      console.log("Error: Ride not found");
      return res.status(404).json({ message: 'Ride not found' });
    }

    console.log("Step 3: Checking authorization");
    console.log("Driver ID:", ride.driver._id.toString());
    console.log("User ID:", req.user.id);
    if (ride.driver._id.toString() !== req.user.id) {
      console.log("Error: Unauthorized user");
      return res.status(403).json({ message: 'Not authorized to accept this request' });
    }

    console.log("Step 4: Finding request");
    const request = ride.requests.id(req.params.requestId);
    console.log("Request data:", request);
    if (!request) {
      console.log("Error: Request not found");
      return res.status(404).json({ message: 'Request not found' });
    }

    console.log("Step 5: Checking request status");
    if (request.status === 'accepted') {
      console.log("Error: Request already accepted");
      return res.status(400).json({ message: 'Request is already accepted' });
    }

    console.log("Step 6: Checking seat availability");
    console.log("Available seats:", ride.availableSeats);
    if (ride.availableSeats <= 0) {
      console.log("Error: No seats available");
      return res.status(400).json({ message: 'No seats available' });
    }

    console.log("Step 7: Updating request status");
    request.status = 'accepted';
    ride.availableSeats -= 1;
    
    console.log("Step 8: Updating accepted passengers");
    if (!ride.acceptedPassengers.includes(request.passenger._id)) {
      ride.acceptedPassengers.push(request.passenger._id);
    }

    console.log("Step 9: Saving ride");
    const updatedRide = await ride.save();
    console.log("Ride updated successfully:", updatedRide);

    console.log("Step 10: Creating notification");
    const notification = new Notification({
      recipient: request.passenger._id,
      title: 'Ride Request Accepted',
      message: `Your request to join the ride from ${ride.from} to ${ride.to} has been accepted`,
      type: 'request_accepted',
      rideId: ride._id
    });

    await notification.save();
    console.log("Notification saved successfully");

    res.json({ 
      message: 'Ride request accepted successfully',
      ride: {
        _id: updatedRide._id,
        from: updatedRide.from,
        to: updatedRide.to,
        date: updatedRide.date,
        time: updatedRide.time,
        availableSeats: updatedRide.availableSeats,
        requests: updatedRide.requests.map(r => ({
          _id: r._id,
          status: r.status,
          passenger: r.passenger
        }))
      }
    });
  } catch (error) {
    console.error('Error accepting ride request:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Reject a ride request
router.post('/:rideId/requests/:requestId/reject', auth, async (req, res) => {
  try {
    console.log("Step 1: Fetching ride with ID:", req.params.rideId);
    const ride = await Ride.findById(req.params.rideId)
      .populate('driver', 'name')
      .populate('requests.passenger', 'name email');
    
    console.log("Ride data:", ride);
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    console.log("Step 2: Checking if user is ride owner");
    console.log("User ID:", req.user.id);
    console.log("Driver ID:", ride.driver._id.toString());
    if (ride.driver._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to reject this request' });
    }

    console.log("Step 3: Finding request with ID:", req.params.requestId);
    const request = ride.requests.find(r => r._id.toString() === req.params.requestId);
    console.log("Request data:", request);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    console.log("Step 4: Checking request status");
    if (request.status === 'rejected') {
      return res.status(400).json({ message: 'Request is already rejected' });
    }

    console.log("Step 5: Updating request status");
    request.status = 'rejected';
    
    console.log("Step 6: Saving ride");
    const updatedRide = await ride.save();
    console.log("Ride updated successfully:", updatedRide);

    console.log("Step 7: Creating notification");
    const notification = new Notification({
      recipient: request.passenger._id,
      title: 'Ride Request Rejected',
      message: `Your request to join the ride from ${ride.from} to ${ride.to} has been rejected.`,
      type: 'request_rejected',
      rideId: ride._id
    });

    await notification.save();
    console.log("Notification saved successfully");

    res.json({ 
      message: 'Ride request rejected successfully',
      ride: {
        _id: updatedRide._id,
        from: updatedRide.from,
        to: updatedRide.to,
        date: updatedRide.date,
        time: updatedRide.time,
        availableSeats: updatedRide.availableSeats,
        requests: updatedRide.requests.map(r => ({
          _id: r._id,
          status: r.status,
          passenger: r.passenger
        }))
      }
    });
  } catch (error) {
    console.error('Error rejecting ride request:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Cancel a ride
router.patch('/:rideId/cancel', auth, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.rideId);
    
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Verify that the current user is the ride creator
    if (ride.driver.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to cancel this ride' });
    }

    // Check if ride is already cancelled
    if (ride.status === 'cancelled') {
      return res.status(400).json({ message: 'Ride is already cancelled' });
    }

    // Update ride status to cancelled
    ride.status = 'cancelled';
    await ride.save();

    res.json({ message: 'Ride cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Edit a ride
router.patch('/:rideId', auth, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.rideId);
    
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Verify that the current user is the ride creator
    if (ride.driver.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to edit this ride' });
    }

    // Update only allowed fields
    const updates = {
      from: req.body.from,
      to: req.body.to,
      date: req.body.date,
      time: req.body.time,
      availableSeats: req.body.availableSeats,
      price: req.body.price,
      vehicle: req.body.vehicle
    };

    // Update the ride
    const updatedRide = await Ride.findByIdAndUpdate(
      req.params.rideId,
      updates,
      { new: true, runValidators: true }
    );

    res.json({ message: 'Ride updated successfully', ride: updatedRide });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get ride requests for the current user
router.get('/requests', auth, async (req, res) => {
  try {
    // Get rides where the current user is the driver and has pending requests
    const ridesWithRequests = await Ride.find({
      driver: req.user.id,
      'requests.status': 'pending'
    })
    .populate('driver', 'name')
    .populate('requests.passenger', 'name email')
    .sort({ date: 1 });

    // Get rides where the current user has sent requests
    const sentRequests = await Ride.find({
      'requests.passenger': req.user.id
    })
    .populate('driver', 'name')
    .populate('requests.passenger', 'name email')
    .sort({ date: 1 });

    // Filter to only show the most recent request for each ride
    const filteredSentRequests = sentRequests.map(ride => {
      // Sort requests by requestedAt in descending order
      const sortedRequests = ride.requests.sort((a, b) => b.requestedAt - a.requestedAt);
      // Take only the most recent request
      return {
        ...ride.toObject(),
        requests: [sortedRequests[0]]
      };
    });

    res.json({
      incoming: ridesWithRequests,
      sent: filteredSentRequests
    });
  } catch (error) {
    console.error('Error fetching ride requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/stats', rideController.getRideStats);

module.exports = router; 