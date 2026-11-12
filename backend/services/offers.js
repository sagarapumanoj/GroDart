const Offer = require('../models/Offer');
const Order = require('../models/Order');

const fail = (message) => { const e = new Error(message); e.status = 400; throw e; };

exports.computeDiscount = (offer, subtotal) => {
  let d = offer.type === 'percent' ? Math.floor((subtotal * offer.value) / 100) : offer.value;
  if (offer.maxDiscount) d = Math.min(d, offer.maxDiscount);
  return Math.max(0, Math.min(d, subtotal));
};

// Validates a coupon for this user + cart subtotal. Throws a 400 with a plain message if it cannot be used.
exports.resolve = async (code, user, subtotal) => {
  const offer = await Offer.findOne({ code: String(code || '').trim().toUpperCase(), isActive: true });
  if (!offer || (offer.expiresAt && offer.expiresAt < new Date())) fail('This offer code is not valid or has expired');
  if (subtotal < offer.minOrder) fail(`Add items worth ₹${offer.minOrder - subtotal} more to use ${offer.code}`);
  if (offer.firstOrderOnly && (await Order.exists({ user: user._id, status: { $ne: 'cancelled' } }))) {
    fail(`${offer.code} is only for your first order`);
  }
  return { offer, discount: exports.computeDiscount(offer, subtotal) };
};
