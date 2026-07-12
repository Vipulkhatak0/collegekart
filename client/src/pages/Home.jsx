import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineShieldCheck, HiOutlineChatBubbleLeftRight, HiOutlineSparkles, HiOutlineArrowRight } from 'react-icons/hi2';
import CategoryCard from '../components/CategoryCard.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { categories } from '../data/mockData.js';
import api from '../lib/api.js';

export default function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get('/products', { params: { sort: 'recent' } }).then(({ data }) => setProducts(data.products)).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-brand-gradient opacity-20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-accent-500 opacity-10 blur-3xl" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-14 pb-20 relative">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <span className="section-eyebrow">Made for your campus</span>
              <h1 className="mt-3 font-display text-4xl font-bold leading-tight sm:text-5xl">
                Buy. Sell. Save. <span className="bg-brand-gradient bg-clip-text text-transparent">Campus to Campus.</span>
              </h1>
              <p className="mt-4 max-w-md text-slate-500 dark:text-slate-400">
                CollegeKart is the marketplace built exclusively for students — trade textbooks, electronics, and hostel essentials safely, right within your campus.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link to="/browse" className="btn-primary">Browse Products <HiOutlineArrowRight className="h-4 w-4" /></Link>
                <Link to="/sell" className="btn-secondary">Start Selling</Link>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.1 }} className="grid grid-cols-2 gap-4">
              {products.slice(0, 4).map((p) => <ProductCard key={p._id} product={p} />)}
              {products.length === 0 && <p className="col-span-2 text-center text-sm text-slate-400">No listings yet — be the first to sell something!</p>}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
        <div className="flex items-end justify-between">
          <div>
            <span className="section-eyebrow">Shop by category</span>
            <h2 className="mt-2 text-2xl font-bold">Find exactly what you need</h2>
          </div>
          <Link to="/categories" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-primary-500">View all <HiOutlineArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
          {categories.slice(0, 7).map((c) => <CategoryCard key={c.id} category={c} />)}
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
        <span className="section-eyebrow">Trending this week</span>
        <h2 className="mt-2 text-2xl font-bold">Featured Listings</h2>
        <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => <ProductCard key={p._id} product={p} />)}
          {products.length === 0 && <p className="col-span-full py-8 text-center text-slate-400">Nothing listed yet.</p>}
        </div>
      </section>

      {/* Trust strip */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
        <div className="glass-card grid gap-8 p-8 sm:grid-cols-3">
          {[
            { icon: HiOutlineShieldCheck, title: 'Verified Students Only', desc: 'Every seller verifies their campus email before listing.' },
            { icon: HiOutlineChatBubbleLeftRight, title: 'Chat & Negotiate', desc: 'Message sellers directly and agree on a fair price.' },
            { icon: HiOutlineSparkles, title: 'AI Price Suggestions', desc: 'List smarter with AI-backed pricing and descriptions.' }
          ].map((f, i) => (
            <div key={i} className="flex flex-col items-start gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-gradient-soft text-primary-600 dark:text-primary-400"><f.icon className="h-5 w-5" /></div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
