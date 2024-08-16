const express = require('express');
const router = express.Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
  const { fullName, email, address, phoneNumber, brn, tin, password,category } = req.body;
  
  try {
    const user = new User({ fullName, email, address, phoneNumber, brn, tin, password,category });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/current-user', authMiddleware, async (req, res) => {
    try {
      const user = await User.findById(req.user.id); // `req.user` comes from your auth middleware
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Include additional fields in the token payload
    const token = jwt.sign({
      id: user._id,
      phoneNumber: user.phoneNumber, // Include phoneNumber
      tin: user.tin,               // Include TIN
      brn: user.brn                // Include BRN
    }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ success: true, token });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

  // Get users' NINs and BRNs
router.get('/users', authMiddleware, async (req, res) => {
  try {
    // Query the User model, selecting only the `nins` and `brns` fields
    const users = await User.find({}, 'tin brn'); // Adjust the fields according to your schema
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/search-users', authMiddleware, async (req, res) => {
  const { brn, tin } = req.query;

  try {
    // Build the query object
    let query = {};
    if (brn) query.brn = brn;
    if (tin) query.tin = tin;

    // Search users based on the query
    const users = await User.find(query, 'brn tin'); // Select only the `brn` and `tin` fields
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

  

module.exports = router;
