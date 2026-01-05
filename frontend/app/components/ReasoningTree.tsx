"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown, Lightbulb, AlertCircle, BookOpen, HelpCircle } from 'lucide-react';
import { ReasoningStep } from '../lib/reasoningParser';

interface ReasoningTreeProps {
  steps: ReasoningStep[];
  onStepClick?: (step: ReasoningStep) => void;
}

const ReasoningTree: React.FC<ReasoningTreeProps> = ({ steps, onStepClick }) => {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  const toggleStep = (stepId: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-400 bg-green-500/10 border-green-500/30';
    if (confidence >= 0.75) return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
    if (confidence >= 0.6) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
    return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.9) return 'High Confidence';
    if (confidence >= 0.75) return 'Confident';
    if (confidence >= 0.6) return 'Moderate';
    return 'Low Confidence';
  };

  if (steps.length === 0) return null;

  return (
    <div className="space-y-3">
      {steps.map((step, index) => {
        const isExpanded = expandedSteps.has(step.id);
        const hasDetails = step.alternatives.length > 0 || (step.sources && step.sources.length > 0);

        return (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="border border-zinc-700/50 rounded-lg bg-zinc-900/30 overflow-hidden"
          >
            {/* Main Step */}
            <div
              className={`p-4 cursor-pointer hover:bg-zinc-800/30 transition-colors ${
                hasDetails ? '' : 'cursor-default'
              }`}
              onClick={() => hasDetails && toggleStep(step.id)}
            >
              <div className="flex items-start gap-3">
                {/* Step Number */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-black text-sm font-bold">
                  {index + 1}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-black flex-shrink-0" />
                    <span className="text-xs text-zinc-500 font-medium">Reasoning Step</span>
                    
                    {/* Confidence Badge */}
                    <div className={`ml-auto px-2 py-0.5 rounded-full text-xs font-medium border ${getConfidenceColor(step.confidence)}`}>
                      {getConfidenceLabel(step.confidence)}
                    </div>
                  </div>

                  <p className="text-black text-sm leading-relaxed">{step.thought}</p>

                  {/* Confidence Bar */}
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${step.confidence * 100}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 + 0.2 }}
                        className={`h-full ${
                          step.confidence >= 0.9 ? 'bg-green-500' :
                          step.confidence >= 0.75 ? 'bg-blue-500' :
                          step.confidence >= 0.6 ? 'bg-yellow-500' : 'bg-orange-500'
                        }`}
                      />
                    </div>
                    <span className="text-xs text-zinc-500 font-mono">
                      {Math.round(step.confidence * 100)}%
                    </span>
                  </div>

                  {/* Expand Indicator */}
                  {hasDetails && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-black">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      <span>
                        {step.alternatives.length > 0 && `${step.alternatives.length} alternative${step.alternatives.length > 1 ? 's' : ''}`}
                        {step.alternatives.length > 0 && step.sources && step.sources.length > 0 && ' • '}
                        {step.sources && step.sources.length > 0 && `${step.sources.length} source${step.sources.length > 1 ? 's' : ''}`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            <AnimatePresence>
              {isExpanded && hasDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-zinc-700/50 overflow-hidden"
                >
                  <div className="p-4 space-y-4 bg-zinc-900/50">
                    {/* Alternatives */}
                    {step.alternatives.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="w-4 h-4 text-yellow-400" />
                          <span className="text-xs font-medium text-yellow-400">Alternative Considerations</span>
                        </div>
                        <div className="space-y-2">
                          {step.alternatives.map((alt, i) => (
                            <div
                              key={i}
                              className="pl-4 border-l-2 border-yellow-500/30 py-2 text-sm text-zinc-300 hover:bg-zinc-800/30 rounded-r transition-colors cursor-pointer"
                              onClick={() => onStepClick && onStepClick({ ...step, thought: alt })}
                            >
                              {alt}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sources */}
                    {step.sources && step.sources.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="w-4 h-4 text-blue-400" />
                          <span className="text-xs font-medium text-blue-400">Medical References</span>
                        </div>
                        <div className="space-y-2">
                          {step.sources.map((source, i) => (
                            <div
                              key={i}
                              className="pl-4 border-l-2 border-blue-500/30 py-2 text-sm text-zinc-300 bg-blue-500/5 rounded-r"
                            >
                              {source}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Ask Follow-up */}
                    <button
                      onClick={() => onStepClick && onStepClick(step)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg text-black text-sm font-medium transition-colors"
                    >
                      <HelpCircle className="w-4 h-4" />
                      Ask follow-up about this step
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ReasoningTree;
