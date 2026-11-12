import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { errMsg, rupees } from '../api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const field = 'mt-1 w-full rounded-lg border border-line bg-white px-3 py-2';
const EMPTY_ADDR = { label: 'Home', line1: '', area: '', pincode: '', landmark: '' };

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const { notify } = useCart();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({ name: user.name || '', email: user.email || '' });
  const [addr, setAddr] = useState(EMPTY_ADDR);
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get('/orders').then((r) => setOrders(r.data.orders)).catch(() => {});
  }, []);

  const placed = orders.filter((o) => o.status !== 'cancelled');
  const spent = placed.reduce((s, o) => s + o.total, 0);
  const since = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '';

  const saveDetails = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await api.patch('/auth/me', form);
      updateUser(r.data.user);
      notify('Profile saved');
    } catch (err) { notify(errMsg(err), 'error'); } finally { setBusy(false); }
  };

  const addAddress = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await api.post('/auth/me/addresses', addr);
      updateUser(r.data.user);
      setAddr(EMPTY_ADDR); setAdding(false);
      notify('Address saved');
    } catch (err) { notify(errMsg(err), 'error'); } finally { setBusy(false); }
  };

  const removeAddress = async (id) => {
    try {
      const r = await api.delete(`/auth/me/addresses/${id}`);
      updateUser(r.data.user);
      notify('Address removed');
    } catch (err) { notify(errMsg(err), 'error'); }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="flex flex-wrap items-center gap-4">
        <span aria-hidden="true" className="flex h-16 w-16 items-center justify-center rounded-full bg-leaf-900 font-display text-3xl font-bold text-white">
          {(user.name || user.phone).charAt(0).toUpperCase()}
        </span>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{user.name || 'Your profile'}</h1>
          <p className="text-muted">+91 {user.phone}{since && ` · Member since ${since}`}</p>
        </div>
        <button onClick={() => { logout(); navigate('/'); }} className="rounded-lg border border-line px-4 py-2 font-medium hover:bg-leaf-50">Log out</button>
      </header>

      <section aria-label="Your activity" className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-line bg-white p-4"><p className="text-2xl font-bold">{placed.length}</p><p className="text-sm text-muted">Orders</p></div>
        <div className="rounded-xl border border-line bg-white p-4"><p className="text-2xl font-bold">{rupees(spent)}</p><p className="text-sm text-muted">Spent so far</p></div>
        <Link to="/offers" className="rounded-xl bg-turmeric p-4 font-semibold text-ink hover:brightness-95">Offers for you<span className="mt-1 block text-sm font-normal">See codes to use</span></Link>
      </section>

      <form onSubmit={saveDetails} className="rounded-xl border border-line bg-white p-5">
        <h2 className="text-xl font-bold">Your details</h2>
        <label className="mt-3 block text-sm font-medium">Name
          <input className={field} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" /></label>
        <label className="mt-3 block text-sm font-medium">Email (optional)
          <input type="email" className={field} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" /></label>
        <p className="mt-3 text-sm text-muted">Your mobile number is your login, so it can't be changed here.</p>
        <button disabled={busy} className="mt-4 rounded-xl bg-leaf-900 px-5 py-2.5 font-semibold text-white hover:bg-leaf-800 disabled:opacity-50">Save details</button>
      </form>

      <section className="rounded-xl border border-line bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Saved addresses</h2>
          {!adding && user.addresses.length < 5 && (
            <button onClick={() => setAdding(true)} className="rounded-lg border border-leaf-600 px-3 py-1.5 text-sm font-semibold text-leaf-800 hover:bg-leaf-50">Add address</button>
          )}
        </div>
        {user.addresses.length === 0 && !adding && <p className="mt-3 text-muted">No saved addresses yet. Add one to check out faster.</p>}
        <ul className="mt-3 space-y-3">
          {user.addresses.map((a) => (
            <li key={a._id} className="flex items-start justify-between gap-3 rounded-lg bg-leaf-50 p-3">
              <div>
                <p className="font-semibold">{a.label}</p>
                <p className="text-sm">{a.line1}, {a.area} - {a.pincode}{a.landmark && `, near ${a.landmark}`}</p>
              </div>
              <button onClick={() => removeAddress(a._id)} className="text-sm text-chili underline">Remove</button>
            </li>
          ))}
        </ul>

        {adding && (
          <form onSubmit={addAddress} className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-medium">Label
              <input className={field} value={addr.label} onChange={(e) => setAddr({ ...addr, label: e.target.value })} placeholder="Home, Work" /></label>
            <label className="block text-sm font-medium">Pincode
              <input required inputMode="numeric" pattern="\d{6}" maxLength={6} className={field} value={addr.pincode} onChange={(e) => setAddr({ ...addr, pincode: e.target.value })} /></label>
            <label className="block text-sm font-medium sm:col-span-2">House / flat and street
              <input required className={field} value={addr.line1} onChange={(e) => setAddr({ ...addr, line1: e.target.value })} /></label>
            <label className="block text-sm font-medium">Area
              <input required className={field} value={addr.area} onChange={(e) => setAddr({ ...addr, area: e.target.value })} placeholder="e.g. MVP Colony" /></label>
            <label className="block text-sm font-medium">Landmark (optional)
              <input className={field} value={addr.landmark} onChange={(e) => setAddr({ ...addr, landmark: e.target.value })} /></label>
            <div className="flex gap-2 sm:col-span-2">
              <button disabled={busy} className="rounded-xl bg-leaf-900 px-5 py-2.5 font-semibold text-white hover:bg-leaf-800 disabled:opacity-50">Save address</button>
              <button type="button" onClick={() => setAdding(false)} className="rounded-xl px-4 py-2.5 font-medium text-muted hover:text-ink">Cancel</button>
            </div>
          </form>
        )}
      </section>

      <p><Link to="/orders" className="font-semibold text-leaf-800 underline">View all your orders</Link></p>
    </div>
  );
}
