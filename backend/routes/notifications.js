const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');

// Get all notifications for the current user
router.get('/', auth, async (req, res) => {
  try {
    // Only fetch notifications that haven't been deleted
    const notifications = await Notification.find({ 
      recipient: req.user.id,
      deleted: { $ne: true } // Only get notifications that haven't been marked as deleted
    }).sort({ createdAt: -1 });
    
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get unread notification count
router.get('/unread-count', auth, async (req, res) => {
  try {
    const count = await Notification.countDocuments({ 
      recipient: req.user.id,
      read: false 
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark a notification as read and delete it permanently
router.patch('/:notificationId/read', auth, async (req, res) => {
  try {
    // Delete the notification directly without checking first
    const result = await Notification.deleteOne({ 
      _id: req.params.notificationId,
      recipient: req.user.id // Ensure user can only delete their own notifications
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    // Return success message
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark all notifications as read
router.patch('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, read: false },
      { read: true }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 