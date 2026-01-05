import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { UserAvatar } from './UserAvatar';

interface StatusHeaderProps {
  user: {
    name: string;
    avatar?: string;
  };
}

const StatusHeader: React.FC<StatusHeaderProps> = ({ user }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative">
      <motion.button
        onClick={() => setShowTooltip(!showTooltip)}
        className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-full px-3 py-1.5 flex items-center gap-2 relative"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="w-2 h-2 bg-green-500 rounded-full" />
        <ShieldCheck className="w-4 h-4 text-zinc-400" />
      </motion.button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Encryption Status */}
            <div className="p-4 border-b border-zinc-800 bg-gradient-to-br from-green-500/10 to-transparent">
              <div className="flex items-center gap-3 mb-2">
                <div className="relative">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping opacity-75" />
                </div>
                <ShieldCheck className="w-5 h-5 text-green-500" />
                <span className="text-sm font-semibold text-green-400">AES-256 Encrypted</span>
              </div>
              <p className="text-xs text-zinc-400 ml-6">Your data is secure</p>
            </div>

            {/* User Info */}
            <div className="p-4">
              <p className="text-xs text-zinc-500 mb-1">Logged in as</p>
              <p className="text-sm font-medium text-zinc-200">{user.name}</p>
            </div>

            <div className="absolute -top-1 right-4 w-2 h-2 bg-zinc-900 border-l border-t border-zinc-800 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StatusHeader;