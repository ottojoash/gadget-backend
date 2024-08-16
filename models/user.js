const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the User schema
const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    address: { type: String },
    phoneNumber: { type: String },
    brn: { type: String },
    tin: { type: String },
    password: { type: String, required: true },
    category: { type: String }, // Add category field
    // Array of ObjectIds that reference the Gadget model
    gadgets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Gadget' }]
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// Compare password method
userSchema.methods.comparePassword = function (password) {
    return bcrypt.compare(password, this.password);
};

// Export the User model
module.exports = mongoose.model('User', userSchema);
