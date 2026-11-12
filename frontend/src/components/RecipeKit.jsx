import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { rupees } from '../api';

// Mirrors the server's scaling so the price shown here matches what lands in the cart
const scale = (qty, servings, base) => Math.max(1, Math.ceil((qty * servings) / base));

export default function RecipeKit({ recipe }) {
  const { user } = useAuth();
  const { addRecipe } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [servings, setServings] = useState(recipe.baseServings);
  const [have, setHave] = useState(() => new Set()); // ingredients the customer already owns
  const [busy, setBusy] = useState(false);

  const lines = useMemo(
    () =>
      recipe.ingredients
        .filter((i) => i.product)
        .map((i) => ({ product: i.product, qty: scale(i.quantity, servings, recipe.baseServings) })),
    [recipe, servings]
  );
  const picked = lines.filter((l) => !have.has(l.product._id));
  const total = picked.reduce((s, l) => s + l.product.price * l.qty, 0);

  const toggle = (id) =>
    setHave((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const submit = async () => {
    if (!user) return navigate('/login', { state: { from: location.pathname } });
    setBusy(true);
    const res = await addRecipe(recipe, servings, [...have]);
    setBusy(false);
    if (res) navigate('/cart');
  };

  return (
    <section className="kit-pop rounded-2xl border border-line bg-white p-5" aria-label={`${recipe.name} ingredient kit`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">{recipe.name}</h2>
          <p className="text-sm text-muted">{recipe.prepTime} min cooking</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-line px-1" role="group" aria-label="Servings">
          <button aria-label="Fewer servings" className="px-3 py-1 text-lg" disabled={servings <= 1} onClick={() => setServings(servings - 1)}>−</button>
          <span className="min-w-20 text-center text-sm font-medium">Serves {servings}</span>
          <button aria-label="More servings" className="px-3 py-1 text-lg" disabled={servings >= 12} onClick={() => setServings(servings + 1)}>+</button>
        </div>
      </div>

      <p className="mt-4 text-sm text-muted">Untick anything you already have at home.</p>
      <ul className="mt-2 divide-y divide-line">
        {lines.map(({ product, qty }) => {
          const owned = have.has(product._id);
          return (
            <li key={product._id}>
              <label className={`flex cursor-pointer items-center gap-3 py-2 ${owned ? 'opacity-50' : ''}`}>
                <input type="checkbox" className="h-4 w-4 accent-leaf-600" checked={!owned} onChange={() => toggle(product._id)} />
                <span className="text-xl" aria-hidden="true">{product.emoji}</span>
                <span className={`flex-1 ${owned ? 'line-through' : ''}`}>
                  {product.name} <span className="text-sm text-muted">{qty} × {product.unit}</span>
                </span>
                <span className="text-sm font-medium">{rupees(product.price * qty)}</span>
              </label>
            </li>
          );
        })}
      </ul>

      <button
        onClick={submit}
        disabled={busy || picked.length === 0}
        className="mt-4 w-full rounded-xl bg-leaf-900 px-4 py-3 font-semibold text-white hover:bg-leaf-800 disabled:opacity-50"
      >
        {picked.length === 0 ? 'Nothing selected' : `Add ${picked.length} items to cart · ${rupees(total)}`}
      </button>
    </section>
  );
}
