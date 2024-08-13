const express = require('express');
const router = express.Router();
const Gadget = require('../models/Gadget');
const authenticate = require('../middleware/auth'); // Ensure this path is correct
const User = require('../models/user'); // Ensure this path is correct


// Register Gadget
router.post('/register', authenticate, async (req, res) => {
  console.log('Request body:', req.body); // Log the request body

  const {
    type,
    model,
    imei,
    deviceId,  // Add this field for laptops
    brand,
    serialNumber,
    color,
    description,
    purchaseLocation,
    registrationDate,
    storageSize,
    simType,
    phoneNumber,
    network,
    ram  // Add this field for laptops
  } = req.body;

  // Validation
  if (!type || !model || !brand || !serialNumber || !description || !purchaseLocation || !registrationDate || !storageSize) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Conditional validation for phone and laptop
  if (type === 'phone') {
    if (!imei || !phoneNumber || !network || !simType) {
      return res.status(400).json({ error: 'Missing required fields for phone' });
    }
  } else if (type === 'laptop') {
    if (!deviceId || !ram) {
      return res.status(400).json({ error: 'Missing required fields for laptop' });
    }
  }

  try {
    // Create a new gadget
    const newGadget = new Gadget({
      type,
      model,
      imei: type === 'phone' ? imei : undefined, // Only include if type is phone
      deviceId: type === 'laptop' ? deviceId : undefined, // Only include if type is laptop
      brand,
      serialNumber,
      ram: type === 'laptop' ? ram : undefined, // Only include if type is laptop
      color,
      description,
      purchaseLocation,
      registrationDate,
      storageSize,
      simType: type === 'phone' ? simType : undefined, // Only include if type is phone
      phoneNumber: type === 'phone' ? phoneNumber : undefined, // Only include if type is phone
      network: type === 'phone' ? network : undefined, // Only include if type is phone
      owner: req.userId // Attach the gadget to the authenticated user's ID
    });

    // Save the new gadget to the database
    const savedGadget = await newGadget.save();
    res.status(201).json(savedGadget);
  } catch (error) {
    console.error('Error registering gadget:', error);
    res.status(500).json({ error: error.message });
  }
});

// View All Gadgets Registered by the Authenticated User
router.get('/view', authenticate, async (req, res) => {
  try {
    // Find gadgets owned by the authenticated user with all necessary fields
    const gadgets = await Gadget.find(
      { owner: req.userId },
      'model brand type serialNumber imei deviceId storageSize ram color registrationDate simType'
    );
    
    // Check if gadgets were found
    if (gadgets.length === 0) {
      return res.status(404).json({ message: 'No gadgets found for this user.' });
    }

    res.status(200).json(gadgets);
  } catch (error) {
    console.error('Error retrieving gadgets:', error);
    res.status(400).json({ error: error.message });
  }
});



// View Gadget Details by ID
router.get('/view/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const gadget = await Gadget.findById(id);
    if (!gadget) {
      return res.status(404).json({ error: 'Gadget not found' });
    }
    res.status(200).json(gadget);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get Gadget by IMEI or Serial Number
router.get('/:identifier', async (req, res) => {
  const { identifier } = req.params;

  try {
    // Find gadget by IMEI or Serial Number
    const gadget = await Gadget.findOne({
      $or: [
        { imei: identifier },
        { serialNumber: identifier }
      ]
    });

    if (!gadget) {
      return res.status(404).json({ error: 'Gadget not found' });
    }

    res.json(gadget);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Gadget by Model, Serial Number, or IMEI
router.get('/search', async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    const regex = new RegExp(query, 'i'); // Case-insensitive search
    const gadgets = await Gadget.find({
      $or: [
        { model: regex },
        { serialNumber: regex },
        { imei: regex }
      ]
    });

    if (gadgets.length === 0) {
      return res.status(404).json({ message: 'No gadgets found' });
    }

    res.status(200).json(gadgets);
  } catch (error) {
    console.error('Error searching gadgets:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
