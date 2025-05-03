// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'mysecretkey';

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  console.log('Middleware invoked for:', url.pathname);

  // Allow public routes (like login or register)
  if (url.pathname.startsWith('/login') || url.pathname.startsWith('/register')) {
    console.log('Public route accessed, skipping middleware.');
    return NextResponse.next();
  }

  // Retrieve token from cookies
  const token = req.cookies.get('token')?.value;
  console.log('Token found:', token);

  if (!token) {
    console.log('No token present, redirecting to /login');
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    // jose requires the secret as a Uint8Array.
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    console.log('Decoded token payload:', payload);

    // Ensure the payload includes a 'type' field.
    const type = payload.type;
    if (!type) {
      console.log('No type in token payload, redirecting.');
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Verify access based on token type for protected routes.
    if (url.pathname.startsWith('/company') && type !== 'company') {
      console.log('Token type mismatch for /company, redirecting.');
      return NextResponse.redirect(new URL('/login', req.url));
    }
    if (url.pathname.startsWith('/user') && type !== 'user') {
      console.log('Token type mismatch for /user, redirecting.');
      return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.log('Token verification error:', error);
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = {
  matcher: ['/company/:path*', '/user/:path*', '/dashboard/:path*'],
};
