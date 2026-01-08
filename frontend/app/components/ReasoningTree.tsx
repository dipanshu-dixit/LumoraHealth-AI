"use client";

import React, { useState } from 'react';
import { ChevronRight, Brain, Zap, Target, Search, BookOpen, MessageCircle, Sparkles } from 'lucide-react';
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

  const getStepIcon = (index: number) => {
    const icons = [Brain, Zap, Target, Search, BookOpen, MessageCircle, Sparkles, Brain];
    const Icon = icons[index % icons.length];
    return <Icon className="w-4 h-4" />;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'from-emerald-500 to-teal-500';
    if (confidence >= 0.75) return 'from-blue-500 to-cyan-500';
    if (confidence >= 0.6) return 'from-yellow-500 to-orange-500';
    return 'from-orange-500 to-red-500';
  };

  if (steps.length === 0) return null;

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-zinc-900/50 to-zinc-800/50 border border-zinc-700/50 rounded-lg">
        <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
          <Brain className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-white">AI Reasoning Chain</div>
          <div className="text-xs text-zinc-400">{steps.length} analytical steps</div>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-1">
        {steps.map((step, index) => {
          const isExpanded = expandedSteps.has(step.id);
          const hasDetails = step.alternatives.length > 0 || (step.sources && step.sources.length > 0);

          return (
            <div key={step.id} className="group">
              {/* Step Header - Compact */}
              <div
                className={`flex items-start gap-3 p-3 rounded-lg transition-all duration-200 ${
                  hasDetails 
                    ? 'cursor-pointer hover:bg-zinc-800/30 border border-zinc-700/50 hover:border-zinc-600/50' 
                    : 'bg-zinc-900/20 border border-zinc-700/30'
                }`}
                onClick={() => hasDetails && toggleStep(step.id)}
              >
                {/* Professional Icon */}
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-zinc-700 to-zinc-800 border border-zinc-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-white">{index + 1}</span>
                </div>

                {/* Full Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-white text-sm leading-relaxed flex-1">{step.thought}</p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${getConfidenceColor(step.confidence)}`} />
                      <span className="text-xs text-zinc-400 font-mono">{Math.round(step.confidence * 100)}%</span>
                      {hasDetails && (
                        <ChevronRight className={`w-4 h-4 text-zinc-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Details - Compact */}
              {isExpanded && hasDetails && (
                <div className="ml-6 sm:ml-8 mt-1 space-y-2">
                  {/* Alternatives */}
                  {step.alternatives.length > 0 && (
                    <div className="bg-yellow-500/5 border border-yellow-500/20 rounded p-2">
                      <div className="flex items-center gap-1 mb-1">
                        <Target className="w-3 h-3 text-yellow-400" />
                        <span className="text-xs font-medium text-yellow-400">Alternatives</span>
                      </div>
                      <div className="space-y-1">
                        {step.alternatives.map((alt, i) => (
                          <div
                            key={i}
                            className="p-1.5 bg-yellow-500/5 hover:bg-yellow-500/10 border border-yellow-500/20 rounded text-xs text-[var(--text-secondary)] cursor-pointer transition-colors break-words"
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
                    <div className="bg-blue-500/5 border border-blue-500/20 rounded p-2">
                      <div className="flex items-center gap-1 mb-1">
                        <BookOpen className="w-3 h-3 text-blue-400" />
                        <span className="text-xs font-medium text-blue-400">References</span>
                      </div>
                      <div className="space-y-1">
                        {step.sources.map((source, i) => (
                          <div key={i} className="p-1.5 bg-blue-500/5 border border-blue-500/20 rounded text-xs text-[var(--text-secondary)] break-words">
                            {source}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Follow-up */}
                  <button
                    onClick={() => onStepClick && onStepClick(step)}
                    className="w-full flex items-center justify-center gap-1 px-2 py-1.5 bg-gradient-to-r from-white/5 to-white/10 hover:from-white/10 hover:to-white/20 border border-white/20 rounded text-[var(--text-secondary)] text-xs font-medium transition-all duration-200"
                  >
                    <MessageCircle className="w-3 h-3" />
                    <span className="hidden sm:inline">Ask about this</span>
                    <span className="sm:hidden">Ask</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReasoningTree;
