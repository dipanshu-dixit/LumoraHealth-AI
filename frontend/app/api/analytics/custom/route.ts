import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const metric = await req.json();
    
    if (process.env.NODE_ENV === 'development') {
      const sanitized = {
        name: String(metric.name || '').replace(/[\r\n]/g, ''),
        value: metric.value,
        metadata: JSON.stringify(metric.metadata || {})
      };
      console.log('[Custom Metric]', sanitized.name, sanitized.value, sanitized.metadata);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Custom Metric] Error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
