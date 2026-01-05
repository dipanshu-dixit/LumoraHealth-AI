"use client";

import { AlertCircle, Brain, Moon, Activity, Heart, Apple, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { HEALTH_CATEGORIES } from '../../lib/demo-data';

const iconMap = {
  AlertCircle,
  Brain,
  Moon,
  Activity,
  Heart,
  Apple
};

interface SuggestionsGridProps {
  onQuestionClick: (question: string) => void;
}

export default function SuggestionsGrid({ onQuestionClick }: SuggestionsGridProps) {
  const [showMore, setShowMore] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 lg:mb-32">
      {/* Horizontal Scrollable Suggestion Chips */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-3 min-w-max justify-center">
          {HEALTH_CATEGORIES.slice(0, 8).map((category, index) => {
            const IconComponent = iconMap[category.icon as keyof typeof iconMap] || AlertCircle;
            const randomQuestion = category.questions[Math.floor(Math.random() * category.questions.length)];
            
            return (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => onQuestionClick(randomQuestion)}
                className="flex-shrink-0 bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/50 hover:border-white/50 px-3 lg:px-4 py-3 rounded-xl hover:bg-zinc-800/60 transition-all duration-300 group flex items-center gap-3 min-w-[180px] lg:min-w-[200px] min-h-[44px]"
              >
                <IconComponent className={`w-4 h-4 ${category.color} group-hover:scale-110 transition-transform`} />
                <div className="text-left">
                  <div className="text-starlight font-medium text-sm">{category.title}</div>
                  <div className="text-muted text-xs truncate max-w-[120px] lg:max-w-[140px]">{randomQuestion}</div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
      
      {/* Show more categories button */}
      <div className="text-center mt-6">
        <button
          onClick={() => setShowMore(!showMore)}
          className="text-white hover:text-zinc-300 text-sm font-medium transition-colors min-h-[44px] flex items-center justify-center gap-2 mx-auto"
        >
          <span>{showMore ? 'Show less categories' : 'Show more categories'}</span>
          {showMore ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        {showMore && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {HEALTH_CATEGORIES.map((category, index) => {
              const IconComponent = iconMap[category.icon as keyof typeof iconMap] || AlertCircle;
              const isExpanded = expandedCategories.has(category.id);
              const questionsToShow = isExpanded ? category.questions : category.questions.slice(0, 5);
              
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="bg-zinc-900/40 border border-zinc-800/50 p-4 rounded-lg hover:bg-zinc-800/40 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <IconComponent className={`w-4 h-4 ${category.color}`} />
                      <h3 className="text-starlight font-medium text-sm">{category.title}</h3>
                    </div>
                    <span className="text-xs text-muted bg-zinc-800 px-2 py-1 rounded">
                      {category.questions.length}
                    </span>
                  </div>
                  
                  <div className="space-y-1 mb-3">
                    {questionsToShow.map((question, qIndex) => (
                      <button
                        key={qIndex}
                        onClick={() => onQuestionClick(question)}
                        className="block w-full text-left text-muted text-xs hover:text-starlight transition-colors cursor-pointer p-2 rounded hover:bg-zinc-700/50 min-h-[36px] flex items-center"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                  
                  {category.questions.length > 5 && (
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className="text-white hover:text-zinc-300 text-xs font-medium transition-colors flex items-center gap-1"
                    >
                      {isExpanded ? 'Show less' : `Show ${category.questions.length - 5} more`}
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}