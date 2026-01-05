import { storage, STORAGE_KEYS } from '../../src/lib/storage';

export interface MedicineHistoryItem {
  medicine: string;
  timestamp: number;
  response?: string;
}

class MedicineHistoryService {
  private static instance: MedicineHistoryService;
  private saveTimeout: number | null = null;
  private currentHistory: MedicineHistoryItem[] = [];

  static getInstance(): MedicineHistoryService {
    if (!MedicineHistoryService.instance) {
      MedicineHistoryService.instance = new MedicineHistoryService();
    }
    return MedicineHistoryService.instance;
  }

  private debouncedSave() {
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    this.saveTimeout = window.setTimeout(() => {
      try {
        storage.set(STORAGE_KEYS.MEDICINE_HISTORY, this.currentHistory);
      } catch (error) {
        console.error('Failed to save medicine history:', error);
      }
    }, 500);
  }

  loadHistory(): MedicineHistoryItem[] {
    try {
      const saved = storage.get(STORAGE_KEYS.MEDICINE_HISTORY);
      const items = saved || [];
      const unique = items.filter((item: MedicineHistoryItem, index: number, self: MedicineHistoryItem[]) => 
        index === self.findIndex(t => t.medicine.toLowerCase().trim() === item.medicine.toLowerCase().trim())
      );
      this.currentHistory = unique.slice(0, 10);
      return this.currentHistory;
    } catch (error) {
      console.error('Failed to load medicine history:', error);
      this.currentHistory = [];
      return [];
    }
  }

  addToHistory(medicine: string, response?: string): void {
    const normalized = medicine.toLowerCase().trim();
    const existingIndex = this.currentHistory.findIndex(h => h.medicine.toLowerCase().trim() === normalized);
    
    if (existingIndex !== -1) {
      this.currentHistory.splice(existingIndex, 1);
    }
    
    const newItem: MedicineHistoryItem = { 
      medicine, 
      timestamp: Date.now(), 
      response 
    };
    this.currentHistory.unshift(newItem);
    
    this.currentHistory = this.currentHistory.slice(0, 10);
    this.debouncedSave();
  }

  getHistory(): MedicineHistoryItem[] {
    return [...this.currentHistory];
  }

  clearHistory(): void {
    this.currentHistory = [];
    storage.remove(STORAGE_KEYS.MEDICINE_HISTORY);
  }

  findCached(medicine: string): MedicineHistoryItem | undefined {
    const normalized = medicine.toLowerCase().trim();
    return this.currentHistory.find(h => h.medicine.toLowerCase().trim() === normalized && h.response);
  }
}

export const MedicineHistory = MedicineHistoryService.getInstance();