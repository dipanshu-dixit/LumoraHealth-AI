import { NextResponse } from 'next/server';
import { z } from 'zod';

// Inline validation schemas
const chatMessageSchema = z.object({
  message: z.string()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message too long (max 2000 characters)')
    .trim(),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().max(5000)
  })).max(50, 'History too long').optional().default([]),
  aiMode: z.enum(['classic', 'medical', 'chatty']).optional().default('classic'),
  customInstructions: z.string().optional().default(''),
  maxTokens: z.number().min(100).max(1000).optional().default(450),
  temperature: z.number().min(0).max(1).optional().default(0.5),
  contextWindow: z.number().min(2).max(20).optional().default(6),
  enableReasoning: z.boolean().optional().default(false),
  adaptiveProfile: z.object({
    preferredResponseStyle: z.enum(['concise', 'detailed', 'empathetic']),
    topicsOfInterest: z.array(z.string()),
    dislikedPatterns: z.array(z.string()),
    effectiveApproaches: z.array(z.string())
  }).nullable().optional()
});

const validateInput = <T>(schema: z.ZodSchema<T>, data: unknown) => {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.errors.map(e => e.message).join(', ');
    throw new Error(`Validation failed: ${errors}`);
  }
  return result.data;
};

// Inline logger for API routes
const logger = {
  error: (message: string, meta: Record<string, any> = {}) => {
    console.error(JSON.stringify({
      level: 'error',
      message,
      timestamp: new Date().toISOString(),
      ...meta
    }));
  },
  warn: (message: string, meta: Record<string, any> = {}) => {
    console.warn(JSON.stringify({
      level: 'warn', 
      message,
      timestamp: new Date().toISOString(),
      ...meta
    }));
  },
  info: (message: string, meta: Record<string, any> = {}) => {
    console.log(JSON.stringify({
      level: 'info',
      message, 
      timestamp: new Date().toISOString(),
      ...meta
    }));
  }
};

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const requestId = Date.now().toString(36);
  
  try {
    const body = await req.json().catch(() => {
      throw new Error('Invalid JSON in request body');
    });
    
    // Zod validation - fail fast, fail clean
    const validatedData = validateInput(chatMessageSchema, body);
    
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      logger.error('xAI API key missing', { requestId });
      return NextResponse.json({ error: "Service temporarily unavailable" }, { status: 500 });
    }

    logger.info('AI chat request', { 
      requestId,
      messageLength: validatedData.message.length,
      hasHistory: validatedData.history.length > 0
    });

    const systemPrompt = {
      role: "system",
      content: `You are Lumora, a health assistant.

      ${validatedData.enableReasoning ? `CRITICAL: Include detailed reasoning in <thinking></thinking> tags with 6-8 analytical steps:
      <thinking>
      - Initial Assessment: [Analyze the question/symptoms]
      - Medical Context: [Consider relevant medical knowledge]
      - Differential Analysis: [List possible causes/conditions]
      - Risk Evaluation: [Assess severity and urgency]
      - Evidence Review: [Consider supporting medical evidence]
      - Alternative Considerations: [What else could this be?]
      - Confidence Level: [Rate certainty: High/Medium/Low]
      - Recommendation Strategy: [Best approach for response]
      </thinking>
      
      [Then provide your main response]` : ''}

      ${validatedData.aiMode === 'medical' ? `MEDICAL PROFESSIONAL MODE: Use precise medical terminology, provide detailed pathophysiology, include differential diagnoses, mention relevant lab tests or imaging when appropriate. Assume the user has medical training.` : ''}
      
      ${validatedData.aiMode === 'chatty' ? `CHATTY DOCTOR MODE: Be warm, encouraging, and empathetic. Use gentle humor when appropriate. Show genuine concern and provide emotional support alongside medical guidance. Be like a caring family doctor who knows you well.` : ''}
      
      ${validatedData.aiMode === 'classic' ? `CLASSIC MODE: Provide balanced, professional medical guidance. Use clear language that's accessible to general users while remaining medically accurate.` : ''}

      ${validatedData.customInstructions ? `CUSTOM USER CONTEXT: ${validatedData.customInstructions}. Always consider these personal details when providing advice.` : ''}
      
      ${validatedData.adaptiveProfile ? `
USER PREFERENCES (learned from feedback):
- Response style: ${validatedData.adaptiveProfile.preferredResponseStyle}
${validatedData.adaptiveProfile.dislikedPatterns.length > 0 ? `- Avoid: ${validatedData.adaptiveProfile.dislikedPatterns.join(', ')}` : ''}
${validatedData.adaptiveProfile.effectiveApproaches.length > 0 ? `- User appreciates: ${validatedData.adaptiveProfile.effectiveApproaches.join(', ')}` : ''}
${validatedData.adaptiveProfile.topicsOfInterest.length > 0 ? `- Topics of interest: ${validatedData.adaptiveProfile.topicsOfInterest.join(', ')}` : ''}` : ''}

      CORE STYLE:
      BE HUMAN. Do not use labels like "Direct Answer:" or "Key Mechanisms:". Just talk.
      SIMPLE LANGUAGE. Explain things as if you are talking to a friend${validatedData.aiMode === 'medical' ? ' with medical knowledge' : ''}.
      STRUCTURE. Use paragraphs for the main point, and bullet points for lists.
      EMPATHY. ${validatedData.aiMode === 'chatty' ? 'Be extra caring and supportive.' : 'If the user is anxious, be reassuring.'}
      CONTINUITY. Remember what the user has told you in this conversation.

      ${validatedData.history.length > 0 ? `CONVERSATION CONTEXT: You have been talking with this user. Build on what they've shared before.` : ''}`
    };

    const messagesPayload = [
      systemPrompt,
      ...validatedData.history.slice(-(validatedData.contextWindow || 6)),
      { role: "user", content: validatedData.message }
    ];

    // Debounce rapid requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "X-Title": "Lumora AI Health Assistant"
      },
      body: JSON.stringify({
        model: "grok-2-latest",
        messages: messagesPayload,
        max_tokens: validatedData.maxTokens || 450,
        temperature: validatedData.temperature || 0.5,
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('xAI API error', { 
        requestId,
        status: response.status,
        error: errorText 
      });
      
      if (response.status === 429) {
        return NextResponse.json({ error: "Service is busy, please try again in a moment" }, { status: 429 });
      }
      
      return NextResponse.json({ error: "AI service temporarily unavailable" }, { status: 503 });
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      logger.error('Empty AI response', { requestId, data });
      return NextResponse.json({ error: "Unable to generate response, please try again" }, { status: 500 });
    }

    // Extract thinking process if present
    let thinking = '';
    const thinkingMatch = content.match(/<thinking>([\s\S]*?)<\/thinking>/);
    if (thinkingMatch) {
      thinking = thinkingMatch[1].trim();
      content = content.replace(/<thinking>[\s\S]*?<\/thinking>/, '').trim();
    }

    logger.info('AI chat success', { 
      requestId,
      responseLength: content.length,
      hasThinking: thinking.length > 0
    });

    return NextResponse.json({
      success: true,
      content,
      thinking
    });

  } catch (error: any) {
    // Handle validation errors specifically
    if (error.message?.includes('Validation failed')) {
      logger.warn('Input validation failed', { requestId, error: error.message });
      return NextResponse.json({ error: error.message.replace('Validation failed: ', '') }, { status: 400 });
    }
    
    logger.error('Chat endpoint error', {
      requestId,
      error: error.message,
      stack: error.stack
    });
    
    return NextResponse.json({ 
      error: "Something went wrong, please try again" 
    }, { status: 500 });
  }
}
