'use client';

import NavigationSidebar from '../components/NavigationSidebar';
import { Shield, Lock, Database, Download, Trash2, Server, AlertTriangle } from 'lucide-react';
import { ChatStorage } from '../lib/chatStorage';
import toast, { Toaster } from 'react-hot-toast';

export default function Privacy() {
  const handleClearData = () => {
    if (confirm('⚠️ This will permanently delete all your data. This cannot be undone. Continue?')) {
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
      toast.success('All data cleared successfully. Redirecting...', { duration: 3000 });
      setTimeout(() => window.location.href = '/', 2000);
    }
  };

  const escapeHtml = (text: string) => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const handleExportData = () => {
    const chats = ChatStorage.getAllChats();
    const firstName = localStorage.getItem('lumora-user-first-name') || 'User';
    const lastName = localStorage.getItem('lumora-user-last-name') || '';
    const userName = lastName ? `${firstName} ${lastName}` : firstName;
    
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lumora Health Data Export - ${userName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 900px; margin: 40px auto; padding: 20px; background: #f5f5f5; }
    .header { background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%); color: white; padding: 40px; border-radius: 12px; margin-bottom: 30px; }
    .header h1 { margin: 0 0 10px 0; font-size: 42px; font-family: Georgia, serif; font-style: italic; font-weight: 300; }
    .header p { margin: 5px 0; opacity: 0.9; }
    .section { background: white; padding: 30px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .section h2 { color: #14b8a6; margin-top: 0; border-bottom: 2px solid #14b8a6; padding-bottom: 10px; }
    .chat { background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #14b8a6; }
    .chat-title { font-weight: bold; color: #1f2937; margin-bottom: 10px; font-size: 18px; }
    .chat-date { color: #6b7280; font-size: 14px; margin-bottom: 15px; }
    .message { margin: 15px 0; padding: 12px; border-radius: 8px; }
    .user-msg { background: #e0f2fe; margin-left: 40px; }
    .ai-msg { background: #f0fdfa; margin-right: 40px; border-left: 3px solid #14b8a6; }
    .label { font-weight: 600; color: #14b8a6; font-size: 12px; text-transform: uppercase; margin-bottom: 5px; }
    .footer { text-align: center; color: #6b7280; margin-top: 40px; padding: 20px; font-size: 14px; }
    @media print { body { background: white; } .section { box-shadow: none; page-break-inside: avoid; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>Lumora</h1>
    <p><strong>${escapeHtml(userName)}</strong></p>
    <p>Health Data Export</p>
    <p>Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
  </div>

  <div class="section">
    <h2>📊 Summary</h2>
    <p><strong>Total Conversations:</strong> ${chats.length}</p>
    <p><strong>Export Date:</strong> ${new Date().toLocaleDateString()}</p>
  </div>

  <div class="section">
    <h2>💬 Conversation History</h2>
    ${chats.map((chat: any, i: number) => `
      <div class="chat">
        <div class="chat-title">${i + 1}. ${escapeHtml(chat.topic || 'Health Consultation')}</div>
        <div class="chat-date">${new Date(chat.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
        ${chat.messages.map((msg: any) => `
          <div class="message ${msg.isUser ? 'user-msg' : 'ai-msg'}">
            <div class="label">${msg.isUser ? 'You' : 'Lumora AI'}</div>
            <div>${msg.content.replace(/\*\*/g, '').replace(/\*/g, '').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}</div>
          </div>
        `).join('')}
      </div>
    `).join('')}
  </div>

  <div class="footer">
    <p><strong>Lumora AI v1.1</strong> • Privacy-First Health Intelligence</p>
    <p>This data is exported from your local device storage. No data was sent to external servers.</p>
    <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">To save as PDF: Press Ctrl+P (Cmd+P on Mac) → Select "Save as PDF"</p>
  </div>
</body>
</html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Lumora-Health-Data-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen">
      <NavigationSidebar user={{ name: 'User' }} />
      
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#18181b',
            color: '#FFFFFF',
            border: '1px solid #39D3BB',
          },
        }}
      />
      
      <div className="flex-1 overflow-y-auto bg-[var(--bg-page)]">
        <div className="max-w-4xl mx-auto px-4 lg:px-6 py-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent mb-3">Privacy & Data Control</h1>
            <p className="text-zinc-400">Last updated: January 2, 2026</p>
          </div>
          
          <div className="space-y-6">
            {/* Zero-Knowledge Architecture */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-emerald-400" />
                <h2 className="text-2xl font-semibold text-white">Zero-Knowledge Architecture</h2>
              </div>
              <div className="space-y-3 text-zinc-300">
                <p className="text-lg">Lumora is built with privacy-first principles:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-zinc-400">
                  <li><strong className="text-white">No Database:</strong> We don't have any database to store your data</li>
                  <li><strong className="text-white">No Data Collection:</strong> We don't collect, store, or transmit your personal information</li>
                  <li><strong className="text-white">Local Storage Only:</strong> All data stays in your browser's localStorage</li>
                  <li><strong className="text-white">No Accounts:</strong> No sign-up, no login, no tracking</li>
                  <li><strong className="text-white">No Analytics:</strong> We don't track your usage or behavior</li>
                </ul>
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Database className="w-6 h-6 text-blue-400" />
                <h2 className="text-2xl font-semibold text-white">How Your Data is Stored</h2>
              </div>
              <div className="space-y-3 text-zinc-300">
                <p>Your conversations and settings are stored locally in your browser:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-zinc-400">
                  <li>Chat history stored in browser localStorage</li>
                  <li>Data never leaves your device except AI requests</li>
                  <li>Clearing browser cache/history deletes all data permanently</li>
                  <li>No cloud backup or sync</li>
                </ul>
              </div>
            </div>

            {/* AI Processing */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Server className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-semibold text-white">AI Processing</h2>
              </div>
              <div className="space-y-3 text-zinc-300">
                <p>When you send a message:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-zinc-400">
                  <li><strong className="text-white">AI Model:</strong> xAI Grok-2 (via xAI API)</li>
                  <li><strong className="text-white">Data Sent:</strong> Only your current message and conversation context</li>
                  <li><strong className="text-white">Encryption:</strong> All API requests use HTTPS/TLS encryption</li>
                  <li><strong className="text-white">No Personal Info:</strong> No names, emails, or identifiers sent to AI</li>
                  <li><strong className="text-white">Temporary Processing:</strong> AI providers process requests but don't store conversations</li>
                </ul>
              </div>
            </div>

            {/* Data Control */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Lock className="w-6 h-6 text-cyan-400" />
                <h2 className="text-2xl font-semibold text-white">Your Data, Your Control</h2>
              </div>
              <div className="space-y-4">
                <p className="text-zinc-300">You have complete control over your data:</p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleExportData}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-zinc-100 text-black rounded-lg transition-colors font-medium"
                  >
                    <Download className="w-5 h-5" />
                    Export Data
                  </button>
                  <button
                    onClick={handleClearData}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                  >
                    <Trash2 className="w-5 h-5" />
                    Delete All Data
                  </button>
                </div>
              </div>
            </div>

            {/* Important Notice */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold text-amber-400 mb-2">Important Notice</h3>
                  <p className="text-amber-200/90 leading-relaxed">
                    Since all data is stored locally in your browser, clearing your browser cache, history, or cookies will permanently delete all your conversations and settings. There is no way to recover this data. We recommend exporting your data regularly if you want to keep a backup.
                  </p>
                </div>
              </div>
            </div>

            {/* Medical Disclaimer */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold text-red-400 mb-2">Medical Disclaimer</h3>
                  <p className="text-red-200/90 leading-relaxed">
                    Lumora provides general health information for educational purposes only. This is NOT medical advice, diagnosis, or treatment. Always consult qualified healthcare professionals for medical decisions. In emergencies, call your local emergency number immediately (911 in US, 112 in EU, 108/102 in India).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
