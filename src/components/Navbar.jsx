import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import {
  HiOutlineMagnifyingGlass, HiOutlineHeart, HiOutlineBell, HiOutlineChatBubbleLeftRight,
  HiOutlineSun, HiOutlineMoon, HiOutlineBars3, HiOutlineXMark, HiOutlineUserCircle, HiOutlineArrowRightOnRectangle
} from 'react-icons/hi2';
import useTheme from '../context/ThemeContext.jsx';
import useAuth from '../context/AuthContext.jsx';
import api, { SOCKET_URL } from '../lib/api.js';

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

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 400, damping: 30 }
  },
  exit: { opacity: 0, y: 10, scale: 0.95, transition: { duration: 0.15 } }
};

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
  const [unreadCount, setUnreadCount] = useState(0);

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

  // Real-time notifications: personal alerts (admins) + site-wide "new listing" broadcast.
  useEffect(() => {
    if (!user) return;
    const myId = user.id || user._id;

    api.get('/notifications/unread-count').then((res) => setUnreadCount(res.data.count)).catch(() => {});

    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socket.emit('join', myId);

    const playSound = () => {
      const audio = new Audio('/notification-sound.mp3');
      audio.play().catch(() => { /* browser blocked autoplay before interaction, ignore */ });
    };

    socket.on('newNotification', () => {
      setUnreadCount((c) => c + 1);
      playSound();
    });

    socket.on('newListing', (data) => {
      toast(`New listing: ${data.title}`, { icon: '🆕' });
      playSound();
    });

    return () => socket.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: easeOut }}
      className={`sticky top-0 z-40 border-b transition-all duration-300 ${
        scrolled
          ? 'border-slate-200/70 dark:border-white/10 bg-white/90 dark:bg-surface-dark/90 backdrop-blur-xl shadow-[0_1px_0_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.12)]'
          : 'border-transparent bg-white/75 dark:bg-surface-dark/75 backdrop-blur-xl'
      }`}
    >
      <div className={`mx-auto flex max-w-7xl items-center gap-3 px-4 sm:px-6 transition-[padding] duration-300 ${scrolled ? 'py-2.5' : 'py-3.5'}`}>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <motion.span
            whileHover={{ scale: 1.08, rotate: [0, -5, 5, 0] }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="grid h-9 w-9 place-items-center rounded-xl bg-brand-gradient font-display text-lg font-bold text-white shadow-md shadow-primary-500/30 group-hover:shadow-primary-500/50"
          >
            C
          </motion.span>
          <motion.span
            className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white"
            whileHover={{ x: 2 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            CollegeKart
          </motion.span>
        </Link>

        {/* Vertical divider */}
        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="hidden lg:block h-6 w-px bg-slate-200 dark:bg-white/10 mx-1 origin-center"
        />

        {/* Desktop Navigation */}
        <motion.nav
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="hidden lg:flex items-center gap-0.5 flex-1 min-w-0"
        >
          {navLinks.map((l) => {
            const active = isActive(l.to);
            return (
              <motion.div key={l.to} variants={itemVariants}>
                <NavLink
                  to={l.to}
                  className="relative rounded-full px-3.5 py-2 text-[13.5px] font-medium whitespace-nowrap transition-colors block"
                >
                  {active && (
                    <motion.span
                      layoutId="nav-active-pill"
                      className="absolute inset-0 rounded-full bg-primary-50 dark:bg-white/10 shadow-sm"
                      transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                    />
                  )}
                  <motion.span
                    className={`relative z-10 block ${active ? 'text-primary-600 dark:text-primary-400 font-semibold' : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    {l.label}
                  </motion.span>
                </NavLink>
              </motion.div>
            );
          })}
        </motion.nav>

        <div className="flex-1 lg:hidden" />

        {/* Expandable Search */}
        <div className="relative hidden md:flex items-center" ref={searchRef}>
          <AnimatePresence initial={false} mode="wait">
            {!searchOpen ? (
              <motion.button
                key="search-icon"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2 }}
                onClick={() => setSearchOpen(true)}
                aria-label="Open search"
                className={iconButtonClass}
              >
                <HiOutlineMagnifyingGlass className="h-5 w-5" />
              </motion.button>
            ) : (
              <motion.form
                key="search-field"
                initial={{ width: 40, opacity: 0, scaleX: 0.9 }}
                animate={{ width: 300, opacity: 1, scaleX: 1 }}
                exit={{ width: 40, opacity: 0, scaleX: 0.9 }}
                transition={{ duration: 0.3, ease: easeOut }}
                onSubmit={handleSearch}
                role="search"
                className="flex items-center gap-2 rounded-full border border-slate-200 dark:border-white/15 bg-white dark:bg-slate-900 px-3.5 py-2 shadow-lg ring-1 ring-primary-500/20 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-500/30"
              >
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <HiOutlineMagnifyingGlass className="h-4 w-4 text-primary-500 shrink-0" />
                </motion.div>
                <input
                  ref={inputRef}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search books, laptops, notes…"
                  aria-label="Search CollegeKart"
                  className="w-full bg-transparent text-sm text-slate-800 dark:text-white outline-none placeholder:text-slate-400"
                />
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.2, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSearchOpen(false)}
                  aria-label="Close search"
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <HiOutlineXMark className="h-4 w-4" />
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <motion.button
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className={iconButtonClass}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={theme}
                initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                transition={{ duration: 0.2 }}
                className="block"
              >
                {theme === 'dark' ? <HiOutlineSun className="h-5 w-5 text-amber-400" /> : <HiOutlineMoon className="h-5 w-5 text-indigo-600" />}
              </motion.span>
            </AnimatePresence>
          </motion.button>

          {[
            { to: '/wishlist', icon: HiOutlineHeart, label: 'Wishlist' },
            { to: '/chat', icon: HiOutlineChatBubbleLeftRight, label: 'Messages' }
          ].map(({ to, icon: Icon, label }) => (
            <motion.div key={to} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Link to={to} aria-label={label} className={`hidden sm:inline-flex ${iconButtonClass}`}>
                <Icon className="h-5 w-5" />
              </Link>
            </motion.div>
          ))}

          {/* Notifications — separate from the map above so it can carry the unread badge */}
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Link to="/notifications" aria-label="Notifications" className={`hidden sm:inline-flex relative ${iconButtonClass}`}>
              <HiOutlineBell className="h-5 w-5" />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full bg-red-500 text-[9px] font-bold text-white"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
              )}
            </Link>
          </motion.div>

          {/* Divider before profile/login */}
          <div className="hidden sm:block h-6 w-px bg-slate-200 dark:bg-white/10 mx-1" />

          {/* User Profile Dropdown or Login */}
          {user ? (
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Account menu"
                className="flex items-center gap-1 rounded-full p-1 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10 transition-colors"
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="h-7 w-7 rounded-full object-cover ring-2 ring-primary-500/30" />
                ) : (
                  <HiOutlineUserCircle className="h-7 w-7 text-primary-500" />
                )}
              </motion.button>

              <AnimatePresence>
                {menuOpen && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-10"
                      onClick={() => setMenuOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -10 }}
                      transition={{ duration: 0.2, ease: easeOut }}
                      className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200/80 bg-white p-2 shadow-xl dark:border-white/10 dark:bg-slate-900 z-20 backdrop-blur-xl"
                    >
                      <div className="px-3 py-2.5 border-b border-slate-100 dark:border-white/10 mb-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                        <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{user.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      </div>
                      {[
                        { to: '/dashboard', label: 'Dashboard' },
                        { to: '/profile', label: 'Profile' },
                        { to: '/orders', label: 'Orders' },
                        ...(user.role === 'admin' ? [{ to: '/admin', label: 'Admin Panel' }] : [])
                      ].map((item) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={() => setMenuOpen(false)}
                          className="flex w-full items-center rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-primary-50 hover:text-primary-600 dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-white transition-colors"
                        >
                          {item.label}
                        </Link>
                      ))}
                      <div className="border-t border-slate-100 dark:border-white/10 mt-1.5 pt-1.5">
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
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
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/login" className="btn-primary !px-4 !py-2 text-xs rounded-full shadow-md shadow-primary-500/20">
                Login
              </Link>
            </motion.div>
          )}

          {/* Mobile Menu Trigger */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className={`lg:hidden ${iconButtonClass}`}
          >
            <HiOutlineBars3 className="h-6 w-6" />
          </motion.button>
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
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-md z-[9998] lg:hidden"
            />

            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.35, ease: easeOut }}
              className="fixed top-0 right-0 h-screen w-80 bg-white dark:bg-slate-900 shadow-2xl z-[9999] overflow-y-auto lg:hidden flex flex-col border-l border-slate-200 dark:border-white/10"
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 p-5">
                <motion.h2
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-lg font-bold text-slate-900 dark:text-white font-display"
                >
                  Menu
                </motion.h2>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10"
                >
                  <HiOutlineXMark className="h-6 w-6" />
                </motion.button>
              </div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                exit="exit"
                className="flex flex-col gap-1 p-4 flex-1"
              >
                {[
                  ...navLinks,
                  { to: '/wishlist', label: 'Wishlist' },
                  { to: '/chat', label: 'Chat' },
                  { to: '/notifications', label: unreadCount > 0 ? `Notifications (${unreadCount})` : 'Notifications' },
                  { to: '/dashboard', label: 'Dashboard' },
                  ...(user ? [{ to: '/profile', label: 'Profile' }, { to: '/orders', label: 'Orders' }] : []),
                  ...(user?.role === 'admin' ? [{ to: '/admin', label: 'Admin Panel' }] : []),
                ].map((item, i) => (
                  <motion.div key={item.to} variants={itemVariants}>
                    <Link
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-white/10 dark:hover:text-white transition-all shadow-sm hover:shadow"
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}

                <motion.div variants={itemVariants} className="border-t border-slate-200 dark:border-slate-800 mt-auto pt-4 pb-6">
                  {user ? (
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { setOpen(false); handleLogout(); }}
                      className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 transition-all shadow-sm"
                    >
                      <HiOutlineArrowRightOnRectangle className="h-4 w-4" />
                      Logout
                    </motion.button>
                  ) : (
                    <Link
                      to="/login"
                      onClick={() => setOpen(false)}
                      className="block text-center rounded-xl px-4 py-3 text-sm font-semibold text-white bg-brand-gradient shadow-md shadow-primary-500/30 hover:opacity-95 transition-all"
                    >
                      Login
                    </Link>
                  )}
                </motion.div>
              </motion.div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
}