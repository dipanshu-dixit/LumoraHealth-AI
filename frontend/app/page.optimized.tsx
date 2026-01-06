"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import DOMPurify from 'isomorphic-dompurify';
import { sanitizeChatMessage } from './lib/sanitize';
import ThinkingLoader from './components/ThinkingLoader';
import ChatInterface from './components/Chat/ChatInterface';
import NavigationSidebar from './components/NavigationSidebar.optimized';
import { ArrowLeft, Lock, ThumbsUp, ThumbsDown, Copy } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import ReasoningTree from './components/ReasoningTree';
import { parseReasoning } from './lib/reasoningParser';
import SuggestionsGrid from './components/home/SuggestionsGrid';
import { detectMedicines } from './lib/medicineDetection';
import InlineMedicineCard from './components/InlineMedicineCard';
import { storage, STORAGE_KEYS } from '../src/lib/storage';
import { ChatStorage } from './lib/chatStorage';
import { sessionManager } from './lib/sessionManager';
import { AdaptiveAI } from './lib/adaptiveAI';

// Lazy load heavy components
const OnboardingModal = dynamic(() => import('./components/OnboardingModal'), { 
  ssr: false,
  loading: () => <div className="fixed inset-0 z-50 bg-black" />
});
const DynamicWelcome = dynamic(() => import('./components/DynamicWelcome'), { 
  ssr: false,
  loading: () => <div className="fixed inset-0 z-50 bg-black" />
});
const PrivacyNoticeModal = dynamic(() => import('./components/PrivacyNoticeModal'), { 
  ssr: false,
  loading: () => <div className="fixed inset-0 z-50 bg-black" />
});

interface Message {
	id: string;
	content: string;
	isUser: boolean;
	timestamp: Date;
	thinking?: string;
	imageData?: string;
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
	const [selectedImage, setSelectedImage] = useState<string | null>(null);
	const [likedMessages, setLikedMessages] = useState<Set<string>>(new Set());
	const [dislikedMessages, setDislikedMessages] = useState<Set<string>>(new Set());
	const [isTyping, setIsTyping] = useState(false);
	const [showBackButton, setShowBackButton] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const chatContainerRef = useRef<HTMLDivElement>(null);
	const savingRef = useRef(false);

	// Memoize expensive operations
	const displayMessages = useMemo(() => messages.slice(-50), [messages]);
	
	const showToastMessage = useCallback((message: string) => {
		setShowToast(message);
		setTimeout(() => setShowToast(''), 2000);
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
			const newDisliked = new Set(prev);
			const newLiked = new Set(likedMessages);
			
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

	// Optimized scroll to bottom
	const scrollToBottom = useCallback(() => {
		requestAnimationFrame(() => {
			messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
		});
	}, []);

	// Debounced save function
	const saveToHistory = useCallback((msgs: Message[]) => {
		if (msgs.length === 0 || savingRef.current) return;

		const lastMessage = msgs[msgs.length - 1];
		if (!lastMessage || lastMessage.isUser) return;

		savingRef.current = true;

		// Use setTimeout to debounce saves
		setTimeout(() => {
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
			
			savingRef.current = false;
		}, 1000);
	}, [currentChatId]);

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
	}, [input]);

	const sendToAI = useCallback(async (message: string) => {
		try {
			setIsTyping(true);

			// Get user settings once
			const settings = {
				aiMode: storage.get('lumora-ai-mode') || 'classic',
				customInstructions: storage.get('lumora-custom-instructions') || '',
				maxTokens: parseInt(storage.get('lumora-max-tokens') || '450'),
				temperature: parseFloat(storage.get('lumora-temperature') || '0.5'),
				contextWindow: parseInt(storage.get('lumora-context-window') || '6'),
				enableReasoning: storage.get('lumora-enable-reasoning') === 'true'
			};
			
			const adaptiveProfile = AdaptiveAI.getProfile();

			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 30000);

			const response = await fetch('/api/lumora-chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					message,
					history: messages.slice(-settings.contextWindow).map(m => ({ 
						role: m.isUser ? 'user' : 'assistant', 
						content: m.content 
					})),
					...settings,
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
				content: data.content,
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

	// Initialize app
	useEffect(() => {
		if (typeof window !== 'undefined') {
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

			// Load saved likes/dislikes
			const savedLikes = localStorage.getItem('lumora-liked-messages');
			const savedDislikes = localStorage.getItem('lumora-disliked-messages');
			if (savedLikes) setLikedMessages(new Set(JSON.parse(savedLikes)));
			if (savedDislikes) setDislikedMessages(new Set(JSON.parse(savedDislikes)));
		}

		const completed = storage.get(STORAGE_KEYS.ONBOARDING_COMPLETE);
		if (completed) {
			setShowWelcome(false);
			setOnboardingComplete(true);
		}
		setIsHydrated(true);
		
		// Listen for new chat event
		const handleNewChat = () => {
			sessionManager.setCurrentSession(null);
			setMessages([]);
			setCurrentChatId(null);
			setShowBackButton(false);
		};
		
		window.addEventListener('lumora_new_chat', handleNewChat);
		
		return () => {
			window.removeEventListener('lumora_new_chat', handleNewChat);
		};
	}, []);

	// Auto-scroll effect
	useEffect(() => {
		const container = chatContainerRef.current;
		if (!container) return;

		const isScrolledToBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
    
		if (isScrolledToBottom || (messages.length > 0 && !messages[messages.length - 1].isUser)) {
			scrollToBottom();
		}
	}, [messages, scrollToBottom]);

	// Load chat from history
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

	// Save current chat before unmounting
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
			{isHydrated && (
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

			{/* Back to History Button */}
			{showBackButton && (
				<button
					onClick={() => router.push('/history')}
					className="fixed top-4 left-4 lg:left-[calc(var(--sidebar-width,64px)+1rem)] z-40 px-3 py-1.5 flex items-center gap-2 text-zinc-400 hover:text-black transition-colors group bg-zinc-900/90 backdrop-blur-sm border border-zinc-700 rounded-full"
				>
					<ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
					<span className="text-sm font-medium">Back to History</span>
				</button>
			)}
      
			<main className="flex flex-col h-screen bg-[var(--bg-page)] overflow-hidden lg:ml-[var(--sidebar-width,64px)] transition-all duration-400">
				<div 
					ref={chatContainerRef} 
					className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 scroll-smooth pb-56 sm:pb-48 pt-4"
				>
					<div className="max-w-6xl mx-auto space-y-6 py-2">
						{displayMessages.map((message) => (
							<div key={message.id} className="max-w-3xl mx-auto">
								{!message.isUser && message.thinking && (() => {
									const steps = parseReasoning(message.thinking);
									return (
										<details className="mb-4">
											<summary className="cursor-pointer select-none transition-all duration-200 flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-white/10 to-blue-500/10 hover:from-white/20 hover:to-blue-500/20 border border-white/30 rounded-lg group">
												<svg className="w-5 h-5 text-black group-hover:text-teal-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
												</svg>
												<div className="flex-1">
													<div className="text-sm font-semibold text-black group-hover:text-teal-300 transition-colors">View AI Reasoning Chain</div>
													<div className="text-xs text-zinc-500">See how I analyzed your question{steps.length > 0 && ` • ${steps.length} reasoning steps`}</div>
												</div>
												<svg className="w-4 h-4 text-black group-hover:text-teal-300 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
												</svg>
											</summary>
											<div className="mt-3">
												{steps.length > 0 ? (
													<ReasoningTree 
														steps={steps}
														onStepClick={(step) => {
															setInput(`Can you explain more about: "${step.thought.substring(0, 100)}...\"?`);
														}}
													/>
												) : (
													<div className="bg-zinc-900/30 border border-zinc-700/50 rounded-lg p-4">
														<pre className="text-zinc-300 text-sm whitespace-pre-wrap font-mono">{message.thinking}</pre>
													</div>
												)}
											</div>
										</details>
									);
								})()}
								<div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-6`}>
									<div className="flex gap-3 max-w-[90%] md:max-w-[80%]">
										{!message.isUser && (
											<div className="text-xs font-medium text-zinc-500 flex-shrink-0 mt-1">
												LUMORA
											</div>
										)}
										<div className="flex-1">
											<div
												className={`${
													message.isUser 
														? 'bg-zinc-800 rounded-2xl rounded-tr-sm px-3 md:px-4 py-2 md:py-3 font-sans text-[var(--text-primary)]' 
														: 'font-sans text-[var(--text-primary)]'
												} leading-relaxed text-sm md:text-base`}
												role={message.isUser ? 'article' : 'article'}
												aria-live={message.isUser ? undefined : 'polite'}
											>
												{message.isUser ? (
													<>
														{message.imageData ? (
															<div className="space-y-2">
																<div className="flex items-center gap-2 text-zinc-300 text-sm mb-2">
																	<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
																	<span>{message.content}</span>
																</div>
																<img 
																	src={message.imageData} 
																	alt="Uploaded" 
																	className="max-w-xs rounded-lg border border-zinc-700 cursor-pointer hover:opacity-80 transition-opacity"
																	onClick={() => setSelectedImage(message.imageData!)}
																/>
															</div>
														) : (
															<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(String(message.content || '')) }} />
														)}
													</>
												) : (
													<>
														<div className="prose prose-invert max-w-none prose-headings:font-sans prose-headings:mb-3 prose-headings:mt-6 prose-p:font-sans prose-p:leading-relaxed prose-p:mb-4 prose-li:font-sans prose-li:mb-2 prose-li:marker:text-zinc-400 prose-strong:text-white prose-ul:my-4 prose-ol:my-4">
															<ReactMarkdown>
																{String(message.content || '')}
															</ReactMarkdown>
														</div>
														{(() => {
															const detectedMeds = detectMedicines(message.content);
															return detectedMeds.length > 0 ? (
																<details className="mt-6 group">
																	<summary className="cursor-pointer select-none flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-3">
																		<svg className="w-3.5 h-3.5 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
																			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
																		</svg>
																		<span className="font-medium tracking-wide">RELATED MEDICATIONS ({detectedMeds.length})</span>
																	</summary>
																	<div className="pl-5 space-y-2">
																		{detectedMeds.map((med) => (
																			<div key={med}>
																				<InlineMedicineCard
																					name={med}
																					onSearch={(name) => {
																						if (messages.length > 0 && currentChatId) {
																							const messageLimit = parseInt(storage.get('lumora-message-limit') || '50');
																							const limitedMsgs = messages.slice(-messageLimit);
																							const firstUserMsg = limitedMsgs.find(m => m.isUser);
																							const topic = firstUserMsg ? ChatStorage.generateTitle(firstUserMsg.content) : 'Health Consultation';
																							ChatStorage.saveChat(topic, limitedMsgs, currentChatId);
																							sessionManager.setCurrentSession(currentChatId);
																						}
																						router.push(`/medicines?search=${encodeURIComponent(name)}`);
																					}}
																				/>
																			</div>
																		))}
																	</div>
																</details>
															) : null;
														})()}
													</>
												)}
											</div>
											{!message.isUser && (
												<div className="flex items-center gap-1 mt-2">
													<button 
														onClick={() => handleLike(message.id)}
														className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
															likedMessages.has(message.id) 
																? 'bg-green-500/20 text-green-400' 
																: 'text-zinc-500 hover:text-green-400 hover:bg-green-500/10'
														}`} 
														title="Like"
													>
														<ThumbsUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
													</button>
													<button 
														onClick={() => handleDislike(message.id)}
														className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
															dislikedMessages.has(message.id) 
																? 'bg-red-500/20 text-red-400' 
																: 'text-zinc-500 hover:text-red-400 hover:bg-red-500/10'
														}`} 
														title="Dislike"
													>
														<ThumbsDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
													</button>
													<button 
														onClick={() => {
															navigator.clipboard.writeText(message.content);
															showToastMessage('Copied to clipboard!');
														}}
														className="p-1.5 sm:p-2 text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors" 
														title="Copy"
													>
														<Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
													</button>
												</div>
											)}
										</div>
									</div>
								</div>
							</div>
						))}

						{isTyping && <ThinkingLoader />}

						{messages.length === 0 && (
							<div className="max-w-6xl mx-auto space-y-6 lg:space-y-8 py-8 transition-all duration-400">
								<div className="text-center">
									<h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-light text-white mb-2 transition-all duration-400 tracking-tight">
										How can I <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent font-medium">help you</span> today?
									</h2>
									<p className="text-zinc-400 font-sans text-sm lg:text-base">
										Describe what you're experiencing.
									</p>
								</div>
								
								<SuggestionsGrid onQuestionClick={(question) => {
									setInput(question);
								}} />
							</div>
						)}

						<div ref={messagesEndRef} className="h-2" />
					</div>
				</div>

				<div className="fixed bottom-0 left-0 right-0 w-full bg-black border-t border-gray-800 p-3 sm:p-6 lg:left-[var(--sidebar-width,64px)] z-30">
					<div className="max-w-6xl mx-auto">
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
						<p className="text-center text-xs text-zinc-600 mt-2 sm:mt-3">
							Lumora can make mistakes, so double-check it
						</p>
					</div>
				</div>
			</main>
      
			{/* Toast Notification */}
			{showToast && (
				<div className="fixed bottom-32 sm:bottom-24 left-1/2 transform -translate-x-1/2 bg-zinc-800 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm max-w-[90vw]">
					{DOMPurify.sanitize(showToast, { ALLOWED_TAGS: [] })}
				</div>
			)}

			{/* Image Modal */}
			{selectedImage && (
				<div 
					className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
					onClick={() => setSelectedImage(null)}
				>
					<button
						className="absolute top-4 right-4 text-white hover:text-zinc-300 transition-colors"
						onClick={() => setSelectedImage(null)}
					>
						<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
					<img 
						src={selectedImage} 
						alt="Full size" 
						className="max-w-full max-h-full object-contain rounded-lg"
						onClick={(e) => e.stopPropagation()}
					/>
				</div>
			)}
		</>
	);
}