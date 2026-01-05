import React from 'react';
import { motion } from 'framer-motion';

interface MedicineCardProps {
  name: string;
  onSearch: (name: string) => void;
}

export default function InlineMedicineCard({ name, onSearch }: MedicineCardProps) {
  return (
    <motion.button
      onClick={() => onSearch(name)}
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.99 }}
      className="group relative inline-flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors duration-200"
    >
      <span className="text-sm font-medium tracking-tight">{name}</span>
      <svg 
        className="w-3 h-3 opacity-40 group-hover:opacity-100 transition-opacity" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
      <span className="absolute -bottom-0.5 left-0 w-full h-px bg-gradient-to-r from-zinc-700/0 via-zinc-500 to-zinc-700/0 opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.button>
  );
}
