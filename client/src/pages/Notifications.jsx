import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiOutlineChatBubbleLeftRight, HiOutlineTag, HiOutlineShieldCheck, HiOutlineHeart, HiOutlineBell } from 'react-icons/hi2';
import api, { getErrorMessage } from '../lib/api.js';
import { timeAgo } from '../lib/geo.js';
import { io } from 'socket.io-client';

const iconFor = (type) => {
  switch (type) {
    case 'new_product': return HiOutlineTag;
    case 'message': return HiOutlineChatBubbleLeftRight;
    case 'offer': return HiOutlineHeart;
    default: return HiOutlineShieldCheck;
  }
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get('/notifications')
      .then((res) => setNotifications(res.data.notifications || []))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();

    // Setup real-time socket listener for live notifications
    const socketUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const socket = io(socketUrl);

    socket.on('newNotification', (newNotif) => {
      setNotifications((prev) => [newNotif, ...prev]);
      toast(newNotif.text, { icon: '🔔' });
      
      // Play notification sound if available in public folder
      try {
        const audio = new Audio('/notification-sound.mp3');
        audio.play().catch(() => {});
      } catch (e) {
        // Ignore audio playback blocks
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-slate-800 dark:text-white">Notifications</h1>
        {notifications.some((n) => !n.read) && (
          <button onClick={markAllRead} className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline">
            Mark all as read
          </button>
        )}
      </div>

      <div className="mt-6 space-y-3">
        {loading && <p className="text-sm text-slate-400">Loading...</p>}

        {!loading && notifications.length === 0 && (
          <div className="glass-card flex flex-col items-center gap-2 p-10 text-center text-slate-400">
            <HiOutlineBell className="h-8 w-8" />
            <p className="text-sm">No notifications yet.</p>
          </div>
        )}

        {notifications.map((n) => {
          const Icon = iconFor(n.type);
          const content = (
            <div
              className={`glass-card flex items-start gap-3 p-4 transition cursor-pointer ${
                !n.read 
                  ? 'border border-primary-400/40 bg-primary-50/20 dark:bg-primary-500/5' 
                  : 'hover:bg-slate-50 dark:hover:bg-white/5'
              }`}
              onClick={() => !n.read && markRead(n._id)}
            >
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-gradient-soft text-primary-600 dark:text-primary-400">
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-800 dark:text-slate-200">{n.text}</p>
                <p className="mt-1 text-xs text-slate-400">{timeAgo(n.createdAt)}</p>
              </div>
              {!n.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary-500" />}
            </div>
          );
          return n.link ? (
            <Link key={n._id} to={n.link} onClick={() => !n.read && markRead(n._id)}>
              {content}
            </Link>
          ) : (
            <div key={n._id}>{content}</div>
          );
        })}
      </div>
    </div>
  );
}