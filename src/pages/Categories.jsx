import { useState, useEffect } from 'react';
import CategoryCard from '../components/CategoryCard.jsx';
import { categories as staticCategories } from '../data/mockData.js';
import api from '../lib/api.js';

export default function Categories() {
  const [categories, setCategories] = useState(staticCategories);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products/category-counts')
      .then((res) => {
        const counts = res.data.counts || {};
        setCategories(
          staticCategories.map((c) => ({ ...c, count: counts[c.id] || 0 }))
        );
      })
      .catch(() => {
        // If the request fails, fall back to the static list (all zeros) rather than breaking the page.
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <span className="section-eyebrow">Everything on campus</span>
      <h1 className="mt-2 font-display text-2xl font-bold">All Categories</h1>
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {categories.map((c) => <CategoryCard key={c.id} category={c} />)}
      </div>
    </div>
  );
}