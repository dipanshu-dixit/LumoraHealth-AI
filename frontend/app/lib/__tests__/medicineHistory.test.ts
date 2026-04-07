import { MedicineHistory } from '../medicineHistory';
import { storage, STORAGE_KEYS } from '../../../src/lib/storage';

import { mock, test as it, expect, describe, beforeEach, jest, beforeAll } from "bun:test";

beforeAll(() => {
  global.window = {
    setTimeout: (cb) => setTimeout(cb, 0),
    clearTimeout: (id) => clearTimeout(id)
  } as any;
});

// Mock storage
mock.module('../../../src/lib/storage', () => ({
  storage: {
    get: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
  },
  STORAGE_KEYS: {
    MEDICINE_HISTORY: 'MEDICINE_HISTORY',
  },
}));

describe('MedicineHistoryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    MedicineHistory.clearHistory();
  });

  describe('loadHistory', () => {
    it('should handle empty storage', () => {
      (storage.get as ReturnType<typeof jest.fn>).mockReturnValue(null);
      const result = MedicineHistory.loadHistory();
      expect(result).toEqual([]);
    });

    it('should load and deduplicate history', () => {
      const mockData = [
        { medicine: 'Aspirin', timestamp: 1000 },
        { medicine: 'aspirin ', timestamp: 2000 },
        { medicine: 'Tylenol', timestamp: 3000 },
      ];
      (storage.get as ReturnType<typeof jest.fn>).mockReturnValue(mockData);

      const result = MedicineHistory.loadHistory();

      // Should contain 2 items: Aspirin and Tylenol
      // And should pick the first seen in the array
      expect(result).toHaveLength(2);
      expect(result[0].medicine).toBe('Aspirin');
      expect(result[1].medicine).toBe('Tylenol');
    });

    it('should limit history to 10 items', () => {
      const mockData = Array.from({ length: 15 }, (_, i) => ({
        medicine: `Med${i}`,
        timestamp: 1000 + i,
      }));
      (storage.get as ReturnType<typeof jest.fn>).mockReturnValue(mockData);

      const result = MedicineHistory.loadHistory();
      expect(result).toHaveLength(10);
    });
  });

  describe('addToHistory', () => {
    it('should add a new medicine to history', () => {
      MedicineHistory.addToHistory('Advil');
      const history = MedicineHistory.getHistory();
      expect(history).toHaveLength(1);
      expect(history[0].medicine).toBe('Advil');
    });

    it('should move an existing medicine to the top', () => {
      MedicineHistory.addToHistory('Aspirin');
      MedicineHistory.addToHistory('Tylenol');
      MedicineHistory.addToHistory('Aspirin'); // Re-add Aspirin

      const history = MedicineHistory.getHistory();
      expect(history).toHaveLength(2);
      expect(history[0].medicine).toBe('Aspirin');
      expect(history[1].medicine).toBe('Tylenol');
    });
  });

  describe('findCached', () => {
    it('should find a cached medicine by name if it has a response', () => {
      MedicineHistory.addToHistory('Aspirin', 'Response for Aspirin');
      MedicineHistory.addToHistory('Tylenol'); // No response

      const found = MedicineHistory.findCached('aspirin ');
      expect(found).toBeDefined();
      expect(found?.response).toBe('Response for Aspirin');

      const notFound = MedicineHistory.findCached('tylenol');
      expect(notFound).toBeUndefined();
    });
  });
});
