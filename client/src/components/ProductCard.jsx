import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineHeart, HiCheckBadge, HiOutlineMapPin } from 'react-icons/hi2';
import { timeAgo, formatDistance } from '../lib/geo.js';

export default function ProductCard({ product, onToggleWishlist, isWishlisted }) {
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discount = hasDiscount ? Math.round(100 - (product.price / product.originalPrice) * 100) : 0;
  const locationLabel = formatDistance(product.distanceKm) || product.location?.address || product.seller?.hostel || '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35 }}
      className="id-notch glass-card group overflow-hidden"
    >
      <Link to={`/product/${product._id}`}>
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-card">
          <img src={product.images?.[0]} alt={product.title} className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${product.status && product.status !== 'active' ? 'grayscale opacity-70' : ''}`} />
          {product.status && product.status !== 'active' && (
            <span className="absolute left-3 top-3 rounded-full bg-slate-900/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">Sold</span>
          )}
          {product.isFeatured && product.status === 'active' && (
            <span className="absolute left-3 top-3 rounded-full bg-brand-gradient px-2.5 py-1 text-[10px] font-semibold text-white shadow">Featured</span>
          )}
          <button
            onClick={(e) => { e.preventDefault(); onToggleWishlist?.(product._id); }}
            aria-label="Save to wishlist"
            className={`absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/80 dark:bg-black/50 backdrop-blur transition-colors ${isWishlisted ? 'text-red-500' : 'text-slate-600 dark:text-white hover:text-red-500'}`}
          >
            <HiOutlineHeart className="h-4 w-4" fill={isWishlisted ? 'currentColor' : 'none'} />
          </button>
        </div>

        <div className="p-4">
          <h3 className="line-clamp-1 font-display text-sm font-semibold text-slate-800 dark:text-white">{product.title}</h3>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-lg font-bold text-primary-600 dark:text-primary-400">₹{product.price?.toLocaleString()}</span>
            {hasDiscount && (
              <>
                <span className="text-xs text-slate-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
                <span className="text-xs font-semibold text-success">{discount}% off</span>
              </>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1 truncate">
              <HiOutlineMapPin className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{locationLabel}</span>
            </span>
            <span className="shrink-0">{product.createdAt ? timeAgo(product.createdAt) : ''}</span>
          </div>

          <div className="mt-3 flex items-center gap-1.5 border-t border-slate-100 dark:border-white/10 pt-3">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{product.seller?.name}</span>
            {product.seller?.isSellerVerified && <HiCheckBadge className="h-3.5 w-3.5 text-primary-500" title="Verified seller" />}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
