import React, { useState, useRef, useEffect } from 'react';
import { storage, STORAGE_KEYS } from '../../../src/lib/storage';
import { ChatStorage } from '../../lib/chatStorage';
import { sessionManager } from '../../lib/sessionManager';
import { Plus, Paperclip, X, Camera, ArrowUp, Pill, FileText, Utensils, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { compressImage, validateImageFile } from '../../lib/imageUtils';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatInterfaceProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;
  onImageAnalysis?: (imageData: string, context: string, userMessage: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  input,
  setInput,
  onSubmit,
  isLoading,
  messages,
  setMessages,
  activeChatId,
  setActiveChatId,
  onImageAnalysis
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [showImageMenu, setShowImageMenu] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const imageMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleNewChat = () => {
      setMessages([]);
      setInput('');
      setActiveChatId(null);
    };

    window.addEventListener('lumora_new_chat', handleNewChat);
    
    return () => {
      window.removeEventListener('lumora_new_chat', handleNewChat);
    };
  }, []);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (imageMenuRef.current && !imageMenuRef.current.contains(event.target as Node)) {
        setShowImageMenu(false);
      }
    };

    if (showImageMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showImageMenu]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [input]);

  // Generate image preview
  useEffect(() => {
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(selectedFile);
    } else {
      setImagePreview(null);
    }
  }, [selectedFile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !selectedFile) return;
    if (selectedFile && onImageAnalysis) {
      setShowContextMenu(true);
      return;
    }
    onSubmit(e);
    setSelectedFile(null);
  };

  const handleContextSelect = (context: string) => {
    if (selectedFile && imagePreview && onImageAnalysis) {
      onImageAnalysis(imagePreview, context, input.trim());
      setSelectedFile(null);
      setInput('');
    }
    setShowContextMenu(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileSelect = (file: File) => {
    if (file.type.startsWith('image/')) {
      setSelectedFile(file);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateImageFile(file)) {
      try {
        setIsUploadingImage(true);
        const compressedDataUrl = await compressImage(file);
        const blob = await fetch(compressedDataUrl).then(r => r.blob());
        const compressedFile = new File([blob], file.name, { type: 'image/jpeg' });
        handleFileSelect(compressedFile);
      } catch (error) {
        console.error('Image compression failed:', error);
      } finally {
        setIsUploadingImage(false);
      }
    }
    e.target.value = '';
  };

  const canSubmit = (input.trim() || selectedFile) && !isLoading;

  const contextOptions = [
    { id: 'skin', label: 'Skin Condition', icon: Camera, desc: 'Rashes, moles, lesions' },
    { id: 'medication', label: 'Medication Label', icon: Pill, desc: 'Extract drug info' },
    { id: 'lab', label: 'Lab Report', icon: FileText, desc: 'Blood work, test results' },
    { id: 'food', label: 'Food Analysis', icon: Utensils, desc: 'Nutrition assessment' },
    { id: 'posture', label: 'Posture Analysis', icon: User, desc: 'Ergonomic review' }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4">
      {/* Context Selection Modal */}
      <AnimatePresence>
        {showContextMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowContextMenu(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-semibold text-white mb-2">Select Analysis Type</h3>
              <p className="text-sm text-zinc-400 mb-6">Choose the category for accurate analysis</p>
              
              <div className="space-y-2">
                {contextOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleContextSelect(option.id)}
                      className="w-full flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-zinc-600 transition-all text-left group"
                    >
                      <Icon className="w-5 h-5 text-zinc-400 group-hover:text-white mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium text-sm">{option.label}</div>
                        <div className="text-zinc-500 text-xs mt-0.5">{option.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setShowContextMenu(false)}
                className="w-full mt-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit}>
        <div className="relative">
          {/* Image Preview */}
          <AnimatePresence>
            {imagePreview && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mb-3 flex justify-start"
              >
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Selected"
                    className="max-w-[200px] max-h-[150px] rounded-lg object-cover border border-zinc-700"
                  />
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="absolute -top-2 -right-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full p-1 shadow-lg"
                  >
                    <X size={14} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Input Container */}
          <div className="relative bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 rounded-2xl px-2 sm:px-4 py-2 sm:py-3 shadow-lg hover:border-zinc-600/50 transition-all duration-200 focus-within:border-white/50/50 focus-within:shadow-white/10/10">
            <div className="flex items-end gap-1 sm:gap-3">
              {/* Plus Button */}
              <div className="relative" ref={imageMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowImageMenu(!showImageMenu)}
                  className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-transparent hover:bg-zinc-700/50 text-zinc-400 hover:text-white rounded-full flex items-center justify-center transition-all duration-200"
                  disabled={isLoading || isUploadingImage}
                >
                  {isUploadingImage ? (
                    <div className="w-4 h-4 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
                  )}
                </button>

                {/* Image Menu */}
                <AnimatePresence>
                  {showImageMenu && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setShowImageMenu(false)}
                        onTouchStart={() => setShowImageMenu(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-full left-0 mb-2 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden z-20 min-w-[200px]"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            cameraInputRef.current?.click();
                            setShowImageMenu(false);
                          }}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800 transition-colors w-full text-left"
                        >
                          <Camera size={18} className="text-zinc-400" />
                          <div>
                            <div className="text-white text-sm font-medium">Capture Photo</div>
                            <div className="text-zinc-500 text-xs">Use camera</div>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            fileInputRef.current?.click();
                            setShowImageMenu(false);
                          }}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800 transition-colors w-full text-left border-t border-zinc-800"
                        >
                          <Paperclip size={18} className="text-zinc-400" />
                          <div>
                            <div className="text-white text-sm font-medium">Upload Image</div>
                            <div className="text-zinc-500 text-xs">From gallery</div>
                          </div>
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Lumora anything..."
                disabled={isLoading}
                className="flex-1 bg-transparent text-white placeholder-zinc-400 resize-none border-0 outline-none text-sm sm:text-base leading-6 py-1 max-h-[120px] min-h-[24px]"
                rows={1}
              />

              {/* Right Side Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Send Button */}
                <motion.button
                  type="submit"
                  disabled={!canSubmit}
                  className={`w-8 h-8 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                    canSubmit
                      ? 'bg-white hover:bg-zinc-100 text-black shadow-lg'
                      : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                  }`}
                  whileHover={canSubmit ? { scale: 1.05 } : {}}
                  whileTap={canSubmit ? { scale: 0.95 } : {}}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-zinc-400 border-t-black rounded-full animate-spin" />
                  ) : (
                    <ArrowUp size={16} className="sm:w-4 sm:h-4" />
                  )}
                </motion.button>
              </div>
            </div>
          </div>

          {/* Hidden File Inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="user"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
