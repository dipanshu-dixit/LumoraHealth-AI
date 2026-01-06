"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { X, MessageSquarePlus, History, LayoutDashboard, Settings, MessageCircle, Menu, Pill, LogOut, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import StatusHeader from './StatusHeader';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { UserAvatar } from './UserAvatar';

const MobileDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const handleToggle = () => setIsOpen(prev => !prev);
    window.addEventListener('toggle-drawer', handleToggle);
    return () => window.removeEventListener('toggle-drawer', handleToggle);
  }, []);

  const handleNewChat = () => {
    localStorage.removeItem('lumora_active_chat_id');
    window.dispatchEvent(new Event('lumora_new_chat'));
    setIsOpen(false);
    if (pathname !== '/') {
      router.push('/');
    }
  };

  const navigationLinks = [
    { href: '/', label: 'Home', icon: MessageSquarePlus },
    { href: '/medicines', label: 'Medicines', icon: Pill },
    { href: '/history', label: 'History', icon: History },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/support', label: 'Support', icon: MessageCircle },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Drawer Overlay & Content */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/70 z-[60] lg:hidden"
            />

            <motion.div
              data-mobile-drawer
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed left-0 top-0 h-full w-[280px] bg-[var(--bg-sidebar)] border-r border-[var(--border-color)] z-[70] lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
                <span className="text-2xl font-bold text-white" style={{ fontFamily: '"Brush Script MT", "Apple Chancery", "Lucida Handwriting", cursive' }}>Lumora</span>
                
                  <button onClick={() => setIsOpen(false)} className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                    <X size={20} />
                  </button>
              </div>

              <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
                <button
                  onClick={handleNewChat}
                  className="w-full flex items-center gap-3 p-3 rounded-lg text-[var(--text-secondary)] hover:bg-zinc-800/50 transition-all"
                >
                  <Plus size={20} strokeWidth={2.5} strokeLinecap="round" />
                  <span className="font-medium">New Chat</span>
                </button>
                {navigationLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.href);
                  return (
                    <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)}>
                      <div className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
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
                {mounted && (
                  <div className="flex items-center gap-3 mb-4">
                    <UserAvatar name={storage.get(STORAGE_KEYS.USER_NAME) || 'User'} size="md" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[var(--text-primary)]">{storage.get(STORAGE_KEYS.USER_NAME) || 'User'}</p>
                      <p className="text-xs text-[var(--text-secondary)]">Free Plan</p>
                    </div>
                  </div>
                )}
                <button
                  onClick={() => {
                    if (confirm('Logout?')) {
                      storage.clear();
                      window.location.href = '/';
                    }
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-500/10"
                >
                  <LogOut size={18} />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileDrawer;