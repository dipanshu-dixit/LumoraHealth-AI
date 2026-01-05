class SessionManager {
  private static instance: SessionManager;

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  setActiveChat(chatId: string): void {
    try {
      localStorage.setItem('lumora_active_chat_id', chatId);
      localStorage.setItem('lumora_from_history', 'true');
      console.log('Set active chat:', chatId);
    } catch (error) {
      console.error('Failed to set active chat:', error);
    }
  }

  getActiveChat(): { chatId: string | null; fromHistory: boolean } {
    try {
      const chatId = localStorage.getItem('lumora_active_chat_id');
      const fromHistory = localStorage.getItem('lumora_from_history') === 'true';
      console.log('Get active chat:', chatId, fromHistory);
      return { chatId, fromHistory };
    } catch (error) {
      console.error('Failed to get active chat:', error);
      return { chatId: null, fromHistory: false };
    }
  }

  clearActiveChat(): void {
    try {
      localStorage.removeItem('lumora_from_history');
      console.log('Cleared active chat');
    } catch (error) {
      console.error('Failed to clear active chat:', error);
    }
  }

  setCurrentSession(chatId: string | null): void {
    try {
      if (chatId) {
        localStorage.setItem('lumora_active_chat_id', chatId);
      } else {
        localStorage.removeItem('lumora_active_chat_id');
      }
    } catch (error) {
      console.error('Failed to set current session:', error);
    }
  }

  getCurrentSession(): string | null {
    try {
      return localStorage.getItem('lumora_active_chat_id');
    } catch (error) {
      console.error('Failed to get current session:', error);
      return null;
    }
  }

  clearAll(): void {
    try {
      sessionStorage.clear();
    } catch (error) {
      console.error('Failed to clear session storage:', error);
    }
  }
}

export const sessionManager = SessionManager.getInstance();