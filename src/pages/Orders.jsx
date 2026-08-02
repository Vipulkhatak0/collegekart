import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../lib/api.js';

const statusColor = {
  Pending: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  Confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  Completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  Cancelled: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/me').then(({ data }) => setOrders(data.orders)).catch((err) => toast.error(getErrorMessage(err))).finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
      <h1 className="font-display text-2xl font-bold">Your Orders</h1>
      <div className="mt-8 space-y-4">
        {loading && <p className="text-sm text-slate-400">Loading...</p>}
        {!loading && orders.length === 0 && <p className="text-sm text-slate-400">No orders yet. Once you buy something, it'll show up here.</p>}
        {orders.map((o) => (
          <div key={o._id} className="glass-card flex flex-col sm:flex-row sm:items-center gap-4 p-4">
            <img src={o.product?.images?.[0]} alt={o.product?.title} className="h-20 w-20 rounded-xl object-cover" />
            <div className="flex-1">
              <p className="text-xs text-slate-400">#{o._id.slice(-8).toUpperCase()}</p>
              <p className="font-semibold">{o.product?.title}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">₹{o.price?.toLocaleString()} · {o.paymentMethod?.toUpperCase()}</p>
            </div>
            <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${statusColor[o.status] || ''}`}>{o.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
