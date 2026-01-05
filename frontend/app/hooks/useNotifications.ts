import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export function useNotifications() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('notificationsEnabled') === 'true';
      setNotificationsEnabled(stored);
    }
  }, []);

  const toggleNotifications = async () => {
    if (!notificationsEnabled && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        localStorage.setItem('notificationsEnabled', 'true');
        toast.success('Notifications enabled!');
      } else {
        toast.error('Please enable notifications in your browser settings.');
      }
    } else {
      setNotificationsEnabled(false);
      localStorage.setItem('notificationsEnabled', 'false');
    }
  };

  return { notificationsEnabled, toggleNotifications, mounted };
}