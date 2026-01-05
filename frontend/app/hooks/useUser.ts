'use client';

import { useState, useEffect } from 'react';

export function useUser() {
  const [firstName, setFirstNameState] = useState('User');
  const [lastName, setLastNameState] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedFirstName = localStorage.getItem('lumora-user-first-name') || 'User';
      const savedLastName = localStorage.getItem('lumora-user-last-name') || '';
      setFirstNameState(savedFirstName);
      setLastNameState(savedLastName);
    }
  }, []);

  const setFirstName = (name: string) => {
    setFirstNameState(name);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lumora-user-first-name', name);
    }
  };

  const setLastName = (name: string) => {
    setLastNameState(name);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lumora-user-last-name', name);
    }
  };

  // Listen for storage changes from other components
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'lumora-user-first-name' && e.newValue) {
        setFirstNameState(e.newValue);
      }
      if (e.key === 'lumora-user-last-name' && e.newValue) {
        setLastNameState(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const fullName = lastName ? `${firstName} ${lastName}` : firstName;
  const initials = lastName 
    ? `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
    : firstName.charAt(0).toUpperCase();

  return {
    firstName,
    lastName,
    fullName,
    initials,
    setFirstName,
    setLastName,
  };
}