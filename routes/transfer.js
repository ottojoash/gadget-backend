const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Gadget = require('../models/Gadget');
const Notification = require('../models/Notification');

// Transfer Ownership for Batch
router.post('/batch', async (req, res) => {
  const { userId, gadgetIds } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const gadgets = await Gadget.updateMany(
      { _id: { $in: gadgetIds } },
      { $set: { owner: userId } }
    );

    user.gadgets.push(...gadgetIds);
    await user.save();

    // Create notification
    await Notification.create({
      title: 'Gadget Ownership Transferred',
      message: `You have been assigned ownership of gadgets: ${gadgetIds.join(', ')}`,
      user: userId,
      type: 'Transfer',
      gadget: null // or pass the first gadget ID if relevant
    });

    res.status(200).json({ message: 'Ownership transferred successfully', gadgets });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Transfer Ownership for a Single Gadget
router.post('/piece', async (req, res) => {
  const { userId, gadgetId } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const gadget = await Gadget.findById(gadgetId);
    if (!gadget) {
      return res.status(404).json({ error: 'Gadget not found' });
    }

    gadget.owner = userId;
    await gadget.save();

    user.gadgets.push(gadgetId);
    await user.save();

    // Create notification
    await Notification.create({
      title: 'Gadget Ownership Transferred',
      message: `You have been assigned ownership of gadget: ${gadgetId}`,
      user: userId,
      type: 'Transfer',
      gadget: gadgetId
    });

    res.status(200).json({ message: 'Ownership transferred successfully', gadget });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
