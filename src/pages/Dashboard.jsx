import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiOutlineTag, HiOutlineShoppingBag, HiOutlineStar, HiOutlineTrash } from 'react-icons/hi2';
import useAuth from '../context/AuthContext.jsx';
import api, { getErrorMessage } from '../lib/api.js';

export default function Dashboard() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/products/mine/list').then(({ data }) => setListings(data.products)).catch((err) => toast.error(getErrorMessage(err))).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const removeListing = async (id) => {
    try {
      await api.delete(`/products/${id}`);
      setListings((prev) => prev.filter((p) => p._id !== id));
      toast.success('Listing removed.');
    } catch (err) { toast.error(getErrorMessage(err)); }
  };

  const active = listings.filter((p) => p.status === 'active');
  const sold = listings.filter((p) => p.status === 'sold');

  const stats = [
    { label: 'Active Listings', value: active.length, icon: HiOutlineTag },
    { label: 'Items Sold', value: sold.length, icon: HiOutlineShoppingBag },
    { label: 'Seller Rating', value: user?.sellerRating || 'New', icon: HiOutlineStar }
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <div className="flex items-center gap-4">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-brand-gradient font-display text-xl font-bold text-white overflow-hidden">
          {user?.avatar ? <img src={user.avatar} className="h-14 w-14 object-cover" alt="" /> : user?.name?.charAt(0)}
        </div>
        <div>
          <h1 className="font-display text-xl font-bold">Welcome back, {user?.name?.split(' ')[0]}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
        </div>
        <Link to="/sell" className="btn-primary ml-auto hidden sm:inline-flex">+ New Listing</Link>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="glass-card p-4">
            <s.icon className="h-5 w-5 text-primary-500" />
            <p className="mt-2 font-display text-xl font-bold">{s.value}</p>
            <p className="text-xs text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-bold">Your Listings</h2>
        {loading && <p className="mt-4 text-sm text-slate-400">Loading...</p>}
        {!loading && listings.length === 0 && <p className="mt-4 text-sm text-slate-400">You haven't listed anything yet. <Link to="/sell" className="font-semibold text-primary-500">Sell your first item</Link>.</p>}
        <div className="mt-4 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {listings.map((p) => (
            <div key={p._id} className="glass-card overflow-hidden">
              <Link to={`/product/${p._id}`}>
                <img src={p.images?.[0]} alt={p.title} className="aspect-[4/3] w-full object-cover" />
              </Link>
              <div className="p-3">
                <p className="line-clamp-1 text-sm font-semibold">{p.title}</p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-sm font-bold text-primary-600 dark:text-primary-400">₹{p.price?.toLocaleString()}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${p.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-white/10'}`}>{p.status}</span>
                </div>
                <button onClick={() => removeListing(p._id)} className="mt-2 flex items-center gap-1 text-xs text-red-500 hover:underline"><HiOutlineTrash className="h-3.5 w-3.5" /> Remove</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
