const express = require('express');
const router = express.Router();
const Gadget = require('../models/Gadget');

// Register Gadget
// Register Gadget
router.post('/register', async (req, res) => {
    console.log('Request body:', req.body); // Log the request body
  
    const {
      type,
      model,
      imei,
      brand,
      serialNumber,
      color,
      description,
      purchaseLocation,
      registrationDate,
      storageSize,
      simType,
      phoneNumber,
      network
    } = req.body;
  
    // Validation
    if (!type || !model || !brand || !serialNumber || !description || !purchaseLocation || !registrationDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
  
    try {
      const newGadget = new Gadget({
        type,
        model,
        imei: type === 'laptop' ? undefined : imei,
        brand,
        serialNumber,
        color,
        description,
        purchaseLocation,
        registrationDate,
        storageSize: type === 'laptop' ? storageSize : undefined,
        simType: type === 'laptop' ? undefined : simType,
        phoneNumber: type === 'laptop' ? undefined : phoneNumber,
        network: type === 'laptop' ? undefined : network
      });
  
      await newGadget.save();
      res.status(201).json(newGadget);
    } catch (error) {
      console.error('Error saving gadget:', error);
      res.status(400).json({ error: error.message });
    }
  });
  

// View All Gadgets with Specific Fields
router.get('/view', async (req, res) => {
    try {
      const gadgets = await Gadget.find({}, 'brand type serialNumber imei storageSize ram color');
      res.status(200).json(gadgets);
    } catch (error) {
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
