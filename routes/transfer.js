const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); // Add this line to import mongoose
const User = require('../models/user');
const Gadget = require('../models/Gadget');
const Notification = require('../models/Notification');
const authMiddleware = require('../middleware/auth');

// Transfer Ownership for Batch
router.post('/batch', authMiddleware, async (req, res) => {
  const { newOwnerBrn, newOwnerTin, gadgetIds } = req.body;

  try {
    const currentOwner = req.user; // Extracted from token
    console.log('Current Owner:', currentOwner);

    // Find new owner by either BRN or TIN
    const query = {};
    if (newOwnerBrn) query.brn = newOwnerBrn;
    if (newOwnerTin) query.tin = newOwnerTin;

    const newOwner = await User.findOne(query);
    console.log('New Owner:', newOwner);
    
    if (!newOwner) {
      return res.status(404).json({ error: 'New owner not found' });
    }

    // Update gadgets' owner to new owner
    const result = await Gadget.updateMany(
      { _id: { $in: gadgetIds }, owner: currentOwner.id },
      { $set: { owner: newOwner.id } }
    );
    console.log('Gadget Update Result:', result);

    // Remove gadgets from the current owner's list
    currentOwner.gadgets = currentOwner.gadgets.filter(id => !gadgetIds.includes(id.toString()));
    await currentOwner.save();

    // Add gadgets to the new owner's list
    newOwner.gadgets.push(...gadgetIds);
    await newOwner.save();

    // Create notifications
    await Notification.create({
      title: 'Gadget Ownership Transferred',
      message: `You have been assigned ownership of gadgets: ${gadgetIds.join(', ')}`,
      user: newOwner.id,
      type: 'Transfer',
      gadget: null // or pass the first gadget ID if relevant
    });

    res.status(200).json({ message: 'Ownership transferred successfully', result });
  } catch (error) {
    console.error('Error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Transfer Ownership for a Single Gadget
// Transfer Ownership for a Single Gadget
router.put('/piece', authMiddleware, async (req, res) => {
  const { newOwnerBrn, newOwnerTin, gadgetId } = req.body;

  try {
    // Extract current owner from authenticated user
    const currentOwner = req.user;
    console.log('Current Owner ID:', currentOwner.id);

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(gadgetId)) {
      return res.status(400).json({ error: 'Invalid gadget ID format' });
    }

    // Find the new owner by BRN or TIN
    const query = {};
    if (newOwnerBrn) query.brn = newOwnerBrn;
    if (newOwnerTin) query.tin = newOwnerTin;

    const newOwner = await User.findOne(query);
    console.log('New Owner:', newOwner);

    if (!newOwner) {
      return res.status(404).json({ error: 'New owner not found' });
    }

    // Find the gadget
    const gadget = await Gadget.findById(gadgetId);
    console.log('Gadget:', gadget);

    if (!gadget) {
      return res.status(404).json({ error: 'Gadget not found' });
    }

    // Check if the gadget belongs to the current owner
    if (gadget.owner.toString() !== currentOwner.id.toString()) {
      return res.status(403).json({ error: 'Gadget does not belong to the current owner' });
    }

    // Update the gadget's owner field
    const updatedGadget = await Gadget.findByIdAndUpdate(
      gadgetId,
      { owner: newOwner._id },
      { new: true }  // Returns the updated gadget
    );
    console.log('Updated Gadget:', updatedGadget);

    if (!updatedGadget) {
      return res.status(500).json({ error: 'Failed to update gadget ownership' });
    }

    // Update gadgets list for current owner and new owner
    await User.findByIdAndUpdate(currentOwner.id, { $pull: { gadgets: gadgetId } });
    await User.findByIdAndUpdate(newOwner.id, { $push: { gadgets: gadgetId } });

    // Create notification for the new owner
    await Notification.create({
      title: 'Gadget Ownership Transferred',
      message: `You have been assigned ownership of gadget: ${gadgetId}`,
      user: newOwner.id,
      type: 'Transfer',
      gadget: gadgetId
    });

    res.status(200).json({ message: 'Ownership transferred successfully', gadget: updatedGadget });
  } catch (error) {
    console.error('Error:', error);
    res.status(400).json({ error: error.message });
  }
});



module.exports = router;
