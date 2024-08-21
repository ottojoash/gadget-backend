const express = require('express');
const router = express.Router();
const Gadget = require('../models/Gadget');
const authenticate = require('../middleware/auth'); // Ensure this path is correct
const User = require('../models/user'); // Ensure this path is correct


// Register Gadget
router.post('/register', authenticate, async (req, res) => {
  console.log('Received request data:', req.body);

  const {
    type,
    model,
    imei,
    deviceId,
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
    ram
  } = req.body;

  // Validation logic here...
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
    // Save the new gadget
    const newGadget = new Gadget({
      type,
      model,
      imei: type === 'phone' ? imei : undefined,
      deviceId: type === 'laptop' ? deviceId : undefined,
      brand,
      serialNumber,
      ram: type === 'laptop' ? ram : undefined,
      color,
      description,
      purchaseLocation,
      registrationDate,
      storageSize,
      simType: type === 'phone' ? simType : undefined,
      phoneNumber: type === 'phone' ? phoneNumber : undefined,
      network: type === 'phone' ? network : undefined,
      owner: req.userId
    });

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

// Batch registration route
router.post('/batch-register', authenticate, async (req, res) => {
  let gadgets = req.body;

  // Log the incoming data to verify its structure
  console.log('Received gadgets data:', JSON.stringify(gadgets, null, 2));

  // If the request body is not an array, wrap it in an array
  if (!Array.isArray(gadgets)) {
    gadgets = [gadgets];
  }

  if (gadgets.length === 0) {
    return res.status(400).json({ error: 'Request body must be an array of gadgets' });
  }

  const results = await validateAndSaveGadgets(gadgets, req.userId);

  if (results.some(result => result.status === 'error')) {
    return res.status(400).json({ results });
  }

  return res.status(201).json({ results });
});

// Validation and save function
async function validateAndSaveGadgets(gadgets, userId) {
  const results = [];

  for (const gadget of gadgets) {
    const {
      type,
      model,
      imei,
      deviceId,
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
      ram
    } = gadget;

    // Log the extracted values to ensure they are correct
    console.log('Validating gadget:', JSON.stringify(gadget, null, 2));

    const errors = [];

    // Basic required fields validation
    if (!type || !model || !brand || !serialNumber || !description || !purchaseLocation || !registrationDate || !storageSize) {
      errors.push('Missing required fields');
    }

    // Conditional validation based on type
    if (type === 'phone') {
      if (!imei) errors.push('Missing IMEI for phone');
      if (!simType) errors.push('Missing SIM Type for phone');
      if (!phoneNumber) errors.push('Missing phone number for phone');
      if (!network) errors.push('Missing network for phone');
    } else if (type === 'laptop') {
      if (!deviceId) errors.push('Missing Device ID for laptop');
      if (!ram) errors.push('Missing RAM for laptop');
    }

    // If validation fails, log the error
    if (errors.length > 0) {
      results.push({
        gadget,
        status: 'error',
        errors
      });
      continue;
    }

    try {
      const newGadget = new Gadget({
        type,
        model,
        imei: type === 'phone' ? imei : undefined,
        deviceId: type === 'laptop' ? deviceId : undefined,
        brand,
        serialNumber,
        ram: type === 'laptop' ? ram : undefined,
        color,
        description,
        purchaseLocation,
        registrationDate,
        storageSize,
        simType: type === 'phone' ? simType : undefined,
        phoneNumber: type === 'phone' ? phoneNumber : undefined,
        network: type === 'phone' ? network : undefined,
        owner: userId // Attach the gadget to the authenticated user's ID
      });

      const savedGadget = await newGadget.save();
      results.push({
        gadget: savedGadget,
        status: 'success'
      });
    } catch (error) {
      results.push({
        gadget,
        status: 'error',
        errors: [error.message]
      });
    }
  }

  return results;
}


module.exports = router;
