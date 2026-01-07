"use client";

import { motion } from 'framer-motion';
import { Shield, Database, Trash2, Lock } from 'lucide-react';

interface PrivacyNoticeModalProps {
  onComplete: () => void;
}

export default function PrivacyNoticeModal({ onComplete }: PrivacyNoticeModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: -10 }}
        transition={{ 
          duration: 0.4,
          ease: [0.25, 0.46, 0.45, 0.94]
        }}
        className="max-w-lg mx-4 bg-zinc-900 border border-white/30 rounded-2xl p-8 shadow-2xl"
        role="dialog"
        aria-labelledby="privacy-title"
        aria-describedby="privacy-description"
      >
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-8 h-8 text-white" />
          <h2 id="privacy-title" className="text-2xl font-serif bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 bg-clip-text text-transparent">Your Privacy Matters</h2>
        </div>

        <div id="privacy-description" className="space-y-4 mb-8 text-gray-300">
          <div className="flex gap-3">
            <Lock className="w-5 h-5 text-white flex-shrink-0 mt-1" />
            <div>
              <p className="font-medium bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 bg-clip-text text-transparent">Zero-Knowledge Architecture</p>
              <p className="text-sm text-gray-400">All data is stored locally in your browser only</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Database className="w-5 h-5 text-white flex-shrink-0 mt-1" />
            <div>
              <p className="font-medium bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 bg-clip-text text-transparent">No Database, No Collection</p>
              <p className="text-sm text-gray-400">We don't collect, store, or transmit your personal data</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Trash2 className="w-5 h-5 text-amber-400 flex-shrink-0 mt-1" />
            <div>
              <p className="font-medium bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 bg-clip-text text-transparent">Important Notice</p>
              <p className="text-sm text-gray-400">Clearing browser cache or history will permanently delete all your data</p>
            </div>
          </div>
        </div>

        <motion.button
          onClick={onComplete}
          className="w-full bg-white hover:bg-zinc-100 text-black py-3 rounded-lg font-medium transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          I Understand
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
