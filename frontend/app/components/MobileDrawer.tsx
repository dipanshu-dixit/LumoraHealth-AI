"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { X, MessageSquarePlus, History, LayoutDashboard, Settings, MessageCircle, Pill, LogOut, Plus } from 'lucide-react';
import { storage, STORAGE_KEYS } from '../../src/lib/storage';
import { UserAvatar } from './UserAvatar';

const MobileDrawer = React.memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Memoize navigation links to prevent recreation
  const navigationLinks = useMemo(() => [
    { href: '/', label: 'Home', icon: MessageSquarePlus },
    { href: '/medicines', label: 'Medicines', icon: Pill },
    { href: '/history', label: 'History', icon: History },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/support', label: 'Support', icon: MessageCircle },
    { href: '/settings', label: 'Settings', icon: Settings },
  ], []);

  // Memoize user data to prevent unnecessary re-renders
  const userData = useMemo(() => ({
    name: storage.get(STORAGE_KEYS.USER_NAME) || 'User'
  }), [mounted]);

  const handleToggle = useCallback(() => setIsOpen(prev => !prev), []);
  
  const handleNewChat = useCallback(() => {
    localStorage.removeItem('lumora_active_chat_id');
    window.dispatchEvent(new Event('lumora_new_chat'));
    setIsOpen(false);
    if (pathname !== '/') {
      router.push('/');
    }
  }, [pathname, router]);

  const handleLinkClick = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleLogout = useCallback(() => {
    if (confirm('Logout?')) {
      storage.clear();
      window.location.href = '/';
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    window.addEventListener('toggle-drawer', handleToggle);
    return () => window.removeEventListener('toggle-drawer', handleToggle);
  }, [handleToggle]);

  const isActive = useCallback((href: string) => pathname === href, [pathname]);

  if (!mounted) return null;

  return (
    <>
      {/* Simplified overlay without framer motion */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/70 z-[60] lg:hidden"
            onClick={() => setIsOpen(false)}
          />

          <div
            className={`fixed left-0 top-0 h-full w-[280px] bg-[var(--bg-sidebar)] border-r border-[var(--border-color)] z-[70] lg:hidden flex flex-col transition-transform duration-300 ${
              isOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
              <span className="text-5xl font-bold text-white tracking-wide drop-shadow-lg" style={{ fontFamily: '"Brush Script MT", "Apple Chancery", "Lucida Handwriting", cursive' }}>Lumora</span>
              <button onClick={() => setIsOpen(false)} className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                <X size={20} />
              </button>
            </div>

            <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
              <button
                onClick={handleNewChat}
                className="w-full flex items-center gap-3 p-3 rounded-lg text-[var(--text-secondary)] hover:bg-zinc-800/50 transition-colors"
              >
                <Plus size={20} strokeWidth={2.5} strokeLinecap="round" />
                <span className="font-medium">New Chat</span>
              </button>
              {navigationLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <Link key={link.href} href={link.href} onClick={handleLinkClick}>
                    <div className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      active ? 'bg-white/20 border-l-4 border-white text-white' : 'text-[var(--text-secondary)] hover:bg-zinc-800/50'
                    }`}>
                      <Icon size={20} />
                      <span className="font-medium">{link.label}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto border-t border-[var(--border-color)] p-4">
              <div className="flex items-center gap-3 mb-4">
                <UserAvatar name={userData.name} size="md" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--text-primary)]">{userData.name}</p>
                  <p className="text-xs text-[var(--text-secondary)]">Free Plan</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut size={18} />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
});

MobileDrawer.displayName = 'MobileDrawer';

export default MobileDrawer;