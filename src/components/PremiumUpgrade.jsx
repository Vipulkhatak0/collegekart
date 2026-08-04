import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import api, { getErrorMessage } from "../lib/api.js";
import useAuth from "../context/AuthContext.jsx";

const isPremiumActive = (provider) => provider?.premiumExpiresAt && new Date(provider.premiumExpiresAt) > new Date();

export default function GigDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [gig, setGig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/gigs/${id}`)
      .then((res) => setGig(res.data.gig))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this gig?")) return;
    try {
      await api.delete(`/gigs/${id}`);
      toast.success("Gig deleted.");
      navigate("/gigs");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (loading) return <div className="mx-auto max-w-2xl px-4 py-16 text-center text-slate-500 dark:text-slate-400">Loading...</div>;
  if (!gig) return <div className="mx-auto max-w-2xl px-4 py-16 text-center text-slate-500 dark:text-slate-400">Gig not found.</div>;

  const isOwner = user && String(user.id) === String(gig.provider?._id);
  const premium = isPremiumActive(gig.provider);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Link to="/gigs" className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary-500">
        ← Back to Gigs
      </Link>

      <div className="mt-4 rounded-2xl border border-slate-200 dark:border-white/10 p-6">
        {gig.portfolioImage && (
          <img src={gig.portfolioImage} alt={gig.title} className="w-full h-56 object-cover rounded-xl mb-4" />
        )}

        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="rounded-full bg-primary-50 dark:bg-white/10 text-primary-600 dark:text-primary-400 text-xs font-semibold px-2.5 py-1 capitalize">
            {gig.category}
          </span>
          {premium && (
            <span className="rounded-full bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 uppercase tracking-wide">
              ⭐ Featured Provider
            </span>
          )}
        </div>

        <h1 className="mt-3 font-display text-xl font-bold text-slate-800 dark:text-white">
          {gig.title}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{gig.description}</p>

        <div className="flex gap-4 flex-wrap mt-4 text-sm">
          <span className="font-bold text-primary-600 dark:text-primary-400">₹{gig.price}</span>
          <span className="text-slate-400 dark:text-slate-500">{gig.deliveryDays} day delivery</span>
        </div>

        <p className="text-xs text-slate-400 dark:text-slate-500 mt-4">
          Offered by {gig.provider?.name} {gig.provider?.college && `· ${gig.provider.college}`}
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {!isOwner && (
            <button
              onClick={() => navigate(`/chat?with=${gig.provider._id}&gig=${gig._id}`)}
              className="rounded-full bg-brand-gradient text-white px-5 py-2.5 text-sm font-semibold"
            >
              Contact {gig.provider?.name}
            </button>
          )}
          {isOwner && (
            <button
              onClick={handleDelete}
              className="rounded-full border border-red-400 text-red-500 px-5 py-2.5 text-sm font-semibold"
            >
              Delete Gig
            </button>
          )}
        </div>
      </div>
    </div>
  );
}