import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  HiOutlineHeart, HiCheckBadge, HiOutlineMapPin, HiOutlineShare,
  HiOutlineFlag, HiOutlineChatBubbleLeftRight, HiStar, HiOutlinePhone
} from 'react-icons/hi2';
import ProductCard from '../components/ProductCard.jsx';
import api, { getErrorMessage } from '../lib/api.js';
import useAuth from '../context/AuthContext.jsx';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offer, setOffer] = useState('');
  const [showPhone, setShowPhone] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [buying, setBuying] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    setLoading(true);
    setShowPhone(false);
    setActiveImage(0);
    api.get(`/products/${id}`)
      .then(({ data }) => {
        setProduct(data.product);
        return api.get('/products', { params: { category: data.product.category } });
      })
      .then(({ data }) => setRelated(data.products.filter((p) => p._id !== id).slice(0, 4)))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!user) return;
    api.get('/users/wishlist').then(({ data }) => setWishlisted(data.wishlist.some((p) => p._id === id))).catch(() => {});
  }, [user, id]);

  if (loading) {
    return <div className="flex min-h-[50vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" /></div>;
  }
  if (!product) return <div className="mx-auto max-w-3xl px-4 py-16 text-center text-slate-400">Listing not found.</div>;

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discount = hasDiscount ? Math.round(100 - (product.price / product.originalPrice) * 100) : 0;
  const isOwner = user && (user.id === product.seller?._id || user._id === product.seller?._id);
  const isSold = product.status !== 'active';

  const requireLogin = (action) => {
    if (!user) { toast.error('Please login to continue.'); navigate('/login', { state: { from: { pathname: `/product/${id}` } } }); return false; }
    return action();
  };

  const toggleWishlist = () => requireLogin(async () => {
    try {
      const { data } = await api.post(`/users/wishlist/${id}`);
      setWishlisted(data.wishlist.includes(id));
    } catch (err) { toast.error(getErrorMessage(err)); }
  });

  const goToChat = () => requireLogin(() => {
    navigate(`/chat?with=${product.seller._id}&product=${product._id}`);
  });

  const sendOffer = () => requireLogin(async () => {
    if (!offer) return;
    try {
      await api.post('/messages', {
        receiverId: product.seller._id, productId: product._id,
        text: `I'd like to offer ₹${offer} for "${product.title}".`, isOffer: true, offerAmount: Number(offer)
      });
      toast.success('Offer sent to seller!');
      setOffer('');
      navigate(`/chat?with=${product.seller._id}&product=${product._id}`);
    } catch (err) { toast.error(getErrorMessage(err)); }
  });

  const buyNow = () => requireLogin(async () => {
    setBuying(true);
    try {
      // Re-check availability right before buying — someone else may have bought it
      // in the meantime since this page was first loaded.
      const { data: fresh } = await api.get(`/products/${product._id}`);
      if (fresh.product.status !== 'active') {
        setProduct(fresh.product);
        toast.error('Sorry, this item is no longer available.');
        return;
      }
      await api.post('/orders', { productId: product._id, paymentMethod: 'cod' });
      toast.success('Order placed! Coordinate pickup with the seller via chat.');
      navigate('/orders');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBuying(false);
    }
  });

  const report = async () => {
    try {
      await api.post(`/products/${id}/report`);
      toast('Listing reported. Our team will review it.');
    } catch (err) { toast.error(getErrorMessage(err)); }
  };

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) { navigator.share({ title: product.title, url }).catch(() => {}); }
    else { await navigator.clipboard.writeText(url); toast.success('Link copied to clipboard!'); }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="glass-card overflow-hidden relative">
            <img src={product.images?.[activeImage]} alt={product.title} className={`aspect-square w-full object-cover ${isSold ? 'grayscale opacity-70' : ''}`} />
            {isSold && (
              <span className="absolute left-4 top-4 rounded-full bg-slate-900/85 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white">
                {product.status === 'sold' ? 'Sold' : 'Unavailable'}
              </span>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImage(i)} className={`shrink-0 overflow-hidden rounded-lg border-2 ${i === activeImage ? 'border-primary-500' : 'border-transparent'}`}>
                  <img src={img} alt="" className="h-16 w-16 object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-start justify-between gap-4">
            <h1 className="font-display text-2xl font-bold">{product.title}</h1>
            <div className="flex gap-2 shrink-0">
              <button onClick={toggleWishlist} className={`rounded-full border border-slate-200 dark:border-white/10 p-2.5 ${wishlisted ? 'text-red-500' : 'text-slate-500 hover:text-red-500'}`}>
                <HiOutlineHeart className="h-5 w-5" fill={wishlisted ? 'currentColor' : 'none'} />
              </button>
              <button onClick={share} className="rounded-full border border-slate-200 dark:border-white/10 p-2.5 text-slate-500"><HiOutlineShare className="h-5 w-5" /></button>
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-3">
            <span className="font-display text-3xl font-bold text-primary-600 dark:text-primary-400">₹{product.price?.toLocaleString()}</span>
            {hasDiscount && (
              <>
                <span className="text-slate-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
                <span className="text-sm font-semibold text-success">{discount}% off</span>
              </>
            )}
          </div>

          <span className="mt-3 inline-block rounded-full bg-brand-gradient-soft px-3 py-1 text-xs font-semibold text-primary-600 dark:text-primary-400">{product.condition}</span>

          <div className="glass-card mt-6 flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-brand-gradient font-display text-sm font-bold text-white">
                {product.seller?.avatar ? <img src={product.seller.avatar} className="h-10 w-10 rounded-full object-cover" alt="" /> : product.seller?.name?.charAt(0)}
              </div>
              <div>
                <p className="flex items-center gap-1 text-sm font-semibold">{product.seller?.name} {product.seller?.isSellerVerified && <HiCheckBadge className="h-4 w-4 text-primary-500" />}</p>
                <p className="flex items-center gap-1 text-xs text-slate-400"><HiStar className="h-3.5 w-3.5 text-amber-400" /> {product.seller?.sellerRating || 'New'} · <HiOutlineMapPin className="h-3.5 w-3.5" /> {product.location?.address}</p>
              </div>
            </div>
            {!isOwner && <button onClick={goToChat} className="btn-secondary !px-4 !py-2 text-xs">Chat <HiOutlineChatBubbleLeftRight className="h-4 w-4" /></button>}
          </div>

          {!isOwner && (
            <button
              onClick={() => requireLogin(() => setShowPhone(true))}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-primary-200 dark:border-primary-500/30 py-3 text-sm font-semibold text-primary-600 dark:text-primary-400"
            >
              <HiOutlinePhone className="h-4 w-4" /> {showPhone ? product.phone : 'Show contact number'}
            </button>
          )}

          {!isOwner && !isSold && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold">Make an offer</h3>
              <div className="mt-2 flex gap-2">
                <input value={offer} onChange={(e) => setOffer(e.target.value)} type="number" placeholder={`e.g. ₹${Math.round(product.price * 0.9)}`} className="input-field" />
                <button onClick={sendOffer} className="btn-primary !px-5 whitespace-nowrap">Send Offer</button>
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            {!isOwner ? (
              <>
                <button onClick={buyNow} disabled={buying || isSold} className="btn-primary flex-1 disabled:opacity-60 disabled:cursor-not-allowed">
                  {isSold ? 'No Longer Available' : buying ? 'Placing order...' : 'Buy Now (COD)'}
                </button>
                {!isSold && (
                  <button onClick={report} className="flex items-center gap-1.5 rounded-full px-4 py-3 text-xs text-slate-400 hover:text-red-500">
                    <HiOutlineFlag className="h-4 w-4" /> Report
                  </button>
                )}
              </>
            ) : (
              <span className="rounded-full bg-brand-gradient-soft px-4 py-2.5 text-xs font-semibold text-primary-600 dark:text-primary-400">This is your listing</span>
            )}
          </div>

          <div className="mt-8">
            <h3 className="text-sm font-semibold">Description</h3>
            <p className="mt-2 whitespace-pre-line text-sm text-slate-500 dark:text-slate-400">{product.description}</p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="text-xl font-bold">You may also like</h2>
          <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
