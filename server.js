require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('error', (err) => console.error('MongoDB connection error:', err));
mongoose.connection.once('open', () => console.log('Connected to MongoDB'));

// Routes
const authRoutes = require('./routes/auth');
const gadgetRoutes = require('./routes/gadget');
const reportRoutes = require('./routes/report');
const notificationRoutes = require('./routes/notification');
const transferRoutes = require('./routes/transfer');  // Added transfer route

app.use('/api/auth', authRoutes);
app.use('/api/gadgets', gadgetRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/transfer', transferRoutes);  // Added transfer route

app.listen(port, () => console.log(`Server running on port ${port}`));
