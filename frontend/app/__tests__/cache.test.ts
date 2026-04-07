import { getCached, setCache, clearCache } from '../lib/cache';

describe('cache utils', () => {
  beforeEach(() => {
    clearCache();
    jest.spyOn(Date, 'now').mockImplementation(() => 1000000000000); // Set a fixed base time
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('setCache and getCached', () => {
    it('should store and retrieve data correctly', () => {
      setCache('test-key', { foo: 'bar' });
      const result = getCached<{ foo: string }>('test-key');
      expect(result).toEqual({ foo: 'bar' });
    });

    it('should return null for non-existent keys', () => {
      const result = getCached('non-existent');
      expect(result).toBeNull();
    });

    it('should return null and delete key if data has expired', () => {
      setCache('test-key', { foo: 'bar' });

      // Fast forward time past TTL (5 minutes = 300000ms)
      // We advance by 300001ms to ensure it's strictly greater than CACHE_TTL
      jest.spyOn(Date, 'now').mockImplementation(() => 1000000000000 + 5 * 60 * 1000 + 1);

      const result = getCached('test-key');
      expect(result).toBeNull();

      // A subsequent get shouldn't crash and should still be null
      expect(getCached('test-key')).toBeNull();
    });

    it('should return data if it has not expired', () => {
      setCache('test-key', { foo: 'bar' });

      // Fast forward time slightly less than TTL
      jest.spyOn(Date, 'now').mockImplementation(() => 1000000000000 + 5 * 60 * 1000 - 1000);

      const result = getCached<{ foo: string }>('test-key');
      expect(result).toEqual({ foo: 'bar' });
    });
  });

  describe('clearCache', () => {
    it('should clear all data', () => {
      setCache('key1', 'value1');
      setCache('key2', 'value2');

      clearCache();

      expect(getCached('key1')).toBeNull();
      expect(getCached('key2')).toBeNull();
    });
  });
});
