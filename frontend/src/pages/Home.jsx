import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import OfferCard from '../components/OfferCard';
import ProductCard from '../components/ProductCard';

const AISLES = [
  ['Vegetables', '🥦', 'Picked fresh every morning'],
  ['Fruits', '🍌', 'Bananas, apples and more'],
  ['Dairy', '🥛', 'Milk, curd, paneer, butter'],
  ['Staples', '🌾', 'Rice, dal, atta and oil'],
  ['Spices', '🥘', 'Masalas and whole spices'],
  ['Meat', '🍗', 'Fresh chicken, cleaned and cut'],
  ['Water', '💧', '20 L cans and bottles'],
  ['Snacks', '🍪', 'Biscuits, peanuts, noodles'],
];

const STEPS = [
  ['Choose', 'Search the shop, or start from a recipe and get every ingredient at once.'],
  ['Review', 'See the exact bill with delivery and any offer code applied before you pay.'],
  ['Receive', 'Pay cash on delivery when your order reaches your door.'],
];

const SOON = [
  ['Medicines', '💊'], ['Monthly water', '🚰'], ['Home cleaning', '🧹'], ['Laundry', '🧺'], ['Lunch boxes', '🍱'],
];

const TILES = ['🍅', '🥛', '🧅', '🍚', '🥕', '🧀', '🍌', '🌶️', '💧'];

export default function Home() {
  const [offers, setOffers] = useState([]);
  const [fresh, setFresh] = useState([]);

  useEffect(() => {
    api.get('/offers').then((r) => setOffers(r.data.offers.slice(0, 3))).catch(() => {});
    api.get('/products', { params: { category: 'Vegetables' } }).then((r) => setFresh(r.data.products.slice(0, 4))).catch(() => {});
  }, []);

  return (
    <div className="space-y-16">
      <section className="grid items-center gap-10 py-6 lg:grid-cols-[1.15fr_1fr]">
        <div>
          <p className="inline-block rounded-full bg-turmeric px-4 py-1 text-sm font-semibold">Now delivering in Visakhapatnam</p>
          <h1 className="mt-5 text-5xl font-extrabold leading-[1.02] text-leaf-900 sm:text-7xl">
            Everything your kitchen needs, at your door.
          </h1>
          <p className="mt-5 max-w-lg text-lg text-muted">
            GroDart brings fresh vegetables, groceries, drinking water and snacks from local vendors. Delivery is free on orders of ₹299 or more.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/shop" className="rounded-xl bg-leaf-900 px-6 py-3 font-semibold text-white hover:bg-leaf-800">Start shopping</Link>
            <Link to="/offers" className="rounded-xl border border-line bg-white px-6 py-3 font-semibold hover:bg-leaf-50">See offers</Link>
          </div>
        </div>

        <div aria-hidden="true" className="grid grid-cols-3 gap-3 rounded-3xl bg-leaf-50 p-4">
          {TILES.map((e, i) => (
            <div key={i} className={`flex aspect-square items-center justify-center rounded-2xl bg-white text-5xl sm:text-6xl ${i === 4 ? 'bg-turmeric/30' : ''}`}>{e}</div>
          ))}
        </div>
      </section>

      <section aria-labelledby="aisles">
        <h2 id="aisles" className="text-3xl font-bold">What you can order</h2>
        <p className="mt-1 text-muted">Eight aisles of daily essentials, with more on the way.</p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {AISLES.map(([name, emoji, line]) => (
            <Link key={name} to={`/shop?category=${name}`} className="rounded-xl border border-line bg-white p-4 hover:border-leaf-600">
              <span className="text-4xl" aria-hidden="true">{emoji}</span>
              <p className="mt-2 font-semibold">{name}</p>
              <p className="text-sm text-muted">{line}</p>
            </Link>
          ))}
        </div>
        <p className="mt-4 text-muted">
          Not sure what to buy? <Link to="/recipes" className="font-semibold text-leaf-800 underline">Cook from a recipe kit</Link> and we collect the ingredients for you.
        </p>
      </section>

      <section aria-labelledby="how" className="rounded-3xl bg-leaf-900 p-6 text-white sm:p-10">
        <h2 id="how" className="text-3xl font-bold">How it works</h2>
        <ol className="mt-6 grid gap-6 sm:grid-cols-3">
          {STEPS.map(([title, text], i) => (
            <li key={title}>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-turmeric font-bold text-ink">{i + 1}</span>
              <h3 className="mt-3 text-xl font-bold">{title}</h3>
              <p className="mt-1 text-leaf-50/80">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      {offers.length > 0 && (
        <section aria-labelledby="offers">
          <div className="flex items-end justify-between gap-4">
            <h2 id="offers" className="text-3xl font-bold">Offers for you</h2>
            <Link to="/offers" className="font-semibold text-leaf-800 underline">All offers</Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {offers.map((o) => <OfferCard key={o._id} offer={o} />)}
          </div>
        </section>
      )}

      {fresh.length > 0 && (
        <section aria-labelledby="fresh">
          <div className="flex items-end justify-between gap-4">
            <h2 id="fresh" className="text-3xl font-bold">Fresh today</h2>
            <Link to="/shop?category=Vegetables" className="font-semibold text-leaf-800 underline">All vegetables</Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {fresh.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}

      <section aria-labelledby="soon">
        <h2 id="soon" className="text-3xl font-bold">Coming soon</h2>
        <p className="mt-1 text-muted">We are adding more services to GroDart.</p>
        <ul className="mt-5 flex flex-wrap gap-3">
          {SOON.map(([name, emoji]) => (
            <li key={name} className="flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 font-medium">
              <span aria-hidden="true">{emoji}</span>{name}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
