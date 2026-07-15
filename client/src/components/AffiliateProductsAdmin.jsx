import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import api, { getErrorMessage } from "../lib/api.js";

export default function AffiliateProductsAdmin() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    title: "", image: "", price: "", rating: 4.5, category: "books", affiliateLink: "",
  });

  const fetchProducts = async () => {
    try {
      const res = await api.get("/affiliate-products");
      setProducts(res.data.affiliateProducts);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/affiliate-products", form);
      setForm({ title: "", image: "", price: "", rating: 4.5, category: "books", affiliateLink: "" });
      toast.success("Product added.");
      fetchProducts();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/affiliate-products/${id}`);
      toast.success("Product removed.");
      fetchProducts();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3 mb-6">
        <input placeholder="Title" value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="border rounded-lg px-3 py-2 dark:bg-white/5 dark:border-white/10 dark:text-white" required />
        <input placeholder="Image URL" value={form.image}
          onChange={(e) => setForm({ ...form, image: e.target.value })}
          className="border rounded-lg px-3 py-2 dark:bg-white/5 dark:border-white/10 dark:text-white" required />
        <input placeholder="Price (₹19,999)" value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="border rounded-lg px-3 py-2 dark:bg-white/5 dark:border-white/10 dark:text-white" required />
        <select value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="border rounded-lg px-3 py-2 dark:bg-white/5 dark:border-white/10 dark:text-white">
          {['books', 'notes', 'electronics', 'laptops', 'mobiles', 'hostel', 'furniture', 'fashion', 'sports', 'calculators', 'cycles', 'gaming', 'accessories', 'others'].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <input placeholder="Amazon Affiliate Link" value={form.affiliateLink}
          onChange={(e) => setForm({ ...form, affiliateLink: e.target.value })}
          className="col-span-2 border rounded-lg px-3 py-2 dark:bg-white/5 dark:border-white/10 dark:text-white" required />
        <button type="submit" className="col-span-2 rounded-full bg-brand-gradient text-white py-2 font-semibold">
          Add Product
        </button>
      </form>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {products.map((p) => (
          <div key={p._id} className="border rounded-xl p-2 dark:border-white/10">
            <img src={p.image} alt={p.title} className="w-full h-24 object-cover rounded" />
            <p className="text-sm mt-1 dark:text-white truncate">{p.title}</p>
            <button onClick={() => handleDelete(p._id)} className="text-xs text-red-500 mt-1">
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}