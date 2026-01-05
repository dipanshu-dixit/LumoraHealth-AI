'use client';

import { useState, useEffect } from 'react';
import { Phone, X } from 'lucide-react';

interface EmergencyCallButtonProps {
  number: string;
  label: string;
}

export default function EmergencyCallButton({ number, label }: EmergencyCallButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!isPressed) return;

    if (countdown === 0) {
      window.location.href = `tel:${number}`;
      setIsPressed(false);
      setCountdown(3);
      return;
    }

    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [isPressed, countdown, number]);

  const handlePress = () => {
    setIsPressed(true);
  };

  const handleCancel = () => {
    setIsPressed(false);
    setCountdown(3);
  };

  if (isPressed) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-zinc-900 border-2 border-red-500 rounded-2xl p-8 max-w-md w-full text-center">
          <div className="text-8xl font-bold text-red-500 mb-4">{countdown}</div>
          <p className="text-black text-xl mb-2">Calling {label}</p>
          <p className="text-zinc-400 mb-6">{number}</p>
          <button
            onClick={handleCancel}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <X className="w-5 h-5" />
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handlePress}
      className="w-full bg-red-600 hover:bg-red-700 text-black py-6 rounded-xl font-bold text-xl flex items-center justify-center gap-3 transition-all transform hover:scale-105 shadow-lg shadow-red-500/30"
    >
      <Phone className="w-7 h-7" />
      Call {label}
    </button>
  );
}
