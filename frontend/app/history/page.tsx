'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, Calendar, Trash2, ThumbsUp, ThumbsDown, Plus, Pin, Edit2, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { ChatStorage, type ChatSession } from '../lib/chatStorage';
import NavigationSidebar from '../components/NavigationSidebar';
import { sessionManager } from '../lib/sessionManager';
import { AdaptiveAI } from '../lib/adaptiveAI';

const cleanContent = (text: string) => {
  // Remove base64 image data
  let cleaned = text.replace(/<img[^>]*src="data:image\/[^"]*"[^>]*>/gi, '');
  
  // Remove all HTML tags including SVG
  cleaned = cleaned.replace(/<[^>]*>/g, '');
  
  // Clean up model artifacts
  cleaned = cleaned
    .replace(/<s>/g, '')
    .replace(/<\/s>/g, '')
    .replace(/\[OUT\]/g, '')
    .replace(/\[INST\]/g, '')
    .replace(/\[\/INST\]/g, '')
    .trim();
  
  return cleaned;
};

export default function History() {
  const router = useRouter();
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [likedMessages, setLikedMessages] = useState<Set<string>>(new Set());
  const [dislikedMessages, setDislikedMessages] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
    
    loadChatHistory();
    
    const savedLikes = localStorage.getItem('lumora-liked-messages');
    const savedDislikes = localStorage.getItem('lumora-disliked-messages');
    if (savedLikes) setLikedMessages(new Set(JSON.parse(savedLikes)));
    if (savedDislikes) setDislikedMessages(new Set(JSON.parse(savedDislikes)));
  }, []);

  const loadChatHistory = () => {
    try {
      const chats = ChatStorage.getAllChats();
      const sorted = chats.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return b.timestamp.getTime() - a.timestamp.getTime();
      });
      setChatHistory(sorted);
    } catch (error) {
      console.error('Failed to load history:', error);
      setChatHistory([]);
    }
  };

  const handleRateChat = (chatId: string, rating: 'up' | 'down') => {
    const chat = chatHistory.find(c => c.id === chatId);
    if (!chat) return;
    
    const aiMessages = chat.messages.filter(m => !m.isUser);
    const newLiked = new Set(likedMessages);
    const newDisliked = new Set(dislikedMessages);
    
    aiMessages.forEach(msg => {
      if (rating === 'up') {
        newLiked.add(msg.id);
        newDisliked.delete(msg.id);
        AdaptiveAI.recordFeedback(msg.id, msg.content, true);
      } else {
        newDisliked.add(msg.id);
        newLiked.delete(msg.id);
        AdaptiveAI.recordFeedback(msg.id, msg.content, false);
      }
    });
    
    setLikedMessages(newLiked);
    setDislikedMessages(newDisliked);
    localStorage.setItem('lumora-liked-messages', JSON.stringify(Array.from(newLiked)));
    localStorage.setItem('lumora-disliked-messages', JSON.stringify(Array.from(newDisliked)));
    
    ChatStorage.rateChat(chatId, rating);
    loadChatHistory();
  };

  const handleRenameChat = (chatId: string, newTitle: string) => {
    ChatStorage.renameChat(chatId, newTitle);
    setEditingId(null);
    loadChatHistory();
  };

  const handleTogglePin = (chatId: string) => {
    ChatStorage.togglePin(chatId);
    loadChatHistory();
  };

  const handleDeleteChat = (chatId: string) => {
    if (confirm('Delete this consultation?')) {
      ChatStorage.deleteChat(chatId);
      loadChatHistory();
      setSelectedChat(null);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).toUpperCase();
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Mental Health': 'text-purple-400 bg-purple-900/20',
      'Physical Health': 'text-blue-400 bg-blue-900/20',
      'Nutrition': 'text-green-400 bg-green-900/20',
      'Sleep': 'text-indigo-400 bg-indigo-900/20',
      'Exercise': 'text-orange-400 bg-orange-900/20',
      'General': 'text-zinc-400 bg-zinc-900/20'
    };
    return colors[category as keyof typeof colors] || colors['General'];
  };

  const openChatSession = (chat: ChatSession) => {
    try {
      sessionManager.setActiveChat(chat.id);
      router.push('/');
    } catch (error) {
      console.error('Failed to open chat session:', error);
    }
  };

  return (
    <>
      <NavigationSidebar user={{ name: typeof window !== 'undefined' ? localStorage.getItem('lumora-user-name') || 'User' : 'User' }} />
      
      <div className="h-full overflow-y-auto bg-[var(--bg-page)] flex flex-col lg:ml-16 transition-all duration-400">
        <div className="px-4 lg:px-6 py-6 pb-20 lg:pb-8">
          
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-light text-white mb-2">
              Health <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent font-medium">History</span>
            </h1>
            <p className="text-zinc-400">Your consultation timeline and health journey</p>
          </div>

          {chatHistory.length > 0 ? (
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-6 top-0 bottom-0 w-px bg-zinc-800"></div>
              
              <div className="space-y-6">
                {chatHistory.map((chat, index) => {
                  const category = ChatStorage.categorizeChat(chat.topic);
                  const categoryColors = getCategoryColor(category);
                  
                  return (
                    <motion.div
                      key={chat.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="relative pl-16"
                    >
                      {/* Timeline Dot */}
                      <div className={`absolute left-4 w-4 h-4 rounded-full border-4 border-black ${
                        chat.pinned ? 'bg-yellow-500' : 'bg-white'
                      }`}></div>
                      
                      {/* Chat Card */}
                      <div className="hover:bg-zinc-900/60 transition-all rounded-2xl p-6 border border-transparent hover:border-zinc-800 group relative">
                        <div 
                          onClick={() => {
                            if (editingId !== chat.id) {
                              setSelectedChat(chat);
                            }
                          }}
                          className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 gap-3 cursor-pointer"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="text-zinc-500 text-xs tracking-widest mb-2">
                              {formatDate(chat.timestamp)}
                            </div>
                            {editingId === chat.id ? (
                              <div className="flex items-center gap-2 mb-2 w-full">
                                <input
                                  value={editTitle}
                                  onChange={(e) => setEditTitle(e.target.value)}
                                  className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-white text-sm sm:text-lg flex-1 min-w-0 cursor-text"
                                  onKeyPress={(e) => e.key === 'Enter' && handleRenameChat(chat.id, editTitle)}
                                  autoFocus
                                />
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRenameChat(chat.id, editTitle);
                                  }}
                                  className="text-green-400 hover:text-green-300 p-1 flex-shrink-0"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingId(null);
                                  }}
                                  className="text-red-400 hover:text-red-300 p-1 flex-shrink-0"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <h3 className="text-white font-medium text-lg mb-2 group-hover:text-white transition-colors flex items-center gap-2">
                                {chat.topic}
                                {chat.pinned && <Pin className="w-4 h-4 text-yellow-500 flex-shrink-0" />}
                              </h3>
                            )}
                            <div className="flex items-center gap-2 mb-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors}`}>
                                {category}
                              </span>
                              <span className="text-zinc-500 text-xs">
                                {chat.messages.length} messages
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTogglePin(chat.id);
                              }}
                              className={`p-1.5 sm:p-2 rounded-lg transition-colors flex items-center justify-center ${
                                chat.pinned
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : 'text-zinc-500 hover:text-yellow-400 hover:bg-yellow-500/10'
                              }`}
                            >
                              <Pin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingId(chat.id);
                                setEditTitle(chat.topic);
                              }}
                              className="p-1.5 sm:p-2 text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors flex items-center justify-center"
                            >
                              <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRateChat(chat.id, 'up');
                              }}
                              className={`p-1.5 sm:p-2 rounded-lg transition-colors flex items-center justify-center ${
                                chat.rating === 'up' 
                                  ? 'bg-green-500/20 text-green-400' 
                                  : 'text-zinc-500 hover:text-green-400 hover:bg-green-500/10'
                              }`}
                            >
                              <ThumbsUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRateChat(chat.id, 'down');
                              }}
                              className={`p-1.5 sm:p-2 rounded-lg transition-colors flex items-center justify-center ${
                                chat.rating === 'down' 
                                  ? 'bg-red-500/20 text-red-400' 
                                  : 'text-zinc-500 hover:text-red-400 hover:bg-red-500/10'
                              }`}
                            >
                              <ThumbsDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteChat(chat.id);
                              }}
                              className="p-1.5 sm:p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex items-center justify-center"
                            >
                              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => {
                              if (editingId !== chat.id) {
                                setSelectedChat(chat);
                              }
                            }}
                            className="flex-1 text-left"
                          >
                            <div className="text-zinc-400 text-sm line-clamp-2">
                              {cleanContent(chat.messages[0]?.content || '').substring(0, 120)}...
                            </div>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openChatSession(chat);
                            }}
                            className="px-4 py-2 bg-white hover:bg-zinc-100 text-black text-sm rounded-lg transition-colors flex-shrink-0"
                          >
                            Continue
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
              <h3 className="text-xl font-light text-white mb-2">No consultations yet</h3>
              <p className="text-zinc-400 mb-6">Start your first health consultation to begin your timeline</p>
              <button
                onClick={() => router.push('/')}
                className="bg-white hover:bg-zinc-100 text-black px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                Start First Consultation
              </button>
            </div>
          )}
        </div>

        {/* Chat Detail Drawer */}
        <AnimatePresence>
          {selectedChat && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 z-50"
              onClick={() => setSelectedChat(null)}
            >
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="absolute right-0 top-0 h-full w-full max-w-2xl bg-zinc-900 border-l border-zinc-800 overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-medium text-white mb-1">{selectedChat.topic}</h2>
                      <p className="text-zinc-400 text-sm">{formatDate(selectedChat.timestamp)}</p>
                    </div>
                    <button
                      onClick={() => setSelectedChat(null)}
                      className="text-zinc-400 hover:text-white transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {selectedChat.messages.map((message, index) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-4 rounded-2xl ${
                            message.isUser
                              ? 'bg-zinc-800 text-white rounded-tr-sm'
                              : 'bg-zinc-800 text-white border-l-2 border-white'
                          }`}
                        >
                          {message.isUser ? (
                            <div className="text-sm leading-relaxed">{cleanContent(message.content)}</div>
                          ) : (
                            <div className="prose prose-invert max-w-none text-sm leading-relaxed prose-headings:text-white prose-p:text-white prose-li:text-white prose-strong:text-white">
                              <ReactMarkdown>
                                {cleanContent(message.content)}
                              </ReactMarkdown>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
