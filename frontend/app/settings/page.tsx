"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import DeleteAccountModal from '../components/DeleteAccountModal';
import AdvancedSettingsModal from '../components/AdvancedSettingsModal';
import NavigationSidebar from '../components/NavigationSidebar';
import { useNotifications } from '../hooks/useNotifications';
import { useUser } from '../hooks/useUser';
import { Download, Trash2, ChevronRight, FileText, Shield, Book, Settings as SettingsIcon, Bell, Phone } from 'lucide-react';
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

	useEffect(() => {
		setMounted(true);
		setTempFirstName(firstName);
		setTempLastName(lastName);
	}, [firstName, lastName]);

	const handleSaveName = useCallback(() => {
		setFirstName(tempFirstName);
		setLastName(tempLastName);
		setHasChanges(false);
		toast.success('Name saved successfully!', { duration: 3000 });
	}, [tempFirstName, tempLastName, setFirstName, setLastName]);

	const handleFirstNameChange = useCallback((value: string) => {
		setTempFirstName(value);
		setHasChanges(value !== firstName || tempLastName !== lastName);
	}, [firstName, lastName, tempLastName]);

	const handleLastNameChange = useCallback((value: string) => {
		setTempLastName(value);
		setHasChanges(tempFirstName !== firstName || value !== lastName);
	}, [firstName, lastName, tempFirstName]);

	const escapeHtml = useCallback((text: string) => {
		return text
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#039;');
	}, []);

	const handleExportData = useCallback(async () => {
		toast.loading('Preparing export...', { id: 'export' });
    
		const userData = {
			user: { name: fullName, firstName, lastName, exportDate: new Date().toISOString() },
			chatHistory: typeof window !== 'undefined' ? JSON.parse(storage.get(STORAGE_KEYS.CHAT_HISTORY) || '[]') : []
		};

		const htmlContent = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Lumora Export - ${fullName}</title><style>body{font-family:system-ui;max-width:900px;margin:40px auto;padding:20px;background:#f5f5f5}.header{background:linear-gradient(135deg,#14b8a6,#0d9488);color:white;padding:40px;border-radius:12px;margin-bottom:30px}.section{background:white;padding:30px;border-radius:12px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.1)}.chat{background:#f9fafb;padding:20px;border-radius:8px;margin-bottom:20px;border-left:4px solid #14b8a6}.message{margin:15px 0;padding:12px;border-radius:8px}.user-msg{background:#e0f2fe;margin-left:40px}.ai-msg{background:#f0fdfa;margin-right:40px}</style></head><body><div class="header"><h1>Lumora</h1><p>${escapeHtml(fullName)}</p><p>Generated: ${new Date().toLocaleDateString()}</p></div><div class="section"><h2>Summary</h2><p>Total: ${userData.chatHistory.length} conversations</p></div><div class="section"><h2>Conversations</h2>${userData.chatHistory.map((chat: any, i: number) => `<div class="chat"><div>${i + 1}. ${escapeHtml(chat.topic || 'Health Consultation')}</div><div>${new Date(chat.timestamp).toLocaleDateString()}</div>${chat.messages.map((msg: any) => `<div class="message ${msg.isUser ? 'user-msg' : 'ai-msg'}"><strong>${msg.isUser ? 'You' : 'AI'}:</strong> ${msg.content.replace(/[<>]/g, '').replace(/\n/g, '<br>')}</div>`).join('')}</div>`).join('')}</div></body></html>`;

		const blob = new Blob([htmlContent], { type: 'text/html' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = `Lumora-${new Date().toISOString().split('T')[0]}.html`;
		link.click();
		URL.revokeObjectURL(url);
    
		toast.success('Data exported!', { id: 'export', duration: 3000 });
	}, [fullName, firstName, lastName, escapeHtml]);

	const handleDeleteAccount = useCallback(() => {
		if (typeof window !== 'undefined') {
			storage.clear();
			sessionStorage.clear();
		}
		toast.success('All data cleared successfully. Redirecting...', { duration: 3000 });
		setShowDeleteModal(false);
		setTimeout(() => window.location.href = '/', 2000);
	}, []);

	const handleFactoryReset = useCallback(() => {
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
	}, [setFirstName, setLastName]);

	const legalItems = useMemo(() => [
		{ title: 'Privacy Policy', href: '/privacy', icon: Shield },
		{ title: 'Terms of Service', href: '/terms', icon: FileText },
		{ title: 'Documentation', href: '/docs', icon: Book },
		{ title: 'Emergency Contacts', href: '/emergency', icon: Phone },
		{ title: 'Advanced Settings', action: () => setShowAdvanced(true), icon: SettingsIcon }
	], []);

	return (
		<>
			<NavigationSidebar user={{ name: fullName }} />
			<div className="h-full overflow-y-auto bg-[var(--bg-page)] lg:ml-16 transition-all duration-400">
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
      
			<div className="max-w-6xl mx-auto px-6 py-6 pt-8 pb-40">
					<h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-emerald-500 bg-clip-text text-transparent mb-8 font-sans">
						Settings
					</h1>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						<div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-8 hover:bg-zinc-800/80 transition-all">
							<h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6 font-sans">Your Data</h2>
							
							<div className="grid md:grid-cols-2 gap-6">
								<div className="space-y-4">
									<div>
										<label className="block text-[var(--text-primary)] text-sm font-medium mb-3 font-sans">
											First Name
										</label>
										<input
											type="text"
											value={mounted ? tempFirstName : ''}
											onChange={(e) => handleFirstNameChange(e.target.value)}
											className="w-full h-12 bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-white focus:border-white transition-colors font-sans"
											placeholder="Enter your first name"
										/>
									</div>
									<div>
										<label className="block text-[var(--text-primary)] text-sm font-medium mb-3 font-sans">
											Last Name (Optional)
										</label>
										<input
											type="text"
											value={mounted ? tempLastName : ''}
											onChange={(e) => handleLastNameChange(e.target.value)}
											className="w-full h-12 bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-white focus:border-white transition-colors font-sans"
											placeholder="Enter your last name"
										/>
									</div>
									
									{/* Reserve space for save button to prevent layout shift */}
									<div className="h-12">
										{hasChanges && (
											<button
												onClick={handleSaveName}
												className="bg-white hover:bg-zinc-100 text-black px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 font-sans h-12"
											>
												<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
												</svg>
												Save
											</button>
										)}
									</div>
								</div>
								
								<div className="flex flex-col gap-3 min-h-[180px]">
									<button
										onClick={handleExportData}
										className="bg-white hover:bg-zinc-100 text-black px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 font-sans h-12"
									>
										<Download className="w-5 h-5" />
										Export
									</button>
									
									<button
										onClick={handleFactoryReset}
										className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 font-sans h-12"
									>
										<SettingsIcon className="w-5 h-5" />
										Reset
									</button>
									
									<button
										onClick={() => setShowDeleteModal(true)}
										className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 font-sans h-12"
									>
										<Trash2 className="w-5 h-5" />
										Delete
									</button>
								</div>
							</div>
						</div>

						<div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 hover:bg-zinc-800/80 transition-all">
							<div className="flex items-center gap-3 mb-6">
								<Bell className="w-6 h-6 text-white" />
								<h2 className="text-2xl font-bold text-white font-sans">Notifications</h2>
							</div>

							<div>
								<div className="flex items-center gap-2 mb-3">
									<Bell className="w-5 h-5 text-white" />
									<label className="text-white font-medium font-sans">Daily Check-ins</label>
								</div>
								{/* Reserve space for toggle to prevent layout shift */}
								<div className="h-6">
									{mounted && (
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
									)}
								</div>
							</div>
						</div>

						<div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:bg-zinc-800/80 transition-all">
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
						</div>

						<div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:bg-zinc-800/80 transition-all relative">
							<h2 className="text-xl font-bold text-white mb-4 font-sans">About Lumora</h2>
							<p className="text-zinc-400 font-sans text-sm leading-relaxed">
								Lumora AI v1.1 • Powered by xAI Grok-4
							</p>
							<div className="mt-4 pt-4 border-t border-zinc-800">
								<p className="text-zinc-500 text-xs font-sans mb-2">
									Privacy-first AI health intelligence platform with advanced medical consultation capabilities.
								</p>
								<p className="text-zinc-700 text-xs font-sans mt-1">
									© 2026 Lumora AI. All rights reserved.
								</p>
							</div>
						</div>

						<div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:bg-zinc-800/80 transition-all flex items-center justify-center">
							<span 
								className="text-6xl font-bold text-white tracking-wide"
								style={{ fontFamily: 'Brush Script MT, cursive' }}
							>
								Lumora
							</span>
						</div>
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