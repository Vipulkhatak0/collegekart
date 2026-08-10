import { useEffect } from 'react';
import useAuth from '../context/AuthContext';
import { useGlobalSocket } from '../lib/useSocket';
import { requestNotificationPermission } from '../services/notificationService';

export default function SocketListener() {
  const { user: currentUser } = useAuth();
  useGlobalSocket(currentUser);

  useEffect(() => {
    requestNotificationPermission();

    
  }, []);

  return null;
}