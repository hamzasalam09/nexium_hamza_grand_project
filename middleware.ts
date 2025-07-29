import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if this is a magic link callback with localhost redirect
  if (request.nextUrl.pathname === '/' && request.nextUrl.searchParams.has('code')) {
    const code = request.nextUrl.searchParams.get('code');
    const type = request.nextUrl.searchParams.get('type');
    
    // If this is coming from localhost (magic link), redirect to our auth callback
    if (code && type === 'magiclink') {
      const callbackUrl = new URL('/api/auth/callback', request.url);
      callbackUrl.searchParams.set('code', code);
      callbackUrl.searchParams.set('type', type);
      
      return NextResponse.redirect(callbackUrl);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
