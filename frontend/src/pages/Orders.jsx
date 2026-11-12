import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg, rupees } from '../api';
import { useCart } from '../context/CartContext';

const LABEL = {
  placed: 'Order placed', confirmed: 'Confirmed', packed: 'Packed',
  out_for_delivery: 'Out for delivery', delivered: 'Delivered', cancelled: 'Cancelled',
};

export default function Orders() {
  const [orders, setOrders] = useState(null);
  const { notify } = useCart();

  const load = () => api.get('/orders').then((r) => setOrders(r.data.orders)).catch((e) => notify(errMsg(e), 'error'));
  useEffect(() => { load(); }, []);

  const cancel = async (id) => {
    try { await api.post(`/orders/${id}/cancel`); notify('Order cancelled'); load(); }
    catch (e) { notify(errMsg(e), 'error'); }
  };

  if (!orders) return <p className="text-muted">Loading…</p>;
  if (orders.length === 0) {
    return <p className="py-16 text-center text-muted">No orders yet. <Link className="underline" to="/recipes">Pick a recipe to start</Link></p>;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold">Your orders</h1>
      <ul className="mt-4 space-y-4">
        {orders.map((o) => (
          <li key={o._id} className="rounded-xl border border-line bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold">{new Date(o.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
              <span className={`rounded-full px-3 py-1 text-sm font-medium ${
                o.status === 'cancelled' ? 'bg-chili/10 text-chili' : o.status === 'delivered' ? 'bg-leaf-50 text-leaf-800' : 'bg-turmeric/25'}`}>
                {LABEL[o.status]}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted">{o.items.map((i) => `${i.name} × ${i.quantity}`).join(', ')}</p>
            {o.discount > 0 && <p className="mt-1 text-sm text-leaf-800">{o.couponCode} saved you {rupees(o.discount)}</p>}
            <div className="mt-3 flex items-center justify-between">
              <p className="font-bold">{rupees(o.total)} <span className="text-sm font-normal text-muted">· cash on delivery</span></p>
              {['placed', 'confirmed'].includes(o.status) && (
                <button onClick={() => cancel(o._id)} className="text-sm text-chili underline">Cancel order</button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
