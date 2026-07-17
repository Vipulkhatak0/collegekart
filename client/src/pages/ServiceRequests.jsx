import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api.js";

const categories = [
  { value: "all", label: "All" },
  { value: "assignment", label: "Assignment" },
  { value: "project", label: "Project" },
  { value: "presentation", label: "Presentation" },
  { value: "typing", label: "Typing" },
  { value: "design", label: "Design" },
  { value: "coding", label: "Coding" },
  { value: "other", label: "Other" },
];

export default function ServiceRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");

  useEffect(() => {
    setLoading(true);
    const params = { status: "open" };
    if (category !== "all") params.category = category;

    api.get("/service-requests", { params })
      .then((res) => setRequests(res.data.requests || []))
      .catch((err) => console.error("Failed to load requests:", err))
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-800 dark:text-white">
            Service Requests
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Need help with an assignment or project? Post it and get bids from other students.
          </p>
        </div>
        <Link
          to="/services/post"
          className="rounded-full bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition"
        >
          Post a Request
        </Link>
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        {categories.map((c) => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              category === c.value
                ? "bg-primary-50 text-primary-600 dark:bg-white/10 dark:text-primary-400"
                : "text-slate-600 hover:text-primary-500 dark:text-slate-300"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-slate-500 dark:text-slate-400">Loading...</p>
      ) : requests.length === 0 ? (
        <p className="text-slate-500 dark:text-slate-400">No open requests right now.</p>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <Link
              key={r._id}
              to={`/services/${r._id}`}
              className="block rounded-2xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl p-4 shadow-sm hover:shadow-lg transition"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="rounded-full bg-primary-50 dark:bg-white/10 text-primary-600 dark:text-primary-400 text-xs font-semibold px-2.5 py-1 capitalize">
                  {r.category}
                </span>
                {r.budget && (
                  <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                    Budget: ₹{r.budget}
                  </span>
                )}
              </div>
              <h3 className="mt-2 font-display font-semibold text-slate-800 dark:text-white">
                {r.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                {r.description}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                Posted by {r.buyer?.name}
                {r.deadline && ` · Deadline: ${new Date(r.deadline).toLocaleDateString()}`}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}