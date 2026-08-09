import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-slate-100 dark:border-white/10 bg-white/60 dark:bg-surface-dark/60 mt-20">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 grid grid-cols-2 gap-8 md:grid-cols-5">
        <div className="col-span-2">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-gradient font-display text-sm font-bold text-white">C</span>
            <span className="font-display text-base font-bold">CollegeKart</span>
          </div>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 max-w-xs">Buy. Sell. Save. Campus to Campus. The trusted marketplace built by students, for students.</p>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Marketplace</h4>
          <div className="mt-3 flex flex-col gap-2 text-sm text-slate-600 dark:text-slate-300">
            <Link to="/browse">Browse Products</Link>
            <Link to="/categories">Categories</Link>
            <Link to="/sell">Sell Product</Link>
          </div>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Company</h4>
          <div className="mt-3 flex flex-col gap-2 text-sm text-slate-600 dark:text-slate-300">
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/help">Help Center</Link>
          </div>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Account</h4>
          <div className="mt-3 flex flex-col gap-2 text-sm text-slate-600 dark:text-slate-300">
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/wishlist">Wishlist</Link>
            <Link to="/orders">Orders</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-100 dark:border-white/10 py-5 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} CollegeKart. Built for students, by students.
      </div>
    </footer>
  );
}
