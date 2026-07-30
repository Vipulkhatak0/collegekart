import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
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
  { to: '/student-essentials', label: 'Essentials' },
  { to: '/notes', label: 'Library' },
  { to: '/services', label: 'Services' },
  { to: '/gigs', label: 'Gigs' },
  { to: '/sell', label: 'Sell' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' }
];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Shrink + intensify blur/shadow once the page has scrolled a bit.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Collapse search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input automatically when search opens
  useEffect(() => {
    if (searchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchOpen]);

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

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(search.trim() ? `/browse?search=${encodeURIComponent(search.trim())}` : '/browse');
    setSearch('');
    setSearchOpen(false);
  };

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const isActive = (to) => location.pathname === to;

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`sticky top-0 z-40 border-b transition-all duration-300 ${
        scrolled
          ? 'border-white/40 dark:border-white/10 bg-white/85 dark:bg-surface-dark/85 backdrop-blur-xl shadow-[0_4px_24px_-8px_rgba(59,95,227,0.25)]'
          : 'border-white/20 dark:border-white/5 bg-white/70 dark:bg-surface-dark/70 backdrop-blur-xl'
      }`}
    >
      <div className={`mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 transition-all duration-300 ${scrolled ? 'py-2' : 'py-3'}`}>

        {/* Logo */}
        <Link to="/" className="group flex items-center gap-2 shrink-0">
          <motion.span
            whileHover={{ rotate: -8, scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 400, damping: 12 }}
            className="relative grid h-9 w-9 place-items-center rounded-xl bg-brand-gradient font-display text-lg font-bold text-white shadow-md shadow-primary-500/30"
          >
            C
            <span className="absolute inset-0 rounded-xl bg-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ mixBlendMode: 'overlay' }} />
          </motion.span>
          <span className="font-display text-lg font-bold text-slate-800 dark:text-white">CollegeKart</span>
        </Link>

        {/* Desktop Navigation with sliding active-tab indicator */}
        <nav className="hidden lg:flex items-center gap-1 relative">
          {navLinks.map((l) => {
            const active = isActive(l.to);
            return (
              <NavLink
                key={l.to}
                to={l.to}
                className="relative rounded-full px-4 py-2 text-sm font-medium transition-colors"
              >
                {active && (
                  <motion.span
                    layoutId="nav-active-pill"
                    className="absolute inset-0 rounded-full bg-primary-50 dark:bg-white/10"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span className={`relative z-10 ${active ? 'text-primary-600 dark:text-primary-400' : 'text-slate-600 hover:text-primary-500 dark:text-slate-300'}`}>
                  {l.label}
                </span>
              </NavLink>
            );
          })}
        </nav>

        {/* Expandable Search Icon/Bar */}
        <div className="relative hidden md:flex items-center" ref={searchRef}>
          {!searchOpen ? (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSearchOpen(true)}
              aria-label="Open search"
              className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
            >
              <HiOutlineMagnifyingGlass className="h-5 w-5" />
            </motion.button>
          ) : (
            <motion.form
              initial={{ width: 40, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 40, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              onSubmit={handleSearch}
              className="flex items-center gap-2 rounded-full border border-primary-400 bg-white/90 dark:bg-slate-900/90 px-4 py-2 shadow-[0_0_0_4px_rgba(59,95,227,0.12)] backdrop-blur-md"
            >
              <HiOutlineMagnifyingGlass className="h-4 w-4 text-primary-500 shrink-0" />
              <input
                ref={inputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for books, laptops, notes..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <HiOutlineXMark className="h-4 w-4" />
              </button>
            </motion.form>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <motion.button
            whileHover={{ scale: 1.1, rotate: theme === 'dark' ? 20 : -20 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={theme}
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.2 }}
                className="block"
              >
                {theme === 'dark' ? <HiOutlineSun className="h-5 w-5" /> : <HiOutlineMoon className="h-5 w-5" />}
              </motion.span>
            </AnimatePresence>
          </motion.button>

          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="hidden sm:block">
            <Link to="/wishlist" className="inline-flex rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10">
              <HiOutlineHeart className="h-5 w-5" />
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="hidden sm:block">
            <Link to="/chat" className="inline-flex rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10">
              <HiOutlineChatBubbleLeftRight className="h-5 w-5" />
            </Link>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            animate={{ rotate: [0, -12, 12, -8, 8, 0] }}
            transition={{ rotate: { duration: 1.4, repeat: Infinity, repeatDelay: 4 } }}
            className="hidden sm:block"
          >
            <Link to="/notifications" className="inline-flex rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10">
              <HiOutlineBell className="h-5 w-5" />
            </Link>
          </motion.div>

          {/* User Profile Dropdown or Login */}
          {user ? (
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-1 rounded-full p-1 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="h-7 w-7 rounded-full object-cover" />
                ) : (
                  <HiOutlineUserCircle className="h-7 w-7" />
                )}
              </motion.button>

              <AnimatePresence>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-white/10 dark:bg-slate-900 z-20"
                    >
                      <Link
                        to="/dashboard"
                        onClick={() => setMenuOpen(false)}
                        className="flex w-full items-center rounded-lg px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setMenuOpen(false)}
                        className="flex w-full items-center rounded-lg px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        Profile
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setMenuOpen(false)}
                        className="flex w-full items-center rounded-lg px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        Orders
                      </Link>
                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setMenuOpen(false)}
                          className="flex w-full items-center rounded-lg px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-lg px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <HiOutlineArrowRightOnRectangle className="h-4 w-4" />
                        Logout
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Link to="/login" className="btn-primary !px-4 !py-2 text-xs">Login</Link>
            </motion.div>
          )}

          {/* Mobile Menu Trigger */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setOpen(true)}
            className="lg:hidden rounded-full p-2 text-slate-600 dark:text-slate-200"
          >
            <HiOutlineBars3 className="h-6 w-6" />
          </motion.button>
        </div>
      </div>

      {/* Global Mobile Drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] lg:hidden"
            />

            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              className="fixed top-0 right-0 h-screen w-72 bg-white dark:bg-slate-900 shadow-2xl z-[9999] overflow-y-auto lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 p-4">
                <h2 className="text-lg font-bold">Menu</h2>
                <motion.button whileTap={{ scale: 0.9, rotate: 90 }} onClick={() => setOpen(false)}>
                  <HiOutlineXMark className="h-6 w-6" />
                </motion.button>
              </div>

              <div className="flex flex-col gap-1 p-4">
                {[
                  ...navLinks,
                  { to: "/wishlist", label: "Wishlist" },
                  { to: "/chat", label: "Chat" },
                  { to: "/dashboard", label: "Dashboard" },
                  ...(user ? [{ to: "/profile", label: "Profile" }, { to: "/orders", label: "Orders" }] : []),
                  ...(user?.role === 'admin' ? [{ to: "/admin", label: "Admin Panel" }] : []),
                ].map((item, i) => (
                  <motion.div
                    key={item.to}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 * i, duration: 0.25 }}
                  >
                    <Link
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className="block rounded-lg px-4 py-3 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:translate-x-1 transition-all"
                    >
                      {item.label}
                    </Link>
                  </motion.div>
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
    </motion.header>
  );
}