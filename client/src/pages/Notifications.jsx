import { HiOutlineChatBubbleLeftRight, HiOutlineTag, HiOutlineShieldCheck, HiOutlineHeart } from 'react-icons/hi2';

const notifications = [
  { icon: HiOutlineChatBubbleLeftRight, text: 'Ananya sent you a new message about "TI-84 Calculator"', time: '10m ago' },
  { icon: HiOutlineTag, text: 'Your listing "Dell Inspiron 15" received an offer of ₹26,000', time: '1h ago' },
  { icon: HiOutlineShieldCheck, text: 'Your seller verification was approved!', time: '3h ago' },
  { icon: HiOutlineHeart, text: '3 people saved your "Mountain Cycle" listing', time: '1d ago' }
];

export default function Notifications() {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
      <h1 className="font-display text-2xl font-bold">Notifications</h1>
      <div className="mt-6 space-y-3">
        {notifications.map((n, i) => (
          <div key={i} className="glass-card flex items-start gap-3 p-4">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-gradient-soft text-primary-600 dark:text-primary-400"><n.icon className="h-4 w-4" /></div>
            <div>
              <p className="text-sm">{n.text}</p>
              <p className="mt-1 text-xs text-slate-400">{n.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
