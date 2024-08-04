const mongoose = require('mongoose');

const gadgetSchema = new mongoose.Schema({
  type: { type: String, required: true },
  model: { type: String, required: true },
  brand: { type: String, required: true },
  serialNumber: { type: String, required: true },
  imei: { type: String },
  storageSize: { type: String },
  ram: { type: String },
  color: { type: String },
  description: { type: String },
  purchaseLocation: { type: String },
  registrationDate: { type: Date },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Gadget', gadgetSchema);
