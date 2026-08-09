import { useEffect } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

export function useGlobalSocket(currentUser) {
  useEffect(() => {
    if (!currentUser?._id) return;

    // Get the base API URL and clean up any trailing /api or spaces
    let rawUrl = import.meta.env.VITE_API_URL || 'https://collegekart-server1.onrender.com';
    const socketUrl = rawUrl.replace(/\/api\/?$/, '').trim();
    
    const socket = io(socketUrl, {
      transports: ['polling', 'websocket'], // Ensures stable connection through proxies
      secure: true,
      withCredentials: true,
    });

    // Join personal socket room upon connection
    socket.emit('join', currentUser._id);

    // Listen for incoming live messages
    socket.on('newMessage', (message) => {
      // Handle populated or raw ID fields safely
      const receiverId = message.receiver?._id || message.receiver;
      const senderId = message.sender?._id || message.sender;
      const senderName = message.sender?.name || 'Someone';

      if (receiverId === currentUser._id && senderId !== currentUser._id) {
        toast.success(`${senderName}: ${message.text}`, {
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

// Safe audio trigger using your public notification sound file
function playChime() {
  try {
    const audio = new Audio('/notification-sound.mp3');
    audio.play().catch((err) => {
      console.log('Audio autoplay prevented by browser policy until user interaction:', err);
    });
  } catch (e) {
    // Fail silently if audio context is restricted
  }
}