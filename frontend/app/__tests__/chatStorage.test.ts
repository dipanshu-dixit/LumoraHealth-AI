import { ChatStorage } from '../lib/chatStorage';
import { randomUUID } from 'crypto';

// Use real localStorage implementation
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

global.localStorage = localStorageMock;

describe('ChatStorage', () => {
  beforeEach(() => {
    localStorage.clear();
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
      ChatStorage.saveChat('Topic 1', []);
      ChatStorage.saveChat('Topic 2', []);
      
      const chats = ChatStorage.getAllChats();
      expect(chats).toHaveLength(2);
    });
  });

  describe('deleteChat', () => {
    test('removes chat by id', () => {
      const chatId = ChatStorage.saveChat('Test', []);
      ChatStorage.deleteChat(chatId);
      
      const chats = ChatStorage.getAllChats();
      expect(chats).toHaveLength(0);
    });
  });

  describe('clearAllChats', () => {
    test('removes all chats', () => {
      ChatStorage.saveChat('Test 1', []);
      ChatStorage.saveChat('Test 2', []);
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
      const chatId = ChatStorage.saveChat('Test', []);
      
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
      const chatId = ChatStorage.saveChat('Test', []);
      
      ChatStorage.rateChat(chatId, 'up');
      let chats = ChatStorage.getAllChats();
      expect(chats[0].rating).toBe('up');
      
      ChatStorage.rateChat(chatId, 'down');
      chats = ChatStorage.getAllChats();
      expect(chats[0].rating).toBe('down');
    });
  });
});
