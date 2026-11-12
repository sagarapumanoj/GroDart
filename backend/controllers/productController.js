const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

exports.list = asyncHandler(async (req, res) => {
  const { category, search } = req.query;
  const filter = { isActive: true };
  if (category) filter.category = category;
  if (search) filter.name = { $regex: escapeRegex(String(search).slice(0, 50)), $options: 'i' };
  const products = await Product.find(filter).sort({ category: 1, name: 1 }).limit(200);
  res.json({ products });
});

exports.get = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product || !product.isActive) return res.status(404).json({ message: 'Product not found' });
  res.json({ product });
});

// Admin
exports.create = asyncHandler(async (req, res) => res.status(201).json({ product: await Product.create(req.body) }));

exports.update = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json({ product });
});
