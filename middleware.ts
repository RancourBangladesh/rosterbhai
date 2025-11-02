import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSubdomainFromHostname, getTenantFromHostname } from './lib/subdomain';

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const path = url.pathname;
  const hostname = req.headers.get('host') || '';
  const subdomain = getSubdomainFromHostname(hostname);
  
  // Determine if this is a tenant subdomain or main domain
  const isTenantSubdomain = subdomain !== null;
  const isMainDomain = !isTenantSubdomain;
  
  // If subdomain detected, verify tenant exists
  if (isTenantSubdomain) {
    const tenant = getTenantFromHostname(hostname);
    
    // If tenant doesn't exist, redirect to main domain
    if (!tenant) {
      // Build main domain URL
      const mainHostname = hostname.includes('localhost') 
        ? 'localhost:3000' 
        : 'rosterbhai.me';
      const protocol = hostname.includes('localhost') ? 'http' : 'https';
      return NextResponse.redirect(new URL(`${protocol}://${mainHostname}`, req.url));
    }
    
    // Tenant exists but is inactive
    if (!tenant.is_active) {
      const mainHostname = hostname.includes('localhost') 
        ? 'localhost:3000' 
        : 'rosterbhai.me';
      const protocol = hostname.includes('localhost') ? 'http' : 'https';
      return NextResponse.redirect(new URL(`${protocol}://${mainHostname}`, req.url));
    }
    
    // For admin routes, validate that session tenant matches subdomain tenant
    if (path.startsWith('/admin') && !path.startsWith('/admin/login')) {
      const session = req.cookies.get('admin_session_v1');
      if (session) {
        try {
          const sessionData = JSON.parse(Buffer.from(session.value, 'base64').toString());
          // If session tenant doesn't match subdomain tenant, clear session and redirect to login
          if (sessionData.tenantId !== tenant.id) {
            const response = NextResponse.redirect(new URL('/admin/login', req.url));
            response.cookies.set('admin_session_v1', '', { path: '/', maxAge: 0 });
            return response;
          }
        } catch (e) {
          // Invalid session, redirect to login
          url.pathname = '/admin/login';
          return NextResponse.redirect(url);
        }
      }
    }
  }
  
  // Route protection: Tenant subdomains cannot access /developer
  if (isTenantSubdomain && path.startsWith('/developer')) {
    url.pathname = '/employee';
    return NextResponse.redirect(url);
  }
  
  // Route protection: Main domain cannot access /employee or /admin
  if (isMainDomain && (path.startsWith('/employee') || path.startsWith('/admin'))) {
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
    '/employee/:path*',
    '/about',
    '/pricing',
    '/contact',
    '/client'
  ]
};