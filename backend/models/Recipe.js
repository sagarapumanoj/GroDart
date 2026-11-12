const mongoose = require('mongoose');

// quantity = number of packs of the product needed for `baseServings`
const ingredientSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    note: { type: String, default: '' },
  },
  { _id: false }
);

const recipeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    cuisine: { type: String, default: 'Indian' },
    emoji: { type: String, default: '🍲' },
    image: { type: String, default: '' },
    prepTime: { type: Number, default: 30 }, // minutes
    baseServings: { type: Number, default: 4, min: 1 },
    ingredients: { type: [ingredientSchema], validate: (v) => v.length > 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Recipe', recipeSchema);
