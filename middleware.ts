import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'df30df98ddff45b2dcc6ec26df64e6b48669620cb6e4e4f477b8b35a738421c8';

function withCorsHeaders(res: NextResponse) {
  res.headers.set('Access-Control-Allow-Credentials', 'true');
  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT,OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, ngrok-skip-browser-warning');
  return res;
}

export async function middleware(req: NextRequest) {
  if (req.method === 'OPTIONS') {
    return withCorsHeaders(new NextResponse(null, { status: 200 }));
  }

  // Handle /api routes
  if (req.nextUrl.pathname.startsWith('/api/')) {
    const authHeader = req.headers.get('authorization');
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (token) {
      try {
        const secret = new TextEncoder().encode(JWT_SECRET);
        const { payload } = await jose.jwtVerify(token, secret);
        
        const requestHeaders = new Headers(req.headers);
        if (payload.userId) {
          requestHeaders.set('x-user-id', String(payload.userId));
        }
        if (payload.email) {
          requestHeaders.set('x-user-email', String(payload.email));
        }
        if (payload.isAdmin !== undefined) {
          requestHeaders.set('x-user-is-admin', String(payload.isAdmin));
        }

        const res = NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
        return withCorsHeaders(res);
      } catch (error) {
        return withCorsHeaders(NextResponse.json({ error: 'Invalid token' }, { status: 401 }));
      }
    }

    // Strictly protected routes that require authentication at the middleware level
    if (req.nextUrl.pathname.startsWith('/api/admin/')) {
      return withCorsHeaders(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
    }

    return withCorsHeaders(NextResponse.next());
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
