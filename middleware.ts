import { NextRequest, NextResponse } from 'next/server';
import { randomBytes, timingSafeEqual } from 'crypto';

// Rate limiting store (in production, use Redis)
const rateLimit = new Map<string, { count: number; resetTime: number }>();

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Healthcare-critical security headers
  const securityHeaders = {
    // Prevent XSS attacks - critical for healthcare data
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // Strict CSP - only self-hosted scripts for healthcare trust
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'", // Next.js requires unsafe-inline
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "connect-src 'self'",
      "font-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; '),
    
    // Force HTTPS for healthcare data protection
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
  };

  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // IP-based rate limiting - prevent abuse of healthcare service
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 100; // Reasonable limit for healthcare consultations

  const current = rateLimit.get(ip);
  if (!current || now > current.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + windowMs });
  } else if (current.count >= maxRequests) {
    return new NextResponse('Rate limit exceeded', { status: 429 });
  } else {
    current.count++;
  }

  // CSRF protection for state-changing operations
  const method = request.method;
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const token = request.headers.get('x-csrf-token');
    const cookie = request.cookies.get('csrf-token')?.value;
    
    if (!token || !cookie || !timingSafeEqual(
      Buffer.from(token, 'hex'),
      Buffer.from(cookie, 'hex')
    )) {
      return new NextResponse('CSRF token invalid', { status: 403 });
    }
  }

  // Generate CSRF token for new sessions
  if (!request.cookies.get('csrf-token')) {
    const csrfToken = randomBytes(32).toString('hex');
    response.cookies.set('csrf-token', csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 // 24 hours
    });
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api/health|_next/static|_next/image|favicon.ico).*)',
  ],
};