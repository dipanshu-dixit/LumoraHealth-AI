import { secureStorage } from './secureStorage';

// Encrypted storage keys
export const STORAGE_KEYS = {
  USER_NAME: 'lumora-user-name',
  LANGUAGE: 'lumora-language',
  CHAT_HISTORY: 'lumora-chat-history',
  MEDICINE_HISTORY: 'lumora-medicine-history',
  PERSONAL_NOTES: 'lumora-personal-notes',
  ONBOARDING_COMPLETE: 'lumora-onboarding-complete',
  SIDEBAR_EXPANDED: 'lumora-sidebar-expanded',
  TODAY_MOOD: 'lumora-today-mood',
  TODAY_ENERGY: 'lumora-today-energy',
} as const;

// Session storage keys (not encrypted, temporary)
export const SESSION_KEYS = {
  ACTIVE_CHAT_ID: 'lumora_active_chat_id',
  FROM_HISTORY: 'lumora_from_history',
} as const;

export const storage = {
  // Encrypted get/set
  get: (key: string) => secureStorage.getItem(key),
  set: (key: string, value: any) => secureStorage.setItem(key, value),
  remove: (key: string) => secureStorage.removeItem(key),
  clear: () => secureStorage.clear(),
  
  // Session storage (not encrypted)
  sessionGet: (key: string) => sessionStorage.getItem(key),
  sessionSet: (key: string, value: string) => sessionStorage.setItem(key, value),
  sessionRemove: (key: string) => sessionStorage.removeItem(key),
};
