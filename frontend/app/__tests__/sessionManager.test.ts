import { describe, it, expect, beforeEach, afterEach, mock, spyOn } from "bun:test";
import { sessionManager } from '../lib/sessionManager';
import { logger } from '../lib/logger';

// We can mock the logger using bun:test's mock utilities or by just spying
// Since we want to use `bun test`, let's just spy on logger.error

describe('SessionManager', () => {
  let originalLocalStorage: Storage;
  let loggerErrorSpy: any;

  beforeEach(() => {
    // Save original localStorage
    originalLocalStorage = global.localStorage;

    // Create a mock localStorage
    const localStorageMock = (() => {
      let store: Record<string, string> = {};
      return {
        getItem: mock((key: string) => store[key] || null),
        setItem: mock((key: string, value: string) => {
          store[key] = value.toString();
        }),
        removeItem: mock((key: string) => {
          delete store[key];
        }),
        clear: mock(() => {
          store = {};
        }),
        length: 0,
        key: mock(),
      };
    })();

    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true
    });

    loggerErrorSpy = spyOn(logger, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore original localStorage
    Object.defineProperty(global, 'localStorage', {
      value: originalLocalStorage,
      writable: true
    });

    loggerErrorSpy.mockRestore();
  });

  describe('setActiveChat', () => {
    it('should set active chat in localStorage successfully', () => {
      const chatId = 'test-chat-123';
      sessionManager.setActiveChat(chatId);

      expect(global.localStorage.setItem).toHaveBeenCalledWith('lumora_active_chat_id', chatId);
      expect(global.localStorage.setItem).toHaveBeenCalledWith('lumora_from_history', 'true');
      expect(loggerErrorSpy).not.toHaveBeenCalled();
    });

    it('should handle errors when setting active chat fails', () => {
      // Mock localStorage.setItem to throw an error
      const error = new Error('Storage quota exceeded');
      (global.localStorage.setItem as any).mockImplementation(() => {
        throw error;
      });

      const chatId = 'test-chat-123';
      sessionManager.setActiveChat(chatId);

      expect(global.localStorage.setItem).toHaveBeenCalledWith('lumora_active_chat_id', chatId);
      expect(loggerErrorSpy).toHaveBeenCalledWith('Failed to set active chat:', { error });
    });
  });
});
