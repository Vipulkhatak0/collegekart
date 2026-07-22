import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api, { getErrorMessage } from "../lib/api.js";

export default function EditGig() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/gigs/${id}`)
      .then((res) => {
        const g = res.data.gig;
        setForm({
          title: g.title,
          description: g.description,
          category: g.category,
          price: g.price,
          deliveryDays: g.deliveryDays,
          portfolioImage: g.portfolioImage || "",
        });
      })
      .catch((err) => toast.error(getErrorMessage(err)));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put(`/gigs/${id}`, form);
      toast.success("Gig updated!");
      navigate(`/gigs/${id}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (!form) return <div className="mx-auto max-w-2xl px-4 py-16 text-center text-slate-500 dark:text-slate-400">Loading...</div>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-slate-800 dark:text-white mb-6">
        Edit Gig
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full border rounded-lg px-3 py-2.5 dark:bg-white/5 dark:border-white/10 dark:text-white"
          required
        />
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full border rounded-lg px-3 py-2.5 dark:bg-white/5 dark:border-white/10 dark:text-white"
          rows={4}
          required
        />
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="w-full border rounded-lg px-3 py-2.5 dark:bg-white/5 dark:border-white/10 dark:text-white"
        >
          <option value="assignment">Assignment</option>
          <option value="project">Project</option>
          <option value="presentation">Presentation</option>
          <option value="typing">Typing</option>
          <option value="design">Design</option>
          <option value="coding">Coding</option>
          <option value="other">Other</option>
        </select>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            min="0"
            placeholder="Price (₹)"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="border rounded-lg px-3 py-2.5 dark:bg-white/5 dark:border-white/10 dark:text-white"
            required
          />
          <input
            type="number"
            min="1"
            placeholder="Delivery days"
            value={form.deliveryDays}
            onChange={(e) => setForm({ ...form, deliveryDays: e.target.value })}
            className="border rounded-lg px-3 py-2.5 dark:bg-white/5 dark:border-white/10 dark:text-white"
            required
          />
        </div>
        <input
          placeholder="Portfolio image URL"
          value={form.portfolioImage}
          onChange={(e) => setForm({ ...form, portfolioImage: e.target.value })}
          className="w-full border rounded-lg px-3 py-2.5 dark:bg-white/5 dark:border-white/10 dark:text-white"
        />
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-brand-gradient text-white py-3 font-semibold disabled:opacity-50"
        >
          {submitting ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}