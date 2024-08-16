const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');


// Create a new notification
router.post('/', async (req, res) => {
  const { title, message, user, type, gadget } = req.body;
  try {
    const notification = new Notification({ title, message, user, type, gadget });
    await notification.save();
    res.status(201).json({ message: 'Notification created successfully', notification });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get notifications for a user
// router.get('/', async (req, res) => {
//   const { userId } = req.user; // Extract userId from request (set by authenticateToken)
//   try {
//     const notifications = await Notification.find({ user: userId }).sort({ date: -1 });
//     res.status(200).json(notifications);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ date: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
