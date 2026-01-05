/**
 * NavigationSidebar - Premium collapsible navigation sidebar
 * 
 * Purpose: Central command center for Lumora application navigation
 * Features: Collapsible design, smooth animations, active state tracking
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
	MessageSquarePlus,
	History,
	LayoutDashboard,
	LifeBuoy,
	Settings,
	LogOut,
	ChevronLeft,
	ChevronRight,
	Pill,
	Plus
} from 'lucide-react';
import { storage, STORAGE_KEYS, SESSION_KEYS } from '@/lib/storage';
import { UserAvatar } from './UserAvatar';
import { useUser } from '../hooks/useUser';

interface NavigationSidebarProps {
	user?: {
		name?: string;
		avatar?: string;
	};
}

const NavigationSidebar = React.memo<NavigationSidebarProps>(({ user }) => {
	const [isExpanded, setIsExpanded] = useState(false);
	const [mounted, setMounted] = useState(false);
	const { fullName } = useUser();
	const pathname = usePathname();
	const router = useRouter();

	useEffect(() => {
		setMounted(true);
		const savedState = storage.get(STORAGE_KEYS.SIDEBAR_EXPANDED);
		const expanded = savedState === 'true';
		setIsExpanded(expanded);
		document.documentElement.style.setProperty('--sidebar-width', expanded ? '16rem' : '4rem');
	}, []);

	useEffect(() => {
		if (!mounted) return;
		storage.set(STORAGE_KEYS.SIDEBAR_EXPANDED, String(isExpanded));
		document.documentElement.style.setProperty('--sidebar-width', isExpanded ? '16rem' : '4rem');
		window.dispatchEvent(new CustomEvent('sidebar-state-change', { detail: { expanded: isExpanded } }));
	}, [isExpanded, mounted]);

	const handleNewChat = () => {
		storage.sessionRemove(SESSION_KEYS.ACTIVE_CHAT_ID);
		localStorage.removeItem('lumora_active_chat_id');
		window.dispatchEvent(new Event('lumora_new_chat'));
		if (window.location.pathname !== '/') {
			router.push('/');
		}
	};

	const navigationLinks = [
		{
			href: '/',
			label: 'Home',
			icon: MessageSquarePlus,
		},
		{
			href: '/medicines',
			label: 'Medicines',
			icon: Pill,
		},
		{
			href: '/history',
			label: 'History',
			icon: History,
		},
		{
			href: '/dashboard',
			label: 'Dashboard',
			icon: LayoutDashboard,
		},
		{
			href: '/support',
			label: 'Support',
			icon: LifeBuoy,
		},
	];

	const isActive = (href: string) => pathname === href;

	return (
		<motion.div
			initial={false}
			animate={{ width: mounted ? (isExpanded ? '16rem' : '4rem') : '4rem' }}
			transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
			className="fixed left-0 top-0 h-screen bg-[var(--bg-sidebar)] border-r border-[var(--border-color)] z-50 flex-col hidden lg:flex"
			suppressHydrationWarning
		>
			{/* Brand Logo */}
			<div className="p-4 border-b border-[var(--border-color)] flex items-center justify-center">
				<div className="group cursor-pointer flex items-center gap-3">
					<AnimatePresence mode="wait">
						{isExpanded ? (
							<motion.span
								key="expanded"
								initial={{ opacity: 0, scale: 0.8 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.8 }}
								transition={{ duration: 0.3 }}
								className="text-3xl font-bold text-white tracking-wide"
								style={{ fontFamily: 'Brush Script MT, cursive' }}
							>
								Lumora
							</motion.span>
						) : (
							<motion.span
								key="collapsed"
								initial={{ opacity: 0, scale: 0.8 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.8 }}
								transition={{ duration: 0.3 }}
								className="text-2xl font-bold text-white"
								style={{ fontFamily: 'Brush Script MT, cursive' }}
							>
								L
							</motion.span>
						)}
					</AnimatePresence>
				</div>
			</div>

			{/* Navigation Links */}
			<nav className="flex-1 p-2">
				<ul className="space-y-1 mb-4">
					<li>
						<button
							onClick={handleNewChat}
							className="w-full relative flex items-center px-3 py-3 rounded-lg transition-all duration-200 cursor-pointer group text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 border-l-4 border-transparent"
						>
							<div className="flex items-center justify-center w-6 h-6 mr-3">
								<Plus size={20} />
							</div>
							{isExpanded && (
								<span className="font-medium text-sm">New Chat</span>
							)}
						</button>
					</li>
					{navigationLinks.map((link) => {
						const Icon = link.icon;
						const active = isActive(link.href);
            
						return (
							<li key={link.href}>
								<Link href={link.href}>
									<div
										className={`relative flex items-center px-3 py-3 rounded-lg transition-all duration-200 cursor-pointer group ${
											active 
												? 'bg-gradient-to-r from-white/20 to-transparent border-l-4 border-white text-white' 
												: 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 border-l-4 border-transparent'
										}`}
									>
										<div className="flex items-center justify-center w-6 h-6 mr-3">
											<Icon size={20} className={`${active ? 'text-white drop-shadow-sm' : ''}`} />
										</div>
                    
										{isExpanded && (
											<span className={`font-medium text-sm ${active ? 'text-white drop-shadow-sm' : ''}`}>
												{link.label}
											</span>
										)}
									</div>
								</Link>
							</li>
						);
					})}
				</ul>
			</nav>

			{/* Bottom Section */}
			<div className="p-2 border-t border-white/10">
				{/* User Profile Card */}
				<div className="mb-4 p-3 bg-[var(--bg-card)] rounded-lg">
					{isExpanded ? (
						<div className="flex items-center space-x-3">
							{mounted && <UserAvatar size="sm" />}
							<div className="flex-1 min-w-0 flex flex-col justify-center">
								<p className="text-[var(--text-primary)] text-sm font-medium truncate">
									{mounted ? fullName : 'User'}
								</p>
								<p className="text-[var(--text-secondary)] text-xs">
									Free Plan
								</p>
							</div>
							<Link href="/settings">
								<button className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
									<Settings size={18} />
								</button>
							</Link>
						</div>
					) : (
						<div className="flex flex-col items-center gap-2">
							{mounted && <UserAvatar size="sm" />}
							<Link href="/settings">
								<button className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 rounded-lg transition-all">
									<Settings size={20} />
								</button>
							</Link>
						</div>
					)}
				</div>

				{/* Logout Button */}
				<button
					className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-500 hover:bg-opacity-10 transition-colors duration-200"
					onClick={() => {
						if (confirm('Are you sure you want to logout?')) {
							storage.clear();
							window.location.href = '/';
						}
					}}
				>
					<LogOut size={20} className="flex-shrink-0" />
					{isExpanded && (
						<span className="font-medium text-sm">
							Logout
						</span>
					)}
				</button>

				{/* Expand/Collapse Toggle */}
				<button
					onClick={() => setIsExpanded(!isExpanded)}
					className="w-full flex items-center justify-center mt-4 p-2 rounded-lg text-[var(--text-secondary)] hover:text-black hover:bg-white/10 hover:bg-opacity-10 transition-colors duration-200"
					suppressHydrationWarning
				>
					{isExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
				</button>
			</div>
		</motion.div>
	);
});

NavigationSidebar.displayName = 'NavigationSidebar';

export default NavigationSidebar;