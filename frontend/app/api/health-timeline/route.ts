import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { chats } = await req.json();

    if (!chats || !Array.isArray(chats)) {
      return NextResponse.json({ error: 'Invalid chats data' }, { status: 400 });
    }

    const conversationText = chats.map(chat => {
      const timestamp = new Date(chat.timestamp).toISOString();
      const messages = chat.messages.map((m: any) => `${m.isUser ? 'User' : 'AI'}: ${m.content}`).join('\n');
      return `[${timestamp}] ${messages}`;
    }).join('\n\n');

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.XAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'grok-2-latest',
        messages: [{
          role: 'system',
          content: 'Extract health data from conversations. Return only valid JSON. For insights, provide ACTIONABLE self-care recommendations (hydration, sleep, exercise, stress management, diet changes) instead of saying "consult a doctor". Only suggest medical consultation if symptoms are severe or dangerous. Format: {"symptoms": [{"name": "string", "dates": ["ISO date"], "severity": [1-10]}], "medications": [{"name": "string", "startDate": "ISO date", "frequency": "string"}], "lifestyle": {"sleep": [], "exercise": [], "stress": []}, "insights": [{"pattern": "string", "recommendation": "actionable self-care advice", "confidence": 0-1, "category": "symptom"}]}'
        }, {
          role: 'user',
          content: conversationText.substring(0, 8000)
        }],
        temperature: 0.3,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error('Grok API failed');
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '{}';
    
    let extracted;
    try {
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      extracted = JSON.parse(cleaned);
    } catch {
      extracted = { symptoms: [], medications: [], lifestyle: { sleep: [], exercise: [], stress: [] }, insights: [] };
    }

    return NextResponse.json(extracted);
  } catch (error) {
    console.error('Health timeline extraction error:', error);
    return NextResponse.json({
      symptoms: [],
      medications: [],
      lifestyle: { sleep: [], exercise: [], stress: [] },
      insights: []
    });
  }
}
