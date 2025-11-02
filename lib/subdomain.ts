import { getTenantBySlug } from './tenants';
import { Tenant } from './types';

/**
 * Extract subdomain from hostname
 * Returns null if no subdomain or if it's www
 */
export function getSubdomainFromHostname(hostname: string): string | null {
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

/**
 * Get tenant from request based on subdomain
 */
export function getTenantFromRequest(request: Request): Tenant | null {
  const hostname = new URL(request.url).hostname;
  const subdomain = getSubdomainFromHostname(hostname);
  
  if (!subdomain) {
    return null;
  }
  
  return getTenantBySlug(subdomain);
}

/**
 * Get tenant from hostname string
 */
export function getTenantFromHostname(hostname: string): Tenant | null {
  const subdomain = getSubdomainFromHostname(hostname);
  
  if (!subdomain) {
    return null;
  }
  
  return getTenantBySlug(subdomain);
}
