"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Trash2, ChevronRight, FileText, Shield, Book, Settings as SettingsIcon, Bell, Phone, Brain, Activity, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import DeleteAccountModal from '../components/DeleteAccountModal';
import AdvancedSettingsModal from '../components/AdvancedSettingsModal';
import NavigationSidebar from '../components/NavigationSidebar';
import { useNotifications } from '../hooks/useNotifications';
import { useUser } from '../hooks/useUser';

import { storage, STORAGE_KEYS } from '@/lib/storage';

export default function Settings() {
	const router = useRouter();
	const { firstName, lastName, fullName, setFirstName, setLastName } = useUser();
	const { notificationsEnabled, toggleNotifications, mounted: notificationsMounted } = useNotifications();
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [showAdvanced, setShowAdvanced] = useState(false);
	const [mounted, setMounted] = useState(false);
	const [tempFirstName, setTempFirstName] = useState('');
	const [tempLastName, setTempLastName] = useState('');
	const [hasChanges, setHasChanges] = useState(false);
	const [autoDeleteDays, setAutoDeleteDays] = useState(30);
	const [messageLimit, setMessageLimit] = useState(50);
	const [aiMode, setAiMode] = useState('classic');
	const [customInstructions, setCustomInstructions] = useState('');
	const [tempCustomInstructions, setTempCustomInstructions] = useState('');
	const [hasInstructionChanges, setHasInstructionChanges] = useState(false);

	useEffect(() => {
		setMounted(true);
		setTempFirstName(firstName);
		setTempLastName(lastName);
		setAutoDeleteDays(parseInt(storage.get('lumora-auto-delete-days') || '30'));
		setMessageLimit(parseInt(storage.get('lumora-message-limit') || '50'));
		setAiMode(storage.get('lumora-ai-mode') || 'classic');
		const instructions = storage.get('lumora-custom-instructions') || '';
		setCustomInstructions(instructions);
		setTempCustomInstructions(instructions);
	}, [firstName, lastName]);

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

	const handleAiModeChange = (mode: string) => {
		setAiMode(mode);
		storage.set('lumora-ai-mode', mode);
		const modeNames = {
			classic: 'Classic Mode',
			medical: 'Medical Professional Mode',
			chatty: 'Chatty Doctor Mode'
		};
		toast.success(`AI Mode: ${modeNames[mode as keyof typeof modeNames]}`, { duration: 2000 });
	};

	const handleCustomInstructionsChange = (value: string) => {
		setTempCustomInstructions(value);
		setHasInstructionChanges(value !== customInstructions);
	};

	const saveCustomInstructions = () => {
		setCustomInstructions(tempCustomInstructions);
		storage.set('lumora-custom-instructions', tempCustomInstructions);
		setHasInstructionChanges(false);
		toast.success('Custom instructions saved!', { duration: 2000 });
	};

	const handleSaveName = () => {
		setFirstName(tempFirstName);
		setLastName(tempLastName);
		setHasChanges(false);
		toast.success('Name saved successfully!', { duration: 3000 });
	};

	const handleFirstNameChange = (value: string) => {
		setTempFirstName(value);
		setHasChanges(value !== firstName || tempLastName !== lastName);
	};

	const handleLastNameChange = (value: string) => {
		setTempLastName(value);
		setHasChanges(tempFirstName !== firstName || value !== lastName);
	};

	const escapeHtml = (text: string) => {
		return text
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#039;');
	};

	const handleExportData = async () => {
		toast.loading('Preparing your data export...', { id: 'export' });
    
		const userData = {
			user: {
				name: fullName,
				firstName,
				lastName,
				exportDate: new Date().toISOString()
			},
			chatHistory: typeof window !== 'undefined' ? JSON.parse(storage.get(STORAGE_KEYS.CHAT_HISTORY) || '[]') : []
		};

		// Create beautiful HTML export
		const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Lumora Health Data Export - ${fullName}</title>
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
		<p><strong>${escapeHtml(fullName)}</strong></p>
		<p>Health Data Export</p>
		<p>Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
	</div>

	<div class="section">
		<h2>📊 Summary</h2>
		<p><strong>Total Conversations:</strong> ${userData.chatHistory.length}</p>
		<p><strong>Export Date:</strong> ${new Date().toLocaleDateString()}</p>
	</div>

	<div class="section">
		<h2>💬 Conversation History</h2>
		${userData.chatHistory.map((chat: any, i: number) => `
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
		const link = document.createElement('a');
		link.href = url;
		link.download = `Lumora-Health-Data-${new Date().toISOString().split('T')[0]}.html`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
    
		toast.success('Data exported! Open the HTML file and print to save as PDF.', { id: 'export', duration: 5000 });
	};

	const handleDeleteAccount = () => {
		if (typeof window !== 'undefined') {
			storage.clear();
			sessionStorage.clear();
		}
		toast.success('All data cleared successfully. Redirecting...', { duration: 3000 });
		setShowDeleteModal(false);
		setTimeout(() => window.location.href = '/', 2000);
	};

	const handleFactoryReset = () => {
		if (confirm('⚠️ Factory Reset will restore all settings to default and clear all data. This cannot be undone. Continue?')) {
			if (typeof window !== 'undefined') {
				localStorage.clear();
				sessionStorage.clear();
				setFirstName('User');
				setLastName('');
			}
			toast.success('Factory reset complete! Reloading...', { duration: 2000 });
			setTimeout(() => window.location.reload(), 1500);
		}
	};

	const legalItems = [
		{ title: 'Privacy Policy', href: '/privacy', icon: Shield },
		{ title: 'Terms of Service', href: '/terms', icon: FileText },
		{ title: 'Documentation', href: '/docs', icon: Book },
		{ title: 'Emergency Contacts', href: '/emergency', icon: Phone },
		{ title: 'Advanced Settings', action: () => setShowAdvanced(true), icon: SettingsIcon }
	];

	return (
		<>
			<NavigationSidebar user={{ name: fullName }} />
			<div className="h-full overflow-y-auto bg-[var(--bg-page)] pt-16">
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
      
			<div className="max-w-6xl mx-auto px-6 py-6">
					<h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-emerald-500 bg-clip-text text-transparent mb-8 font-sans">
						Settings
					</h1>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3 }}
							className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-8 hover:bg-zinc-800/80 transition-all"
						>
							<h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6 font-sans">Your Data</h2>
							
							<div className="grid md:grid-cols-2 gap-6">
								<div className="space-y-4">
									<div>
										<label className="block text-[var(--text-primary)] text-sm font-medium mb-3 font-sans">
											First Name
										</label>
										<input
											type="text"
											value={tempFirstName}
											onChange={(e) => handleFirstNameChange(e.target.value)}
											className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all font-sans"
											placeholder="Enter your first name"
										/>
									</div>
									<div>
										<label className="block text-[var(--text-primary)] text-sm font-medium mb-3 font-sans">
											Last Name (Optional)
										</label>
										<input
											type="text"
											value={tempLastName}
											onChange={(e) => handleLastNameChange(e.target.value)}
											className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all font-sans"
											placeholder="Enter your last name"
										/>
									</div>
									
									{hasChanges && (
										<motion.button
											onClick={handleSaveName}
											className="bg-white hover:bg-zinc-100 text-black px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 font-sans"
											whileHover={{ scale: 1.02 }}
											whileTap={{ scale: 0.98 }}
										>
											<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
											</svg>
											Save Name
										</motion.button>
									)}
								</div>
								
								<div className="flex flex-col gap-3">
									<motion.button
										onClick={handleExportData}
										className="bg-white hover:bg-zinc-100 text-black px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 font-sans"
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
									>
										<Download className="w-5 h-5" />
										Export Data
									</motion.button>
									
									<motion.button
										onClick={handleFactoryReset}
										className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 font-sans"
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
									>
										<SettingsIcon className="w-5 h-5" />
										Factory Reset
									</motion.button>
									
									<motion.button
										onClick={() => setShowDeleteModal(true)}
										className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 font-sans"
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
									>
										<Trash2 className="w-5 h-5" />
										<span className="text-red-100">Delete Account</span>
									</motion.button>
								</div>
							</div>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3, delay: 0.1 }}
							className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-8 hover:bg-zinc-800/80 transition-all"
						>
							<div className="flex items-center gap-3 mb-6">
								<SettingsIcon className="w-6 h-6 text-white" />
								<h2 className="text-2xl font-bold text-white font-sans">Storage & Privacy</h2>
							</div>

							<div className="grid md:grid-cols-2 gap-6">
								<div>
									<div className="flex items-center gap-2 mb-3">
										<Bell className="w-5 h-5 text-white" />
										<label className="text-white font-medium font-sans">Auto-Delete Messages</label>
									</div>
									<select 
										value={autoDeleteDays}
										onChange={(e) => handleAutoDeleteChange(parseInt(e.target.value))}
										className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all font-sans"
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
										<SettingsIcon className="w-5 h-5 text-white" />
										<label className="text-white font-medium font-sans">Message Storage Limit</label>
									</div>
									<select 
										value={messageLimit}
										onChange={(e) => handleMessageLimitChange(parseInt(e.target.value))}
										className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all font-sans"
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
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3, delay: 0.15 }}
							className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-8 hover:bg-zinc-800/80 transition-all"
						>
							<div className="flex items-center gap-3 mb-6">
								<Brain className="w-6 h-6 text-white" />
								<h2 className="text-2xl font-bold text-white font-sans">AI Behavior</h2>
							</div>

							<div className="grid md:grid-cols-2 gap-6">
								<div>
									<div className="flex items-center gap-2 mb-3">
										<SettingsIcon className="w-5 h-5 text-white" />
										<label className="text-white font-medium font-sans">Response Mode</label>
									</div>
									<select 
										value={aiMode}
										onChange={(e) => handleAiModeChange(e.target.value)}
										className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all font-sans"
									>
										<option value="classic">Classic - Balanced responses</option>
										<option value="medical">Medical Professional - Technical & detailed</option>
										<option value="chatty">Chatty Doctor - Encouraging & friendly</option>
									</select>
								</div>

								<div>
									<div className="flex items-center gap-2 mb-3">
										<FileText className="w-5 h-5 text-white" />
										<label className="text-white font-medium font-sans">Custom Instructions</label>
									</div>
									<textarea
										value={tempCustomInstructions}
										onChange={(e) => handleCustomInstructionsChange(e.target.value)}
										placeholder="e.g., I have diabetes, I'm sensitive to light, I prefer natural remedies, I'm a healthcare worker..."
										rows={4}
										className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all font-sans resize-none"
									/>
									<p className="text-xs text-zinc-500 mt-2">AI will consider these details in all responses</p>
									
									{hasInstructionChanges && (
										<motion.button
											onClick={saveCustomInstructions}
											className="bg-white hover:bg-zinc-100 text-black px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 font-sans mt-3"
											whileHover={{ scale: 1.02 }}
											whileTap={{ scale: 0.98 }}
										>
											<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
											</svg>
											Save Instructions
										</motion.button>
									)}
								</div>
							</div>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3, delay: 0.2 }}
							className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 hover:bg-zinc-800/80 transition-all"
						>
							<div className="flex items-center gap-3 mb-6">
								<Bell className="w-6 h-6 text-white" />
								<h2 className="text-2xl font-bold text-white font-sans">Notifications</h2>
							</div>

							<div>
								<div className="flex items-center gap-2 mb-3">
									<Bell className="w-5 h-5 text-white" />
									<label className="text-white font-medium font-sans">Daily Check-ins</label>
								</div>
								<button
									onClick={toggleNotifications}
									className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black ${
										notificationsMounted && notificationsEnabled ? 'bg-teal-500' : 'bg-zinc-700'
									}`}
								>
									<span
										className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
											notificationsMounted && notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
										}`}
									/>
								</button>
							</div>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3, delay: 0.2 }}
							className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:bg-zinc-800/80 transition-all"
						>
							<h2 className="text-xl font-bold text-white mb-4 font-sans">Legal & Trust</h2>
							
							<div className="space-y-2">
								{legalItems.map((item) => {
									const Icon = item.icon;
									return (
										<button
											key={item.title}
											onClick={() => item.action ? item.action() : router.push(item.href!)}
											className="w-full flex items-center justify-between p-3 hover:bg-zinc-800 rounded-lg transition-colors group"
										>
											<div className="flex items-center gap-3">
												<Icon className="w-5 h-5 text-zinc-400" />
												<span className="text-white font-medium font-sans">{item.title}</span>
											</div>
											<ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
										</button>
									);
								})}
							</div>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3, delay: 0.3 }}
							className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:bg-zinc-800/80 transition-all relative"
						>
							<h2 className="text-xl font-bold text-white mb-4 font-sans">About Lumora</h2>
							<p className="text-zinc-400 font-sans text-sm leading-relaxed">
								Lumora AI v1.1 • Powered by xAI Grok-2
							</p>
							<div className="mt-4 pt-4 border-t border-zinc-800">
								<p className="text-zinc-500 text-xs font-sans mb-2">
									Privacy-first AI health intelligence platform with advanced medical consultation capabilities.
								</p>
								<p className="text-zinc-700 text-xs font-sans mt-1">
									© 2026 Lumora AI. All rights reserved.
								</p>
							</div>
						</motion.div>
					</div>
				</div>

				<DeleteAccountModal
					isOpen={showDeleteModal}
					onClose={() => setShowDeleteModal(false)}
					onConfirm={handleDeleteAccount}
				/>
				<AdvancedSettingsModal
					isOpen={showAdvanced}
					onClose={() => setShowAdvanced(false)}
				/>
			</div>
		</>
	);
}