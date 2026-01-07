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
    if (!notificationsEnabled) {
      if ('Notification' in window) {
        try {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            setNotificationsEnabled(true);
            localStorage.setItem('notificationsEnabled', 'true');
            toast.success('Notifications enabled!');
            // Test notification
            new Notification('Lumora', {
              body: 'Notifications are now enabled!',
              icon: '/lumora-icon-192.png'
            });
          } else {
            toast.error('Notification permission denied. Please enable in browser settings.');
          }
        } catch (error) {
          toast.error('Failed to request notification permission.');
        }
      } else {
        toast.error('Notifications not supported on this device.');
      }
    } else {
      setNotificationsEnabled(false);
      localStorage.setItem('notificationsEnabled', 'false');
      toast.success('Notifications disabled');
    }
  };

  return { notificationsEnabled, toggleNotifications, mounted };
}