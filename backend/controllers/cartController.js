const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Recipe = require('../models/Recipe');
const asyncHandler = require('../utils/asyncHandler');
const { summarize, scaleQty } = require('../utils/pricing');

const getOrCreate = async (userId) => (await Cart.findOne({ user: userId })) || Cart.create({ user: userId, items: [] });

// Shape the cart for the client: drop items whose product disappeared, add price summary
const present = async (cart) => {
  await cart.populate('items.product');
  const items = cart.items
    .filter((i) => i.product && i.product.isActive)
    .map((i) => ({ product: i.product, quantity: i.quantity, recipe: i.recipe || null }));
  const summary = summarize(items.map((i) => ({ price: i.product.price, quantity: i.quantity })));
  return { items, ...summary, itemCount: items.reduce((n, i) => n + i.quantity, 0) };
};

exports.get = asyncHandler(async (req, res) => {
  res.json({ cart: await present(await getOrCreate(req.user._id)) });
});

exports.add = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const qty = Math.max(1, parseInt(req.body.quantity, 10) || 1);
  const product = await Product.findById(productId);
  if (!product || !product.isActive) return res.status(404).json({ message: 'Product not found' });

  const cart = await getOrCreate(req.user._id);
  const line = cart.items.find((i) => String(i.product) === String(product._id));
  const nextQty = (line ? line.quantity : 0) + qty;
  if (nextQty > product.stock) {
    return res.status(409).json({ message: `Only ${product.stock} of ${product.name} in stock` });
  }
  if (line) line.quantity = nextQty;
  else cart.items.push({ product: product._id, quantity: qty });
  await cart.save();
  res.json({ cart: await present(cart) });
});

exports.setQuantity = asyncHandler(async (req, res) => {
  const qty = parseInt(req.body.quantity, 10);
  const cart = await getOrCreate(req.user._id);
  const line = cart.items.find((i) => String(i.product) === req.params.productId);
  if (!line) return res.status(404).json({ message: 'Item not in cart' });

  if (!qty || qty < 1) {
    cart.items = cart.items.filter((i) => String(i.product) !== req.params.productId);
  } else {
    const product = await Product.findById(req.params.productId);
    if (!product || qty > product.stock) return res.status(409).json({ message: 'Not enough stock' });
    line.quantity = qty;
  }
  await cart.save();
  res.json({ cart: await present(cart) });
});

exports.remove = asyncHandler(async (req, res) => {
  const cart = await getOrCreate(req.user._id);
  cart.items = cart.items.filter((i) => String(i.product) !== req.params.productId);
  await cart.save();
  res.json({ cart: await present(cart) });
});

exports.clear = asyncHandler(async (req, res) => {
  const cart = await getOrCreate(req.user._id);
  cart.items = [];
  await cart.save();
  res.json({ cart: await present(cart) });
});

// The GroDart USP: one tap turns a recipe into a cart.
// body: { recipeId, servings, exclude: [productId, ...] }  (exclude = things the customer already has)
exports.addRecipe = asyncHandler(async (req, res) => {
  const { recipeId, exclude = [] } = req.body;
  const servings = Math.min(20, Math.max(1, parseInt(req.body.servings, 10) || 0));
  const recipe = await Recipe.findOne({ _id: recipeId, isActive: true }).populate('ingredients.product');
  if (!recipe) return res.status(404).json({ message: 'Recipe not found' });

  const skip = new Set(exclude.map(String));
  const cart = await getOrCreate(req.user._id);
  const skipped = [];
  let added = 0;

  for (const ing of recipe.ingredients) {
    const p = ing.product;
    if (!p || skip.has(String(p._id))) continue;
    const need = scaleQty(ing.quantity, servings || recipe.baseServings, recipe.baseServings);
    const line = cart.items.find((i) => String(i.product) === String(p._id));
    const have = line ? line.quantity : 0;
    const target = Math.min(p.stock, have + need);

    if (!p.isActive || p.stock < 1 || target <= have) {
      skipped.push({ name: p.name, reason: 'Out of stock' });
      continue;
    }
    if (target < have + need) skipped.push({ name: p.name, reason: `Only ${target - have} available` });
    if (line) line.quantity = target;
    else cart.items.push({ product: p._id, quantity: target, recipe: recipe._id });
    added += 1;
  }

  await cart.save();
  res.json({ cart: await present(cart), added, skipped });
});
