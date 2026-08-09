import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import ProductCard from '../components/ProductCard.jsx';
import api, { getErrorMessage } from '../lib/api.js';

export default function Wishlist() {
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/users/wishlist').then(({ data }) => setSaved(data.wishlist)).catch((err) => toast.error(getErrorMessage(err))).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const toggleWishlist = async (productId) => {
    try {
      await api.post(`/users/wishlist/${productId}`);
      setSaved((prev) => prev.filter((p) => p._id !== productId));
    } catch (err) { toast.error(getErrorMessage(err)); }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <h1 className="font-display text-2xl font-bold">Your Wishlist</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{loading ? 'Loading...' : `${saved.length} item${saved.length === 1 ? '' : 's'} saved`}</p>
      <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {saved.map((p) => <ProductCard key={p._id} product={p} onToggleWishlist={toggleWishlist} isWishlisted />)}
        {!loading && saved.length === 0 && <p className="col-span-full py-16 text-center text-slate-400">Nothing saved yet — tap the heart on any listing to add it here.</p>}
      </div>
    </div>
  );
}
