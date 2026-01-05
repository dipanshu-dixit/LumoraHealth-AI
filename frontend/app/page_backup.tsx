"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import DOMPurify from 'isomorphic-dompurify';
import { sanitizeChatMessage } from './lib/sanitize';
import TypingIndicator from './components/TypingIndicator';
import ScrollToBottom from './components/ScrollToBottom';
import ChatInterface from './components/Chat/ChatInterface';
import NavigationSidebar from './components/NavigationSidebar';
import StatusHeader from './components/StatusHeader';
import { ArrowLeft, Lock, ThumbsUp, ThumbsDown, Copy } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import SuggestionsGrid from './components/home/SuggestionsGrid';
import { storage, STORAGE_KEYS } from '../src/lib/storage';
import { ChatStorage } from './lib/chatStorage';
import { sessionManager } from './lib/sessionManager';

const OnboardingModal = dynamic(() => import('./components/OnboardingModal'), { ssr: false });
const DynamicWelcome = dynamic(() => import('./components/DynamicWelcome'), { ssr: false });
const PrivacyNoticeModal = dynamic(() => import('./components/PrivacyNoticeModal'), { ssr: false });

interface Message {
	id: string;
	content: string;
	isUser: boolean;
	timestamp: Date;
	thinking?: string;
}

export default function Home() {
	const router = useRouter();
	const [messages, setMessages] = useState<Message[]>([]);
	const [currentChatId, setCurrentChatId] = useState<string | null>(null);
	const [showWelcome, setShowWelcome] = useState(true);
	const [showOnboarding, setShowOnboarding] = useState(false);
	const [showPrivacyNotice, setShowPrivacyNotice] = useState(false);
	const [isHydrated, setIsHydrated] = useState(false);
	const [onboardingComplete, setOnboardingComplete] = useState(false);
	const [input, setInput] = useState('');
	const [showToast, setShowToast] = useState('');
	const [likedMessages, setLikedMessages] = useState<Set<string>>(new Set());
	const [dislikedMessages, setDislikedMessages] = useState<Set<string>>(new Set());

	const showToastMessage = (message: string) => {
		setShowToast(message);
		setTimeout(() => setShowToast(''), 2000);
	};

	const handleLike = (messageId: string) => {
		const newLiked = new Set(likedMessages);
		const newDisliked = new Set(dislikedMessages);
		
		if (newLiked.has(messageId)) {
			newLiked.delete(messageId);
		} else {
			newLiked.add(messageId);
			newDisliked.delete(messageId);
		}
		
		setLikedMessages(newLiked);
		setDislikedMessages(newDisliked);
	};

	const handleDislike = (messageId: string) => {
		const newLiked = new Set(likedMessages);
		const newDisliked = new Set(dislikedMessages);
		
		if (newDisliked.has(messageId)) {
			newDisliked.delete(messageId);
		} else {
			newDisliked.add(messageId);
			newLiked.delete(messageId);
		}
		
		setLikedMessages(newLiked);
		setDislikedMessages(newDisliked);
	};

	useEffect(() => {
		if (typeof window !== 'undefined') {
			window.scrollTo(0, 0);
			
			// Auto-delete old messages on app start
			const autoDeleteDays = parseInt(storage.get('lumora-auto-delete-days') || '30');
			if (autoDeleteDays < 99999) {
				const chats = JSON.parse(storage.get(STORAGE_KEYS.CHAT_HISTORY) || '[]');
				const cutoffDate = new Date(Date.now() - autoDeleteDays * 24 * 60 * 60 * 1000);
				const filteredChats = chats.filter((chat: any) => new Date(chat.timestamp) > cutoffDate);
				
				if (filteredChats.length !== chats.length) {
					storage.set(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(filteredChats));
				}
			}
		}
		const completed = storage.get(STORAGE_KEYS.ONBOARDING_COMPLETE);
		if (completed) {
			setShowWelcome(false);
			setOnboardingComplete(true);
		}
		setIsHydrated(true);
		
		// Listen for sidebar state changes
		const handleSidebarChange = (e: CustomEvent) => {
			setSidebarExpanded(e.detail.expanded);
		};
		
		window.addEventListener('sidebar-state-change', handleSidebarChange as EventListener);
		
		return () => {
			window.removeEventListener('sidebar-state-change', handleSidebarChange as EventListener);
		};
	}, []);
	
	// Separate effect for loading chat from history
	useEffect(() => {
		if (!onboardingComplete) return;
		
		const { chatId, fromHistory } = sessionManager.getActiveChat();
		console.log('Checking for active chat:', chatId, fromHistory);
		
		if (chatId && fromHistory) {
			const allChats = ChatStorage.getAllChats();
			console.log('All chats:', allChats.length, allChats.map(c => c.id));
			const targetChat = allChats.find((c) => c.id === chatId);
			console.log('Target chat ID:', chatId);
			console.log('Found chat:', targetChat);

			if (targetChat?.messages?.length > 0) {
				console.log('Loading chat with', targetChat.messages.length, 'messages');
				setMessages(targetChat.messages);
				setCurrentChatId(chatId);
				setShowBackButton(true);
			} else {
				console.error('Chat not found or has no messages');
			}
			sessionManager.clearActiveChat();
		}
	}, [onboardingComplete]);
	const [isTyping, setIsTyping] = useState(false);
	const [showScrollButton, setShowScrollButton] = useState(false);
	const [showBackButton, setShowBackButton] = useState(false);
	const [sidebarExpanded, setSidebarExpanded] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const chatContainerRef = useRef<HTMLDivElement>(null);
	const savingRef = useRef(false);

	useEffect(() => {
		const container = chatContainerRef.current;
		if (!container) return;

		const isScrolledToBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
    
		if (isScrolledToBottom || (messages.length > 0 && !messages[messages.length - 1].isUser)) {
			setTimeout(() => {
				messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
			}, 100);
		}
	}, [messages]);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
		setShowScrollButton(false);
	};

	const saveToHistory = (msgs: Message[]) => {
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
	};

		const handleSentientSubmit = ({ text, file }: { text: string; file: File | null }) => {
			if (!text.trim() && !file) return;

			if (text.trim()) {
				const sanitizedInput = sanitizeChatMessage(text.trim());
				const userMessage: Message = {
					id: crypto.randomUUID(),
					content: sanitizedInput,
					isUser: true,
					timestamp: new Date()
				};
				setMessages(prev => [...prev, userMessage]);
				sendToAI(sanitizedInput);
			}

			if (file) {
				const reader = new FileReader();
				reader.onload = (e) => {
					const imageData = e.target?.result as string;
					const imageMessage: Message = {
						id: crypto.randomUUID(),
						content: `📷 ${file.name}<br><img src="${imageData}" alt="Uploaded image" style="max-width: 300px; border-radius: 8px; margin-top: 8px;" />`,
						isUser: true,
						timestamp: new Date()
					};
					setMessages(prev => [...prev, imageMessage]);
					sendToAI(`User uploaded an image: ${file.name}`);
				};
				reader.readAsDataURL(file);
			}
			setInput('');
		};

	const handleSend = (e: React.FormEvent) => {
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
	};

	const sendToAI = async (message: string) => {
		try {
			setIsTyping(true);

			// Get user settings
			const aiMode = storage.get('lumora-ai-mode') || 'classic';
			const customInstructions = storage.get('lumora-custom-instructions') || '';
			const maxTokens = parseInt(storage.get('lumora-max-tokens') || '450');
			const temperature = parseFloat(storage.get('lumora-temperature') || '0.5');
			const contextWindow = parseInt(storage.get('lumora-context-window') || '6');

			// Debounce rapid requests
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 30000);

			const response = await fetch('/api/lumora-chat', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					message: message,
					history: messages.slice(-contextWindow).map(m => ({ role: m.isUser ? 'user' : 'assistant', content: m.content })),
					aiMode,
					customInstructions,
					maxTokens,
					temperature,
					contextWindow
				}),
				signal: controller.signal
			});

			clearTimeout(timeoutId);

			if (!response.ok) throw new Error('API request failed');

			const data = await response.json();

			if (!data.success) throw new Error(data.error);

			const content = data.content;
			if (!content) throw new Error('Empty response from AI');

			const aiMessage: Message = {
				id: crypto.randomUUID(),
				content: content,
				isUser: false,
				timestamp: new Date()
			};

			setMessages(prev => {
				const newHistory = [...prev, aiMessage];
				saveToHistory(newHistory);
				return newHistory;
			});
			setIsTyping(false);
		} catch (error) {
			setIsTyping(false);
			const errorMessage: Message = {
				id: crypto.randomUUID(),
				content: "I'm temporarily unavailable. Please try again in a moment.",
				isUser: false,
				timestamp: new Date()
			};
			setMessages(prev => [...prev, errorMessage]);
		}
	};

	if (!isHydrated || (showWelcome || showOnboarding || showPrivacyNotice)) {
		return (
			<div className="fixed inset-0 z-50 bg-black">
				{isHydrated && showWelcome && (
					<DynamicWelcome onComplete={() => {
						setShowWelcome(false);
						setShowOnboarding(true);
					}} />
				)}
				{isHydrated && showOnboarding && (
					<OnboardingModal onComplete={() => {
						setShowOnboarding(false);
						setShowPrivacyNotice(true);
					}} />
				)}
				{isHydrated && showPrivacyNotice && (
					<PrivacyNoticeModal onComplete={() => {
						setShowPrivacyNotice(false);
						storage.set(STORAGE_KEYS.ONBOARDING_COMPLETE, 'true');
						setOnboardingComplete(true);
					}} />
				)}
			</div>
		);
	}

	return (
		<>
			<NavigationSidebar user={{ name: 'User' }} />
			
			{/* Encrypted Status Indicator - Hidden on mobile */}
			{isHydrated && !sidebarExpanded && (
				<div 
					className="fixed top-4 z-40 hidden lg:flex items-center gap-2 bg-zinc-900/90 backdrop-blur-sm border border-zinc-700 rounded-full px-3 py-1.5 transition-all duration-400" 
					style={{ 
						left: 'calc(50% + 32px)',
						transform: 'translateX(-50%)'
					}}
				>
					<div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
					<Lock className="w-3.5 h-3.5 text-zinc-400" />
				</div>
			)}
      
			<main className="flex flex-col h-screen bg-[var(--bg-page)] overflow-hidden lg:ml-[var(--sidebar-width,64px)] transition-all duration-400">
				{showBackButton && (
					<button
						onClick={() => router.push('/history')}
						className="flex-shrink-0 px-4 pt-4 pb-2 flex items-center gap-2 text-zinc-400 hover:text-black transition-colors group z-50"
					>
						<ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
						<span className="text-sm font-medium">Back to History</span>
					</button>
				)}
				<div ref={chatContainerRef} className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 scroll-smooth pb-56 sm:pb-48" onScroll={(e) => {
					const container = e.currentTarget;
					const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
					setShowScrollButton(!isNearBottom);
				}}>
					<div className="max-w-5xl mx-auto space-y-6 py-6">
						{messages.slice(-50).map((message) => (
							<div key={message.id} className="max-w-3xl mx-auto">
								{!message.isUser && message.thinking && (
									<details className="mr-12 mb-2">
										<summary className="text-aura text-sm cursor-pointer hover:text-aura-dark hover:brightness-110 select-none transition-all duration-200 hover:shadow-glow">
											💭 Show thinking process
										</summary>
										<div className="text-muted text-sm mt-2 p-3 bg-surface rounded-lg border-l-4 border-aura">
											{message.thinking}
										</div>
									</details>
								)}
								<div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-6`}>
									<div className="flex flex-col max-w-[90%] md:max-w-[80%]">
										{!message.isUser && (
											<div className="text-black font-bold tracking-widest text-xs mb-1">LUMORA</div>
										)}
										<div
											className={`${
												message.isUser 
													? 'bg-zinc-800 rounded-2xl rounded-tr-sm px-3 md:px-4 py-2 md:py-3 font-sans text-[var(--text-primary)]' 
													: 'border-l-2 border-white pl-3 md:pl-4 font-sans text-[var(--text-primary)]'
											} leading-relaxed text-sm md:text-base`}
											role={message.isUser ? 'article' : 'article'}
											aria-live={message.isUser ? undefined : 'polite'}
										>
											{message.isUser ? (
												<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(String(message.content || '')) }} />
											) : (
												<div className="prose prose-invert max-w-none prose-headings:font-sans prose-p:font-sans prose-p:leading-relaxed prose-li:font-sans prose-li:marker:text-black prose-strong:text-black">
													<ReactMarkdown>
														{String(message.content || '')}
													</ReactMarkdown>
												</div>
											)}
										</div>
										{!message.isUser && (
											<div className="flex items-center gap-2 mt-2 ml-3">
												<button 
													onClick={() => handleLike(message.id)}
													className={`p-1.5 hover:bg-zinc-800 rounded transition-colors ${
														likedMessages.has(message.id) ? 'text-green-400 bg-zinc-800' : 'text-green-500 hover:text-green-400'
													}`} 
													title="Like"
												>
													<ThumbsUp className="w-4 h-4" />
												</button>
												<button 
													onClick={() => handleDislike(message.id)}
													className={`p-1.5 hover:bg-zinc-800 rounded transition-colors ${
														dislikedMessages.has(message.id) ? 'text-red-400 bg-zinc-800' : 'text-red-500 hover:text-red-400'
													}`} 
													title="Dislike"
												>
													<ThumbsDown className="w-4 h-4" />
												</button>
												<button 
													onClick={() => {
														navigator.clipboard.writeText(message.content);
														showToastMessage('Copied to clipboard!');
													}}
													className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-blue-400 transition-colors" 
													title="Copy"
												>
													<Copy className="w-4 h-4" />
												</button>
											</div>
										)}
									</div>
								</div>
							</div>
						))}

						{isTyping && <TypingIndicator />}

						{messages.length === 0 && (
							<div className={`max-w-5xl mx-auto space-y-6 lg:space-y-8 py-8 transition-all duration-400 ${
								sidebarExpanded ? 'max-w-4xl' : 'max-w-5xl'
							}`}>
								<div className="text-center">
									<h2 className={`text-xl sm:text-2xl lg:text-3xl text-[var(--text-primary)] font-serif mb-2 transition-all duration-400 ${
										sidebarExpanded ? 'xl:text-3xl' : 'xl:text-4xl'
									}`}>
										How can I help you today?
									</h2>
									<p className="text-[var(--text-secondary)] font-sans text-sm lg:text-base">
										Describe what you're experiencing.
									</p>
								</div>
								
								<SuggestionsGrid onQuestionClick={(question) => {
							setInput(question);
							handleSend({ preventDefault: () => {} } as React.FormEvent);
						}} />
							</div>
						)}

						<div ref={messagesEndRef} className="h-2" />
					</div>
				</div>

				<div className="fixed bottom-0 left-0 right-0 w-full bg-black border-t border-gray-800 p-6 lg:left-[var(--sidebar-width,64px)] z-30">
					<div className="max-w-5xl mx-auto">
						<ChatInterface
							input={input}
							setInput={setInput}
							onSubmit={handleSend}
							isLoading={isTyping}
							messages={messages}
							setMessages={setMessages}
							activeChatId={currentChatId}
							setActiveChatId={setCurrentChatId}
						/>
						<p className="text-center text-xs text-zinc-600 mt-3">
							Lumora can make mistakes, so double-check it
						</p>
					</div>
				</div>
			</main>
      
			<ScrollToBottom isVisible={showScrollButton} onClick={scrollToBottom} />
			
			{/* Toast Notification */}
			{showToast && (
				<div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-zinc-800 text-black px-4 py-2 rounded-lg shadow-lg z-50 text-sm">
					{showToast}
				</div>
			)}
		</>
	);
}
