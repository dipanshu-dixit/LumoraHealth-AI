'use client';

import { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NavigationSidebar from '../components/NavigationSidebar';
import { FAQ_DATA } from '../lib/faq-data';

export default function Support() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [openItem, setOpenItem] = useState<string | null>(null);

  const categories = ['All', 'Getting Started', 'Medical Accuracy', 'Privacy & Data', 'Account', 'Technical Issues'];

  const filteredFAQs = useMemo(() => {
    return FAQ_DATA.filter(item => {
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
      const matchesSearch = searchQuery === '' || 
        item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.a.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, activeCategory]);

  const toggleAccordion = (id: string) => {
    setOpenItem(openItem === id ? null : id);
  };

  return (
    <>
      <NavigationSidebar user={{ name: 'User' }} />
      
      <div className="h-full overflow-y-auto bg-[var(--bg-page)] lg:ml-16 transition-all duration-400">
        <div className="w-full max-w-4xl mx-auto px-4 py-6 pb-12 mt-16">
          {/* Hero Section */}
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-2xl md:text-4xl font-light text-white mb-4 md:mb-6">How can we <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent font-medium">help?</span></h1>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)] w-6 h-6" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for bugs, health tips, privacy..."
                  className="w-full h-14 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl pl-16 pr-6 text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all text-lg"
                />
              </div>
            </div>
          </div>

          {/* Category Filters */}
          <div className="mb-8">
            <div className="flex gap-3 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                    activeCategory === category
                      ? 'bg-white text-black'
                      : 'bg-zinc-800 text-[var(--text-secondary)] hover:bg-zinc-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* FAQ List */}
          <div className="space-y-3 mb-12">
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((item) => {
                const isOpen = openItem === item.id;
                
                return (
                  <div key={item.id} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleAccordion(item.id)}
                      className="w-full flex items-center justify-between p-4 text-left text-[var(--text-primary)] hover:bg-[var(--bg-card)]/50 transition-colors"
                    >
                      <span className="font-medium pr-4">{item.q}</span>
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-[var(--text-secondary)] flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-[var(--text-secondary)] flex-shrink-0" />
                      )}
                    </button>
                    
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 pt-0 text-[var(--text-secondary)] leading-relaxed">
                            {item.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <p className="text-[var(--text-secondary)] text-lg">No results found for "{searchQuery}"</p>
                <p className="text-[var(--text-secondary)] text-sm mt-2">Try different keywords or browse categories</p>
              </div>
            )}
          </div>

          {/* Premium Contact Card */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Still need help?</h3>
              <p className="text-sm text-zinc-400">Our support team is available 24/7 for urgent technical issues.</p>
            </div>
            <a 
              href="mailto:dipanshudixit206@gmail.com?subject=Lumora Support Request&body=Hi Dipanshu,%0D%0A%0D%0AI need help with:%0D%0A%0D%0APlease describe your issue here..."
              className="bg-white text-black hover:bg-zinc-200 px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </>
  );
}