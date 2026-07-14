import { useState, useEffect } from "react";
import axios from "axios";

export default function AffiliateProductsAdmin() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    title: "", image: "", price: "", rating: 4.5, category: "Books", affiliateLink: "",
  });

  const fetchProducts = async () => {
   const res = await axios.get("/api/affiliate-products");
setProducts(res.data.affiliateProducts);   // ← .affiliateProducts, not res.data
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post("/api/affiliate-products", form, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    setForm({ title: "", image: "", price: "", rating: 4.5, category: "Books", affiliateLink: "" });
    fetchProducts();
  };

  const handleDelete = async (id) => {
    await axios.delete(`/api/affiliate-products/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    fetchProducts();
  };

  return (
    <div className="p-4">
      <h2 className="font-display text-xl font-bold mb-4 dark:text-white">Affiliate Products</h2>

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
          {["Books", "Laptops", "Headphones", "Printers", "Smartphones", "Backpacks"].map((c) => (
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