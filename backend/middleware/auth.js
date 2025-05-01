const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    console.log('Auth header:', authHeader); // Debug log

    if (!authHeader) {
      console.log('No auth header found');
      return res.status(401).json({ message: 'No authentication token found' });
    }

    // Extract token from header
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
    console.log('Extracted token:', token); // Debug log

    if (!token) {
      console.log('No token found after extraction');
      return res.status(401).json({ message: 'No authentication token found' });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded token:', decoded); // Debug log

      // Check if userId exists in decoded token
      if (!decoded.userId) {
        console.log('No userId found in token');
        return res.status(401).json({ message: 'Invalid token format' });
      }

      // Find user using userId from token
      const user = await User.findById(decoded.userId);
      console.log('Found user:', user ? 'yes' : 'no'); // Debug log

      if (!user) {
        console.log('User not found for token');
        return res.status(401).json({ message: 'User not found' });
      }

      // Attach user to request
      req.user = user;
      next();
    } catch (jwtError) {
      console.error('JWT Error:', jwtError.message);
      console.error('JWT Error stack:', jwtError.stack);
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
      }
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      return res.status(401).json({ message: 'Token verification failed' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    console.error('Error stack:', error.stack);
    return res.status(401).json({ message: 'Authentication failed' });
  }
};

module.exports = auth; 