import { useState } from 'react';
import { HiChevronDown } from 'react-icons/hi2';

const faqs = [
  { q: 'How do I verify my student account?', a: 'Sign up with your official campus email address and confirm the OTP sent to it.' },
  { q: 'Is Cash on Delivery available?', a: 'Yes — you can arrange a campus meet-up and pay in person, or use online payment via Stripe/Razorpay.' },
  { q: 'How do I report a suspicious listing?', a: 'Open the listing and tap "Report" — our team reviews all reports within 24 hours.' },
  { q: 'Can I edit a listing after posting?', a: 'Yes, go to your Dashboard, select the listing, and update details anytime.' }
];

export default function HelpCenter() {
  const [open, setOpen] = useState(0);
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-14">
      <span className="section-eyebrow">We're here to help</span>
      <h1 className="mt-2 font-display text-2xl font-bold">Help Center</h1>

      <div className="mt-8 space-y-3">
        {faqs.map((f, i) => (
          <div key={i} className="glass-card overflow-hidden">
            <button onClick={() => setOpen(open === i ? -1 : i)} className="flex w-full items-center justify-between p-4 text-left text-sm font-semibold">
              {f.q}
              <HiChevronDown className={`h-4 w-4 transition-transform ${open === i ? 'rotate-180' : ''}`} />
            </button>
            {open === i && <p className="px-4 pb-4 text-sm text-slate-500 dark:text-slate-400">{f.a}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
