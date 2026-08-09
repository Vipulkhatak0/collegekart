import { useEffect } from 'react';
import toast from 'react-hot-toast';
import useAuth from '../context/AuthContext.jsx';
import { requestNotificationPermission, listenForForegroundMessages } from '../firebase.js';

export default function PushNotificationListener() {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    requestNotificationPermission(user.role === 'admin' || user.isAdmin === true);

    const unsubscribe = listenForForegroundMessages((payload) => {
      toast(payload.notification?.title || 'New notification', { icon: '🔔' });
    });

    return () => unsubscribe && unsubscribe();
  }, [isAuthenticated, user]);

  return null;
}