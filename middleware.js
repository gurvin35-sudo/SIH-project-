import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req) {
  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET || 'ayushcase-sih-2026-secret-key-super-secure-hash',
    });

    const { pathname } = req.nextUrl;

    const protectedPaths = ['/dashboard', '/patients', '/case-taking'];
    const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

    if (isProtected && !token) {
      const loginUrl = new URL('/login', req.url);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  } catch (error) {
    // If anything fails in edge middleware, allow navigation to prevent 500 error
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/patients/:path*', '/case-taking/:path*'],
};
