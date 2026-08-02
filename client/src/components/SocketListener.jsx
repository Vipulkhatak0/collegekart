import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useGlobalSocket } from '@/lib/useSocket';
import { requestNotificationPermission } from '@/services/notificationService';

export default function SocketListener() {
  const { currentUser } = useAuth();
  useGlobalSocket(currentUser);

  useEffect(() => {
    requestNotificationPermission();

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(err => console.error(err));
      });
    }
  }, []);

  return null;
}