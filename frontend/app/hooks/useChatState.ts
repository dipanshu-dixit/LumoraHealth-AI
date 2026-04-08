import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { sanitizeChatMessage } from '../lib/sanitize';
import { storage, STORAGE_KEYS } from '../../src/lib/storage';
import { ChatStorage } from '../lib/chatStorage';
import { sessionManager } from '../lib/sessionManager';
import { AdaptiveAI } from '../lib/adaptiveAI';
import { Message } from '../types';

export function useChatState() {
	const router = useRouter();
	const [messages, setMessages] = useState<Message[]>([]);
	const [currentChatId, setCurrentChatId] = useState<string | null>(null);
	const [input, setInput] = useState('');
	const [isTyping, setIsTyping] = useState(false);
	const [showToast, setShowToast] = useState('');
	const [selectedImage, setSelectedImage] = useState<string | null>(null);
	const [likedMessages, setLikedMessages] = useState<Set<string>>(new Set());
	const [dislikedMessages, setDislikedMessages] = useState<Set<string>>(new Set());
	const [showScrollButton, setShowScrollButton] = useState(false);
	const [showBackButton, setShowBackButton] = useState(false);
	const [sidebarExpanded, setSidebarExpanded] = useState(false);

	// UI State that could potentially be managed here
	const [showWelcome, setShowWelcome] = useState(true);
	const [showOnboarding, setShowOnboarding] = useState(false);
	const [showPrivacyNotice, setShowPrivacyNotice] = useState(false);
	const [isHydrated, setIsHydrated] = useState(false);
	const [onboardingComplete, setOnboardingComplete] = useState(false);

	const messagesEndRef = useRef<HTMLDivElement>(null);
	const chatContainerRef = useRef<HTMLDivElement>(null);
	const savingRef = useRef(false);
	const toastTimeoutRef = useRef<NodeJS.Timeout>();

	const showToastMessage = useCallback((message: string) => {
		if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
		setShowToast(message);
		toastTimeoutRef.current = setTimeout(() => setShowToast(''), 2000);
	}, []);

	const handleLike = useCallback((messageId: string) => {
		setLikedMessages(prev => {
			const newLiked = new Set(prev);
			const newDisliked = new Set(dislikedMessages);

			if (newLiked.has(messageId)) {
				newLiked.delete(messageId);
			} else {
				newLiked.add(messageId);
				newDisliked.delete(messageId);

				const message = messages.find(m => m.id === messageId);
				if (message && !message.isUser) {
					AdaptiveAI.recordFeedback(messageId, message.content, true);
				}
			}

			setDislikedMessages(newDisliked);
			localStorage.setItem('lumora-liked-messages', JSON.stringify(Array.from(newLiked)));
			localStorage.setItem('lumora-disliked-messages', JSON.stringify(Array.from(newDisliked)));
			return newLiked;
		});
	}, [messages, dislikedMessages]);

	const handleDislike = useCallback((messageId: string) => {
		setDislikedMessages(prev => {
			const newLiked = new Set(likedMessages);
			const newDisliked = new Set(prev);

			if (newDisliked.has(messageId)) {
				newDisliked.delete(messageId);
			} else {
				newDisliked.add(messageId);
				newLiked.delete(messageId);

				const message = messages.find(m => m.id === messageId);
				if (message && !message.isUser) {
					AdaptiveAI.recordFeedback(messageId, message.content, false);
				}
			}

			setLikedMessages(newLiked);
			localStorage.setItem('lumora-liked-messages', JSON.stringify(Array.from(newLiked)));
			localStorage.setItem('lumora-disliked-messages', JSON.stringify(Array.from(newDisliked)));
			return newDisliked;
		});
	}, [messages, likedMessages]);

	const saveToHistory = useCallback((msgs: Message[]) => {
		if (msgs.length === 0 || savingRef.current) return;

		const lastMessage = msgs[msgs.length - 1];
		if (!lastMessage || lastMessage.isUser) return;

		savingRef.current = true;

		const messageLimit = parseInt(storage.get('lumora-message-limit') || '50');
		const limitedMsgs = msgs.slice(-messageLimit);

		const firstUserMsg = limitedMsgs.find(m => m.isUser);
		const topic = firstUserMsg ? ChatStorage.generateTitle(firstUserMsg.content) : 'Health Consultation';

		if (!currentChatId) {
			const newChatId = ChatStorage.saveChat(topic, limitedMsgs);
			setCurrentChatId(newChatId);
		} else {
			ChatStorage.saveChat(topic, limitedMsgs, currentChatId);
		}

		setTimeout(() => {
			savingRef.current = false;
		}, 1000);
	}, [currentChatId]);

	const sendToAI = useCallback(async (message: string) => {
		try {
			setIsTyping(true);

			const aiMode = storage.get('lumora-ai-mode') || 'classic';
			const customInstructions = storage.get('lumora-custom-instructions') || '';
			const maxTokens = parseInt(storage.get('lumora-max-tokens') || '450');
			const temperature = parseFloat(storage.get('lumora-temperature') || '0.5');
			const contextWindow = parseInt(storage.get('lumora-context-window') || '6');
			const enableReasoning = storage.get('lumora-enable-reasoning') === 'true';
			const adaptiveProfile = AdaptiveAI.getProfile();

			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 30000);

			const response = await fetch('/api/lumora-chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					message,
					history: messages.slice(-contextWindow).map(m => ({ role: m.isUser ? 'user' : 'assistant', content: m.content })),
					aiMode,
					customInstructions,
					maxTokens,
					temperature,
					contextWindow,
					enableReasoning,
					adaptiveProfile
				}),
				signal: controller.signal
			});

			clearTimeout(timeoutId);

			if (!response.ok) throw new Error('API request failed');

			const data = await response.json();
			if (!data.success) throw new Error(data.error);

			const aiMessage: Message = {
				id: crypto.randomUUID(),
				content: data.content || '',
				isUser: false,
				timestamp: new Date(),
				thinking: data.thinking || ''
			};

			setMessages(prev => {
				const newHistory = [...prev, aiMessage];
				saveToHistory(newHistory);
				return newHistory;
			});
		} catch (error) {
			const errorMessage: Message = {
				id: crypto.randomUUID(),
				content: "I'm temporarily unavailable. Please try again in a moment.",
				isUser: false,
				timestamp: new Date()
			};
			setMessages(prev => [...prev, errorMessage]);
		} finally {
			setIsTyping(false);
		}
	}, [messages, saveToHistory]);

	const handleImageAnalysis = useCallback(async (imageData: string, context: string, userMessage: string) => {
		try {
			setIsTyping(true);

			const userMsg: Message = {
				id: crypto.randomUUID(),
				content: `Image Analysis Request${userMessage ? `: ${userMessage}` : ''}`,
				isUser: true,
				timestamp: new Date(),
				imageData
			};
			setMessages(prev => [...prev, userMsg]);

			const contextWindow = parseInt(storage.get('lumora-context-window') || '6');
			const response = await fetch('/api/lumora-vision', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					image: imageData,
					context,
					history: messages.slice(-contextWindow).map(m => ({ role: m.isUser ? 'user' : 'assistant', content: m.content })),
					userMessage
				})
			});

			if (!response.ok) throw new Error('Vision API failed');

			const data = await response.json();
			if (!data.success) throw new Error(data.error);

			const aiMessage: Message = {
				id: crypto.randomUUID(),
				content: data.content,
				isUser: false,
				timestamp: new Date()
			};

			setMessages(prev => {
				const newHistory = [...prev, aiMessage];
				saveToHistory(newHistory);
				return newHistory;
			});
		} catch (error) {
			const errorMessage: Message = {
				id: crypto.randomUUID(),
				content: "Image analysis failed. Please try again.",
				isUser: false,
				timestamp: new Date()
			};
			setMessages(prev => [...prev, errorMessage]);
		} finally {
			setIsTyping(false);
		}
	}, [messages, saveToHistory]);

	const handleSend = useCallback((e: React.FormEvent) => {
		e.preventDefault();
		if (!input.trim()) return;

		const sanitizedInput = sanitizeChatMessage(input.trim());
		const userMessage: Message = {
			id: crypto.randomUUID(),
			content: sanitizedInput,
			isUser: true,
			timestamp: new Date()
		};
		setMessages(prev => [...prev, userMessage]);
		sendToAI(sanitizedInput);
		setInput('');
	}, [input, sendToAI]);


	useEffect(() => {
		if (typeof window === 'undefined') return;

		try {
			const savedLikes = localStorage.getItem('lumora-liked-messages');
			const savedDislikes = localStorage.getItem('lumora-disliked-messages');
			if (savedLikes) setLikedMessages(new Set(JSON.parse(savedLikes)));
			if (savedDislikes) setDislikedMessages(new Set(JSON.parse(savedDislikes)));
		} catch (e) {
			console.warn('Failed to load saved preferences');
		}

		const completed = storage.get(STORAGE_KEYS.ONBOARDING_COMPLETE);
		if (completed) {
			setShowWelcome(false);
			setOnboardingComplete(true);
		}
		setIsHydrated(true);

		setTimeout(() => {
			const autoDeleteDays = parseInt(storage.get('lumora-auto-delete-days') || '30');
			if (autoDeleteDays < 99999) {
				try {
					const chats = JSON.parse(storage.get(STORAGE_KEYS.CHAT_HISTORY) || '[]');
					const cutoffDate = new Date(Date.now() - autoDeleteDays * 24 * 60 * 60 * 1000);
					const filteredChats = chats.filter((chat: any) => new Date(chat.timestamp) > cutoffDate);

					if (filteredChats.length !== chats.length) {
						storage.set(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(filteredChats));
					}
				} catch (e) {
					console.warn('Failed to cleanup old chats');
				}
			}
		}, 100);

		const handleNewChat = () => {
			sessionManager.setCurrentSession(null);
			setMessages([]);
			setCurrentChatId(null);
			setShowBackButton(false);
		};

		const handleSidebarChange = (e: CustomEvent) => {
			setSidebarExpanded(e.detail.expanded);
		};

		window.addEventListener('lumora_new_chat', handleNewChat);
		window.addEventListener('sidebar-state-change', handleSidebarChange as EventListener);

		return () => {
			if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
			window.removeEventListener('lumora_new_chat', handleNewChat);
			window.removeEventListener('sidebar-state-change', handleSidebarChange as EventListener);
		};
	}, []);

	useEffect(() => {
		if (!onboardingComplete) return;

		const { chatId, fromHistory } = sessionManager.getActiveChat();

		if (chatId && fromHistory) {
			const allChats = ChatStorage.getAllChats();
			const targetChat = allChats.find((c) => c.id === chatId);

			if (targetChat?.messages?.length > 0) {
				setMessages(targetChat.messages);
				setCurrentChatId(chatId);
				setShowBackButton(true);
			}
			sessionManager.clearActiveChat();
		} else if (chatId) {
			const allChats = ChatStorage.getAllChats();
			const targetChat = allChats.find((c) => c.id === chatId);
			if (targetChat?.messages?.length > 0) {
				setMessages(targetChat.messages);
				setCurrentChatId(chatId);
			}
		}
	}, [onboardingComplete]);

	useEffect(() => {
		if (messages.length > 0) {
			const lastMessage = messages[messages.length - 1];
			if (lastMessage.isUser || isTyping) {
				requestAnimationFrame(() => {
					messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
				});
			}
		}
	}, [messages.length, isTyping]);

	useEffect(() => {
		return () => {
			if (messages.length > 0 && currentChatId) {
				const messageLimit = parseInt(storage.get('lumora-message-limit') || '50');
				const limitedMsgs = messages.slice(-messageLimit);
				const firstUserMsg = limitedMsgs.find(m => m.isUser);
				const topic = firstUserMsg ? ChatStorage.generateTitle(firstUserMsg.content) : 'Health Consultation';
				ChatStorage.saveChat(topic, limitedMsgs, currentChatId);
			}
		};
	}, [messages, currentChatId]);

	return {
		messages,
		setMessages,
		currentChatId,
		setCurrentChatId,
		input,
		setInput,
		isTyping,
		showToast,
		showToastMessage,
		selectedImage,
		setSelectedImage,
		likedMessages,
		handleLike,
		dislikedMessages,
		handleDislike,
		showScrollButton,
		setShowScrollButton,
		showBackButton,
		sidebarExpanded,
		showWelcome,
		setShowWelcome,
		showOnboarding,
		setShowOnboarding,
		showPrivacyNotice,
		setShowPrivacyNotice,
		isHydrated,
		onboardingComplete,
		setOnboardingComplete,
		messagesEndRef,
		chatContainerRef,
		handleSend,
		handleImageAnalysis,
		router
	};
}
