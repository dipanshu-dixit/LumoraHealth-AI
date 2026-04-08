import { ChatSession } from './chatStorage';

export interface HealthTimeline {
  symptoms: Map<string, SymptomData>;
  medications: Map<string, MedicationData>;
  lifestyle: LifestyleData;
  insights: HealthInsight[];
}

interface SymptomData {
  dates: Date[];
  severity: number[];
}

interface MedicationData {
  startDate: Date;
  frequency: string;
}

interface LifestyleData {
  sleep: number[];
  exercise: number[];
  stress: number[];
}

export interface SymptomEntry {
  name: string;
  dates: Date[];
  severity: number[];
}

export interface MedicationEntry {
  name: string;
  startDate: Date;
  frequency: string;
}

export interface LifestyleMetrics {
  sleep: { date: Date, hours: number }[];
  exercise: { date: Date, minutes: number }[];
  stress: { date: Date, level: number }[];
}

export interface HealthInsight {
  pattern: string;
  recommendation: string;
  confidence: number;
  category: 'symptom' | 'medication' | 'lifestyle';
}

// Module-level constants for symptom/medication detection (pre-compiled for performance)
const SYMPTOM_KEYWORDS = ['pain', 'headache', 'fever', 'cough', 'fatigue', 'nausea', 'dizzy', 'ache'];
const MEDICATION_KEYWORDS = ['taking', 'prescribed', 'medication', 'pill', 'tablet', 'dose'];
const SYMPTOM_REGEX = new RegExp(`(${SYMPTOM_KEYWORDS.join('|')})`);
const MEDICATION_REGEX = new RegExp(`(${MEDICATION_KEYWORDS.join('|')})`, 'i');
const MED_NAME_REGEX = /\b[A-Z][a-z]+(?:in|ol|ex|am)\b/;

class HealthTimelineService {
  private static instance: HealthTimelineService;

  static getInstance(): HealthTimelineService {
    if (!HealthTimelineService.instance) {
      HealthTimelineService.instance = new HealthTimelineService();
    }
    return HealthTimelineService.instance;
  }
  async extractHealthData(chats: ChatSession[]): Promise<{
    symptoms: SymptomEntry[];
    medications: MedicationEntry[];
    lifestyle: LifestyleMetrics;
    insights: HealthInsight[];
  }> {
    try {
      const response = await fetch('/api/health-timeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chats })
      });

      if (!response.ok) throw new Error('Failed to extract health data');
      return await response.json();
    } catch (error) {
      console.error('Health extraction error:', error);
      return this.fallbackExtraction(chats);
    }
  }

  private fallbackExtraction(chats: ChatSession[]): {
    symptoms: SymptomEntry[];
    medications: MedicationEntry[];
    lifestyle: LifestyleMetrics;
    insights: HealthInsight[];
  } {
    const symptoms = new Map<string, { dates: Date[], severity: number[] }>();
    const medications = new Map<string, { startDate: Date, frequency: string }>();
    const lifestyle = { sleep: [], exercise: [], stress: [] };

    chats.forEach(chat => {
      chat.messages.forEach(msg => {
        if (!msg.isUser) return;

        const contentLower = msg.content.toLowerCase();

        if (SYMPTOM_REGEX.test(contentLower)) {
          SYMPTOM_KEYWORDS.forEach(symptom => {
            if (contentLower.includes(symptom)) {
              if (!symptoms.has(symptom)) {
                symptoms.set(symptom, { dates: [], severity: [] });
              }
              symptoms.get(symptom)!.dates.push(msg.timestamp);
              symptoms.get(symptom)!.severity.push(this.estimateSeverity(contentLower));
            }
          });
        }

        if (MEDICATION_REGEX.test(contentLower)) {
          const medMatch = msg.content.match(MED_NAME_REGEX);
          if (medMatch) {
            const medName = medMatch[0];
            if (!medications.has(medName)) {
              medications.set(medName, { startDate: msg.timestamp, frequency: 'daily' });
            }
          }
        }
      });
    });

    return {
      symptoms: Array.from(symptoms.entries()).map(([name, data]) => ({ name, ...data })),
      medications: Array.from(medications.entries()).map(([name, data]) => ({ name, ...data })),
      lifestyle: {
        sleep: [],
        exercise: [],
        stress: []
      },
      insights: this.generateInsights(symptoms, medications)
    };
  }

  private estimateSeverity(content: string): number {
    if (content.includes('severe') || content.includes('extreme')) return 8;
    if (content.includes('bad') || content.includes('intense')) return 6;
    if (content.includes('mild') || content.includes('slight')) return 3;
    return 5;
  }

  private generateInsights(
    symptoms: Map<string, { dates: Date[], severity: number[] }>,
    medications: Map<string, { startDate: Date, frequency: string }>
  ): HealthInsight[] {
    const insights: HealthInsight[] = [];

    symptoms.forEach((data, symptom) => {
      if (data.dates.length >= 3) {
        const avgSeverity = data.severity.reduce((a, b) => a + b, 0) / data.severity.length;
        
        if (avgSeverity >= 7) {
          insights.push({
            pattern: `${symptom} occurring frequently with high severity`,
            recommendation: `Try keeping a detailed log of when ${symptom} occurs - note time of day, activities, and food intake to identify triggers`,
            confidence: 0.8,
            category: 'symptom'
          });
        } else if (data.dates.length >= 5) {
          insights.push({
            pattern: `${symptom} mentioned ${data.dates.length} times this month`,
            recommendation: `Consider lifestyle adjustments: ensure adequate hydration, regular sleep schedule, and stress management techniques`,
            confidence: 0.7,
            category: 'symptom'
          });
        } else {
          insights.push({
            pattern: `Recurring ${symptom} pattern detected`,
            recommendation: `Monitor this symptom and note any patterns with diet, sleep, or stress levels`,
            confidence: 0.6,
            category: 'symptom'
          });
        }
      }
    });

    if (medications.size > 0) {
      insights.push({
        pattern: `Currently tracking ${medications.size} medication${medications.size > 1 ? 's' : ''}`,
        recommendation: `Set daily reminders to maintain consistent medication timing for better effectiveness`,
        confidence: 0.9,
        category: 'medication'
      });
    }

    return insights;
  }

  calculateHealthScore(data: {
    symptoms: SymptomEntry[];
    medications: MedicationEntry[];
    lifestyle: LifestyleMetrics;
  }): number {
    let score = 100;
    score -= data.symptoms.length * 5;
    score -= data.medications.length * 3;
    return Math.max(0, Math.min(100, score));
  }

  async generateMedicalSummary(chats: ChatSession[]): Promise<string> {
    const data = await this.extractHealthData(chats);
    
    let summary = '# Medical Summary\n\n';
    summary += `**Generated:** ${new Date().toLocaleDateString()}\n\n`;
    
    summary += '## Symptoms\n';
    data.symptoms.forEach(s => {
      summary += `- **${s.name}**: ${s.dates.length} occurrences\n`;
    });
    
    summary += '\n## Medications\n';
    data.medications.forEach(m => {
      summary += `- **${m.name}**: Started ${m.startDate.toLocaleDateString()}, ${m.frequency}\n`;
    });
    
    summary += '\n## Insights\n';
    data.insights.forEach(i => {
      summary += `- ${i.pattern}: ${i.recommendation}\n`;
    });
    
    return summary;
  }
}

export const HealthTimeline = HealthTimelineService.getInstance();
