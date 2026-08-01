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

const easeOut = [0.16, 1, 0.3, 1];

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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
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

  const iconButtonClass =
    'rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white';

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: easeOut }}
      className={`sticky top-0 z-40 border-b transition-shadow duration-300 ${
        scrolled
          ? 'border-slate-200/70 dark:border-white/10 bg-white/90 dark:bg-surface-dark/90 backdrop-blur-xl shadow-[0_1px_0_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.12)]'
          : 'border-transparent bg-white/75 dark:bg-surface-dark/75 backdrop-blur-xl'
      }`}
    >
      <div className={`mx-auto flex max-w-7xl items-center gap-3 px-4 sm:px-6 transition-[padding] duration-300 ${scrolled ? 'py-2.5' : 'py-3.5'}`}>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <motion.span
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="grid h-9 w-9 place-items-center rounded-xl bg-brand-gradient font-display text-lg font-bold text-white shadow-sm shadow-primary-500/30"
          >
            C
          </motion.span>
          <span className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            CollegeKart
          </span>
        </Link>

        {/* Vertical divider */}
        <div className="hidden lg:block h-6 w-px bg-slate-200 dark:bg-white/10 mx-1" />

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-0.5 flex-1 min-w-0">
          {navLinks.map((l) => {
            const active = isActive(l.to);
            return (
              <NavLink
                key={l.to}
                to={l.to}
                className="relative rounded-full px-3.5 py-2 text-[13.5px] font-medium whitespace-nowrap transition-colors"
              >
                {active && (
                  <motion.span
                    layoutId="nav-active-pill"
                    className="absolute inset-0 rounded-full bg-primary-50 dark:bg-white/10"
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                  />
                )}
                <span className={`relative z-10 ${active ? 'text-primary-600 dark:text-primary-400' : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'}`}>
                  {l.label}
                </span>
              </NavLink>
            );
          })}
        </nav>

        <div className="flex-1 lg:hidden" />

        {/* Expandable Search */}
        <div className="relative hidden md:flex items-center" ref={searchRef}>
          <AnimatePresence initial={false} mode="wait">
            {!searchOpen ? (
              <motion.button
                key="search-icon"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                onClick={() => setSearchOpen(true)}
                aria-label="Open search"
                className={iconButtonClass}
              >
                <HiOutlineMagnifyingGlass className="h-5 w-5" />
              </motion.button>
            ) : (
              <motion.form
                key="search-field"
                initial={{ width: 40, opacity: 0 }}
                animate={{ width: 300, opacity: 1 }}
                exit={{ width: 40, opacity: 0 }}
                transition={{ duration: 0.25, ease: easeOut }}
                onSubmit={handleSearch}
                role="search"
                className="flex items-center gap-2 rounded-full border border-slate-200 dark:border-white/15 bg-white dark:bg-slate-900 px-3.5 py-2 shadow-sm ring-1 ring-primary-500/10 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-500/15"
              >
                <HiOutlineMagnifyingGlass className="h-4 w-4 text-slate-400 shrink-0" />
                <input
                  ref={inputRef}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search books, laptops, notes…"
                  aria-label="Search CollegeKart"
                  className="w-full bg-transparent text-sm text-slate-800 dark:text-white outline-none placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  aria-label="Close search"
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <HiOutlineXMark className="h-4 w-4" />
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className={iconButtonClass}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={theme}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                className="block"
              >
                {theme === 'dark' ? <HiOutlineSun className="h-5 w-5" /> : <HiOutlineMoon className="h-5 w-5" />}
              </motion.span>
            </AnimatePresence>
          </button>

          <Link to="/wishlist" aria-label="Wishlist" className={`hidden sm:inline-flex ${iconButtonClass}`}>
            <HiOutlineHeart className="h-5 w-5" />
          </Link>
          <Link to="/chat" aria-label="Messages" className={`hidden sm:inline-flex ${iconButtonClass}`}>
            <HiOutlineChatBubbleLeftRight className="h-5 w-5" />
          </Link>
          <Link to="/notifications" aria-label="Notifications" className={`hidden sm:inline-flex ${iconButtonClass}`}>
            <HiOutlineBell className="h-5 w-5" />
          </Link>

          {/* Divider before profile/login */}
          <div className="hidden sm:block h-6 w-px bg-slate-200 dark:bg-white/10 mx-1" />

          {/* User Profile Dropdown or Login */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Account menu"
                className="flex items-center gap-1 rounded-full p-1 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="h-7 w-7 rounded-full object-cover ring-1 ring-slate-200 dark:ring-white/10" />
                ) : (
                  <HiOutlineUserCircle className="h-7 w-7" />
                )}
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.97, y: -6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.97, y: -6 }}
                      transition={{ duration: 0.15, ease: easeOut }}
                      className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg dark:border-white/10 dark:bg-slate-900 z-20"
                    >
                      <div className="px-3 py-2 border-b border-slate-100 dark:border-white/10 mb-1">
                        <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{user.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      </div>
                      <Link
                        to="/dashboard"
                        onClick={() => setMenuOpen(false)}
                        className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setMenuOpen(false)}
                        className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        Profile
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setMenuOpen(false)}
                        className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        Orders
                      </Link>
                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setMenuOpen(false)}
                          className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                          Admin Panel
                        </Link>
                      )}
                      <div className="border-t border-slate-100 dark:border-white/10 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <HiOutlineArrowRightOnRectangle className="h-4 w-4" />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/login" className="btn-primary !px-4 !py-2 text-xs">
              Login
            </Link>
          )}

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className={`lg:hidden ${iconButtonClass}`}
          >
            <HiOutlineBars3 className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9998] lg:hidden"
            />

            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: easeOut }}
              className="fixed top-0 right-0 h-screen w-72 bg-white dark:bg-slate-900 shadow-2xl z-[9999] overflow-y-auto lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 p-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Menu</h2>
                <button onClick={() => setOpen(false)} aria-label="Close menu">
                  <HiOutlineXMark className="h-6 w-6 text-slate-500 dark:text-slate-300" />
                </button>
              </div>

              <div className="flex flex-col gap-0.5 p-3">
                {[
                  ...navLinks,
                  { to: '/wishlist', label: 'Wishlist' },
                  { to: '/chat', label: 'Chat' },
                  { to: '/dashboard', label: 'Dashboard' },
                  ...(user ? [{ to: '/profile', label: 'Profile' }, { to: '/orders', label: 'Orders' }] : []),
                  ...(user?.role === 'admin' ? [{ to: '/admin', label: 'Admin Panel' }] : []),
                ].map((item, i) => (
                  <motion.div
                    key={item.to}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.03 * i, duration: 0.2, ease: easeOut }}
                  >
                    <Link
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className="block rounded-lg px-3.5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}

                <div className="border-t border-slate-100 dark:border-white/10 mt-2 pt-2">
                  {user ? (
                    <button
                      onClick={() => { setOpen(false); handleLogout(); }}
                      className="w-full rounded-lg px-3.5 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      Logout
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      onClick={() => setOpen(false)}
                      className="block rounded-lg px-3.5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Login
                    </Link>
                  )}
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
}