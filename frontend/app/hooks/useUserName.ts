import { useState, useEffect } from 'react';
import { storage, STORAGE_KEYS } from '@/lib/storage';

export const useUserName = () => {
  const [userName, setUserName] = useState('User');

  useEffect(() => {
    setUserName(storage.get(STORAGE_KEYS.USER_NAME) || 'User');
  }, []);

  return userName;
};
