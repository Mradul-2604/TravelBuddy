const Ride = require('../models/Ride');

exports.getRideStats = async (req, res) => {
  try {
    // Get ride status counts
    const statusStats = await Ride.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get total rides and passengers
    const totalStats = await Ride.aggregate([
      {
        $group: {
          _id: null,
          totalRides: { $sum: 1 },
          totalPassengers: { $sum: '$passengers' },
          averageRating: { $avg: '$rating' }
        }
      }
    ]);

    // Get upcoming rides count
    const upcomingRides = await Ride.countDocuments({
      date: { $gte: new Date() },
      status: 'active'
    });

    // Convert the array of stats to an object
    const formattedStats = {
      active: 0,
      completed: 0,
      cancelled: 0,
      totalRides: totalStats[0]?.totalRides || 0,
      totalPassengers: totalStats[0]?.totalPassengers || 0,
      averageRating: totalStats[0]?.averageRating || 0,
      upcomingRides: upcomingRides
    };

    statusStats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
    });

    res.json(formattedStats);
  } catch (error) {
    console.error('Error fetching ride statistics:', error);
    res.status(500).json({ message: 'Error fetching ride statistics' });
  }
}; 