import { useState, useEffect } from "react";
import api from "../lib/api.js";
import ProductCard from "../components/AffiliateProductCard.jsx.jsx";

const categories = ["all", "books", "notes", "electronics", "laptops", "mobiles", "hostel", "furniture", "fashion", "sports", "calculators", "cycles", "gaming", "accessories", "others"];

export default function StudentEssentials() {
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/affiliate-products")
      .then((res) => setProducts(res.data.affiliateProducts || []))
      .catch((err) => console.error("Failed to load affiliate products:", err))
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    activeCategory === "all" ? products : products.filter((p) => p.category === activeCategory);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-slate-800 dark:text-white mb-1">
        🔥 Student Essentials
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        Hand-picked picks for hostel life, study sessions, and everything in between.
      </p>

      <div className="flex gap-2 flex-wrap mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition-colors ${
              activeCategory === cat
                ? "bg-primary-50 text-primary-600 dark:bg-white/10 dark:text-primary-400"
                : "text-slate-600 hover:text-primary-500 dark:text-slate-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-slate-500 dark:text-slate-400">Loading products...</p>
      ) : filtered.length === 0 ? (
        <p className="text-slate-500 dark:text-slate-400">No products yet — check back soon!</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

      <p className="text-xs text-slate-400 dark:text-slate-500 mt-8">
        As an Amazon Associate, CollegeKart earns from qualifying purchases.
      </p>
    </div>
  );
}