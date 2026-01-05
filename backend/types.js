// TypeScript type definitions for backend server
export interface AuthRequest {
  anonymousId?: string;
}

export interface AuthResponse {
  token: string;
  anonymousId: string;
  expiresIn: string;
  encrypted: boolean;
}

export interface ChatRequest {
  message: string;
  personality?: string;
  userProfile?: UserProfile;
  conversationHistory?: ConversationMessage[];
  persona?: string;
  customPrompt?: string;
  userId?: string;
}

export interface ChatResponse {
  message: string;
  confidence: number;
  urgency: 'low' | 'medium' | 'high';
  sentiment: string;
  timestamp: string;
  shardId?: number;
  fromCache?: boolean;
}

export interface ConversationMessage {
  type: 'user' | 'ai';
  content: string;
}

export interface UserProfile {
  ageRange?: string;
  concern?: string;
  goal?: number;
}

export interface ShardConfig {
  shardCount: number;
  maxDocsPerShard: number;
}

export interface ShardHealth {
  currentConfig: ShardConfig;
  totalDocuments: number;
  avgDocsPerShard: number;
  utilizationPercent: number;
  status: 'healthy' | 'monitoring' | 'scaling_needed';
  timestamp?: string;
  recommendations?: string[];
}

export interface CacheStats {
  totalKeys: number;
  hitRate: string;
  memoryUsage: string;
  shardsActive: number;
  averageResponseTime: string;
  cacheEnabled: boolean;
}

export interface ErrorReport {
  id: string;
  level: string;
  message: string;
  stack: string;
  componentStack: string;
  userAgent: string;
  url: string;
  timestamp: string;
  retryCount: number;
  userId: string;
  sessionId: string;
  ip: string;
  environment: string;
  release: string;
}

export interface FeedbackData {
  id: string;
  userId: string;
  type: string;
  message: string;
  timestamp: string;
  userAgent: string;
  url: string;
  shardId: number;
  processed: boolean;
  priority: 'normal' | 'high';
}

export interface PaymentData {
  id: string;
  subscriptionId: string;
  tierId: string;
  amount: number;
  currency: string;
  userId: string;
  status: string;
  created: string;
  description: string;
}

export interface LoadTestRequest {
  userCount?: number;
  messageCount?: number;
}

export interface LoadTestResult {
  totalUsers: number;
  totalMessages: number;
  totalTime: number;
  averageTimePerUser: number;
  shardsUsed: number;
  messagesPerSecond: number;
  success: boolean;
}

export interface MockMessage {
  id: string;
  text: string;
  timestamp: string;
  isUser: boolean;
  shardId: number;
}

export interface HistoryResponse {
  messages: MockMessage[];
  totalCount: number;
  page: number;
  hasMore: boolean;
  fromCache?: boolean;
}

export interface InsightData {
  category: string;
  trend: string;
  confidence: number;
}

export interface InsightsResponse {
  userId: string;
  shardId: number;
  timeframe: string;
  insights: InsightData[];
  generatedAt: string;
  fromCache?: boolean;
}