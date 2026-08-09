import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api, { getErrorMessage } from "../lib/api.js";

export default function PostServiceRequest() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "", description: "", category: "assignment", budget: "", deadline: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post("/service-requests", form);
      toast.success("Request posted!");
      navigate(`/services/${res.data.request._id}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-slate-800 dark:text-white mb-6">
        Post a Service Request
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          placeholder="Title (e.g. 'Need a 10-page assignment on Data Structures')"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full border rounded-lg px-3 py-2.5 dark:bg-white/5 dark:border-white/10 dark:text-white"
          required
        />
        <textarea
          placeholder="Describe what you need in detail..."
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
            placeholder="Your budget (₹, optional)"
            value={form.budget}
            onChange={(e) => setForm({ ...form, budget: e.target.value })}
            className="border rounded-lg px-3 py-2.5 dark:bg-white/5 dark:border-white/10 dark:text-white"
          />
          <input
            type="date"
            value={form.deadline}
            onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            className="border rounded-lg px-3 py-2.5 dark:bg-white/5 dark:border-white/10 dark:text-white"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-brand-gradient text-white py-3 font-semibold disabled:opacity-50"
        >
          {submitting ? "Posting..." : "Post Request"}
        </button>
      </form>
    </div>
  );
}