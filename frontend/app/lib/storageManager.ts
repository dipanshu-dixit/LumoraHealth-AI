// Centralized storage manager to prevent conflicts between localStorage and secureStorage
import { storage, STORAGE_KEYS } from '@/lib/storage';

export class StorageManager {
  private static instance: StorageManager;
  private saveQueue: Map<string, any> = new Map();
  private saveTimeout: number | null = null;

  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  // Debounced save to prevent rapid saves
  queueSave(key: string, value: any, delay: number = 1000) {
    this.saveQueue.set(key, value);
    
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    
    this.saveTimeout = setTimeout(() => {
      this.flushQueue();
    }, delay);
  }

  private flushQueue() {
    for (const [key, value] of this.saveQueue) {
      try {
        if (key === 'lumora-chat-history') {
          // Use localStorage for chat history (not encrypted)
          localStorage.setItem(key, JSON.stringify(value));
        } else {
          // Use secure storage for other data
          storage.set(key, value);
        }
      } catch (error) {
        console.error(`Failed to save ${key}:`, error);
      }
    }
    this.saveQueue.clear();
  }

  // Immediate save (for critical data)
  saveImmediate(key: string, value: any) {
    try {
      if (key === 'lumora-chat-history') {
        localStorage.setItem(key, JSON.stringify(value));
      } else {
        storage.set(key, value);
      }
    } catch (error) {
      console.error(`Failed to save ${key}:`, error);
    }
  }

  // Get data with fallback
  get(key: string): any {
    try {
      if (key === 'lumora-chat-history') {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
      } else {
        return storage.get(key);
      }
    } catch (error) {
      console.error(`Failed to get ${key}:`, error);
      return null;
    }
  }

  // Clear specific key
  remove(key: string) {
    try {
      if (key === 'lumora-chat-history') {
        localStorage.removeItem(key);
      } else {
        storage.remove(key);
      }
    } catch (error) {
      console.error(`Failed to remove ${key}:`, error);
    }
  }

  // Clear all session data
  clearSession() {
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
    }
  }
}

export const storageManager = StorageManager.getInstance();