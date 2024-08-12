const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const Gadget = require('../models/Gadget');
const authenticate = require('../middleware/auth');


// Report Gadget
router.post('/report', async (req, res) => {
  const {
    gadgetIdentifier,  // IMEI or Serial Number
    dateLastSeen,
    locationLastSeen,
    contactInformation,
    gadgetColor,
    personReporting,
    description,
    reportDate,
    comments
  } = req.body;

  // Validation
  if (!gadgetIdentifier || !dateLastSeen || !locationLastSeen || !contactInformation || !personReporting || !description || !reportDate) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Find gadget by IMEI or Serial Number
    const gadget = await Gadget.findOne({
      $or: [
        { imei: gadgetIdentifier },
        { serialNumber: gadgetIdentifier }
      ]
    });

    if (!gadget) {
      return res.status(404).json({ error: 'Gadget not found' });
    }

    const newReport = new Report({
      gadget: gadget._id,
      dateLastSeen,
      locationLastSeen,
      contactInformation,
      gadgetColor,
      personReporting,
      description,
      reportDate,
      comments
    });

    await newReport.save();
    res.status(201).json(newReport);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


// Search Gadgets
router.get('/search', authenticate, async (req, res) => {
  const query = req.query.query;
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    // Search gadgets that belong to the authenticated user
    const gadgets = await Gadget.find({
      owner: req.userId, // Only gadgets that belong to the logged-in user
      $or: [
        { model: { $regex: query, $options: 'i' } },
        { brand: { $regex: query, $options: 'i' } }
      ]
    });
    res.json(gadgets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
//get all reports
  router.get('/reports', async (req, res) => {
    try {
      const reports = await Report.find().populate('gadget');
      res.json(reports);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

module.exports = router;
