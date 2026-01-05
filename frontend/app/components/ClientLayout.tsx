'use client';

import { useState, useEffect } from 'react';
import UniversalHeader from './UniversalHeader';
import MobileDrawer from './MobileDrawer';
import { storage, STORAGE_KEYS } from '../lib/storage';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  useEffect(() => {
    const savedState = storage.get(STORAGE_KEYS.SIDEBAR_EXPANDED);
    setSidebarExpanded(savedState === 'true');

    const handleSidebarChange = (event: CustomEvent) => {
      setSidebarExpanded(event.detail.expanded);
    };

    window.addEventListener('sidebar-state-change', handleSidebarChange as EventListener);
    return () => window.removeEventListener('sidebar-state-change', handleSidebarChange as EventListener);
  }, []);

  return (
    <>
      <UniversalHeader sidebarExpanded={sidebarExpanded} />
      <main className="transition-all duration-400 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] pl-0 lg:pl-[var(--sidebar-width,64px)] h-screen overflow-hidden pt-16 md:pt-16">
        {children}
      </main>
      <MobileDrawer />
    </>
  );
}