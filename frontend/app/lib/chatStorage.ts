import { storage, STORAGE_KEYS } from '../../src/lib/storage';

export interface ChatSession {
  id: string;
  topic: string;
  timestamp: Date;
  messages: Array<{
    id: string;
    content: string;
    isUser: boolean;
    timestamp: Date;
  }>;
  rating?: 'up' | 'down';
  pinned?: boolean;
}

export interface HealthInsight {
  category: string;
  count: number;
  lastDiscussed: Date;
}

class ChatStorageService {
  private static instance: ChatStorageService;
  private readonly STORAGE_KEY = STORAGE_KEYS.CHAT_HISTORY;
  private saveQueue: Map<string, any> = new Map();
  private saveTimeout: number | null = null;

  static getInstance(): ChatStorageService {
    if (!ChatStorageService.instance) {
      ChatStorageService.instance = new ChatStorageService();
    }
    return ChatStorageService.instance;
  }

  private debouncedSave(data: any) {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }
    this.saveTimeout = window.setTimeout(() => {
      try {
        storage.set(this.STORAGE_KEY, JSON.stringify(data));
      } catch (error) {
        console.error('Failed to save chat history:', error);
      } finally {
        this.saveTimeout = null;
      }
    }, 300);
  }

  generateTitle(userMessage: string): string {
    // Check if it's an image analysis request
    if (userMessage.includes('Image Analysis Request') || userMessage.includes('<svg')) {
      const match = userMessage.match(/Request:?\s*(.+?)(?:<|$)/);
      if (match && match[1]) {
        return `Image Analysis: ${match[1].trim()}`;
      }
      return 'Image Analysis';
    }
    
    let title = userMessage.trim();
    title = title.replace(/^(I|My|How|What|Why|When|Where|Can|Should|Is|Are|Do|Does)\s+/i, '');
    title = title.replace(/\?$/, '');
    const words = title.split(' ').slice(0, 5);
    title = words.join(' ');
    return title ? title.charAt(0).toUpperCase() + title.slice(1) : 'Health Consultation';
  }

  saveChat(topic: string, messages: any[], chatId?: string): string {
    if (!messages || messages.length === 0) return chatId || crypto.randomUUID();
    
    const id = chatId || crypto.randomUUID();
    let smartTopic = topic;
    
    if (topic === 'Health Consultation' && messages.length > 0) {
      const firstUserMessage = messages.find(m => m.isUser);
      if (firstUserMessage) {
        smartTopic = this.generateTitle(firstUserMessage.content);
      }
    }
    
    const session: ChatSession = {
      id,
      topic: smartTopic,
      timestamp: new Date(),
      messages: messages.map(m => ({
        id: m.id,
        content: m.content,
        isUser: m.isUser,
        timestamp: m.timestamp
      }))
    };

    const existing = this.getAllChats();
    const existingIndex = existing.findIndex(c => c.id === id);
    
    if (existingIndex !== -1) {
      existing[existingIndex] = session;
    } else {
      existing.push(session);
    }
    
    this.debouncedSave(existing);
    return id;
  }

  getAllChats(): ChatSession[] {
    try {
      const stored = storage.get(this.STORAGE_KEY);
      if (!stored) return [];
      const chats = JSON.parse(stored);
      
      return chats
        .filter((chat: any, index: number, self: any[]) => 
          chat.id && index === self.findIndex(c => c.id === chat.id)
        )
        .map((chat: any) => ({
          ...chat,
          timestamp: new Date(chat.timestamp),
          messages: chat.messages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          }))
        }));
    } catch (error) {
      console.error('Failed to load chat history:', error);
      return [];
    }
  }

  renameChat(chatId: string, newTopic: string) {
    const chats = this.getAllChats();
    const chatIndex = chats.findIndex(c => c.id === chatId);
    if (chatIndex !== -1) {
      chats[chatIndex].topic = newTopic;
      storage.set(this.STORAGE_KEY, JSON.stringify(chats));
    }
  }

  togglePin(chatId: string) {
    const chats = this.getAllChats();
    const chatIndex = chats.findIndex(c => c.id === chatId);
    if (chatIndex !== -1) {
      chats[chatIndex].pinned = !chats[chatIndex].pinned;
      storage.set(this.STORAGE_KEY, JSON.stringify(chats));
    }
  }

  rateChat(chatId: string, rating: 'up' | 'down') {
    const chats = this.getAllChats();
    const chatIndex = chats.findIndex(c => c.id === chatId);
    if (chatIndex !== -1) {
      chats[chatIndex].rating = rating;
      storage.set(this.STORAGE_KEY, JSON.stringify(chats));
    }
  }

  deleteChat(chatId: string) {
    const chats = this.getAllChats().filter(c => c.id !== chatId);
    storage.set(this.STORAGE_KEY, JSON.stringify(chats));
  }

  clearAllChats() {
    storage.remove(this.STORAGE_KEY);
  }

  cleanupHistory() {
    // Removed - was causing data loss
  }

  categorizeChat(topic: string | undefined): string {
    if (!topic || typeof topic !== 'string') return 'General Health';
    const lower = topic.toLowerCase();
    if (lower.includes('sleep') || lower.includes('insomnia') || lower.includes('tired')) return 'Sleep';
    if (lower.includes('food') || lower.includes('diet') || lower.includes('nutrition') || lower.includes('eat')) return 'Nutrition';
    if (lower.includes('exercise') || lower.includes('workout') || lower.includes('fitness') || lower.includes('gym')) return 'Exercise';
    if (lower.includes('stress') || lower.includes('anxiety') || lower.includes('mental') || lower.includes('mood')) return 'Mental Health';
    if (lower.includes('pain') || lower.includes('ache') || lower.includes('hurt') || lower.includes('sore')) return 'Pain Management';
    if (lower.includes('heart') || lower.includes('blood') || lower.includes('pressure') || lower.includes('chest')) return 'Cardiovascular';
    return 'General Health';
  }

  getHealthInsights(): HealthInsight[] {
    const chats = this.getAllChats();
    const categories: { [key: string]: { count: number; lastDiscussed: Date } } = {};

    chats.forEach(chat => {
      const category = this.categorizeChat(chat.topic);
      if (!categories[category]) {
        categories[category] = { count: 0, lastDiscussed: chat.timestamp };
      }
      categories[category].count++;
      if (chat.timestamp > categories[category].lastDiscussed) {
        categories[category].lastDiscussed = chat.timestamp;
      }
    });

    return Object.entries(categories).map(([category, data]) => ({
      category,
      count: data.count,
      lastDiscussed: data.lastDiscussed
    })).sort((a, b) => b.count - a.count);
  }

  getDashboardStats() {
    const chats = this.getAllChats();
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const thisWeekChats = chats.filter(c => c.timestamp >= weekAgo);
    const ratings = chats.filter(c => c.rating).map(c => c.rating === 'up' ? 5 : 1);
    const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

    return {
      totalChats: chats.length,
      thisWeek: thisWeekChats.length,
      avgResponseTime: '2.3s',
      satisfaction: avgRating.toFixed(1)
    };
  }
}

export const ChatStorage = ChatStorageService.getInstance();