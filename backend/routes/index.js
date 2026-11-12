const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { protect, requireRole } = require('../middleware/auth');
const auth = require('../controllers/authController');
const products = require('../controllers/productController');
const recipes = require('../controllers/recipeController');
const cart = require('../controllers/cartController');
const orders = require('../controllers/orderController');
const offers = require('../controllers/offerController');

const otpLimiter = rateLimit({ windowMs: 10 * 60 * 1000, limit: 5, message: { message: 'Too many OTP requests. Try again in a few minutes' } });
const admin = [protect, requireRole('admin')];

// Auth
router.post('/auth/send-otp', otpLimiter, auth.sendOtp);
router.post('/auth/verify-otp', auth.verifyOtp);
router.get('/auth/me', protect, auth.me);
router.patch('/auth/me', protect, auth.updateProfile);
router.post('/auth/me/addresses', protect, auth.addAddress);
router.delete('/auth/me/addresses/:addressId', protect, auth.removeAddress);

// Catalogue
router.get('/products', products.list);
router.get('/products/:id', products.get);
router.post('/products', admin, products.create);
router.put('/products/:id', admin, products.update);

router.get('/recipes', recipes.list);
router.get('/recipes/:id', recipes.get);
router.post('/recipes', admin, recipes.create);
router.put('/recipes/:id', admin, recipes.update);

// Offers
router.get('/offers', offers.list);
router.post('/offers/validate', protect, offers.validate);
router.post('/offers', admin, offers.create);
router.put('/offers/:id', admin, offers.update);

// Cart
router.get('/cart', protect, cart.get);
router.post('/cart/add', protect, cart.add);
router.post('/cart/add-recipe', protect, cart.addRecipe);
router.patch('/cart/item/:productId', protect, cart.setQuantity);
router.delete('/cart/item/:productId', protect, cart.remove);
router.delete('/cart', protect, cart.clear);

// Orders
router.post('/orders', protect, orders.place);
router.get('/orders', protect, orders.mine);
router.get('/orders/admin/all', admin, orders.all);
router.patch('/orders/:id/status', admin, orders.setStatus);
router.get('/orders/:id', protect, orders.get);
router.post('/orders/:id/cancel', protect, orders.cancel);

module.exports = router;
