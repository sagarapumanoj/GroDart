const Recipe = require('../models/Recipe');
const asyncHandler = require('../utils/asyncHandler');

const populated = () => Recipe.find({ isActive: true }).populate('ingredients.product');

exports.list = asyncHandler(async (req, res) => {
  const recipes = await populated().sort({ name: 1 });
  res.json({ recipes });
});

exports.get = asyncHandler(async (req, res) => {
  const recipe = await Recipe.findOne({ _id: req.params.id, isActive: true }).populate('ingredients.product');
  if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
  res.json({ recipe });
});

// Admin
exports.create = asyncHandler(async (req, res) => res.status(201).json({ recipe: await Recipe.create(req.body) }));

exports.update = asyncHandler(async (req, res) => {
  const recipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
  res.json({ recipe });
});
