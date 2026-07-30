import { Link } from 'react-router-dom';

const isPremiumActive = (provider) => provider?.premiumExpiresAt && new Date(provider.premiumExpiresAt) > new Date();

export default function GigCard({ gig }) {
  const premium = isPremiumActive(gig.provider);
  return (
    <Link
      to={`/gigs/${gig._id}`}
      className={`rounded-2xl border p-4 shadow-sm hover:shadow-lg transition flex flex-col ${
        premium
          ? "border-amber-300 dark:border-amber-500/50 bg-amber-50/40 dark:bg-amber-500/5"
          : "border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5"
      }`}
    >
      {gig.portfolioImage && (
        <img src={gig.portfolioImage} alt={gig.title} className="w-full h-24 object-cover rounded-xl mb-3" />
      )}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="rounded-full bg-primary-50 dark:bg-white/10 text-primary-600 dark:text-primary-400 text-xs font-semibold px-2.5 py-1 capitalize">
          Gig · {gig.category}
        </span>
        {premium && (
          <span className="rounded-full bg-amber-400 text-amber-900 text-[10px] font-bold px-2 py-0.5 uppercase">
            ⭐
          </span>
        )}
      </div>
      <h3 className="mt-3 font-display font-semibold text-sm text-slate-800 dark:text-white line-clamp-2">
        {gig.title}
      </h3>
      <div className="flex items-center justify-between mt-2">
        <span className="font-bold text-primary-600 dark:text-primary-400 text-sm">₹{gig.price}</span>
        <span className="text-xs text-slate-400 dark:text-slate-500">{gig.deliveryDays}d delivery</span>
      </div>
      <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">by {gig.provider?.name}</p>
    </Link>
  );
}