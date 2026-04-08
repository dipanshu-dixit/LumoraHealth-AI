import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  const cookieStore = await cookies();
  const existingToken = cookieStore.get('csrf_token');

  if (existingToken && existingToken.value) {
    return NextResponse.json({ csrfToken: existingToken.value });
  }

  const token = randomBytes(32).toString('hex');
  const response = NextResponse.json({ csrfToken: token });

  // Set HttpOnly cookie for server-side validation
  response.cookies.set('csrf_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 15 * 60 // 15 minutes TTL as per SECURITY.md
  });

  return response;
}
