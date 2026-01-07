"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import DeleteAccountModal from '../components/DeleteAccountModal';
import AdvancedAccess from '../components/AdvancedAccess';
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
	const [showAdvancedAccess, setShowAdvancedAccess] = useState(false);
	const [hasAdvancedAccess, setHasAdvancedAccess] = useState(false);
	const [mounted, setMounted] = useState(false);
	const [tempFirstName, setTempFirstName] = useState('');
	const [tempLastName, setTempLastName] = useState('');
	const [hasChanges, setHasChanges] = useState(false);
	const [largeText, setLargeText] = useState(false);

	useEffect(() => {
		setMounted(true);
		setTempFirstName(firstName);
		setTempLastName(lastName);
		const isLargeText = localStorage.getItem('lumora-large-text') === 'true';
		setLargeText(isLargeText);
		// Apply large text on load
		if (isLargeText) {
			document.documentElement.classList.add('large-text');
		}
		
		// Check advanced access
		const advancedAccess = localStorage.getItem('lumora-advanced-access');
		setHasAdvancedAccess(advancedAccess === 'approved');
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

	const toggleLargeText = useCallback(() => {
		const newValue = !largeText;
		setLargeText(newValue);
		localStorage.setItem('lumora-large-text', newValue.toString());
		// Apply to document root for global effect
		if (newValue) {
			document.documentElement.classList.add('large-text');
		} else {
			document.documentElement.classList.remove('large-text');
		}
		toast.success(newValue ? 'Large text enabled' : 'Default text size');
	}, [largeText]);
	const legalItems = useMemo(() => [
		{ title: 'Privacy Policy', href: '/privacy', icon: Shield },
		{ title: 'Terms of Service', href: '/terms', icon: FileText },
		{ title: 'Documentation', href: '/docs', icon: Book },
		{ title: 'Emergency Contacts', href: '/emergency', icon: Phone },
		{ 
			title: 'Advanced Settings', 
			action: () => hasAdvancedAccess ? setShowAdvanced(true) : setShowAdvancedAccess(true), 
			icon: SettingsIcon 
		}
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
      
			<div className="max-w-6xl mx-auto px-6 py-6 pb-32 lg:pb-40 mt-16">
					<h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-emerald-500 bg-clip-text text-transparent mb-6 font-sans">
						Settings
					</h1>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						<div className="lg:col-span-2 space-y-6">
							{/* User Data Section */}
							<div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 hover:bg-zinc-800/80 transition-all">
								<h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6 font-sans">Your Data</h2>
								
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
									
									{hasChanges && (
										<button
											onClick={handleSaveName}
											className="bg-white hover:bg-zinc-100 text-black px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 font-sans"
										>
											<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
											</svg>
											Save
										</button>
									)}
								</div>
							</div>

							{/* Data Actions Section */}
							<div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 hover:bg-zinc-800/80 transition-all">
								<h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6 font-sans">Data Management</h2>
								
								<div className="flex flex-col gap-3">
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

							<div className="space-y-4">
								<div className="flex items-center justify-between py-3">
									<div>
										<p className="text-white font-medium font-sans">Daily Check-ins</p>
										<p className="text-zinc-400 text-sm">Get health reminders</p>
									</div>
									{mounted && notificationsMounted && (
										<button
											onClick={toggleNotifications}
											className={`relative inline-flex h-7 w-12 flex-shrink-0 items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-zinc-900 ${
												notificationsEnabled ? 'bg-teal-500' : 'bg-zinc-600'
											}`}
										>
											<span
												className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
													notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
												}`}
											/>
										</button>
									)}
								</div>

								<div className="flex items-center justify-between py-3">
									<div>
										<p className="text-white font-medium font-sans">Large Text</p>
										<p className="text-zinc-400 text-sm">Better accessibility</p>
									</div>
									{mounted && (
										<button
											onClick={toggleLargeText}
											className={`relative inline-flex h-7 w-12 flex-shrink-0 items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-zinc-900 ${
												largeText ? 'bg-teal-500' : 'bg-zinc-600'
											}`}
										>
											<span
												className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
													largeText ? 'translate-x-5' : 'translate-x-0'
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
				<AdvancedAccess
					isOpen={showAdvancedAccess}
					onClose={() => setShowAdvancedAccess(false)}
					onAccessGranted={() => {
						setHasAdvancedAccess(true);
						setShowAdvancedAccess(false);
						setShowAdvanced(true);
					}}
				/>
				<AdvancedSettingsModal
					isOpen={showAdvanced}
					onClose={() => setShowAdvanced(false)}
				/>
			</div>
		</>
	);
}