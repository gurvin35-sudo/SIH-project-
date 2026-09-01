import { withAuth } from 'next-auth/middleware';

export default withAuth({
  secret: process.env.NEXTAUTH_SECRET || 'ayushcase-sih-2026-secret-key-super-secure-hash',
  pages: {
    signIn: '/login',
  },
});

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/patients/:path*',
    '/case-taking/:path*',
    '/cases/:path*',
  ],
};
