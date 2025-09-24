import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';

// Protected admin routes that require authentication
const protectedRoutes = [
  '/admin',
  '/admin/books',
  '/admin/ebooks',
  '/admin/users',
  '/admin/analytics',
  '/admin/settings',
  '/admin/content',
  '/admin/chats',
  '/admin/posters',
  '/admin/projects',
  '/admin/purchased-books',
  '/admin/payment-settings',
  '/admin/slideshow-settings',
  '/admin/team',
  '/admin/announcements'
];

// Public routes that don't require authentication
const publicRoutes = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password'
];

// Create internationalization middleware
const intlMiddleware = createMiddleware({
  locales: ['en', 'ta'],
  defaultLocale: 'en',
  pathnames: {
    '/': '/',
    '/dashboard': '/dashboard',
    '/auth/login': '/auth/login',
    '/books': '/books',
    '/ebooks': '/ebooks',
    '/users': '/users',
    '/analytics': '/analytics',
    '/settings': '/settings',
    '/profile': '/profile',
    '/books/[id]': '/books/[id]',
    '/ebooks/[id]': '/ebooks/[id]',
    '/users/[id]': '/users/[id]',
    '/categories/[...slug]': '/categories/[...slug]'
  },
  localeDetection: true,
  localePrefix: 'as-needed'
});

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for API routes - let them handle themselves
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }
  
  // Skip middleware for auth routes - let them handle themselves
  if (pathname.startsWith('/auth/')) {
    return NextResponse.next();
  }
  
  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
  
  // Check if the route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
  
  // If it's a protected route, check for authentication
  if (isProtectedRoute && !isPublicRoute) {
    const token = request.cookies.get('admin-token')?.value;
    
    if (!token) {
      // Redirect to login if no token
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // Verify token (basic check - in production, verify JWT signature)
    try {
      // For now, just check if token exists
      // In production, decode and verify JWT token here
      if (!token || token.length < 10) {
        throw new Error('Invalid token');
      }
    } catch (error) {
      // Invalid token, redirect to login
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  // Apply internationalization middleware
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Enable a redirect to a matching locale at the root
    // '/',
    
    // Set a cookie to remember the previous locale for all requests that have a locale prefix
    '/(ta|en)/:path*',
    
    // Enable redirects that add missing locales
    // Exclude API routes, static files, and Next.js internals
    '/((?!api|_next|_vercel|.*\\..*).*)',
    
    // Match all admin pathnames except auth routes
    '/admin/:path*'
  ]
};