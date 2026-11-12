import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import ProductCard from '../components/ProductCard';

const CATEGORIES = ['Vegetables', 'Fruits', 'Dairy', 'Staples', 'Spices', 'Meat', 'Water', 'Snacks'];

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const category = params.get('category') || '';
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState([]);
  const [state, setState] = useState('loading');

  useEffect(() => {
    setState('loading');
    const t = setTimeout(() => {
      api.get('/products', { params: { category: category || undefined, search: search || undefined } })
        .then((r) => { setProducts(r.data.products); setState('ready'); })
        .catch(() => setState('error'));
    }, 250); // debounce typing
    return () => clearTimeout(t);
  }, [category, search]);

  const chip = (active) => `rounded-full border px-4 py-1.5 text-sm font-medium ${active ? 'border-leaf-900 bg-leaf-900 text-white' : 'border-line bg-white hover:bg-leaf-50'}`;

  return (
    <div>
      <h1 className="text-3xl font-bold">Shop</h1>
      <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tomato, paneer, rice…"
        aria-label="Search products" className="mt-4 w-full rounded-xl border border-line bg-white px-4 py-3 sm:max-w-md" />
      <div className="mt-4 flex flex-wrap gap-2">
        <button className={chip(!category)} onClick={() => setParams({})}>All</button>
        {CATEGORIES.map((c) => <button key={c} className={chip(category === c)} onClick={() => setParams({ category: c })}>{c}</button>)}
      </div>

      {state === 'error' && <p className="mt-8 text-chili">We could not load products. Refresh to try again.</p>}
      {state === 'ready' && products.length === 0 && <p className="mt-8 text-muted">No products match "{search}". Try a shorter name.</p>}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => <ProductCard key={p._id} product={p} />)}
      </div>
    </div>
  );
}
