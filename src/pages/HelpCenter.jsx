import { useState } from 'react';
import { HiChevronDown } from 'react-icons/hi2';

const faqs = [
  {
    q: 'How do I verify my student account?',
    a: 'Sign up with your college email address and confirm the one-time code (OTP) sent to it. This keeps CollegeKart limited to genuine students and helps everyone trust who they\'re buying from or selling to.'
  },
  {
    q: 'What can I actually buy and sell on CollegeKart?',
    a: 'Textbooks, calculators, furniture, electronics, and general items on the Marketplace; class notes and study material under Notes; freelance skills like tutoring, design, or editing under Gigs; and one-off tasks you need help with under Service Requests, where other students can bid on your job.'
  },
  {
    q: 'Is Cash on Delivery available?',
    a: 'Yes. Most sellers arrange a simple campus meet-up and accept cash in person. If a seller has enabled online payment, you can also pay through Stripe or Razorpay directly at checkout.'
  },
  {
    q: 'How do I message a seller or buyer?',
    a: 'Open any listing and tap "Chat" or "Message Seller" to start a conversation. All messages are tied to your account, and you\'ll get a notification the moment they reply — even if you\'re not on the site at that moment.'
  },
  {
    q: 'How do Service Requests and bidding work?',
    a: 'Post what you need done — tutoring, moving help, design work, anything — along with your budget. Other students can place bids with their price and a short message. You choose the bid that works best and the request moves to "Assigned" once you accept.'
  },
  {
    q: 'How do I report a suspicious listing or user?',
    a: 'Open the listing and tap "Report." Our team reviews every report and will remove listings that violate our guidelines, including anything that looks fake, unsafe, or misleading.'
  },
  {
    q: 'Can I edit or delete a listing after posting?',
    a: 'Yes. Go to your Dashboard, select the listing, and you can update the details, price, or photos, or remove it entirely at any time.'
  },
  {
    q: 'Why am I not getting notifications?',
    a: 'Make sure you\'ve allowed notifications when prompted after logging in. On Android, also check that Chrome has notification permission enabled in your phone\'s system settings. If you\'re on a campus WiFi network, some networks restrict push notification traffic — mobile data usually works if that happens.'
  },
  {
    q: 'What is CollegeKart Premium?',
    a: 'Premium sellers get their gigs and listings featured higher in search results, along with a verified badge that helps buyers trust your profile faster. You can upgrade anytime from your Profile page.'
  },
  {
    q: 'Is my personal information safe?',
    a: 'Your phone number and exact location are only ever shown to someone once you choose to share them (for example, by posting a listing with contact details). We don\'t sell your data, and all accounts require verified student email addresses.'
  }
];

export default function HelpCenter() {
  const [open, setOpen] = useState(0);
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-14">
      <span className="section-eyebrow">We're here to help</span>
      <h1 className="mt-2 font-display text-2xl font-bold">Help Center</h1>
      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
        Answers to the most common questions about buying, selling, and staying safe on CollegeKart. Can't find what you're looking for? Reach out on our Contact page.
      </p>

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