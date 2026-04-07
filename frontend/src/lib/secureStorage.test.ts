import { secureStorage } from './secureStorage';

// Mock window.crypto.getRandomValues
if (typeof window !== 'undefined' && !window.crypto) {
  (window as any).crypto = {
    getRandomValues: (array: Uint8Array) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    },
  };
}

describe('secureStorage', () => {
  const STORAGE_KEY_FOR_KEY = 'lumora-secure-storage-key';

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('generates and stores a new key if none exists', () => {
    const testKey = 'test-data-key';
    const testValue = { data: 'hello-world' };

    // This should trigger key generation
    secureStorage.setItem(testKey, testValue);

    // Verify key was generated and stored
    const storedKey = localStorage.getItem(STORAGE_KEY_FOR_KEY);
    expect(storedKey).toBeDefined();
    expect(storedKey).toMatch(/^[0-9a-f]{64}$/); // 256-bit key in hex

    // Verify data was encrypted and can be decrypted
    const retrievedValue = secureStorage.getItem(testKey);
    expect(retrievedValue).toEqual(testValue);
  });

  test('reuses an existing key from localStorage', () => {
    const existingKey = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    localStorage.setItem(STORAGE_KEY_FOR_KEY, existingKey);

    const testKey = 'test-data-key';
    const testValue = { foo: 'bar' };

    secureStorage.setItem(testKey, testValue);

    // Verify it used our existing key
    expect(localStorage.getItem(STORAGE_KEY_FOR_KEY)).toBe(existingKey);

    const retrievedValue = secureStorage.getItem(testKey);
    expect(retrievedValue).toEqual(testValue);
  });

  test('getItem returns null for non-existent keys', () => {
    expect(secureStorage.getItem('non-existent')).toBeNull();
  });

  test('handles corrupted data gracefully', () => {
    // Set a key so encryption is available
    localStorage.setItem(STORAGE_KEY_FOR_KEY, '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef');

    // Set some random non-encrypted data
    localStorage.setItem('corrupted', 'this is not encrypted');

    const value = secureStorage.getItem('corrupted');
    expect(value).toBeNull();
    // It should have cleaned up the corrupted data
    expect(localStorage.getItem('corrupted')).toBeNull();
  });

  test('removeItem deletes the correct key', () => {
    secureStorage.setItem('key1', 'val1');
    secureStorage.setItem('key2', 'val2');

    secureStorage.removeItem('key1');

    expect(secureStorage.getItem('key1')).toBeNull();
    expect(secureStorage.getItem('key2')).toBe('val2');
  });

  test('clear deletes all keys but the encryption key is regenerated if needed', () => {
    secureStorage.setItem('key1', 'val1');
    const oldKey = localStorage.getItem(STORAGE_KEY_FOR_KEY);

    secureStorage.clear();

    expect(localStorage.getItem('key1')).toBeNull();
    // After clear, if we call getItem, it might regenerate a key if we're not careful,
    // but secureStorage.clear() calls localStorage.clear() which removes the encryption key too.
    expect(localStorage.getItem(STORAGE_KEY_FOR_KEY)).toBeNull();

    secureStorage.setItem('key2', 'val2');
    const newKey = localStorage.getItem(STORAGE_KEY_FOR_KEY);
    expect(newKey).toBeDefined();
    expect(newKey).not.toBe(oldKey);
  });
});
