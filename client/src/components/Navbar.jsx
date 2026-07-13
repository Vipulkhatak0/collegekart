import { useState, useEffect } from 'react';
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
  useEffect(() => {
  if (open) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }

  return () => {
    document.body.style.overflow = "";
  };
}, [open]);
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
    <header className="sticky top-0 z-40 border-b border-white/40 dark:border-white/10 bg-white/70 dark:bg-surface-dark/70 backdrop-blur-xl">
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
  {open && (
    <>
      {/* Background Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setOpen(false)}
        className="fixed inset-0 bg-black/50 z-[99] lg:hidden"
      />

      {/* Mobile Drawer */}
      <motion.aside
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 right-0 h-screen w-72 bg-white dark:bg-slate-900 shadow-2xl z-[100] lg:hidden overflow-y-auto"
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold">Menu</h2>

          <button onClick={() => setOpen(false)}>
            <HiOutlineXMark className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-col p-4 space-y-2">

          {[...navLinks,
            { to: "/wishlist", label: "Wishlist" },
            { to: "/chat", label: "Chat" },
            { to: "/dashboard", label: "Dashboard" }
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="rounded-lg px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {item.label}
            </Link>
          ))}

          {user ? (
            <button
              onClick={() => {
                setOpen(false);
                handleLogout();
              }}
              className="text-left rounded-lg px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="rounded-lg px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Login
            </Link>
          )}

        </div>
      </motion.aside>
    </>
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
    <>
      {/* Background Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setOpen(false)}
        className="fixed inset-0 bg-black/50 z-[9998] lg:hidden"
      />

      {/* Mobile Menu */}
      <motion.aside
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.25 }}
        className="fixed top-0 right-0 h-screen w-72 bg-white dark:bg-slate-900 shadow-2xl z-[9999] overflow-y-auto lg:hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 p-4">
          <h2 className="text-lg font-bold">Menu</h2>

          <button onClick={() => setOpen(false)}>
            <HiOutlineXMark className="h-6 w-6" />
          </button>
        </div>

        {/* Links */}
        <div className="flex flex-col gap-2 p-4">
          {[
            ...navLinks,
            { to: "/wishlist", label: "Wishlist" },
            { to: "/chat", label: "Chat" },
            { to: "/dashboard", label: "Dashboard" },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="rounded-lg px-4 py-3 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {item.label}
            </Link>
          ))}

          {user ? (
            <button
              onClick={() => {
                setOpen(false);
                handleLogout();
              }}
              className="rounded-lg px-4 py-3 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="rounded-lg px-4 py-3 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Login
            </Link>
          )}
        </div>
      </motion.aside>
    </>
  )}
</AnimatePresence>
          
    </header>
  );
}
