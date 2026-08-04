import { Link } from 'react-router-dom';
import * as Hi2 from 'react-icons/hi2';
import { motion } from 'framer-motion';

export default function CategoryCard({ category }) {
  const Icon = Hi2[category.icon] || Hi2.HiOutlineSquares2X2;
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Link to={`/browse?category=${category.id}`} className="glass-card flex flex-col items-center gap-3 p-5 text-center">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-gradient-soft text-primary-600 dark:text-primary-400">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-white">{category.name}</p>
          <p className="text-xs text-slate-400">{category.count} listings</p>
        </div>
      </Link>
    </motion.div>
  );
}
