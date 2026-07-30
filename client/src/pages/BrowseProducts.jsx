import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiOutlineAdjustmentsHorizontal, HiOutlineMapPin } from 'react-icons/hi2';
import ProductCard from '../components/ProductCard.jsx';
import NoteCard from '../components/NoteCard.jsx';
import GigCard from '../components/GigCard.jsx';
import ServiceRequestCard from '../components/ServiceRequestCard.jsx';
import AdUnit from '../components/AdUnit.jsx';
import { categories } from '../data/mockData.js';
import api, { getErrorMessage } from '../lib/api.js';
import useAuth from '../context/AuthContext.jsx';
import { getCurrentPosition } from '../lib/geo.js';

export default function BrowseProducts() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || 'all';
  const search = searchParams.get('search') || '';

  const [sort, setSort] = useState('recent');
  const [products, setProducts] = useState([]);
  const [notes, setNotes] = useState([]);
  const [gigs, setGigs] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nearMe, setNearMe] = useState(false);
  const [coords, setCoords] = useState(null);
  const [wishlist, setWishlist] = useState([]);

  const showEverything = activeCategory === 'all' && !nearMe;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { category: activeCategory, search: search || undefined, sort };
      if (nearMe && coords) { params.lat = coords.lat; params.lng = coords.lng; params.radiusKm = 15; }

      if (showEverything) {
        const [productsRes, notesRes, gigsRes, requestsRes] = await Promise.all([
          api.get('/products', { params }),
          api.get('/notes', { params: { search: search || undefined } }),
          api.get('/gigs', { params: { search: search || undefined } }),
          api.get('/service-requests', { params: { search: search || undefined } })
        ]);
        setProducts(productsRes.data.products);
        setNotes(notesRes.data.notes || []);
        setGigs(gigsRes.data.gigs || []);
        setRequests(requestsRes.data.requests || []);
      } else {
        // A specific category or Near Me is active — only products apply here.
        const { data } = await api.get('/products', { params });
        setProducts(data.products);
        setNotes([]);
        setGigs([]);
        setRequests([]);
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [activeCategory, search, sort, nearMe, coords, showEverything]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    if (!user) { setWishlist([]); return; }
    api.get('/users/wishlist').then(({ data }) => setWishlist(data.wishlist.map((p) => p._id))).catch(() => {});
  }, [user]);

  const handleNearMe = async () => {
    if (nearMe) { setNearMe(false); return; }
    try {
      const pos = await getCurrentPosition();
      setCoords(pos);
      setNearMe(true);
      setSort('nearby');
    } catch {
      toast.error('Could not access your location. Please allow location permission.');
    }
  };

  const toggleWishlist = async (productId) => {
    if (!user) return toast.error('Please login to save items to your wishlist.');
    try {
      const { data } = await api.post(`/users/wishlist/${productId}`);
      setWishlist(data.wishlist);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const totalCount = products.length + notes.length + gigs.length + requests.length;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <h1 className="font-display text-2xl font-bold">Browse</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {loading
          ? 'Loading listings...'
          : `${totalCount} listing${totalCount === 1 ? '' : 's'}${nearMe ? ' near you' : ' available'}`}
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <button onClick={() => setSearchParams((p) => { p.delete('category'); return p; })} className={`rounded-full px-4 py-2 text-xs font-semibold ${activeCategory === 'all' ? 'bg-brand-gradient text-white' : 'glass-card !shadow-none'}`}>All</button>
        {categories.map((c) => (
          <button key={c.id} onClick={() => setSearchParams((p) => { p.set('category', c.id); return p; })} className={`rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap ${activeCategory === c.id ? 'bg-brand-gradient text-white' : 'glass-card !shadow-none'}`}>
            {c.name}
          </button>
        ))}
      </div>

      {activeCategory !== 'all' && (
        <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
          Showing marketplace listings only for this category. Select "All" to also see Library, Gigs, and Service Requests.
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400"><HiOutlineAdjustmentsHorizontal className="h-4 w-4" /> Filters</span>
          <button
            onClick={handleNearMe}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${nearMe ? 'bg-brand-gradient text-white' : 'glass-card !shadow-none text-slate-600 dark:text-slate-300'}`}
          >
            <HiOutlineMapPin className="h-3.5 w-3.5" /> Near Me
          </button>
        </div>
        <select value={sort} onChange={(e) => { setSort(e.target.value); if (e.target.value !== 'nearby') setNearMe(false); }} className="input-field !w-auto !py-2 text-xs">
          <option value="recent">Most Recent</option>
          <option value="low">Price: Low to High</option>
          <option value="high">Price: High to Low</option>
          {coords && <option value="nearby">Nearest First</option>}
        </select>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={`product-${p._id}`} product={p} onToggleWishlist={toggleWishlist} isWishlisted={wishlist.includes(p._id)} />
        ))}
        {notes.map((n) => (
          <NoteCard key={`note-${n._id}`} note={n} />
        ))}
        {gigs.map((g) => (
          <GigCard key={`gig-${g._id}`} gig={g} />
        ))}
        {requests.map((r) => (
          <ServiceRequestCard key={`request-${r._id}`} request={r} />
        ))}
        {!loading && totalCount === 0 && <p className="col-span-full py-16 text-center text-slate-400">No listings found — check back soon.</p>}
      </div>

      {!loading && totalCount > 0 && (
        <div className="mt-10">
          <AdUnit slot="5638179916" />
        </div>
      )}
    </div>
  );
}