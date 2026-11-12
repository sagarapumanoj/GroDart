import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import api, { errMsg, rupees } from '../api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const field = 'mt-1 w-full rounded-lg border border-line bg-white px-3 py-2';

export default function Checkout() {
  const { user, updateUser } = useAuth();
  const { cart, setCart, notify } = useCart();
  const navigate = useNavigate();
  const saved = user.addresses || [];
  const [choice, setChoice] = useState(saved[0]?._id || 'new');
  const [form, setForm] = useState({ line1: '', area: '', pincode: '', landmark: '' });
  const [saveIt, setSaveIt] = useState(true);
  const [offers, setOffers] = useState([]);
  const [code, setCode] = useState('');
  const [applied, setApplied] = useState(null); // { code, discount }
  const [couponMsg, setCouponMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { api.get('/offers').then((r) => setOffers(r.data.offers)).catch(() => {}); }, []);

  // If the cart changes, the discount may no longer be right: ask the server again
  useEffect(() => { if (applied) applyCode(applied.code, true); /* eslint-disable-next-line */ }, [cart.subtotal]);

  if (cart.items.length === 0) return <Navigate to="/cart" replace />;
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const total = cart.total - (applied?.discount || 0);

  async function applyCode(value, silent = false) {
    const c = (value || '').trim();
    if (!c) return;
    try {
      const r = await api.post('/offers/validate', { code: c });
      setApplied({ code: r.data.code, discount: r.data.discount });
      setCode(r.data.code);
      setCouponMsg(silent ? '' : `${r.data.code} applied. You save ${rupees(r.data.discount)}`);
    } catch (e) {
      setApplied(null);
      setCouponMsg(errMsg(e));
    }
  }

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    const chosen = choice === 'new' ? form : saved.find((a) => a._id === choice);
    const address = { line1: chosen.line1, area: chosen.area, pincode: chosen.pincode, landmark: chosen.landmark };
    try {
      await api.post('/orders', { address, paymentMethod: 'COD', couponCode: applied?.code });
      if (choice === 'new' && saveIt && saved.length < 5) {
        api.post('/auth/me/addresses', { label: 'Home', ...address }).then((r) => updateUser(r.data.user)).catch(() => {});
      }
      setCart({ ...cart, items: [], subtotal: 0, deliveryFee: 0, total: 0, itemCount: 0 });
      notify('Order placed. We are getting it ready');
      navigate('/orders');
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mx-auto grid max-w-3xl gap-8 md:grid-cols-[1fr_280px]">
      <section>
        <h1 className="text-3xl font-bold">Delivery address</h1>

        {saved.length > 0 && (
          <fieldset className="mt-4 space-y-2">
            <legend className="sr-only">Choose an address</legend>
            {saved.map((a) => (
              <label key={a._id} className="flex cursor-pointer items-start gap-3 rounded-lg border border-line bg-white p-3">
                <input type="radio" name="addr" className="mt-1 accent-leaf-600" checked={choice === a._id} onChange={() => setChoice(a._id)} />
                <span><strong>{a.label}</strong><br /><span className="text-sm">{a.line1}, {a.area} - {a.pincode}</span></span>
              </label>
            ))}
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-line bg-white p-3">
              <input type="radio" name="addr" className="accent-leaf-600" checked={choice === 'new'} onChange={() => setChoice('new')} />
              <span className="font-medium">Use a new address</span>
            </label>
          </fieldset>
        )}

        {choice === 'new' && (
          <div className="mt-4">
            <label className="block text-sm font-medium">House / flat and street
              <input required className={field} value={form.line1} onChange={set('line1')} autoComplete="address-line1" /></label>
            <label className="mt-3 block text-sm font-medium">Area
              <input required className={field} value={form.area} onChange={set('area')} placeholder="e.g. MVP Colony" /></label>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="block text-sm font-medium">Pincode
                <input required inputMode="numeric" pattern="\d{6}" maxLength={6} className={field} value={form.pincode} onChange={set('pincode')} /></label>
              <label className="block text-sm font-medium">Landmark (optional)
                <input className={field} value={form.landmark} onChange={set('landmark')} /></label>
            </div>
            {saved.length < 5 && (
              <label className="mt-3 flex items-center gap-2 text-sm">
                <input type="checkbox" className="accent-leaf-600" checked={saveIt} onChange={(e) => setSaveIt(e.target.checked)} /> Save this address to my profile
              </label>
            )}
          </div>
        )}

        <h2 className="mt-6 text-lg font-bold">Offer code</h2>
        <div className="mt-2 flex gap-2">
          <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Enter code" aria-label="Offer code"
            className="w-full rounded-lg border border-line bg-white px-3 py-2 font-mono uppercase" />
          <button type="button" onClick={() => applyCode(code)} className="rounded-lg border border-leaf-600 px-4 font-semibold text-leaf-800 hover:bg-leaf-50">Apply</button>
        </div>
        {couponMsg && <p role="status" className={`mt-2 text-sm ${applied ? 'text-leaf-800' : 'text-chili'}`}>{couponMsg}</p>}
        {!applied && offers.length > 0 && (
          <p className="mt-2 flex flex-wrap gap-2 text-sm">
            {offers.map((o) => (
              <button key={o._id} type="button" onClick={() => applyCode(o.code)} className="rounded-full border border-turmeric px-3 py-1 font-mono hover:bg-turmeric/20">{o.code}</button>
            ))}
          </p>
        )}

        <h2 className="mt-6 text-lg font-bold">Payment</h2>
        <p className="mt-1 rounded-lg border border-line bg-white p-3 text-sm">Cash on delivery. Online payment is coming soon.</p>
        {error && <p role="alert" className="mt-4 text-chili">{error}</p>}
      </section>

      <aside className="h-fit rounded-xl border border-line bg-white p-5">
        <dl className="space-y-1 text-sm">
          <div className="flex justify-between"><dt>{cart.itemCount} items</dt><dd>{rupees(cart.subtotal)}</dd></div>
          <div className="flex justify-between"><dt>Delivery</dt><dd>{cart.deliveryFee ? rupees(cart.deliveryFee) : 'Free'}</dd></div>
          {applied && <div className="flex justify-between text-leaf-800"><dt>{applied.code}</dt><dd>−{rupees(applied.discount)}</dd></div>}
        </dl>
        <p className="mt-3 border-t border-line pt-3 text-2xl font-bold">{rupees(total)}</p>
        <button disabled={busy} className="mt-4 w-full rounded-xl bg-leaf-900 py-3 font-semibold text-white hover:bg-leaf-800 disabled:opacity-50">
          {busy ? 'Placing order…' : 'Place order'}
        </button>
      </aside>
    </form>
  );
}
