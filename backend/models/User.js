const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, default: 'Home' },
    line1: { type: String, required: true, trim: true },
    area: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, match: /^\d{6}$/ },
    landmark: { type: String, trim: true },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, lowercase: true, match: /^\S+@\S+\.\S+$/ },
    phone: { type: String, required: true, unique: true, match: /^[6-9]\d{9}$/ },
    role: { type: String, enum: ['customer', 'vendor', 'delivery', 'admin'], default: 'customer' },
    addresses: [addressSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
