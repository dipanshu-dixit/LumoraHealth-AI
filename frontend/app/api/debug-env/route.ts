import { NextResponse } from 'next/server';

export async function GET() {
  const key = process.env.XAI_API_KEY;
  return NextResponse.json({
    status: 'Debug Check',
    env: process.env.NODE_ENV,
    hasKey: !!key,
    keyPrefix: key ? key.substring(0, 4) : 'MISSING',
  });
}
