const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const { summarize } = require('../utils/pricing');
const { resolve } = require('../services/offers');
const { ORDER_STATUSES } = require('../config/constants');

exports.place = asyncHandler(async (req, res) => {
  const { address, paymentMethod = 'COD' } = req.body;
  if (!address || !address.line1 || !address.area || !/^\d{6}$/.test(address.pincode || '')) {
    return res.status(400).json({ message: 'Add your delivery address with a 6-digit pincode' });
  }
  if (paymentMethod !== 'COD') return res.status(400).json({ message: 'Online payment is coming soon. Choose cash on delivery' });

  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  const lines = (cart?.items || []).filter((i) => i.product && i.product.isActive);
  if (!lines.length) return res.status(400).json({ message: 'Your cart is empty' });

  const items = lines.map((l) => ({
    product: l.product._id, name: l.product.name, unit: l.product.unit, emoji: l.product.emoji,
    price: l.product.price, quantity: l.quantity,
  }));
  const totals = summarize(items);

  // Validate the coupon before touching stock
  let discount = 0;
  let couponCode;
  if (req.body.couponCode) {
    const r = await resolve(req.body.couponCode, req.user, totals.subtotal);
    discount = r.discount;
    couponCode = r.offer.code;
  }

  // Reserve stock atomically per product; roll back if any line fails
  const reserved = [];
  for (const l of lines) {
    const r = await Product.updateOne({ _id: l.product._id, stock: { $gte: l.quantity } }, { $inc: { stock: -l.quantity } });
    if (r.modifiedCount !== 1) {
      await Promise.all(reserved.map((x) => Product.updateOne({ _id: x.product._id }, { $inc: { stock: x.quantity } })));
      return res.status(409).json({ message: `${l.product.name} just went out of stock. Update your cart and try again` });
    }
    reserved.push(l);
  }

  try {
    const order = await Order.create({
      user: req.user._id, items,
      subtotal: totals.subtotal, deliveryFee: totals.deliveryFee, discount, couponCode,
      total: totals.total - discount,
      address: { line1: address.line1, area: address.area, pincode: address.pincode, landmark: address.landmark },
      contactPhone: req.user.phone, paymentMethod,
    });
    cart.items = [];
    await cart.save();
    res.status(201).json({ order });
  } catch (err) {
    await Promise.all(reserved.map((x) => Product.updateOne({ _id: x.product._id }, { $inc: { stock: x.quantity } })));
    throw err;
  }
});

exports.mine = asyncHandler(async (req, res) => {
  res.json({ orders: await Order.find({ user: req.user._id }).sort({ createdAt: -1 }) });
});

exports.get = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json({ order });
});

exports.cancel = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (!['placed', 'confirmed'].includes(order.status)) {
    return res.status(409).json({ message: 'This order is already being packed and cannot be cancelled' });
  }
  order.status = 'cancelled';
  await order.save();
  await Promise.all(order.items.map((i) => Product.updateOne({ _id: i.product }, { $inc: { stock: i.quantity } })));
  res.json({ order });
});

// Admin
exports.all = asyncHandler(async (req, res) => {
  const filter = req.query.status ? { status: req.query.status } : {};
  res.json({ orders: await Order.find(filter).sort({ createdAt: -1 }).limit(200).populate('user', 'name phone') });
});

exports.setStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!ORDER_STATUSES.includes(status)) return res.status(400).json({ message: 'Invalid status' });
  const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json({ order });
});
