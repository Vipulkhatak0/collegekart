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

const isPremiumActive = (provider) => provider?.premiumExpiresAt && new Date(provider.premiumExpiresAt) > new Date();

export default function Gigs() {
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");

  useEffect(() => {
    setLoading(true);
    const params = category !== "all" ? { category } : {};
    api.get("/gigs", { params })
      .then((res) => setGigs(res.data.gigs || []))
      .catch((err) => console.error("Failed to load gigs:", err))
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-800 dark:text-white">
            Freelance Gigs
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse services offered by fellow students — assignments, projects, design, and more.
          </p>
        </div>
        <Link
          to="/gigs/post"
          className="rounded-full bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition"
        >
          Offer a Service
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
      ) : gigs.length === 0 ? (
        <p className="text-slate-500 dark:text-slate-400">No gigs yet. Be the first to offer a service!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {gigs.map((gig) => {
            const premium = isPremiumActive(gig.provider);
            return (
              <Link
                key={gig._id}
                to={`/gigs/${gig._id}`}
                className={`rounded-2xl border p-4 shadow-sm hover:shadow-lg transition ${
                  premium
                    ? "border-amber-300 dark:border-amber-500/50 bg-amber-50/40 dark:bg-amber-500/5"
                    : "border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5"
                }`}
              >
                {gig.portfolioImage && (
                  <img src={gig.portfolioImage} alt={gig.title} className="w-full h-32 object-cover rounded-xl mb-3" />
                )}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="rounded-full bg-primary-50 dark:bg-white/10 text-primary-600 dark:text-primary-400 text-xs font-semibold px-2.5 py-1 capitalize">
                    {gig.category}
                  </span>
                  {premium && (
                    <span className="rounded-full bg-amber-400 text-amber-900 text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide">
                      ⭐ Featured
                    </span>
                  )}
                </div>
                <h3 className="mt-2 font-display font-semibold text-slate-800 dark:text-white line-clamp-2">
                  {gig.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{gig.description}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="font-bold text-primary-600 dark:text-primary-400">₹{gig.price}</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">{gig.deliveryDays} day delivery</span>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">by {gig.provider?.name}</p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}