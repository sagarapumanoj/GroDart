import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { rupees } from '../api';

export default function CartPage() {
  const { cart, setQuantity, removeItem, clear } = useCart();
  const navigate = useNavigate();

  if (cart.items.length === 0) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-muted">Start with a recipe and we'll add the ingredients for you.</p>
        <Link to="/recipes" className="mt-5 inline-block rounded-xl bg-leaf-900 px-5 py-3 font-semibold text-white">Pick a recipe</Link>
      </div>
    );
  }

  const toFree = cart.freeDeliveryAbove - cart.subtotal;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <section>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Your cart</h1>
          <button onClick={clear} className="text-sm text-muted underline hover:text-ink">Empty cart</button>
        </div>
        <ul className="mt-4 divide-y divide-line rounded-xl border border-line bg-white">
          {cart.items.map(({ product, quantity }) => (
            <li key={product._id} className="flex items-center gap-3 p-3">
              <span className="text-3xl" aria-hidden="true">{product.emoji}</span>
              <div className="flex-1">
                <p className="font-semibold">{product.name}</p>
                <p className="text-sm text-muted">{product.unit} · {rupees(product.price)}</p>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-line">
                <button aria-label={`Remove one ${product.name}`} className="px-3 py-1" onClick={() => setQuantity(product._id, quantity - 1)}>−</button>
                <span className="min-w-4 text-center">{quantity}</span>
                <button aria-label={`Add one ${product.name}`} className="px-3 py-1" onClick={() => setQuantity(product._id, quantity + 1)}>+</button>
              </div>
              <span className="w-16 text-right font-semibold">{rupees(product.price * quantity)}</span>
              <button aria-label={`Remove ${product.name}`} className="px-2 text-muted hover:text-chili" onClick={() => removeItem(product._id)}>✕</button>
            </li>
          ))}
        </ul>
      </section>

      <aside className="h-fit rounded-xl border border-line bg-white p-5">
        <h2 className="text-xl font-bold">Bill</h2>
        <dl className="mt-3 space-y-2">
          <div className="flex justify-between"><dt>Items</dt><dd>{rupees(cart.subtotal)}</dd></div>
          <div className="flex justify-between"><dt>Delivery</dt><dd>{cart.deliveryFee ? rupees(cart.deliveryFee) : 'Free'}</dd></div>
          <div className="flex justify-between border-t border-line pt-2 text-lg font-bold"><dt>Total</dt><dd>{rupees(cart.total)}</dd></div>
        </dl>
        {toFree > 0 && <p className="mt-3 text-sm text-muted">Add {rupees(toFree)} more for free delivery.</p>}
        <button onClick={() => navigate('/checkout')} className="mt-4 w-full rounded-xl bg-leaf-900 py-3 font-semibold text-white hover:bg-leaf-800">
          Checkout
        </button>
      </aside>
    </div>
  );
}
