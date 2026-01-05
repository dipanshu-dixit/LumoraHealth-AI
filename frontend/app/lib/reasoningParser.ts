export interface ReasoningStep {
  id: string;
  thought: string;
  confidence: number;
  alternatives: string[];
  sources?: string[];
}

export const parseReasoning = (thinking: string): ReasoningStep[] => {
  if (!thinking || thinking.trim().length === 0) return [];

  const steps: ReasoningStep[] = [];
  const lines = thinking.split('\n').filter(line => line.trim());

  let currentStep: Partial<ReasoningStep> | null = null;
  let stepCounter = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    
    // Detect new reasoning step (bullet points, numbers, or keywords)
    if (trimmed.match(/^[-•*]\s+/) || trimmed.match(/^\d+[\.)]\s+/) || 
        trimmed.toLowerCase().startsWith('step') || 
        trimmed.toLowerCase().startsWith('first') ||
        trimmed.toLowerCase().startsWith('next') ||
        trimmed.toLowerCase().startsWith('then')) {
      
      // Save previous step
      if (currentStep && currentStep.thought) {
        steps.push({
          id: `step-${stepCounter++}`,
          thought: currentStep.thought,
          confidence: currentStep.confidence || 0.8,
          alternatives: currentStep.alternatives || [],
          sources: currentStep.sources
        });
      }

      // Start new step
      const cleanThought = trimmed.replace(/^[-•*]\s+/, '').replace(/^\d+[\.)]\s+/, '');
      currentStep = {
        thought: cleanThought,
        confidence: extractConfidence(cleanThought),
        alternatives: [],
        sources: []
      };
    } 
    // Detect alternatives
    else if (trimmed.toLowerCase().includes('alternatively') || 
             trimmed.toLowerCase().includes('could also') ||
             trimmed.toLowerCase().includes('another option')) {
      if (currentStep) {
        currentStep.alternatives = currentStep.alternatives || [];
        currentStep.alternatives.push(trimmed);
      }
    }
    // Detect sources/references
    else if (trimmed.match(/\[.*\]/) || trimmed.toLowerCase().includes('according to') ||
             trimmed.toLowerCase().includes('research shows')) {
      if (currentStep) {
        currentStep.sources = currentStep.sources || [];
        currentStep.sources.push(trimmed);
      }
    }
    // Continue current thought
    else if (currentStep && trimmed.length > 0) {
      currentStep.thought += ' ' + trimmed;
    }
    // Start first step if none exists
    else if (!currentStep && trimmed.length > 0) {
      currentStep = {
        thought: trimmed,
        confidence: extractConfidence(trimmed),
        alternatives: [],
        sources: []
      };
    }
  }

  // Add final step
  if (currentStep && currentStep.thought) {
    steps.push({
      id: `step-${stepCounter}`,
      thought: currentStep.thought,
      confidence: currentStep.confidence || 0.8,
      alternatives: currentStep.alternatives || [],
      sources: currentStep.sources
    });
  }

  return steps;
};

const extractConfidence = (text: string): number => {
  const lower = text.toLowerCase();
  
  if (lower.includes('certain') || lower.includes('definitely') || lower.includes('clearly')) {
    return 0.95;
  }
  if (lower.includes('likely') || lower.includes('probably')) {
    return 0.85;
  }
  if (lower.includes('possibly') || lower.includes('might') || lower.includes('could')) {
    return 0.65;
  }
  if (lower.includes('uncertain') || lower.includes('unclear') || lower.includes('maybe')) {
    return 0.5;
  }
  
  return 0.8; // Default confidence
};
