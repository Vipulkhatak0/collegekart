import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api, { getErrorMessage } from "../lib/api.js";

export default function PostGig() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "", description: "", category: "assignment", price: "", deliveryDays: "3", portfolioImage: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post("/gigs", form);
      toast.success("Gig posted!");
      navigate(`/gigs/${res.data.gig._id}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-slate-800 dark:text-white mb-1">
        Offer a Service
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        List what you can do for other students — e.g. "I'll write a 10-page assignment for ₹100."
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          placeholder="Title (e.g. 'I will write your assignment')"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full border rounded-lg px-3 py-2.5 dark:bg-white/5 dark:border-white/10 dark:text-white"
          required
        />
        <textarea
          placeholder="Describe what's included, your experience, etc."
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
            placeholder="Delivery time (days)"
            value={form.deliveryDays}
            onChange={(e) => setForm({ ...form, deliveryDays: e.target.value })}
            className="border rounded-lg px-3 py-2.5 dark:bg-white/5 dark:border-white/10 dark:text-white"
            required
          />
        </div>

        <input
          placeholder="Portfolio image URL (optional)"
          value={form.portfolioImage}
          onChange={(e) => setForm({ ...form, portfolioImage: e.target.value })}
          className="w-full border rounded-lg px-3 py-2.5 dark:bg-white/5 dark:border-white/10 dark:text-white"
        />

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-brand-gradient text-white py-3 font-semibold disabled:opacity-50"
        >
          {submitting ? "Posting..." : "Post Gig"}
        </button>
      </form>
    </div>
  );
}