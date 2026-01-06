import { NextResponse } from 'next/server';
import { z } from 'zod';

// Inline validation schemas
const medicineSearchSchema = z.object({
  medicine: z.string()
    .min(1, 'Medicine name required')
    .max(100, 'Medicine name too long')
    .trim()
    .regex(/^[a-zA-Z0-9\s\-\.]+$/, 'Invalid characters in medicine name')
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

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const requestId = Date.now().toString(36);
  
  try {
    const body = await req.json().catch(() => ({}));
    
    // Zod validation - fail fast, fail clean
    const validatedData = validateInput(medicineSearchSchema, body);
    
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      logger.error('XAI API key missing for medicine search', { requestId });
      return NextResponse.json({ error: "Service temporarily unavailable" }, { status: 500 });
    }

    logger.info('Medicine search request', { 
      requestId,
      medicine: validatedData.medicine.substring(0, 50)
    });

    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "User-Agent": "Lumora/2.0"
      },
      body: JSON.stringify({
        model: "grok-4-1-fast-reasoning",
        max_tokens: 400,
        temperature: 0.3,
        presence_penalty: 0.5,
        frequency_penalty: 0.5,
        messages: [
          {
            role: "system",
            content: `You are a medicine expert providing comprehensive information in simple language.

FORMAT YOUR RESPONSE WITH THESE SECTIONS:

**What is it?** - Explain what the medicine does in simple terms
**Active Ingredient** - List the main chemical/salt (e.g., Acetaminophen)
**How to use it** - Simple dosage and usage instructions
**Common Side Effects** - List 3-4 most common side effects
**Warnings** - Important safety information
**Manufacturer Info** - Common brands and country of origin if known
**Price Range** - Approximate cost range

Use simple, universal language that anyone can understand. Avoid medical jargon.`
          },
          { role: "user", content: validatedData.medicine }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('XAI API error in medicine search', { 
        requestId,
        status: response.status,
        error: errorText 
      });
      
      if (response.status === 429) {
        return NextResponse.json({ error: "Service is busy, please try again later" }, { status: 429 });
      }
      
      return NextResponse.json({ error: "Medicine information temporarily unavailable" }, { status: 503 });
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content;
    
    if (!result) {
      logger.error('Empty medicine response', { requestId, data });
      return NextResponse.json({ error: "Unable to find medicine information" }, { status: 500 });
    }

    logger.info('Medicine search success', { 
      requestId,
      responseLength: result.length 
    });

    return NextResponse.json({ result });

  } catch (error: any) {
    // Handle validation errors specifically
    if (error.message?.includes('Validation failed')) {
      logger.warn('Medicine validation failed', { requestId, error: error.message });
      return NextResponse.json({ error: error.message.replace('Validation failed: ', '') }, { status: 400 });
    }
    
    logger.error('Medicine endpoint error', {
      requestId,
      error: error.message,
      stack: error.stack
    });
    
    return NextResponse.json({ 
      error: "Something went wrong, please try again" 
    }, { status: 500 });
  }
}
