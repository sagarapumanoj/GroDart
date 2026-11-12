const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ['Vegetables', 'Fruits', 'Dairy', 'Staples', 'Spices', 'Meat', 'Water', 'Snacks'],
    },
    price: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true }, // pack size, e.g. "500 g"
    stock: { type: Number, default: 0, min: 0 },
    emoji: { type: String, default: '🛒' },
    image: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text' });
productSchema.index({ category: 1 });

module.exports = mongoose.model('Product', productSchema);
