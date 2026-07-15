import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../lib/api.js";

export default function AffiliateProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api.get(`/affiliate-products/${id}`)
      .then((res) => setProduct(res.data.affiliateProduct))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="mx-auto max-w-3xl px-4 py-16 text-center text-slate-500 dark:text-slate-400">Loading...</div>;
  }

  if (notFound || !product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-slate-500 dark:text-slate-400">Product not found.</p>
        <Link to="/student-essentials" className="mt-4 inline-block text-primary-600 dark:text-primary-400 font-semibold">
          ← Back to Student Essentials
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link to="/student-essentials" className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary-500">
        ← Back to Student Essentials
      </Link>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-8">
        <img
          src={product.image}
          alt={product.title}
          className="w-full rounded-2xl object-cover aspect-square"
        />

        <div>
          <h1 className="font-display text-2xl font-bold text-slate-800 dark:text-white">
            {product.title}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            {"⭐".repeat(Math.round(product.rating))} <span className="ml-1">({product.rating} rating)</span>
          </p>
          <p className="text-primary-600 dark:text-primary-400 font-bold text-2xl mt-4">
            {product.price}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 capitalize">
            Category: {product.category}
          </p>

          <a
            href={product.affiliateLink}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="mt-6 block w-full text-center rounded-full bg-yellow-500 hover:bg-yellow-600 px-6 py-3 text-base font-bold text-black transition"
          >
            Buy on Amazon
          </a>

          <p className="text-xs text-slate-400 dark:text-slate-500 mt-4">
            As an Amazon Associate, CollegeKart earns from qualifying purchases.
          </p>
        </div>
      </div>
    </div>
  );
}