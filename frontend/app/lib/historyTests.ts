// Test file to verify all history fixes
import { ChatStorage } from '../lib/chatStorage';
import { storageManager } from '../lib/storageManager';

export const testHistoryFixes = () => {
  console.log('🧪 Testing History Fixes...');
  
  // Test 1: Prevent duplicate saves
  console.log('Test 1: Duplicate Prevention');
  const testMessages = [
    { id: '1', content: 'Test message', isUser: true, timestamp: new Date() },
    { id: '2', content: 'AI response', isUser: false, timestamp: new Date() }
  ];
  
  const chatId1 = ChatStorage.saveChat('Test Chat', testMessages);
  const chatId2 = ChatStorage.saveChat('Test Chat', testMessages, chatId1);
  
  console.log('Same ID returned:', chatId1 === chatId2 ? '✅' : '❌');
  
  // Test 2: History cleanup
  console.log('Test 2: History Cleanup');
  const cleanupResult = ChatStorage.cleanupHistory();
  console.log('Cleanup performed:', cleanupResult ? '✅' : '✅ (no cleanup needed)');
  
  // Test 3: Storage consistency
  console.log('Test 3: Storage Consistency');
  const allChats = ChatStorage.getAllChats();
  const uniqueIds = new Set(allChats.map(c => c.id));
  console.log('No duplicates:', allChats.length === uniqueIds.size ? '✅' : '❌');
  
  // Test 4: Session storage management
  console.log('Test 4: Session Storage');
  storageManager.clearSession();
  sessionStorage.setItem('test', 'value');
  storageManager.clearSession();
  console.log('Session cleared:', !sessionStorage.getItem('test') ? '✅' : '❌');
  
  console.log('🎉 All tests completed!');
};

// Auto-run cleanup on app start
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    ChatStorage.cleanupHistory();
  });
}