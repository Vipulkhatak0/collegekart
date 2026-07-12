import CategoryCard from '../components/CategoryCard.jsx';
import { categories } from '../data/mockData.js';

export default function Categories() {
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
