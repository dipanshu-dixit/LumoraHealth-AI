import { NextResponse } from 'next/server';
import { z } from 'zod';

const visionSchema = z.object({
  image: z.string().min(1, 'Image data required'),
  context: z.enum(['skin', 'medication', 'lab', 'food', 'posture', 'general']),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string()
  })).optional().default([]),
  userMessage: z.string().optional().default('')
});

const logger = {
  error: (msg: string, meta: any = {}) => console.error(JSON.stringify({ level: 'error', msg, ...meta })),
  info: (msg: string, meta: any = {}) => console.log(JSON.stringify({ level: 'info', msg, ...meta }))
};

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const requestId = Date.now().toString(36);
  
  try {
    const body = await req.json();
    const { image, context, history, userMessage } = visionSchema.parse(body);
    
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      logger.error('xAI API key missing', { requestId });
      return NextResponse.json({ error: "Service unavailable" }, { status: 500 });
    }

    const contextPrompts = {
      skin: "Analyze this skin condition image. Describe what you observe, possible conditions (with confidence levels), urgency assessment, and recommend next steps.",
      medication: "Extract all text from this medication label including: drug name, dosage, active ingredients, warnings, and expiration date. Format as structured data.",
      lab: "Extract and explain lab report values. Identify test names, results, reference ranges, and flag abnormal values. Explain what each test measures in simple terms.",
      food: "Analyze this food image. Estimate: calories, macros (protein/carbs/fat), key nutrients, portion size, and health rating (1-10). Suggest healthier alternatives if applicable.",
      posture: "Analyze posture in this image. Identify: alignment issues, potential problem areas, ergonomic concerns, and provide specific corrective exercises or adjustments.",
      general: "Analyze this health-related image and provide relevant medical insights."
    };

    const systemPrompt = `You are Lumora's Vision AI. ${contextPrompts[context as keyof typeof contextPrompts]}

CRITICAL SAFETY RULES:
- For urgent symptoms (severe pain, bleeding, breathing issues, chest pain, difficulty breathing): Immediately recommend emergency care with clear [URGENT] tag
- Never provide definitive diagnoses - use "possible", "may indicate", "consistent with"
- Always recommend professional consultation for any concerning findings

Be concise and focused. Format response clearly with sections and bullet points.`;

    logger.info('Vision analysis request', { requestId, context });

    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "grok-2-vision-1212",
        messages: [
          { role: "system", content: systemPrompt },
          ...history.slice(-4),
          {
            role: "user",
            content: [
              { type: "image_url", image_url: { url: image } },
              { type: "text", text: userMessage || "Analyze this image" }
            ]
          }
        ],
        max_tokens: 600,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('xAI Vision API error', { requestId, status: response.status, error: errorText });
      return NextResponse.json({ error: "Vision analysis unavailable" }, { status: 503 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      logger.error('Empty vision response', { requestId });
      return NextResponse.json({ error: "Unable to analyze image" }, { status: 500 });
    }

    logger.info('Vision analysis success', { requestId, responseLength: content.length });

    return NextResponse.json({ success: true, content, context });

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    
    logger.error('Vision endpoint error', { requestId, error: error.message });
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
