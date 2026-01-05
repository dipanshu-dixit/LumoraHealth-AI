interface UserProfile {
  preferredResponseStyle: 'concise' | 'detailed' | 'empathetic';
  topicsOfInterest: string[];
  dislikedPatterns: string[];
  effectiveApproaches: string[];
}

interface MessageFeedback {
  messageId: string;
  content: string;
  liked: boolean;
  timestamp: Date;
}

class AdaptiveAIService {
  private static instance: AdaptiveAIService;
  private readonly PROFILE_KEY = 'lumora-ai-profile';
  private readonly FEEDBACK_KEY = 'lumora-message-feedback';

  static getInstance(): AdaptiveAIService {
    if (!AdaptiveAIService.instance) {
      AdaptiveAIService.instance = new AdaptiveAIService();
    }
    return AdaptiveAIService.instance;
  }

  recordFeedback(messageId: string, content: string, liked: boolean) {
    const feedback: MessageFeedback = {
      messageId,
      content,
      liked,
      timestamp: new Date()
    };

    const existing = this.getAllFeedback();
    existing.push(feedback);
    
    // Keep last 100 feedbacks
    const limited = existing.slice(-100);
    localStorage.setItem(this.FEEDBACK_KEY, JSON.stringify(limited));
    
    // Rebuild profile
    this.buildProfile();
  }

  private getAllFeedback(): MessageFeedback[] {
    try {
      const stored = localStorage.getItem(this.FEEDBACK_KEY);
      if (!stored) return [];
      return JSON.parse(stored).map((f: any) => ({
        ...f,
        timestamp: new Date(f.timestamp)
      }));
    } catch {
      return [];
    }
  }

  private buildProfile() {
    const feedbacks = this.getAllFeedback();
    const liked = feedbacks.filter(f => f.liked);
    const disliked = feedbacks.filter(f => !f.liked);

    const profile: UserProfile = {
      preferredResponseStyle: this.analyzeResponseStyle(liked, disliked),
      topicsOfInterest: this.extractTopics(liked),
      dislikedPatterns: this.analyzeDislikedPatterns(disliked),
      effectiveApproaches: this.analyzeEffectiveApproaches(liked)
    };

    localStorage.setItem(this.PROFILE_KEY, JSON.stringify(profile));
  }

  private analyzeResponseStyle(liked: MessageFeedback[], disliked: MessageFeedback[]): 'concise' | 'detailed' | 'empathetic' {
    const likedAvgLength = liked.reduce((sum, f) => sum + f.content.length, 0) / (liked.length || 1);
    const dislikedAvgLength = disliked.reduce((sum, f) => sum + f.content.length, 0) / (disliked.length || 1);

    // Check for empathetic language
    const empatheticWords = ['understand', 'feel', 'sorry', 'care', 'support', 'here for you'];
    const likedEmpathy = liked.filter(f => 
      empatheticWords.some(w => f.content.toLowerCase().includes(w))
    ).length / (liked.length || 1);

    if (likedEmpathy > 0.4) return 'empathetic';
    if (likedAvgLength < 300) return 'concise';
    return 'detailed';
  }

  private extractTopics(liked: MessageFeedback[]): string[] {
    const topics = new Set<string>();
    const keywords = ['diet', 'exercise', 'sleep', 'stress', 'medication', 'pain', 'mental health', 'nutrition'];
    
    liked.forEach(f => {
      const content = f.content.toLowerCase();
      keywords.forEach(keyword => {
        if (content.includes(keyword)) topics.add(keyword);
      });
    });

    return Array.from(topics).slice(0, 5);
  }

  private analyzeDislikedPatterns(disliked: MessageFeedback[]): string[] {
    const patterns: string[] = [];
    
    if (disliked.length === 0) return patterns;

    const avgLength = disliked.reduce((sum, f) => sum + f.content.length, 0) / disliked.length;
    
    if (avgLength > 500) patterns.push('overly lengthy responses');
    if (avgLength < 100) patterns.push('too brief responses');
    
    const technicalTerms = disliked.filter(f => 
      /\b(diagnosis|pathology|etiology|prognosis)\b/i.test(f.content)
    ).length;
    
    if (technicalTerms / disliked.length > 0.3) {
      patterns.push('overly technical medical jargon');
    }

    return patterns;
  }

  private analyzeEffectiveApproaches(liked: MessageFeedback[]): string[] {
    const approaches: string[] = [];
    
    if (liked.length === 0) return approaches;

    const withExamples = liked.filter(f => 
      f.content.includes('example') || f.content.includes('for instance')
    ).length;
    
    if (withExamples / liked.length > 0.3) {
      approaches.push('providing concrete examples');
    }

    const withSteps = liked.filter(f => 
      /\b(step|first|second|then|finally)\b/i.test(f.content)
    ).length;
    
    if (withSteps / liked.length > 0.3) {
      approaches.push('breaking down information into steps');
    }

    const withReassurance = liked.filter(f => 
      /\b(normal|common|don't worry|manageable)\b/i.test(f.content)
    ).length;
    
    if (withReassurance / liked.length > 0.3) {
      approaches.push('offering reassurance');
    }

    return approaches;
  }

  getProfile(): UserProfile | null {
    try {
      const stored = localStorage.getItem(this.PROFILE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  buildAdaptivePrompt(basePrompt: string): string {
    const profile = this.getProfile();
    if (!profile) return basePrompt;

    const feedbackCount = this.getAllFeedback().length;
    if (feedbackCount < 3) return basePrompt; // Need at least 3 feedbacks

    let adaptiveSection = '\n\nUSER PREFERENCES (learned from feedback):';
    adaptiveSection += `\n- Response style: ${profile.preferredResponseStyle}`;
    
    if (profile.dislikedPatterns.length > 0) {
      adaptiveSection += `\n- Avoid: ${profile.dislikedPatterns.join(', ')}`;
    }
    
    if (profile.effectiveApproaches.length > 0) {
      adaptiveSection += `\n- User appreciates: ${profile.effectiveApproaches.join(', ')}`;
    }
    
    if (profile.topicsOfInterest.length > 0) {
      adaptiveSection += `\n- Topics of interest: ${profile.topicsOfInterest.join(', ')}`;
    }

    return basePrompt + adaptiveSection;
  }

  getStats() {
    const feedbacks = this.getAllFeedback();
    const liked = feedbacks.filter(f => f.liked).length;
    const disliked = feedbacks.filter(f => !f.liked).length;
    const profile = this.getProfile();

    return {
      totalFeedback: feedbacks.length,
      liked,
      disliked,
      profileBuilt: profile !== null,
      preferredStyle: profile?.preferredResponseStyle || 'not set'
    };
  }
}

export const AdaptiveAI = AdaptiveAIService.getInstance();
