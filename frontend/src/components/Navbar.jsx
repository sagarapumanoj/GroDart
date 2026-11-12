import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const link = ({ isActive }) =>
  `px-3 py-2 rounded-lg font-medium ${isActive ? 'bg-leaf-50 text-leaf-900' : 'text-muted hover:text-ink'}`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-paper/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-2 gap-y-1 px-4 py-3" aria-label="Main">
        <Link to="/" className="mr-3 font-display text-2xl font-extrabold text-leaf-900">
          GroDart<span className="text-turmeric">.</span>
        </Link>
        <NavLink to="/recipes" className={link}>Recipes</NavLink>
        <NavLink to="/shop" className={link}>Shop</NavLink>
        <NavLink to="/offers" className={link}>Offers</NavLink>
        {user && <NavLink to="/orders" className={link}>Orders</NavLink>}

        <div className="ml-auto flex items-center gap-2">
          <Link to="/cart" className="relative rounded-lg bg-leaf-900 px-4 py-2 font-semibold text-white hover:bg-leaf-800">
            Cart
            {cart.itemCount > 0 && (
              <span className="ml-2 rounded-full bg-turmeric px-2 py-0.5 text-xs font-bold text-ink">{cart.itemCount}</span>
            )}
          </Link>
          {user ? (
            <NavLink to="/profile" className={link}>{user.name ? user.name.split(' ')[0] : 'Profile'}</NavLink>
          ) : (
            <Link to="/login" className="rounded-lg border border-line px-3 py-2 font-medium hover:bg-leaf-50">Log in</Link>
          )}
        </div>
      </nav>
    </header>
  );
}
