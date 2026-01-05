import CryptoJS from 'crypto-js';

const getSecretKey = () => {
  if (typeof window === 'undefined') {
    throw new Error('Encryption not available during build time');
  }
  const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
  if (!key || key === 'default-dev-key-do-not-use-in-prod') {
    throw new Error('NEXT_PUBLIC_ENCRYPTION_KEY must be set in environment variables');
  }
  return key;
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
