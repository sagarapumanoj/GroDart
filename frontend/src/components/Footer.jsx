import { Link } from 'react-router-dom';

const SOCIAL = [
  ['Facebook', 'https://www.facebook.com/share/1GNLAZYsnm/'],
  ['Instagram', 'https://www.instagram.com/gro_dart'],
  ['X', 'https://x.com/GDart73752'],
  ['LinkedIn', 'https://linkedin.com/in/Gro-Dart'],
  ['YouTube', 'https://youtube.com/@GroDart-g1n'],
];

const col = 'mb-3 font-display text-base font-bold text-white';
const a = 'text-leaf-50/80 hover:text-white hover:underline';

export default function Footer() {
  return (
    <footer className="mt-16 bg-leaf-900 text-leaf-50">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-2xl font-extrabold text-white">GroDart<span className="text-turmeric">.</span></p>
          <p className="mt-2 max-w-xs text-sm text-leaf-50/80">
            Groceries, fresh vegetables, drinking water and recipe-based ingredient kits, delivered in Visakhapatnam.
          </p>
          <p className="mt-3 text-sm">
            <a className={a} href="mailto:dartgro@gmail.com">dartgro@gmail.com</a>
          </p>
        </div>

        <nav aria-label="Shop links">
          <h2 className={col}>Shop</h2>
          <ul className="space-y-2 text-sm">
            <li><Link className={a} to="/shop">All products</Link></li>
            <li><Link className={a} to="/recipes">Recipe kits</Link></li>
            <li><Link className={a} to="/offers">Offers for you</Link></li>
            <li><Link className={a} to="/cart">Cart</Link></li>
          </ul>
        </nav>

        <nav aria-label="Account and help links">
          <h2 className={col}>Your account</h2>
          <ul className="space-y-2 text-sm">
            <li><Link className={a} to="/profile">My profile</Link></li>
            <li><Link className={a} to="/orders">My orders</Link></li>
            <li><Link className={a} to="/help">Help and support</Link></li>
            <li><Link className={a} to="/about">About GroDart</Link></li>
          </ul>
        </nav>

        <div>
          <h2 className={col}>Follow us</h2>
          <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {SOCIAL.map(([name, url]) => (
              <li key={name}><a className={a} href={url} target="_blank" rel="noopener noreferrer">{name}</a></li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-sm text-leaf-50/70">
          <p>© {new Date().getFullYear()} GroDart. All rights reserved.</p>
          <p className="flex gap-4">
            <Link className={a} to="/privacy">Privacy policy</Link>
            <Link className={a} to="/terms">Terms of service</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
