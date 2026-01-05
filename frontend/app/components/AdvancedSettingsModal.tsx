'use client';

import { useState, useEffect } from 'react';
import { X, Shield, Lock, CheckCircle, XCircle, AlertTriangle, Zap, Database, Code, Settings } from 'lucide-react';
import { secureStorage } from '@/lib/secureStorage';
import { storage } from '@/lib/storage';
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

  useEffect(() => {
    if (isOpen) {
      setMaxTokens(parseInt(storage.get('lumora-max-tokens') || '450'));
      setTemperature(parseFloat(storage.get('lumora-temperature') || '0.5'));
      setContextWindow(parseInt(storage.get('lumora-context-window') || '6'));
      setEnableMarkdown(storage.get('lumora-enable-markdown') !== 'false');
      setEnableAnimations(storage.get('lumora-enable-animations') !== 'false');
      setEnableReasoning(storage.get('lumora-enable-reasoning') === 'true');
    }
  }, [isOpen]);

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

  const handleMaxTokensChange = (value: number) => {
    setMaxTokens(value);
    storage.set('lumora-max-tokens', value.toString());
    toast.success(`Max tokens set to ${value}`);
  };

  const handleTemperatureChange = (value: number) => {
    setTemperature(value);
    storage.set('lumora-temperature', value.toString());
    toast.success(`Temperature set to ${value}`);
  };

  const handleContextWindowChange = (value: number) => {
    setContextWindow(value);
    storage.set('lumora-context-window', value.toString());
    toast.success(`Context window set to ${value} messages`);
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
            </div>
          </div>

          {/* UI Preferences Section */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Settings className="w-5 h-5 text-white" />
              <h3 className="text-lg font-semibold text-white">UI Preferences</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Markdown Formatting</p>
                  <p className="text-xs text-zinc-500">Enable rich text formatting in responses</p>
                </div>
                <button
                  onClick={toggleMarkdown}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enableMarkdown ? 'bg-teal-500' : 'bg-zinc-700'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enableMarkdown ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Animations</p>
                  <p className="text-xs text-zinc-500">Enable smooth transitions and effects</p>
                </div>
                <button
                  onClick={toggleAnimations}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enableAnimations ? 'bg-teal-500' : 'bg-zinc-700'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enableAnimations ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">AI Reasoning Chain</p>
                  <p className="text-xs text-zinc-500">Show AI's step-by-step thinking (uses ~150 extra tokens)</p>
                </div>
                <button
                  onClick={toggleReasoning}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enableReasoning ? 'bg-teal-500' : 'bg-zinc-700'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enableReasoning ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
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
