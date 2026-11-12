import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { rupees } from '../api';

export default function Recipes() {
  const [recipes, setRecipes] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get('/recipes').then((r) => setRecipes(r.data.recipes)).catch(() => setError(true));
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold">Recipes</h1>
      <p className="mt-1 text-muted">Tap a dish to get every ingredient in one go.</p>
      {error && <p className="mt-6 text-chili">We could not load recipes. Refresh to try again.</p>}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recipes?.map((r) => {
          const price = r.ingredients.reduce((s, i) => s + (i.product ? i.product.price * i.quantity : 0), 0);
          return (
            <Link key={r._id} to={`/recipes/${r._id}`} className="rounded-2xl border border-line bg-white p-5 hover:border-leaf-600">
              <div className="mb-3 flex h-28 items-center justify-center rounded-xl bg-leaf-50 text-6xl" aria-hidden="true">{r.emoji}</div>
              <h2 className="text-xl font-bold">{r.name}</h2>
              <p className="mt-1 text-sm text-muted">{r.description}</p>
              <p className="mt-3 text-sm font-medium">{r.ingredients.length} ingredients · {r.prepTime} min · from {rupees(price)} for {r.baseServings}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
