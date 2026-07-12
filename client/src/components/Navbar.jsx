import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineMagnifyingGlass, HiOutlineHeart, HiOutlineBell, HiOutlineChatBubbleLeftRight,
  HiOutlineSun, HiOutlineMoon, HiOutlineBars3, HiOutlineXMark, HiOutlineUserCircle, HiOutlineArrowRightOnRectangle
} from 'react-icons/hi2';
import useTheme from '../context/ThemeContext.jsx';
import useAuth from '../context/AuthContext.jsx';

const navLinks = [
  { to: '/browse', label: 'Browse' },
  { to: '/categories', label: 'Categories' },
  { to: '/sell', label: 'Sell' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' }
];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(search.trim() ? `/browse?search=${encodeURIComponent(search.trim())}` : '/browse');
    setSearch('');
  };

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/40 dark:border-white/10 bg-white/70 dark:bg-surface-dark/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-gradient font-display text-lg font-bold text-white">C</span>
          <span className="font-display text-lg font-bold text-slate-800 dark:text-white">CollegeKart</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-600 dark:bg-white/10 dark:text-primary-400'
                    : 'text-slate-600 hover:text-primary-500 dark:text-slate-300'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-sm items-center gap-2 rounded-full border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 px-4 py-2">
          <HiOutlineMagnifyingGlass className="h-4 w-4 text-slate-400" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for books, laptops, notes..." className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </form>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button onClick={toggleTheme} aria-label="Toggle theme" className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10">
            {theme === 'dark' ? <HiOutlineSun className="h-5 w-5" /> : <HiOutlineMoon className="h-5 w-5" />}
          </button>
          <Link to="/wishlist" className="hidden sm:inline-flex rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10">
            <HiOutlineHeart className="h-5 w-5" />
          </Link>
          <Link to="/chat" className="hidden sm:inline-flex rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10">
            <HiOutlineChatBubbleLeftRight className="h-5 w-5" />
          </Link>
          <Link to="/notifications" className="hidden sm:inline-flex rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10">
            <HiOutlineBell className="h-5 w-5" />
          </Link>

          {user ? (
            <div className="relative">
              <button onClick={() => setMenuOpen((v) => !v)} className="flex items-center gap-1 rounded-full p-1 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="h-7 w-7 rounded-full object-cover" />
                ) : (
                  <HiOutlineUserCircle className="h-7 w-7" />
                )}
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                    className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-100 dark:border-white/10 bg-white dark:bg-surface-darkCard p-1.5 shadow-xl"
                  >
                    <p className="truncate px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400">{user.name}</p>
                    <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-white/5">Dashboard</Link>
                    <Link to="/profile" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-white/5">Profile</Link>
                    <Link to="/orders" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-white/5">Orders</Link>
                    {user.role === 'admin' && <Link to="/admin" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-white/5">Admin Panel</Link>}
                    <button onClick={handleLogout} className="flex w-full items-center gap-1.5 rounded-lg px-3 py-2 text-left text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">
                      <HiOutlineArrowRightOnRectangle className="h-4 w-4" /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/login" className="btn-primary !px-4 !py-2 text-xs">Login</Link>
          )}

          <button onClick={() => setOpen(true)} className="lg:hidden rounded-full p-2 text-slate-600 dark:text-slate-200">
            <HiOutlineBars3 className="h-6 w-6" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.25 }}
            className="fixed inset-y-0 right-0 z-50 w-72 bg-white dark:bg-surface-darkCard shadow-2xl lg:hidden"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 p-4">
              <span className="font-display font-bold">Menu</span>
              <button onClick={() => setOpen(false)}><HiOutlineXMark className="h-6 w-6" /></button>
            </div>
            <div className="flex flex-col p-4 gap-1">
              {[...navLinks, { to: '/wishlist', label: 'Wishlist' }, { to: '/chat', label: 'Chat' }, { to: '/dashboard', label: 'Dashboard' }].map((l) => (
                <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5">
                  {l.label}
                </Link>
              ))}
              {user ? (
                <button onClick={() => { setOpen(false); handleLogout(); }} className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">Logout</button>
              ) : (
                <Link to="/login" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5">Login</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
