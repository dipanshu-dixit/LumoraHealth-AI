import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const rateLimit = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 30;
const WINDOW = 60 * 1000;

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Security headers for all requests
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // HTTPS enforcement in production
  if (process.env.NODE_ENV === 'production') {
    const proto = request.headers.get('x-forwarded-proto');
    if (proto && proto !== 'https') {
      return NextResponse.redirect(`https://${request.headers.get('host')}${request.nextUrl.pathname}`, 301);
    }
  }

  // Rate limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = request.ip || 'anonymous';
    const now = Date.now();
    const userLimit = rateLimit.get(ip);

    if (!userLimit || now > userLimit.resetTime) {
      rateLimit.set(ip, { count: 1, resetTime: now + WINDOW });
    } else {
      userLimit.count++;
      if (userLimit.count > RATE_LIMIT) {
        return new NextResponse('Too many requests', { status: 429 });
      }
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
