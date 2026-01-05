'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface UserContextType {
  firstName: string;
  lastName: string;
  fullName: string;
  initials: string;
  setFirstName: (name: string) => void;
  setLastName: (name: string) => void;
}

const UserContext = createContext<UserContextType>({
  firstName: 'User',
  lastName: '',
  fullName: 'User',
  initials: 'U',
  setFirstName: () => {},
  setLastName: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
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

  const fullName = lastName ? `${firstName} ${lastName}` : firstName;
  const initials = lastName 
    ? `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
    : firstName.charAt(0).toUpperCase();

  return (
    <UserContext.Provider value={{
      firstName,
      lastName,
      fullName,
      initials,
      setFirstName,
      setLastName,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}