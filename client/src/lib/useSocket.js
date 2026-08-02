import { useEffect } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

export function useGlobalSocket(currentUser) {
  useEffect(() => {
    if (!currentUser?._id) return;

    const socketUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const socket = io(socketUrl);

    // Join personal socket room upon connection
    socket.emit('join', currentUser._id);

    // Listen for incoming live messages
    socket.on('newMessage', (message) => {
      if (message.receiver._id === currentUser._id && message.sender._id !== currentUser._id) {
        toast.success(`${message.sender.name}: ${message.text}`, {
          icon: '💬',
          duration: 4000,
        });

        try {
          const audio = new Audio('/notification-sound.mp3');
          audio.play().catch(() => {});
        } catch (e) {}
      }
    });

    // Listen for live general notifications
    socket.on('newNotification', (notif) => {
      toast(notif.text, { icon: '🔔' });
      try {
        const audio = new Audio('/notification-sound.mp3');
        audio.play().catch(() => {});
      } catch (e) {}
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUser]);
}