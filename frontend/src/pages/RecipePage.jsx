import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api';
import RecipeKit from '../components/RecipeKit';

export default function RecipePage() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get(`/recipes/${id}`).then((r) => setRecipe(r.data.recipe)).catch(() => setError(true));
  }, [id]);

  if (error) return <p className="py-12 text-center text-muted">We couldn't find that recipe. <Link className="underline" to="/recipes">See all recipes</Link></p>;
  if (!recipe) return <p className="text-muted">Loading…</p>;

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/recipes" className="text-sm text-muted hover:text-ink">‹ All recipes</Link>
      <div className="my-4 flex items-center gap-4">
        <span className="text-6xl" aria-hidden="true">{recipe.emoji}</span>
        <p className="text-muted">{recipe.description}</p>
      </div>
      <RecipeKit recipe={recipe} />
    </div>
  );
}
