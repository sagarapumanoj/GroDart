const { FREE_DELIVERY_ABOVE, DELIVERY_FEE } = require('../config/constants');

exports.summarize = (lines) => {
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
  const deliveryFee = subtotal === 0 || subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;
  return { subtotal, deliveryFee, total: subtotal + deliveryFee, freeDeliveryAbove: FREE_DELIVERY_ABOVE };
};

// Recipe quantities are stored for baseServings; scale for the requested servings
exports.scaleQty = (qty, servings, baseServings) => Math.max(1, Math.ceil((qty * servings) / baseServings));
