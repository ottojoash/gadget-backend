const mongoose = require('mongoose');
const Gadget = require('./Gadget');  // Ensure this path is correct based on your project structure

const reportSchema = new mongoose.Schema({
  gadget: { type: mongoose.Schema.Types.ObjectId, ref: 'Gadget', required: true },
  dateLastSeen: { type: Date, required: true },
  locationLastSeen: { type: String, required: true },
  contactInformation: { type: String, required: true },
  gadgetColor: { type: String },
  personReporting: { type: String, required: true },
  description: { type: String, required: true },
  reportDate: { type: Date, required: true },
  comments: { type: String }
});

const Report = mongoose.model('Report', reportSchema);
module.exports = Report;
