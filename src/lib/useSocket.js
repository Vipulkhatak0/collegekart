import { useEffect } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

export function useGlobalSocket(currentUser) {
  useEffect(() => {
    if (!currentUser?._id) return;

    // Automatically fall back to current domain if VITE_API_URL isn't set
    const socketUrl = import.meta.env.VITE_API_URL || window.location.origin;
    
    const socket = io(socketUrl, {
      transports: ['polling', 'websocket'], // Ensures stable connection through proxies
      secure: true,
    });

    // Join personal socket room upon connection
    socket.emit('join', currentUser._id);

    // Listen for incoming live messages
    socket.on('newMessage', (message) => {
      if (message.receiver._id === currentUser._id && message.sender._id !== currentUser._id) {
        toast.success(`${message.sender.name}: ${message.text}`, {
          icon: '💬',
          duration: 4000,
        });

        playChime();
      }
    });

    // Listen for live general notifications
    socket.on('newNotification', (notif) => {
      toast(notif.text, { icon: '🔔' });
      playChime();
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUser]);
}

// Safe audio trigger that bypasses browser autoplay blocking errors
function playChime() {
  try {
    const audio = new Audio('/notification-sound.mp3');
    audio.play().catch(() => {});
  } catch (e) {
    // Browsers block un-interacted audio, fail silently
  }
}