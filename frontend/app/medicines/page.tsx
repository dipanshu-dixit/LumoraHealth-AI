"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Sparkles, Clock, AlertCircle, Info, Shield } from 'lucide-react';
import NavigationSidebar from '../components/NavigationSidebar';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { MedicineHistory, type MedicineHistoryItem } from '../lib/medicineHistory';

function MedicinesContent() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [medicineInfo, setMedicineInfo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<MedicineHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const commonMeds = [
    { name: 'Paracetamol', category: 'Pain Relief' },
    { name: 'Ibuprofen', category: 'Anti-inflammatory' },
    { name: 'Cetirizine', category: 'Allergy' },
    { name: 'Metformin', category: 'Diabetes' },
    { name: 'Amoxicillin', category: 'Antibiotic' },
    { name: 'Omeprazole', category: 'Digestive' }
  ];

  useEffect(() => {
    const loadedHistory = MedicineHistory.loadHistory();
    setHistory(loadedHistory);
    
    // Auto-search from URL param
    const searchParam = searchParams.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
      searchMedicine(searchParam);
    }
  }, [searchParams]);

  const addToHistory = (medicine: string, response?: string) => {
    MedicineHistory.addToHistory(medicine, response);
    setHistory(MedicineHistory.getHistory());
  };

  const clearHistory = () => {
    MedicineHistory.clearHistory();
    setHistory([]);
  };

  const sanitizeInput = (input: string): string => {
    return input
      .trim()
      .replace(/[<>"']/g, '')
      .substring(0, 100);
  };

  const searchMedicine = async (medicineName: string) => {
    const sanitized = sanitizeInput(medicineName);
    if (!sanitized || sanitized.length < 2) return;

    const cached = MedicineHistory.findCached(sanitized);
    if (cached) {
      setMedicineInfo(cached.response!);
      setSearchQuery(sanitized);
      return;
    }

    setIsLoading(true);
    setMedicineInfo(null);
    
    try {
      const response = await fetch('/api/lumora-medicine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicine: sanitized })
      });

      if (response.ok) {
        const data = await response.json();
        const result = data.result || 'No information available.';
        setMedicineInfo(result);
        addToHistory(sanitized, result);
      }
    } catch (error) {
      console.error('Medicine search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchMedicine(searchQuery.trim());
    }
  };

  const handleChipClick = (medicine: string) => {
    setSearchQuery(medicine);
  };

  return (
    <>
      <NavigationSidebar user={{ name: 'User' }} />
      
      <div className="h-screen overflow-y-auto bg-[var(--bg-page)] lg:ml-16 transition-all duration-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 pb-32 mt-16">
          
          {/* Hero Section */}
          <div className="text-center mb-12 lg:mb-16">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl sm:text-4xl lg:text-5xl font-light text-white mb-4 tracking-tight"
            >
              Medicine <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent font-medium">Intelligence</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-zinc-400 text-sm sm:text-lg max-w-2xl mx-auto"
            >
              Comprehensive medication information, interactions, and safety data at your fingertips
            </motion.p>
          </div>

          {/* Search Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <form onSubmit={handleSearch} className="relative max-w-3xl mx-auto">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100" />
                <div className="relative bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-2xl overflow-hidden transition-all group-hover:border-white/30">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search any medication..."
                    className="w-full pl-4 sm:pl-6 pr-16 sm:pr-20 py-3 sm:py-5 bg-transparent text-white placeholder-zinc-500 focus:outline-none text-sm sm:text-lg"
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 bg-zinc-700 hover:bg-zinc-600 disabled:bg-zinc-800 text-white p-2.5 sm:p-3 rounded-lg transition-all disabled:text-zinc-500"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-zinc-500 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </button>
                </div>
              </div>
            </form>

            {/* Quick Access Pills */}
            <div className="max-w-3xl mx-auto mt-8">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-zinc-400 font-medium">Popular Medications</p>
                {history.length > 0 && (
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
                  >
                    <Clock className="w-4 h-4" />
                    {showHistory ? 'Hide' : 'Show'} History
                  </button>
                )}
              </div>
              
              <AnimatePresence>
                {showHistory && history.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-white flex items-center gap-2">
                        <Clock className="w-4 h-4 text-zinc-400" />
                        Recent Searches
                      </h3>
                      <button onClick={clearHistory} className="text-xs text-red-400 hover:text-red-300 transition-colors">
                        Clear
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {history.slice(0, 6).map((item, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setSearchQuery(item.medicine);
                            setMedicineInfo(item.response || null);
                          }}
                          className="text-left px-4 py-2.5 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-white/30 rounded-lg text-sm text-white transition-all group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="group-hover:text-white transition-colors">
                              <ReactMarkdown components={{ p: 'span' }}>{item.medicine}</ReactMarkdown>
                            </span>
                            <span className="text-xs text-zinc-500">{new Date(item.timestamp).toLocaleDateString()}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {commonMeds.map((med, i) => (
                  <motion.button
                    key={med.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                    onClick={() => handleChipClick(med.name)}
                    className="group relative bg-zinc-900/50 hover:bg-zinc-800/80 border border-zinc-800 hover:border-white/30 rounded-xl p-4 transition-all hover:scale-105"
                  >
                    <div className="text-left">
                      <div className="text-sm font-medium text-white mb-1 group-hover:text-white transition-colors">{med.name}</div>
                      <div className="text-xs text-zinc-400">{med.category}</div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Loading State */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="max-w-3xl mx-auto bg-gradient-to-br from-zinc-900/80 to-zinc-800/80 backdrop-blur-xl border border-white/30 rounded-2xl p-12 shadow-2xl shadow-white/10"
              >
                <div className="flex flex-col items-center gap-6">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-white/10 border-t-white rounded-full animate-spin" />
                    <Sparkles className="w-6 h-6 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-white text-lg font-medium">Analyzing Medication Data</p>
                    <p className="text-zinc-400 text-sm">Gathering comprehensive information, interactions, and safety data...</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Medicine Info Card */}
          <AnimatePresence>
            {medicineInfo && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="w-full max-w-4xl mx-auto px-2 sm:px-0"
              >
                {/* Header Card */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-xl sm:text-3xl font-light text-white mb-2 break-words">
                        <ReactMarkdown components={{ p: 'span' }}>{searchQuery}</ReactMarkdown>
                      </div>
                      <p className="text-zinc-400 text-xs sm:text-sm">Comprehensive medication information</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <div className="p-2 sm:p-3 bg-white/5 rounded-xl">
                        <Shield className="w-4 h-4 sm:w-6 sm:h-6 text-zinc-400" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info Card */}
                <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-4 sm:p-8 shadow-2xl">
                  <div className="prose prose-invert max-w-none text-sm sm:text-base
                    prose-headings:text-white prose-headings:font-light prose-headings:tracking-tight
                    prose-h1:text-lg sm:prose-h1:text-2xl prose-h2:text-base sm:prose-h2:text-xl prose-h3:text-sm sm:prose-h3:text-lg
                    prose-p:text-zinc-300 prose-p:leading-relaxed
                    prose-strong:text-white prose-strong:font-medium
                    prose-li:text-zinc-300 prose-li:marker:text-zinc-400
                    prose-a:text-white prose-a:no-underline hover:prose-a:underline
                    prose-code:text-zinc-300 prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                  ">
                    <ReactMarkdown>{medicineInfo}</ReactMarkdown>
                  </div>

                  {/* Footer Warning */}
                  <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-zinc-800">
                    <div className="flex items-start gap-3 p-3 sm:p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                      <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs sm:text-sm text-amber-200 font-medium mb-1">Medical Disclaimer</p>
                        <p className="text-xs text-amber-300/80 leading-relaxed">
                          This information is for educational purposes only. Always consult a qualified healthcare professional before starting, stopping, or changing any medication.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty State */}
          {!medicineInfo && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-3xl mx-auto text-center py-16"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/5 rounded-2xl mb-6">
                <Info className="w-10 h-10 text-zinc-400" />
              </div>
              <h3 className="text-xl text-white font-light mb-2">Search for any medication</h3>
              <p className="text-zinc-400 text-sm">Get instant access to comprehensive drug information, side effects, and interactions</p>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}

export default function MedicinesPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-[var(--bg-page)]">
        <div className="w-16 h-16 border-4 border-white/10 border-t-white rounded-full animate-spin" />
      </div>
    }>
      <MedicinesContent />
    </Suspense>
  );
}
