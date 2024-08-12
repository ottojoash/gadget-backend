const mongoose = require('mongoose');

const GadgetSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true
    },
    model: {
        type: String,
        required: true
    },
    imei: {
        type: String,
        required: function () { return this.type !== 'laptop'; }
    },
    brand: {
        type: String,
        required: true
    },
    serialNumber: {
        type: String,
        required: true
    },
    color: String,
    description: {
        type: String,
        required: true
    },
    purchaseLocation: {
        type: String,
        required: true
    },
    registrationDate: {
        type: Date,
        required: true
    },
    storageSize: {
        type: String,
        required: function () { return this.type === 'laptop'; }
    },
    simType: {
        type: String,
        required: function () { return this.type !== 'laptop'; }
    },
    phoneNumber: {
        type: String,
        required: function () { return this.type !== 'laptop'; }
    },
    network: {
        type: String,
        required: function () { return this.type !== 'laptop'; }
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

const Gadget = mongoose.model('Gadget', GadgetSchema);

module.exports = Gadget;
