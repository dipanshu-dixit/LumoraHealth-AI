import { ChatStorage } from './chatStorage';
import { storage } from '../../src/lib/storage';

// Mock storage
const mockStorage = new Map();
storage.get = (key) => mockStorage.get(key) || null;
storage.set = (key, val) => mockStorage.set(key, val);
storage.remove = (key) => mockStorage.delete(key);

const instance = ChatStorage as any;

// Generate some fake chats
const fakeChats = Array.from({ length: 1000 }).map((_, i) => ({
  id: `chat-${i}`,
  topic: `Topic ${i}`,
  timestamp: new Date().toISOString(),
  messages: [
    {
      id: `msg-${i}`,
      content: 'Hello',
      isUser: true,
      timestamp: new Date().toISOString()
    }
  ]
}));

mockStorage.set(instance.STORAGE_KEY, JSON.stringify(fakeChats));

const start = performance.now();
for (let i = 0; i < 100; i++) {
  instance.getAllChats();
}
const end = performance.now();

console.log(`Time taken for 100 getAllChats calls: ${(end - start).toFixed(2)}ms`);
