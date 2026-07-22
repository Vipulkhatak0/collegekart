import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api, { getErrorMessage } from "../lib/api.js";

export default function EditServiceRequest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/service-requests/${id}`)
      .then((res) => {
        const r = res.data.request;
        setForm({
          title: r.title,
          description: r.description,
          category: r.category,
          budget: r.budget || "",
          deadline: r.deadline ? r.deadline.slice(0, 10) : "",
          contactInfo: r.contactInfo || "",
        });
      })
      .catch((err) => toast.error(getErrorMessage(err)));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put(`/service-requests/${id}`, form);
      toast.success("Request updated!");
      navigate(`/services/${id}`);
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
        Edit Request
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
            placeholder="Budget (₹)"
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
        <input
          placeholder="Contact info"
          value={form.contactInfo}
          onChange={(e) => setForm({ ...form, contactInfo: e.target.value })}
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