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
  
  // TENANT SUBDOMAIN LOGIC
  if (isTenantSubdomain) {
    // Redirect subdomain root to /employee
    if (path === '/') {
      url.pathname = '/employee';
      return NextResponse.redirect(url);
    }
    
    // Route protection: Tenant subdomains cannot access /developer
    if (path.startsWith('/developer')) {
      url.pathname = '/employee';
      return NextResponse.redirect(url);
    }
    
    // Route protection: Tenant subdomains cannot access marketing pages
    if (path === '/about' || path === '/pricing' || path === '/contact' || path === '/client') {
      url.pathname = '/employee';
      return NextResponse.redirect(url);
    }
    
    // Allow employee and admin pages through
    // Tenant validation will be done in the API routes/pages
    if (path.startsWith('/employee') || path.startsWith('/admin')) {
      return NextResponse.next();
    }
  }
  
  // MAIN DOMAIN LOGIC
  if (isMainDomain) {
    // Route protection: Main domain cannot access /employee or /admin
    if (path.startsWith('/employee') || path.startsWith('/admin')) {
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
    
    // Handle developer routes
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
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/admin/:path*', 
    '/developer/:path*',
    '/employee/:path*',
    '/about',
    '/pricing',
    '/contact',
    '/client'
  ]
};