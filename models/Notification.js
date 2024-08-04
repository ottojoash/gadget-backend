const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  date: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to the user receiving the notification
  type: { type: String, required: true }, // e.g., 'Report', 'Transfer', 'Communication'
  gadget: { type: mongoose.Schema.Types.ObjectId, ref: 'Gadget' } // Reference to the associated gadget, if any
});

module.exports = mongoose.model('Notification', notificationSchema);
