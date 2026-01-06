"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ArrowLeft, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import StatusHeader from './StatusHeader';
import { storage, SESSION_KEYS, STORAGE_KEYS } from '@/lib/storage';
import { useUser } from '../hooks/useUser';

interface UniversalHeaderProps {
  showBackButton?: boolean;
  title?: string;
}

const UniversalHeader: React.FC<UniversalHeaderProps> = ({ 
  showBackButton = true, 
  title
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const { fullName } = useUser();

  useEffect(() => {
    setMounted(true);
    const savedState = storage.get(STORAGE_KEYS.SIDEBAR_EXPANDED);
    setSidebarExpanded(savedState === 'true');

    const handleSidebarChange = (event: CustomEvent) => {
      setSidebarExpanded(event.detail.expanded);
    };

    window.addEventListener('sidebar-state-change', handleSidebarChange as EventListener);
    return () => window.removeEventListener('sidebar-state-change', handleSidebarChange as EventListener);
  }, []);

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  // Don't show on home page
  // if (pathname === '/') return null;

  // Get page title if not provided
  const getPageTitle = () => {
    if (title) return title;
    
    const titleMap: { [key: string]: string } = {
      '/settings': 'Settings',
      '/docs': 'Documentation', 
      '/privacy': 'Privacy & Data Control',
      '/terms': 'Terms of Service',
      '/dashboard': 'Health Overview',
      '/history': 'Health Timeline',
      '/support': 'Support',
      '/medicines': 'Medicine Intelligence',
      '/emergency': 'Emergency Resources'
    };
    
    return titleMap[pathname] || 'Lumora';
  };

  const getGradientTitle = (title: string) => {
    if (title === 'Medicine Intelligence') {
      return (
        <span>
          Medicine <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Intelligence</span>
        </span>
      );
    }
    return title;
  };

  return (
    <div 
      suppressHydrationWarning={true}
      className="fixed top-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-md border-b border-white/5 z-40 flex items-center justify-between px-4 lg:left-[var(--sidebar-width,64px)]"
    >
      <div className="flex items-center gap-3">
        <motion.button
          onClick={() => window.dispatchEvent(new CustomEvent('toggle-drawer'))}
          className="lg:hidden bg-zinc-900/90 border border-zinc-800 rounded-full p-2 text-zinc-400 hover:text-white transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </motion.button>
        
        <h1 className="text-lg font-medium bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          {pathname === '/' ? (sidebarExpanded ? '' : 'Lumora') : getGradientTitle(getPageTitle())}
        </h1>
      </div>

      {mounted && (
        <div className="lg:hidden flex items-center gap-2 bg-zinc-900/90 backdrop-blur-md border border-zinc-800 rounded-full px-3 py-1.5">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <Shield className="w-4 h-4 text-zinc-400" />
        </div>
      )}
    </div>
  );
};

export default UniversalHeader;