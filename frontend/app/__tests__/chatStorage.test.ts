import { ChatStorage } from '../lib/chatStorage';

// Mock storage module
const mockStore: Record<string, string> = {};

jest.mock('../../src/lib/storage', () => ({
  STORAGE_KEYS: {
    CHAT_HISTORY: 'lumora-chat-history'
  },
  storage: {
    get: jest.fn((key: string) => mockStore[key] || null),
    set: jest.fn((key: string, value: string) => { mockStore[key] = value; }),
    remove: jest.fn((key: string) => { delete mockStore[key]; }),
    clear: jest.fn(() => {
      Object.keys(mockStore).forEach(key => delete mockStore[key]);
    })
  }
}));

import { storage } from '../../src/lib/storage';

describe('ChatStorage', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    Object.keys(mockStore).forEach(key => delete mockStore[key]);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('generateTitle', () => {
    test('generates title from user message', () => {
      const title = ChatStorage.generateTitle('I have a headache and feel dizzy');
      expect(title).toBe('Have a headache and feel');
    });

    test('removes question marks', () => {
      const title = ChatStorage.generateTitle('What causes headaches?');
      expect(title).toBe('Causes headaches');
    });

    test('returns default for empty message', () => {
      const title = ChatStorage.generateTitle('');
      expect(title).toBe('Health Consultation');
    });
  });

  describe('saveChat', () => {
    test('saves chat to localStorage', () => {
      const messages = [
        { id: '1', content: 'Hello', isUser: true, timestamp: new Date() }
      ];
      const chatId = ChatStorage.saveChat('Test Topic', messages);
      
      jest.runAllTimers(); // Advance timers for debounced save

      expect(chatId).toBeTruthy();
      expect(typeof chatId).toBe('string');
      const chats = ChatStorage.getAllChats();
      expect(chats).toHaveLength(1);
      expect(chats[0].topic).toBe('Test Topic');
    });

    test('generates smart title for generic topics', () => {
      const messages = [
        { id: '1', content: 'I have a fever', isUser: true, timestamp: new Date() }
      ];
      ChatStorage.saveChat('Health Consultation', messages);
      
      jest.runAllTimers(); // Advance timers for debounced save

      const chats = ChatStorage.getAllChats();
      expect(chats[0].topic).not.toBe('Health Consultation');
    });
  });

  describe('getAllChats', () => {
    test('returns empty array when no chats', () => {
      const chats = ChatStorage.getAllChats();
      expect(chats).toEqual([]);
    });

    test('returns all saved chats', () => {
      // saveChat returns early if messages are empty and not previously saved, but with a new random uuid
      // Wait, we need to pass a non-empty messages array for it to actually save new chats
      const messages1 = [{ id: '1', content: 'hello', isUser: true, timestamp: new Date() }];
      const messages2 = [{ id: '2', content: 'hello', isUser: true, timestamp: new Date() }];
      // We must pass different message ids to ensure different random generated chat ids
      ChatStorage.saveChat('Topic 1', messages1);
      jest.runAllTimers();
      ChatStorage.saveChat('Topic 2', messages2);

      jest.runAllTimers(); // Advance timers for debounced save
      
      const chats = ChatStorage.getAllChats();
      expect(chats).toHaveLength(2);
    });
  });

  describe('deleteChat', () => {
    test('removes chat by id', () => {
      const messages = [{ id: '1', content: 'hello', isUser: true, timestamp: new Date() }];
      const chatId = ChatStorage.saveChat('Test', messages);
      jest.runAllTimers();
      ChatStorage.deleteChat(chatId);
      
      const chats = ChatStorage.getAllChats();
      expect(chats).toHaveLength(0);
    });
  });

  describe('clearAllChats', () => {
    test('removes all chats', () => {
      const messages = [{ id: '1', content: 'hello', isUser: true, timestamp: new Date() }];
      ChatStorage.saveChat('Test 1', messages);
      ChatStorage.saveChat('Test 2', messages);
      jest.runAllTimers();
      ChatStorage.clearAllChats();
      
      const chats = ChatStorage.getAllChats();
      expect(chats).toHaveLength(0);
    });
  });

  describe('categorizeChat', () => {
    test('categorizes sleep topics', () => {
      expect(ChatStorage.categorizeChat('I have insomnia')).toBe('Sleep');
    });

    test('categorizes nutrition topics', () => {
      expect(ChatStorage.categorizeChat('What should I eat')).toBe('Nutrition');
    });

    test('categorizes pain topics', () => {
      expect(ChatStorage.categorizeChat('My back hurts')).toBe('Pain Management');
    });

    test('returns general health for unknown', () => {
      expect(ChatStorage.categorizeChat('Random topic')).toBe('General Health');
    });
  });

  describe('togglePin', () => {
    test('pins and unpins chat', () => {
      const messages = [{ id: '1', content: 'hello', isUser: true, timestamp: new Date() }];
      const chatId = ChatStorage.saveChat('Test', messages);
      jest.runAllTimers();
      
      ChatStorage.togglePin(chatId);
      let chats = ChatStorage.getAllChats();
      expect(chats[0].pinned).toBe(true);
      
      ChatStorage.togglePin(chatId);
      chats = ChatStorage.getAllChats();
      expect(chats[0].pinned).toBe(false);
    });
  });

  describe('rateChat', () => {
    test('rates chat up or down', () => {
      const messages = [{ id: '1', content: 'hello', isUser: true, timestamp: new Date() }];
      const chatId = ChatStorage.saveChat('Test', messages);
      jest.runAllTimers();
      
      ChatStorage.rateChat(chatId, 'up');
      let chats = ChatStorage.getAllChats();
      expect(chats[0].rating).toBe('up');
      
      ChatStorage.rateChat(chatId, 'down');
      chats = ChatStorage.getAllChats();
      expect(chats[0].rating).toBe('down');
    });
  });
});
