import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiOutlineUsers, HiOutlineTag, HiOutlineExclamationTriangle } from 'react-icons/hi2';
import useAuth from '../context/AuthContext.jsx';
import api, { getErrorMessage } from '../lib/api.js';
import AffiliateProductsAdmin from "../components/AffiliateProductsAdmin.jsx";

export default function AdminPanel() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'admin') return;
    Promise.all([
      api.get('/users/admin/stats'),
      api.get('/products', { params: { sort: 'recent' } })
    ]).then(([statsRes, productsRes]) => {
      setStats(statsRes.data);
      setProducts(productsRes.data.products);
    }).catch((err) => toast.error(getErrorMessage(err))).finally(() => setLoading(false));
  }, [user]);

  if (user && user.role !== 'admin') return <Navigate to="/" replace />;

  const removeListing = async (id) => {
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      toast.success('Listing removed.');
    } catch (err) { toast.error(getErrorMessage(err)); }
  };

  const cards = stats ? [
    { label: 'Total Users', value: stats.userCount, icon: HiOutlineUsers },
    { label: 'Active Listings', value: stats.productCount, icon: HiOutlineTag },
    { label: 'Reported Listings', value: stats.reportedCount, icon: HiOutlineExclamationTriangle }
  ] : [];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <h1 className="font-display text-2xl font-bold">Admin Dashboard</h1>

      {loading && <p className="mt-6 text-sm text-slate-400">Loading...</p>}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((s) => (
          <div key={s.label} className="glass-card p-4">
            <s.icon className="h-5 w-5 text-primary-500" />
            <p className="mt-2 font-display text-lg font-bold">{s.value}</p>
            <p className="text-xs text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-bold">Listing Management</h2>
        <div className="glass-card mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/10 text-xs text-slate-400">
                <th className="p-3">Product</th>
                <th className="p-3">Seller</th>
                <th className="p-3">Price</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-b border-slate-50 dark:border-white/5">
                  <td className="p-3 font-medium">{p.title}</td>
                  <td className="p-3 text-slate-500 dark:text-slate-400">{p.seller?.name}</td>
                  <td className="p-3">₹{p.price?.toLocaleString()}</td>
                  <td className="p-3">
                    <span className="rounded-full bg-emerald-100 dark:bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      {p.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <button onClick={() => removeListing(p._id)} className="text-xs font-semibold text-red-500">
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-bold mb-4">Affiliate Products</h2>
        <div className="glass-card p-4">
          <AffiliateProductsAdmin />
        </div>
      </div>
    </div>
  );
}