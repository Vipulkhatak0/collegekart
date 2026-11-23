import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineArrowRight, HiOutlineBookOpen, HiOutlineComputerDesktop, HiOutlineHome, HiOutlineShoppingBag } from 'react-icons/hi2';
import ProductCard from '../components/ProductCard.jsx';
import api from '../lib/api.js';

const categories = [
  { name: 'Books & study', icon: HiOutlineBookOpen, query: 'books' },
  { name: 'Electronics', icon: HiOutlineComputerDesktop, query: 'electronics' },
  { name: 'Hostel essentials', icon: HiOutlineHome, query: 'hostel' },
  { name: 'Everyday finds', icon: HiOutlineShoppingBag, query: 'others' },
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    api.get('/products', { params: { sort: 'recent', limit: 4 } })
      .then(({ data }) => setProducts(data.products || []))
      .catch(() => setProducts([]));
    api.get('/notes', { params: { limit: 3 } })
      .then(({ data }) => setNotes(data.notes || []))
      .catch(() => setNotes([]));
  }, []);

  return (
    <div className="pb-10">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.1fr_.9fr] lg:py-24">
          <div>
            <p className="text-sm font-semibold tracking-wide text-[#3768A6]">COLLEGEKART · YOUR CAMPUS MARKETPLACE</p>
            <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-tight tracking-tight text-[#142B4A] sm:text-5xl">Your campus marketplace, all in one place.</h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-[#697586]">Discover affordable student essentials, buy and sell pre-owned products, and find academic resources within your college community.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/browse" className="btn-primary">Browse products <HiOutlineArrowRight /></Link>
              <Link to="/sell" className="btn-secondary">Sell an item</Link>
            </div>
          </div>
          <div className="rounded-md border border-slate-200 bg-[#F6F7F9] p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[.16em] text-[#697586]">A simpler way to campus shop</p>
            <div className="mt-6 divide-y divide-slate-200">
              {[
                ['01', 'Find what you need', 'Browse real listings from students in your community.'],
                ['02', 'Connect directly', 'Ask questions and arrange the details with the seller.'],
                ['03', 'Pass it forward', 'List useful items and academic resources for others.'],
              ].map(([n, title, desc]) => <div key={n} className="flex gap-4 py-4 first:pt-0 last:pb-0"><span className="pt-1 text-sm font-semibold text-[#3768A6]">{n}</span><div><h2 className="font-semibold text-[#17212F]">{title}</h2><p className="mt-1 text-sm leading-6 text-[#697586]">{desc}</p></div></div>)}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="flex items-end justify-between gap-4"><div><p className="section-eyebrow">Explore</p><h2 className="mt-2 text-2xl font-bold text-[#17212F]">Browse categories</h2></div><Link to="/categories" className="text-sm font-semibold text-[#3768A6]">All categories <HiOutlineArrowRight className="inline" /></Link></div>
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">{categories.map(({ name, icon: Icon, query }) => <Link key={name} to={`/browse?category=${query}`} className="group flex min-h-24 items-center gap-4 border border-slate-200 bg-white p-5 transition hover:border-[#3768A6]"><Icon className="h-6 w-6 text-[#3768A6]" /><span className="font-semibold text-[#17212F]">{name}</span><HiOutlineArrowRight className="ml-auto text-slate-400 transition group-hover:translate-x-1 group-hover:text-[#3768A6]" /></Link>)}</div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex items-end justify-between gap-4"><div><p className="section-eyebrow">Marketplace</p><h2 className="mt-2 text-2xl font-bold text-[#17212F]">Recently listed</h2></div><Link to="/browse" className="text-sm font-semibold text-[#3768A6]">Browse all <HiOutlineArrowRight className="inline" /></Link></div>
        {products.length ? <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{products.slice(0, 4).map(p => <ProductCard key={p._id} product={p} />)}</div> : <div className="mt-6 border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-[#697586]">No products are listed yet. Check back soon or <Link to="/sell" className="font-semibold text-[#3768A6]">list the first item</Link>.</div>}
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-2">
        <div className="border border-slate-200 bg-white p-7 sm:p-9"><p className="section-eyebrow">Study resources</p><h2 className="mt-2 text-2xl font-bold text-[#17212F]">Notes shared by students</h2><p className="mt-2 text-sm text-[#697586]">Browse notes, past papers, and study material uploaded to the library.</p><Link to="/notes" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#3768A6]">Open notes library <HiOutlineArrowRight /></Link>{notes.length > 0 && <div className="mt-5 divide-y divide-slate-100 border-t border-slate-100">{notes.slice(0, 3).map(note => <Link key={note._id} to={`/notes/${note._id}`} className="block py-3"><span className="font-medium text-[#17212F]">{note.title}</span><span className="mt-1 block text-xs text-[#697586]">{note.subject} · Semester {note.semester} · {(note.fileType || 'file').toUpperCase()}</span></Link>)}</div>}</div>
        <div className="flex flex-col justify-center border border-slate-200 bg-[#142B4A] p-7 text-white sm:p-9"><p className="text-sm font-semibold tracking-wide text-blue-200">MAKE ROOM FOR WHAT’S NEXT</p><h2 className="mt-3 text-2xl font-bold">Give useful things another life.</h2><p className="mt-3 max-w-md leading-7 text-blue-100">List a product or share a study resource with students in your college community.</p><Link to="/sell" className="mt-6 inline-flex w-fit items-center gap-2 border border-white/40 px-4 py-2.5 text-sm font-semibold hover:bg-white/10">Start selling <HiOutlineArrowRight /></Link></div>
      </section>
    </div>
  );
}
