const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    type: { type: String, enum: ['percent', 'flat'], required: true },
    value: { type: Number, required: true, min: 1 }, // percent (1-100) or rupees
    minOrder: { type: Number, default: 0 },
    maxDiscount: { type: Number, default: null }, // cap for percent offers
    firstOrderOnly: { type: Boolean, default: false },
    expiresAt: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Offer', offerSchema);
