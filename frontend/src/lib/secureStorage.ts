import CryptoJS from 'crypto-js';

const STORAGE_KEY = 'lumora-secure-storage-key';
let inMemoryFallbackKey: string | null = null;

const getSecretKey = () => {
  if (typeof window === 'undefined') {
    // Return a placeholder for SSR/build time
    return 'ssr-placeholder-key';
  }

  try {
    let key = localStorage.getItem(STORAGE_KEY);

    if (!key) {
      // Generate a cryptographically strong random 256-bit key
      // This ensures each device has its own unique key and it's not in the source code
      const array = new Uint8Array(32);
      window.crypto.getRandomValues(array);
      key = Array.from(array)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      localStorage.setItem(STORAGE_KEY, key);
    }

    return key;
  } catch (error) {
    // Fallback for environments where localStorage might be restricted (e.g. private browsing)
    // We use a per-session in-memory random key instead of a hardcoded one
    if (!inMemoryFallbackKey) {
      const array = new Uint8Array(32);
      window.crypto.getRandomValues(array);
      inMemoryFallbackKey = Array.from(array)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    }
    console.error('Encryption key storage failed, using session-only key:', error);
    return inMemoryFallbackKey;
  }
};

export const secureStorage = {
  setItem: (key: string, value: any) => {
    try {
      if (typeof window === 'undefined') return;
      const SECRET_KEY = getSecretKey();
      const stringValue = JSON.stringify(value);
      const encrypted = CryptoJS.AES.encrypt(stringValue, SECRET_KEY).toString();
      localStorage.setItem(key, encrypted);
    } catch (error) {
      console.error('Encryption failed:', error);
      throw error;
    }
  },

  getItem: (key: string) => {
    try {
      if (typeof window === 'undefined') return null;
      const SECRET_KEY = getSecretKey();
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return null;
      const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      if (!decrypted) {
        // Corrupted data, remove it
        localStorage.removeItem(key);
        return null;
      }
      return JSON.parse(decrypted);
    } catch (error) {
      // Corrupted or invalid data, remove it
      if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
      }
      return null;
    }
  },

  removeItem: (key: string) => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  },

  clear: () => {
    if (typeof window === 'undefined') return;
    localStorage.clear();
  },

  exportData: (filename: string, data: any) => {
    const SECRET_KEY = getSecretKey();
    const jsonString = JSON.stringify(data);
    const encrypted = CryptoJS.AES.encrypt(jsonString, SECRET_KEY).toString();
    const blob = new Blob([encrypted], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.enc`;
    a.click();
    URL.revokeObjectURL(url);
  }
};
