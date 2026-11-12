import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { rupees } from '../api';

export default function ProductCard({ product }) {
  const { user } = useAuth();
  const { cart, addProduct, setQuantity } = useCart();
  const navigate = useNavigate();
  const line = cart.items.find((i) => i.product._id === product._id);
  const out = product.stock < 1;

  const add = () => (user ? addProduct(product) : navigate('/login', { state: { from: '/shop' } }));

  return (
    <article className="flex flex-col rounded-xl border border-line bg-white p-4">
      <div className="mb-3 flex h-24 items-center justify-center rounded-lg bg-leaf-50 text-5xl" aria-hidden="true">{product.emoji}</div>
      <h3 className="font-semibold leading-tight">{product.name}</h3>
      <p className="text-sm text-muted">{product.unit}</p>
      <div className="mt-3 flex items-center justify-between">
        <span className="font-display text-lg font-bold">{rupees(product.price)}</span>
        {out ? (
          <span className="text-sm font-medium text-chili">Out of stock</span>
        ) : line ? (
          <div className="flex items-center gap-2 rounded-lg bg-leaf-900 px-1 text-white">
            <button aria-label={`Remove one ${product.name}`} className="px-2 py-1 text-lg" onClick={() => setQuantity(product._id, line.quantity - 1)}>−</button>
            <span className="min-w-4 text-center font-semibold">{line.quantity}</span>
            <button aria-label={`Add one ${product.name}`} className="px-2 py-1 text-lg" onClick={() => setQuantity(product._id, line.quantity + 1)}>+</button>
          </div>
        ) : (
          <button onClick={add} className="rounded-lg border-2 border-leaf-600 px-4 py-1 font-semibold text-leaf-800 hover:bg-leaf-50">Add</button>
        )}
      </div>
    </article>
  );
}
