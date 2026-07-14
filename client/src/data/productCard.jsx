// src/components/ProductCard.jsx
export default function ProductCard({ product }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl p-4 shadow-sm hover:shadow-lg transition">
      <img
        src={product.image}
        alt={product.title}
        className="w-full h-44 object-cover rounded-xl"
      />
      <h3 className="mt-3 font-display font-semibold text-slate-800 dark:text-white line-clamp-2">
        {product.title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
        {"⭐".repeat(Math.round(product.rating))} <span className="ml-1">({product.rating})</span>
      </p>
      <p className="text-primary-600 dark:text-primary-400 font-bold mt-1">{product.price}</p>
      
      {/* Restored the missing opening 'a' tag here */}
      <a
        href={product.affiliateLink}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="mt-3 inline-block w-full text-center rounded-full bg-brand-gradient px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition"
      >
        Buy on Amazon
      </a>
    </div>
  );
}