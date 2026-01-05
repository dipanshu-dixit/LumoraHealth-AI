import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(`Error loading ${key}:`, error);
    } finally {
      setIsLoading(false);
    }
  }, [key]);

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      // Async write to not block UI
      requestIdleCallback(() => {
        try {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (err) {
          console.error(`Error writing to localStorage for ${key}:`, err);
        }
      });
    } catch (error) {
      console.error(`Error saving ${key}:`, error instanceof Error ? error.message : 'Unknown error');
    }
  }, [key, storedValue]);

  return [storedValue, setValue, isLoading] as const;
}
