"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function ThinkingLoader() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 mb-6"
    >
      <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-full">
        <motion.div
          className="w-4 h-4 border-2 border-zinc-700 border-t-white rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <span className="text-zinc-400 text-sm">LUMORA</span>
        <motion.span 
          className="text-zinc-500 text-xs font-mono tabular-nums"
          key={seconds}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {seconds}s
        </motion.span>
      </div>
    </motion.div>
  );
}
