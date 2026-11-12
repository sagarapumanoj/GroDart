// Usage: npm run seed   (wipes products + recipes, re-creates them, promotes ADMIN_PHONE to admin)
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const Recipe = require('./models/Recipe');
const User = require('./models/User');
const Offer = require('./models/Offer');

// [name, category, price, unit, emoji]
const products = [
  ['Tomato', 'Vegetables', 18, '500 g', '🍅'], ['Onion', 'Vegetables', 20, '500 g', '🧅'],
  ['Potato', 'Vegetables', 18, '500 g', '🥔'], ['Carrot', 'Vegetables', 28, '500 g', '🥕'],
  ['Green Chilli', 'Vegetables', 15, '100 g', '🌶️'], ['Ginger', 'Vegetables', 12, '100 g', '🫚'],
  ['Garlic', 'Vegetables', 20, '100 g', '🧄'], ['Coriander Leaves', 'Vegetables', 10, '1 bunch', '🌿'],
  ['Mint Leaves', 'Vegetables', 10, '1 bunch', '🌱'], ['Curry Leaves', 'Vegetables', 5, '1 bunch', '🍃'],
  ['French Beans', 'Vegetables', 22, '250 g', '🫘'], ['Green Peas', 'Vegetables', 35, '250 g', '🫛'],
  ['Spinach', 'Vegetables', 15, '1 bunch', '🥬'], ['Capsicum', 'Vegetables', 25, '250 g', ''],
  ['Lemon', 'Vegetables', 20, '4 pcs', '🍋'],
  ['Banana', 'Fruits', 40, '6 pcs', '🍌'], ['Apple', 'Fruits', 90, '500 g', '🍎'],
  ['Paneer', 'Dairy', 90, '200 g', '🧀'], ['Curd', 'Dairy', 35, '400 g', '🥛'],
  ['Milk', 'Dairy', 30, '500 ml', '🥛'], ['Butter', 'Dairy', 58, '100 g', '🧈'],
  ['Fresh Cream', 'Dairy', 55, '200 ml', '🥛'], ['Ghee', 'Dairy', 140, '200 ml', '🫕'],
  ['Basmati Rice', 'Staples', 120, '1 kg', '🍚'], ['Toor Dal', 'Staples', 85, '500 g', '🫘'],
  ['Wheat Atta', 'Staples', 52, '1 kg', '🌾'], ['Sunflower Oil', 'Staples', 140, '1 L', '🫒'],
  ['Salt', 'Staples', 22, '1 kg', '🧂'], ['Sugar', 'Staples', 48, '1 kg', '🍬'],
  ['Tamarind', 'Staples', 25, '100 g', '🟤'],
  ['Biryani Masala', 'Spices', 45, '50 g', '🥘'], ['Garam Masala', 'Spices', 42, '50 g', '🥘'],
  ['Turmeric Powder', 'Spices', 25, '100 g', '🟡'], ['Red Chilli Powder', 'Spices', 38, '100 g', '🌶️'],
  ['Cumin Seeds', 'Spices', 40, '100 g', '🌰'], ['Kasuri Methi', 'Spices', 28, '25 g', '🌿'],
  ['Sambar Powder', 'Spices', 45, '100 g', '🥘'],
  ['Chicken Curry Cut', 'Meat', 130, '500 g', '🍗'],
  ['Drinking Water Can', 'Water', 60, '20 L', '💧'], ['Packaged Water', 'Water', 20, '1 L', '💧'],
  ['Masala Peanuts', 'Snacks', 30, '150 g', '🥜'], ['Marie Biscuits', 'Snacks', 30, '250 g', '🍪'],
  ['Instant Noodles', 'Snacks', 14, '70 g', '🍜'],
];

// [recipe, description, emoji, prepTime, [[product name, packs for 4 servings], ...]]
const recipes = [
  ['Vegetable Biryani', 'Fragrant basmati layered with mixed vegetables and mint.', '🍛', 50,
    [['Basmati Rice', 1], ['Onion', 1], ['Tomato', 1], ['Carrot', 1], ['French Beans', 1], ['Green Peas', 1], ['Ginger', 1],
     ['Garlic', 1], ['Mint Leaves', 1], ['Coriander Leaves', 1], ['Green Chilli', 1], ['Curd', 1], ['Biryani Masala', 1], ['Ghee', 1], ['Salt', 1]]],
  ['Chicken Biryani', 'Dum-style biryani with marinated chicken.', '🍗', 70,
    [['Chicken Curry Cut', 2], ['Basmati Rice', 1], ['Onion', 2], ['Tomato', 1], ['Curd', 1], ['Ginger', 1], ['Garlic', 1],
     ['Mint Leaves', 1], ['Coriander Leaves', 1], ['Biryani Masala', 1], ['Ghee', 1], ['Green Chilli', 1], ['Lemon', 1]]],
  ['Paneer Butter Masala', 'Creamy tomato gravy with soft paneer cubes.', '🧈', 40,
    [['Paneer', 1], ['Tomato', 2], ['Onion', 1], ['Butter', 1], ['Fresh Cream', 1], ['Ginger', 1], ['Garlic', 1],
     ['Kasuri Methi', 1], ['Red Chilli Powder', 1], ['Garam Masala', 1], ['Green Chilli', 1]]],
  ['Palak Paneer', 'Smooth spinach gravy with paneer.', '🥬', 35,
    [['Spinach', 2], ['Paneer', 1], ['Onion', 1], ['Tomato', 1], ['Ginger', 1], ['Garlic', 1], ['Green Chilli', 1],
     ['Fresh Cream', 1], ['Garam Masala', 1], ['Cumin Seeds', 1]]],
  ['Sambar', 'South Indian lentil stew with vegetables and tamarind.', '🍲', 45,
    [['Toor Dal', 1], ['Carrot', 1], ['Onion', 1], ['Tomato', 1], ['French Beans', 1], ['Tamarind', 1],
     ['Sambar Powder', 1], ['Turmeric Powder', 1], ['Curry Leaves', 1], ['Sunflower Oil', 1]]],
  ['Aloo Paratha', 'Stuffed wheat flatbread with spiced potato.', '🫓', 30,
    [['Wheat Atta', 1], ['Potato', 2], ['Green Chilli', 1], ['Coriander Leaves', 1], ['Butter', 1], ['Cumin Seeds', 1], ['Garam Masala', 1], ['Curd', 1]]],
];

const offers = [
  { code: 'WELCOME50', title: '₹50 off your first order', description: 'New to GroDart? Get ₹50 off on orders of ₹299 or more.', type: 'flat', value: 50, minOrder: 299, firstOrderOnly: true },
  { code: 'FRESH10', title: '10% off fresh picks', description: '10% off on orders of ₹499 or more, up to ₹60.', type: 'percent', value: 10, minOrder: 499, maxDiscount: 60 },
  { code: 'KITCHEN75', title: '₹75 off big baskets', description: 'Stocking up? Get ₹75 off on orders of ₹799 or more.', type: 'flat', value: 75, minOrder: 799 },
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([Product.deleteMany({}), Recipe.deleteMany({}), Offer.deleteMany({})]);
  await Offer.insertMany(offers);

  const docs = await Product.insertMany(
    products.map(([name, category, price, unit, emoji]) => ({ name, category, price, unit, emoji, stock: 50 }))
  );
  const byName = Object.fromEntries(docs.map((p) => [p.name, p._id]));

  await Recipe.insertMany(
    recipes.map(([name, description, emoji, prepTime, ings]) => ({
      name, description, emoji, prepTime, baseServings: 4,
      ingredients: ings.map(([n, quantity]) => {
        if (!byName[n]) throw new Error(`Recipe "${name}" uses unknown product "${n}"`);
        return { product: byName[n], quantity };
      }),
    }))
  );

  if (process.env.ADMIN_PHONE) {
    await User.findOneAndUpdate({ phone: process.env.ADMIN_PHONE }, { role: 'admin' }, { upsert: true, setDefaultsOnInsert: true });
    console.log(`Admin: ${process.env.ADMIN_PHONE}`);
  }
  console.log(`Seeded ${docs.length} products, ${recipes.length} recipes and ${offers.length} offers`);
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
