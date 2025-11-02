import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Extract subdomain from hostname
 * Returns null if no subdomain or if it's www
 */
function getSubdomain(hostname: string): string | null {
  // For localhost testing: handle localhost:3000 format
  if (hostname.includes('localhost')) {
    // Check for subdomain.localhost format (e.g., rancour.localhost:3000)
    const parts = hostname.split('.');
    if (parts.length >= 2 && parts[0] !== 'localhost') {
      return parts[0];
    }
    return null;
  }
  
  // For production: handle rosterbhai.me and subdomains
  const parts = hostname.split('.');
  
  // If we have at least 3 parts (subdomain.rosterbhai.me), extract subdomain
  if (parts.length >= 3) {
    const subdomain = parts[0];
    // Ignore www subdomain
    if (subdomain === 'www') {
      return null;
    }
    return subdomain;
  }
  
  return null;
}

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const path = url.pathname;
  const hostname = req.headers.get('host') || '';
  const subdomain = getSubdomain(hostname);
  
  // Determine if this is a tenant subdomain or main domain
  const isTenantSubdomain = subdomain !== null;
  const isMainDomain = !isTenantSubdomain;
  
  // Route protection: Tenant subdomains cannot access /developer
  if (isTenantSubdomain && path.startsWith('/developer')) {
    // Redirect to employee login or dashboard
    url.pathname = '/employee';
    return NextResponse.redirect(url);
  }
  
  // Route protection: Main domain cannot access /employee or /admin
  if (isMainDomain && (path.startsWith('/employee') || path.startsWith('/admin'))) {
    // Redirect to main landing page
    url.pathname = '/';
    return NextResponse.redirect(url);
  }
  
  // Redirect subdomain root to /employee
  if (isTenantSubdomain && path === '/') {
    url.pathname = '/employee';
    return NextResponse.redirect(url);
  }
  
  // Handle developer routes (only on main domain)
  if (path.startsWith('/developer')) {
    // Allow login page always
    if (path.startsWith('/developer/login')) return NextResponse.next();
    
    // Check developer session
    const devSession = req.cookies.get('developer_session_v1');
    if (!devSession) {
      url.pathname = '/developer/login';
      return NextResponse.redirect(url);
    }
    
    return NextResponse.next();
  }
  
  // Handle admin routes (only on tenant subdomains)
  if (path.startsWith('/admin')) {
    // Allow login page always
    if (path.startsWith('/admin/login')) return NextResponse.next();

    // Read cookie
    const session = req.cookies.get('admin_session_v1');
    if (!session) {
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }
  
  // Handle employee routes (only on tenant subdomains)
  if (path.startsWith('/employee')) {
    // Employee route doesn't require auth check here
    // Auth is handled in the page component
    return NextResponse.next();
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/admin/:path*', 
    '/developer/:path*',
    '/employee/:path*'
  ]
};