import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { HiOutlinePaperAirplane, HiCheckBadge } from 'react-icons/hi2';
import api, { SOCKET_URL, getErrorMessage } from '../lib/api.js';
import useAuth from '../context/AuthContext.jsx';
import { timeAgo } from '../lib/geo.js';

export default function Chat() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const startWithUserId = searchParams.get('with');
  const startProductId = searchParams.get('product');

  const [threads, setThreads] = useState([]); // [{ userId, name, avatar, product, lastMessage, time }]
  const [activeUserId, setActiveUserId] = useState(startWithUserId || null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loadingThreads, setLoadingThreads] = useState(true);
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  const myId = user?.id || user?._id;

  // Build the thread list from all messages the user has ever sent/received.
  const loadThreads = useCallback(async () => {
    setLoadingThreads(true);
    try {
      const { data } = await api.get('/messages/threads');
      const map = new Map();
      for (const m of data.messages) {
        const other = m.sender._id === myId ? m.receiver : m.sender;
        if (!map.has(other._id) || new Date(m.createdAt) > new Date(map.get(other._id).time)) {
          map.set(other._id, {
            userId: other._id, name: other.name, avatar: other.avatar,
            product: m.product?.title, lastMessage: m.text, time: m.createdAt
          });
        }
      }
      let list = Array.from(map.values()).sort((a, b) => new Date(b.time) - new Date(a.time));

      // If we arrived here via "Chat with seller" and there's no existing thread yet, synthesize one.
      if (startWithUserId && !list.some((t) => t.userId === startWithUserId)) {
        try {
          const { data: userData } = await api.get(`/users/${startWithUserId}`);
          list = [{ userId: startWithUserId, name: userData.user.name, avatar: userData.user.avatar, product: null, lastMessage: 'Start the conversation...', time: new Date().toISOString() }, ...list];
        } catch { /* seller lookup failed, ignore */ }
      }
      setThreads(list);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoadingThreads(false);
    }
  }, [myId, startWithUserId]);

  useEffect(() => { loadThreads(); }, [loadThreads]);

  // Load the conversation for whichever thread is active.
  useEffect(() => {
    if (!activeUserId) return;
    api.get(`/messages/${activeUserId}`)
      .then(({ data }) => setMessages(data.messages))
      .catch((err) => toast.error(getErrorMessage(err)));
  }, [activeUserId]);

  // Keep a ref of the active thread so the socket handler below always sees the latest value.
  const activeUserIdRef = useRef(activeUserId);
  useEffect(() => { activeUserIdRef.current = activeUserId; }, [activeUserId]);

  // Socket.io: join our own room, listen for incoming messages in real time.
  useEffect(() => {
    if (!myId) return;
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;
    socket.emit('join', myId);

    socket.on('newMessage', (message) => {
      setMessages((prev) => (prev.some((m) => m._id === message._id) ? prev : (
        (message.sender._id === activeUserIdRef.current || message.receiver._id === activeUserIdRef.current)
          ? [...prev, message] : prev
      )));
      loadThreads();
    });

    return () => socket.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const activeThread = useMemo(() => threads.find((t) => t.userId === activeUserId), [threads, activeUserId]);

  const send = async () => {
    if (!input.trim() || !activeUserId) return;
    const text = input.trim();
    setInput('');
    try {
      const { data } = await api.post('/messages', { receiverId: activeUserId, productId: startProductId || undefined, text });
      setMessages((prev) => (prev.some((m) => m._id === data.message._id) ? prev : [...prev, data.message]));
      loadThreads();
    } catch (err) {
      toast.error(getErrorMessage(err));
      setInput(text);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <h1 className="font-display text-2xl font-bold">Messages</h1>
      <div className="glass-card mt-6 grid grid-cols-1 md:grid-cols-3 overflow-hidden" style={{ minHeight: '520px' }}>
        <div className="border-b md:border-b-0 md:border-r border-slate-100 dark:border-white/10">
          {loadingThreads && <p className="p-4 text-xs text-slate-400">Loading conversations...</p>}
          {!loadingThreads && threads.length === 0 && <p className="p-4 text-xs text-slate-400">No conversations yet. Message a seller from a product page to get started.</p>}
          {threads.map((t) => (
            <button
              key={t.userId}
              onClick={() => setActiveUserId(t.userId)}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left ${activeUserId === t.userId ? 'bg-brand-gradient-soft' : 'hover:bg-slate-50 dark:hover:bg-white/5'}`}
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-brand-gradient font-display text-sm font-bold text-white">
                {t.avatar ? <img src={t.avatar} className="h-10 w-10 object-cover" alt="" /> : t.name?.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1 truncate text-sm font-semibold">{t.name}</p>
                <p className="truncate text-xs text-slate-400">{t.lastMessage}</p>
              </div>
              <span className="shrink-0 text-[10px] text-slate-400">{timeAgo(t.time)}</span>
            </button>
          ))}
        </div>

        <div className="col-span-2 flex flex-col">
          {activeThread ? (
            <>
              <div className="border-b border-slate-100 dark:border-white/10 p-4">
                <p className="flex items-center gap-1 text-sm font-semibold">{activeThread.name} <HiCheckBadge className="h-3.5 w-3.5 text-primary-500" /></p>
                {activeThread.product && <p className="text-xs text-slate-400">Re: {activeThread.product}</p>}
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {messages.map((m) => {
                  const mine = (m.sender._id || m.sender) === myId;
                  return (
                    <div key={m._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs rounded-2xl px-4 py-2 text-sm ${mine ? 'bg-brand-gradient text-white' : 'bg-slate-100 dark:bg-white/10'}`}>
                        {m.isOffer && <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide opacity-80">Offer: ₹{m.offerAmount}</p>}
                        {m.text}
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
              <div className="flex items-center gap-2 border-t border-slate-100 dark:border-white/10 p-4">
                <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Type a message..." className="input-field" />
                <button onClick={send} className="btn-primary !px-4 !py-3"><HiOutlinePaperAirplane className="h-4 w-4" /></button>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-sm text-slate-400">Select a conversation to start chatting</div>
          )}
        </div>
      </div>
    </div>
  );
}
