const Offer = require('../models/Offer');
const Cart = require('../models/Cart');
const asyncHandler = require('../utils/asyncHandler');
const { resolve } = require('../services/offers');

exports.list = asyncHandler(async (req, res) => {
  const now = new Date();
  const offers = await Offer.find({ isActive: true, $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }] }).sort({ minOrder: 1 });
  res.json({ offers });
});

// Checks a code against the user's real cart (never trusts a client-sent subtotal)
exports.validate = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  const subtotal = (cart?.items || []).reduce((s, i) => s + (i.product && i.product.isActive ? i.product.price * i.quantity : 0), 0);
  if (!subtotal) return res.status(400).json({ message: 'Add items to your cart first' });
  const { offer, discount } = await resolve(req.body.code, req.user, subtotal);
  res.json({ code: offer.code, title: offer.title, discount });
});

// Admin
exports.create = asyncHandler(async (req, res) => res.status(201).json({ offer: await Offer.create(req.body) }));
exports.update = asyncHandler(async (req, res) => {
  const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!offer) return res.status(404).json({ message: 'Offer not found' });
  res.json({ offer });
});
