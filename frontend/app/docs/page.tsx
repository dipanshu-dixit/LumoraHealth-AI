'use client';

import NavigationSidebar from '../components/NavigationSidebar';
import { Book, Code, Zap, Shield, Heart, Database, Lock } from 'lucide-react';

export default function Documentation() {
  return (
    <div className="flex h-screen">
      <NavigationSidebar user={{ name: typeof window !== 'undefined' ? localStorage.getItem('lumora-user-name') || 'User' : 'User' }} />
      
      <div className="flex-1 overflow-y-auto bg-[var(--bg-page)] pt-8 pb-20">
        <div className="max-w-4xl mx-auto px-4 lg:px-6 py-6">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Book className="w-10 h-10 text-blue-400" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">Documentation</h1>
            </div>
            <p className="text-zinc-400">Last updated: January 2, 2026</p>
          </div>
          
          <div className="space-y-6">
            {/* Getting Started */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-6 h-6 text-yellow-400" />
                <h2 className="text-2xl font-semibold text-white">Getting Started</h2>
              </div>
              <div className="space-y-3 text-zinc-300">
                <p>Welcome to Lumora! Here's how to use the platform:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-zinc-400">
                  <li><strong className="text-white">Start Chatting:</strong> Type your health question in the input bar</li>
                  <li><strong className="text-white">Quick Topics:</strong> Click suggestion cards for common health topics</li>
                  <li><strong className="text-white">View History:</strong> Access past conversations from the History page</li>
                  <li><strong className="text-white">Search Medicines:</strong> Look up medication information and side effects</li>
                  <li><strong className="text-white">Manage Data:</strong> Export or delete your data anytime in Settings</li>
                </ul>
              </div>
            </div>

            {/* Key Features */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Heart className="w-6 h-6 text-red-400" />
                <h2 className="text-2xl font-semibold text-white">Key Features</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4 text-zinc-300">
                <div>
                  <h3 className="font-semibold text-white mb-2">AI Health Assistant</h3>
                  <p className="text-sm text-zinc-400">Powered by xAI Grok-2 for intelligent health conversations</p>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">Medicine Database</h3>
                  <p className="text-sm text-zinc-400">Search medications with side effects and safety information</p>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">Chat History</h3>
                  <p className="text-sm text-zinc-400">Access and manage your past health conversations</p>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">Zero-Knowledge</h3>
                  <p className="text-sm text-zinc-400">No database, no data collection, complete privacy</p>
                </div>
              </div>
            </div>

            {/* Privacy & Security */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-emerald-400" />
                <h2 className="text-2xl font-semibold text-white">Privacy & Security</h2>
              </div>
              <div className="space-y-3 text-zinc-300">
                <p>Your privacy is our top priority:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-zinc-400">
                  <li><strong className="text-white">Local Storage Only:</strong> All data stays in your browser</li>
                  <li><strong className="text-white">No Accounts:</strong> No sign-up, no login required</li>
                  <li><strong className="text-white">No Database:</strong> We don't have any database to store your data</li>
                  <li><strong className="text-white">Encrypted API Calls:</strong> All AI requests use HTTPS/TLS encryption</li>
                  <li><strong className="text-white">Full Control:</strong> Export or delete your data anytime</li>
                </ul>
              </div>
            </div>

            {/* Technical Details */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Code className="w-6 h-6 text-cyan-400" />
                <h2 className="text-2xl font-semibold text-white">Technical Details</h2>
              </div>
              <div className="space-y-4 text-zinc-300">
                <div>
                  <h3 className="font-semibold text-white mb-2">AI Model</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-sm text-zinc-400">
                    <li>xAI Grok-2 Latest (via xAI API)</li>
                    <li>Max tokens: 450 per response</li>
                    <li>Temperature: 0.5 for balanced responses</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">Technology Stack</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-sm text-zinc-400">
                    <li>Next.js 15 with TypeScript</li>
                    <li>Tailwind CSS for styling</li>
                    <li>Framer Motion for animations</li>
                    <li>React Hot Toast for notifications</li>
                    <li>Zod for validation</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">Data Storage</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-sm text-zinc-400">
                    <li>Browser localStorage (client-side only)</li>
                    <li>No server-side database</li>
                    <li>No cloud sync or backup</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Database className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-semibold text-white">How It Works</h2>
              </div>
              <div className="space-y-3 text-zinc-300">
                <ol className="list-decimal list-inside space-y-2 ml-4 text-zinc-400">
                  <li>You type a health question in the chat</li>
                  <li>Your message is sent to xAI Grok-2 via secure API</li>
                  <li>AI processes your question and generates a response</li>
                  <li>Response is displayed and saved locally in your browser</li>
                  <li>No personal data is stored on our servers</li>
                </ol>
              </div>
            </div>

            {/* Limitations */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Lock className="w-6 h-6 text-amber-400" />
                <h2 className="text-2xl font-semibold text-amber-400">Important Limitations</h2>
              </div>
              <div className="space-y-3 text-amber-200/90">
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Lumora is NOT a medical device or diagnostic tool</li>
                  <li>Information provided is for educational purposes only</li>
                  <li>Always consult healthcare professionals for medical decisions</li>
                  <li>Data is lost if you clear browser cache/history</li>
                  <li>No multi-device sync (data stays on one device)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
