'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Shield, Lock, CheckCircle, XCircle, AlertTriangle, Zap, Database, Code, Settings, Bell } from 'lucide-react';
import { secureStorage } from '@/lib/secureStorage';
import { storage, STORAGE_KEYS } from '../../src/lib/storage';
import toast from 'react-hot-toast';
import StorageUsageCard from './StorageUsageCard';

interface AdvancedSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdvancedSettingsModal({ isOpen, onClose }: AdvancedSettingsModalProps) {
  const [testData, setTestData] = useState('');
  const [encryptedData, setEncryptedData] = useState('');
  const [decryptedData, setDecryptedData] = useState('');
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [maxTokens, setMaxTokens] = useState(450);
  const [temperature, setTemperature] = useState(0.5);
  const [contextWindow, setContextWindow] = useState(6);
  const [enableMarkdown, setEnableMarkdown] = useState(true);
  const [enableAnimations, setEnableAnimations] = useState(true);
  const [enableReasoning, setEnableReasoning] = useState(false);
  const [autoDeleteDays, setAutoDeleteDays] = useState(30);
  const [messageLimit, setMessageLimit] = useState(50);
  const [customInstructions, setCustomInstructions] = useState('');
  const [hasInstructionsChanges, setHasInstructionsChanges] = useState(false);
  const [hasParameterChanges, setHasParameterChanges] = useState(false);
  
  // Debounce refs for notifications
  const tokenTimeoutRef = useRef<NodeJS.Timeout>();
  const tempTimeoutRef = useRef<NodeJS.Timeout>();
  const contextTimeoutRef = useRef<NodeJS.Timeout>();
  const instructionsTimeoutRef = useRef<NodeJS.Timeout>();

  const handleMaxTokensChange = useCallback((value: number) => {
    setMaxTokens(value);
    const original = parseInt(storage.get('lumora-max-tokens') || '450');
    setHasParameterChanges(value !== original);
  }, []);

  const handleTemperatureChange = useCallback((value: number) => {
    setTemperature(value);
    const original = parseFloat(storage.get('lumora-temperature') || '0.5');
    setHasParameterChanges(value !== original);
  }, []);

  const handleContextWindowChange = useCallback((value: number) => {
    setContextWindow(value);
    const original = parseInt(storage.get('lumora-context-window') || '6');
    setHasParameterChanges(value !== original);
  }, []);

  const handleSaveParameters = useCallback(() => {
    storage.set('lumora-max-tokens', maxTokens.toString());
    storage.set('lumora-temperature', temperature.toString());
    storage.set('lumora-context-window', contextWindow.toString());
    setHasParameterChanges(false);
    toast.success('AI parameters saved!');
  }, [maxTokens, temperature, contextWindow]);

  const handleCustomInstructionsChange = useCallback((value: string) => {
    setCustomInstructions(value);
    const original = storage.get('lumora-custom-instructions') || '';
    setHasInstructionsChanges(value !== original);
  }, []);

  const handleSaveInstructions = useCallback(() => {
    storage.set('lumora-custom-instructions', customInstructions);
    setHasInstructionsChanges(false);
    toast.success('Custom instructions saved!');
  }, [customInstructions]);

  useEffect(() => {
    if (isOpen) {
      setMaxTokens(parseInt(storage.get('lumora-max-tokens') || '450'));
      setTemperature(parseFloat(storage.get('lumora-temperature') || '0.5'));
      setContextWindow(parseInt(storage.get('lumora-context-window') || '6'));
      setEnableMarkdown(storage.get('lumora-enable-markdown') !== 'false');
      setEnableAnimations(storage.get('lumora-enable-animations') !== 'false');
      setEnableReasoning(storage.get('lumora-enable-reasoning') === 'true');
      setAutoDeleteDays(parseInt(storage.get('lumora-auto-delete-days') || '30'));
      setMessageLimit(parseInt(storage.get('lumora-message-limit') || '50'));
      setCustomInstructions(storage.get('lumora-custom-instructions') || '');
    }
  }, [isOpen]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (tokenTimeoutRef.current) clearTimeout(tokenTimeoutRef.current);
      if (tempTimeoutRef.current) clearTimeout(tempTimeoutRef.current);
      if (contextTimeoutRef.current) clearTimeout(contextTimeoutRef.current);
      if (instructionsTimeoutRef.current) clearTimeout(instructionsTimeoutRef.current);
    };
  }, []);

  if (!isOpen) return null;

  const runEncryptionTest = () => {
    const testKey = 'encryption-test-key';
    const testValue = testData || 'Sensitive Health Data: Patient has diabetes';

    try {
      secureStorage.setItem(testKey, testValue);
      const rawEncrypted = localStorage.getItem(testKey) || '';
      setEncryptedData(rawEncrypted);

      const decrypted = secureStorage.getItem(testKey);
      setDecryptedData(decrypted);

      const isEncrypted = rawEncrypted !== testValue && rawEncrypted.length > 0;
      const isDecrypted = decrypted === testValue;
      
      setTestStatus(isEncrypted && isDecrypted ? 'success' : 'failed');
      localStorage.removeItem(testKey);
    } catch (error) {
      setTestStatus('failed');
    }
  };

  const toggleMarkdown = () => {
    const newValue = !enableMarkdown;
    setEnableMarkdown(newValue);
    storage.set('lumora-enable-markdown', newValue.toString());
    toast.success(newValue ? 'Markdown enabled' : 'Markdown disabled');
  };

  const toggleAnimations = () => {
    const newValue = !enableAnimations;
    setEnableAnimations(newValue);
    storage.set('lumora-enable-animations', newValue.toString());
    toast.success(newValue ? 'Animations enabled' : 'Animations disabled');
  };

  const toggleReasoning = () => {
    const newValue = !enableReasoning;
    setEnableReasoning(newValue);
    storage.set('lumora-enable-reasoning', newValue.toString());
    toast.success(newValue ? 'AI Reasoning enabled' : 'AI Reasoning disabled');
  };

  const handleAutoDeleteChange = (days: number) => {
    setAutoDeleteDays(days);
    storage.set('lumora-auto-delete-days', days.toString());
    toast.success(`Auto-delete set to ${days} days`, { duration: 2000 });
    
    // Clean old messages immediately
    const chats = JSON.parse(storage.get(STORAGE_KEYS.CHAT_HISTORY) || '[]');
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const filteredChats = chats.filter((chat: any) => new Date(chat.timestamp) > cutoffDate);
    
    if (filteredChats.length !== chats.length) {
      storage.set(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(filteredChats));
      toast.success(`Deleted ${chats.length - filteredChats.length} old conversations`, { duration: 3000 });
    }
  };

  const handleMessageLimitChange = (limit: number) => {
    setMessageLimit(limit);
    storage.set('lumora-message-limit', limit.toString());
    toast.success(`Message limit set to ${limit}`, { duration: 2000 });
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-white" />
            <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-emerald-500 bg-clip-text text-transparent">Advanced Settings</h2>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Storage Usage Section */}
          <StorageUsageCard />

          {/* Storage & Privacy Section */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-white" />
              <h3 className="text-lg font-semibold text-white">Storage & Privacy</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Bell className="w-5 h-5 text-white" />
                  <label className="text-white font-medium">Auto-Delete Messages</label>
                </div>
                <select 
                  value={autoDeleteDays}
                  onChange={(e) => handleAutoDeleteChange(parseInt(e.target.value))}
                  className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all"
                >
                  <option value={7}>7 days</option>
                  <option value={30}>30 days</option>
                  <option value={90}>90 days</option>
                  <option value={365}>1 year</option>
                  <option value={99999}>Never</option>
                </select>
                <p className="text-xs text-zinc-500 mt-2">Conversations older than this will be automatically deleted</p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Settings className="w-5 h-5 text-white" />
                  <label className="text-white font-medium">Message Storage Limit</label>
                </div>
                <select 
                  value={messageLimit}
                  onChange={(e) => handleMessageLimitChange(parseInt(e.target.value))}
                  className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all"
                >
                  <option value={25}>25 messages per chat</option>
                  <option value={50}>50 messages per chat</option>
                  <option value={100}>100 messages per chat</option>
                  <option value={200}>200 messages per chat</option>
                </select>
                <p className="text-xs text-zinc-500 mt-2"><Shield className="w-3 h-3 inline mr-1" />Higher limits may slow down the app. Recommended: 50 messages</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-zinc-400 font-medium">STORAGE TYPE</span>
                </div>
                <p className="text-white font-medium">Local Device</p>
                <p className="text-xs text-zinc-500 mt-1">100% Private</p>
              </div>
              
              <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-zinc-400 font-medium">CAPACITY</span>
                </div>
                <p className="text-white font-medium">5-10 MB</p>
                <p className="text-xs text-zinc-500 mt-1">Browser Limit</p>
              </div>
              
              <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className={`w-4 h-4 ${autoDeleteDays >= 99999 ? 'text-zinc-500' : 'text-purple-400'}`} />
                  <span className="text-xs text-zinc-400 font-medium">AUTO-CLEAN</span>
                </div>
                <p className="text-white font-medium">{autoDeleteDays >= 99999 ? 'Disabled' : 'Enabled'}</p>
                <p className="text-xs text-zinc-500 mt-1">{autoDeleteDays >= 99999 ? 'Manual Only' : 'Optimized'}</p>
              </div>
            </div>
          </div>

          {/* AI Behavior Section */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Settings className="w-5 h-5 text-white" />
              <h3 className="text-lg font-semibold text-white">AI Behavior</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Settings className="w-5 h-5 text-white" />
                  <label className="text-white font-medium">Response Mode</label>
                </div>
                <select 
                  value={storage.get('lumora-ai-mode') || 'classic'}
                  onChange={(e) => {
                    storage.set('lumora-ai-mode', e.target.value);
                    const modeNames = {
                      classic: 'Classic Mode',
                      medical: 'Medical Professional Mode',
                      chatty: 'Chatty Doctor Mode'
                    };
                    toast.success(`AI Mode: ${modeNames[e.target.value as keyof typeof modeNames]}`, { duration: 2000 });
                  }}
                  className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all"
                >
                  <option value="classic">Classic - Balanced responses</option>
                  <option value="medical">Medical Professional - Technical & detailed</option>
                  <option value="chatty">Chatty Doctor - Encouraging & friendly</option>
                </select>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Code className="w-5 h-5 text-white" />
                  <label className="text-white font-medium">Custom Instructions</label>
                </div>
                <textarea
                  value={customInstructions}
                  onChange={(e) => handleCustomInstructionsChange(e.target.value)}
                  placeholder="e.g., I have diabetes, I'm sensitive to light, I prefer natural remedies, I'm a healthcare worker..."
                  rows={4}
                  className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all resize-none"
                />
                <p className="text-xs text-zinc-500 mt-2">AI will consider these details in all responses</p>
                {hasInstructionsChanges && (
                  <button
                    onClick={handleSaveInstructions}
                    className="mt-3 bg-white hover:bg-zinc-100 text-black px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Instructions
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* AI Parameters Section */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-5 h-5 text-white" />
              <h3 className="text-lg font-semibold text-white">AI Parameters</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-zinc-400 mb-2 block">Max Tokens: {maxTokens}</label>
                <input
                  type="range"
                  min="100"
                  max="1000"
                  step="50"
                  value={maxTokens}
                  onChange={(e) => handleMaxTokensChange(parseInt(e.target.value))}
                  className="w-full accent-white"
                />
                <p className="text-xs text-zinc-500 mt-1">Controls response length. Higher = longer responses</p>
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-400 mb-2 block">Temperature: {temperature}</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => handleTemperatureChange(parseFloat(e.target.value))}
                  className="w-full accent-white"
                />
                <p className="text-xs text-zinc-500 mt-1">0 = Focused, 1 = Creative. Recommended: 0.5</p>
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-400 mb-2 block">Context Window: {contextWindow} messages</label>
                <input
                  type="range"
                  min="2"
                  max="20"
                  step="2"
                  value={contextWindow}
                  onChange={(e) => handleContextWindowChange(parseInt(e.target.value))}
                  className="w-full accent-white"
                />
                <p className="text-xs text-zinc-500 mt-1">Number of previous messages AI remembers</p>
              </div>
              
              {hasParameterChanges && (
                <button
                  onClick={handleSaveParameters}
                  className="bg-white hover:bg-zinc-100 text-black px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Parameters
                </button>
              )}
            </div>
          </div>

          {/* UI Preferences Section */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Settings className="w-5 h-5 text-white" />
              <h3 className="text-lg font-semibold text-white">UI Preferences</h3>
            </div>
            
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-white">Markdown Formatting</p>
                  <p className="text-xs text-zinc-500">Enable rich text formatting in responses</p>
                </div>
                <button
                  onClick={toggleMarkdown}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 border ${
                    enableMarkdown 
                      ? 'bg-teal-500 border-teal-500 text-white shadow-lg shadow-teal-500/25' 
                      : 'bg-zinc-700 border-zinc-600 text-zinc-300 hover:bg-zinc-600'
                  }`}
                >
                  {enableMarkdown ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-white">Animations</p>
                  <p className="text-xs text-zinc-500">Enable smooth transitions and effects</p>
                </div>
                <button
                  onClick={toggleAnimations}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 border ${
                    enableAnimations 
                      ? 'bg-teal-500 border-teal-500 text-white shadow-lg shadow-teal-500/25' 
                      : 'bg-zinc-700 border-zinc-600 text-zinc-300 hover:bg-zinc-600'
                  }`}
                >
                  {enableAnimations ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-white">AI Reasoning Chain</p>
                  <p className="text-xs text-zinc-500">Show AI's step-by-step thinking (uses ~150 extra tokens)</p>
                </div>
                <button
                  onClick={toggleReasoning}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 border ${
                    enableReasoning 
                      ? 'bg-teal-500 border-teal-500 text-white shadow-lg shadow-teal-500/25' 
                      : 'bg-zinc-700 border-zinc-600 text-zinc-300 hover:bg-zinc-600'
                  }`}
                >
                  {enableReasoning ? 'ON' : 'OFF'}
                </button>
              </div>
          </div>

          {/* Encryption Test Section */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-yellow-500 font-semibold mb-1">Encryption Test</h3>
                <p className="text-sm text-zinc-400">
                  Test how Lumora encrypts your health data using AES-256 encryption.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-5 h-5 text-white" />
              <h3 className="text-lg font-semibold text-white">Encryption Test</h3>
            </div>
            <p className="text-sm text-zinc-400 mb-4">
              Enter any text below to see how Lumora encrypts it. Your actual health data is encrypted the same way.
            </p>
            
            <input
              type="text"
              value={testData}
              onChange={(e) => setTestData(e.target.value)}
              placeholder="Enter text to encrypt (e.g., 'My health data')"
              className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:border-white focus:outline-none mb-4"
            />
            
            <button 
              onClick={runEncryptionTest}
              className="px-6 py-3 bg-white hover:bg-zinc-100 rounded-lg font-medium transition-colors text-black"
            >
              Run Encryption Test
            </button>
          </div>

          {testStatus !== 'idle' && (
            <div className={`border rounded-lg p-6 ${testStatus === 'success' ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
              <div className="flex items-center gap-3 mb-4">
                {testStatus === 'success' ? (
                  <>
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <h3 className="text-lg font-bold text-green-500">Encryption Working!</h3>
                  </>
                ) : (
                  <>
                    <XCircle className="w-6 h-6 text-red-500" />
                    <h3 className="text-lg font-bold text-red-500">Encryption Failed</h3>
                  </>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-zinc-400 mb-2">Original Data:</h4>
                  <div className="bg-black border border-zinc-700 rounded-lg p-3 font-mono text-sm text-green-400">
                    {testData || 'Sensitive Health Data: Patient has diabetes'}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-zinc-400 mb-2 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Encrypted (AES-256):
                  </h4>
                  <div className="bg-black border border-zinc-700 rounded-lg p-3 font-mono text-xs text-yellow-400 break-all">
                    {encryptedData}
                  </div>
                  <p className="text-xs text-zinc-500 mt-2">✓ Unreadable without encryption key</p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-zinc-400 mb-2">Decrypted Data:</h4>
                  <div className="bg-black border border-zinc-700 rounded-lg p-3 font-mono text-sm text-green-400">
                    {decryptedData}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Code className="w-5 h-5 text-white" />
              <h3 className="text-lg font-semibold text-white">How It Works</h3>
            </div>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li className="flex items-start gap-2">
                <span className="text-white font-bold">1.</span>
                <span>Your data is encrypted using AES-256 encryption before storage</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-white font-bold">2.</span>
                <span>Encrypted data is stored locally on your device only</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-white font-bold">3.</span>
                <span>No data is sent to external servers</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-white font-bold">4.</span>
                <span>Only you can decrypt your data with your encryption key</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
