import { describe, it, expect, mock, beforeEach, afterEach } from 'bun:test';
import { generateDeviceId, getDeviceId } from '../deviceId';

describe('deviceId', () => {
  let mockStorage: Record<string, string> = {};

  beforeEach(() => {
    mockStorage = {};

    // Mock canvas and its context
    const mockCtx = {
      textBaseline: '',
      font: '',
      fillText: mock(() => {}),
    };

    const mockCanvas = {
      getContext: mock(() => mockCtx),
      toDataURL: mock(() => 'data:image/png;base64,mockdata'),
    };

    // Global mocks
    global.document = {
      createElement: mock((tag: string) => {
        if (tag === 'canvas') return mockCanvas;
        return {};
      }),
    } as any;

    global.navigator = {
      userAgent: 'MockUserAgent/1.0',
      language: 'en-US',
    } as any;

    global.screen = {
      width: 1920,
      height: 1080,
    } as any;

    global.localStorage = {
      getItem: mock((key: string) => mockStorage[key] || null),
      setItem: mock((key: string, value: string) => {
        mockStorage[key] = value;
      }),
    } as any;
  });

  afterEach(() => {
    // Clean up
    delete (global as any).document;
    delete (global as any).navigator;
    delete (global as any).screen;
    delete (global as any).localStorage;
  });

  describe('generateDeviceId', () => {
    it('should generate a string device ID', () => {
      const id = generateDeviceId();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    it('should generate the same ID for the same environment', () => {
      const id1 = generateDeviceId();
      const id2 = generateDeviceId();
      expect(id1).toBe(id2);
    });

    it('should generate a different ID for a different environment', () => {
      const id1 = generateDeviceId();

      // Change environment slightly
      global.navigator = {
        ...global.navigator,
        userAgent: 'AnotherUserAgent/2.0',
      } as any;

      const id2 = generateDeviceId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('getDeviceId', () => {
    it('should retrieve existing device ID from localStorage', () => {
      mockStorage['lumora-device-id'] = 'existing-id-123';
      const id = getDeviceId();
      expect(id).toBe('existing-id-123');
      expect(global.localStorage.getItem).toHaveBeenCalledWith('lumora-device-id');
      expect(global.localStorage.setItem).not.toHaveBeenCalled();
    });

    it('should generate and save new device ID if not in localStorage', () => {
      const id = getDeviceId();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
      expect(global.localStorage.getItem).toHaveBeenCalledWith('lumora-device-id');
      expect(global.localStorage.setItem).toHaveBeenCalledWith('lumora-device-id', id);
      expect(mockStorage['lumora-device-id']).toBe(id);
    });
  });
});
