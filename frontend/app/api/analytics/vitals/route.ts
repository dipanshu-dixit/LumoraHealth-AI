import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface Metric {
  name: string;
  value: number;
  timestamp: number;
}

const metrics: Metric[] = [];
const MAX_METRICS = 1000;

export async function POST(req: Request) {
  try {
    const metric = await req.json();
    
    if (!metric.timestamp) {
      metric.timestamp = Date.now();
    }

    metrics.push(metric);
    
    if (metrics.length > MAX_METRICS) {
      metrics.shift();
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', metric.name, metric.value);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function GET() {
  const summary = {
    total: metrics.length,
    byName: metrics.reduce((acc: Record<string, number>, m) => {
      acc[m.name] = (acc[m.name] || 0) + 1;
      return acc;
    }, {}),
    recent: metrics.slice(-10)
  };

  return NextResponse.json(summary);
}
