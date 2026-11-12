const mongoose = require('mongoose');
const { ORDER_STATUSES } = require('../config/constants');

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    // Name/price are snapshots so later catalogue edits never change old orders
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        name: String,
        unit: String,
        emoji: String,
        price: Number,
        quantity: Number,
        _id: false,
      },
    ],
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    couponCode: { type: String },
    total: { type: Number, required: true },
    address: {
      line1: { type: String, required: true },
      area: { type: String, required: true },
      pincode: { type: String, required: true },
      landmark: String,
    },
    contactPhone: { type: String, required: true },
    paymentMethod: { type: String, enum: ['COD', 'ONLINE'], default: 'COD' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    status: { type: String, enum: ORDER_STATUSES, default: 'placed' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
