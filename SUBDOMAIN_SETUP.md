# Subdomain Multi-Tenant Setup Guide

## Overview

This application now supports subdomain-based multi-tenancy. Each tenant gets their own subdomain (e.g., `rancour.rosterbhai.me`) where they can access their employee and admin dashboards.

## Key Features

### Subdomain Routing
- **Tenant Subdomains**: `{tenant-slug}.rosterbhai.me`
  - Access employee dashboard: `{tenant-slug}.rosterbhai.me/employee`
  - Access admin dashboard: `{tenant-slug}.rosterbhai.me/admin`
  - Root subdomain redirects to `/employee`

- **Main Domain**: `rosterbhai.me`
  - Access developer portal: `rosterbhai.me/developer`
  - Marketing pages: `rosterbhai.me`, `rosterbhai.me/about`, `rosterbhai.me/pricing`

### Route Protection
- ✅ Tenant subdomains **can** access: `/employee`, `/admin`
- ❌ Tenant subdomains **cannot** access: `/developer`
- ✅ Main domain **can** access: `/developer`, marketing pages
- ❌ Main domain **cannot** access: `/employee`, `/admin`

## Local Development Testing

### Prerequisites
1. Install dependencies: `npm install`
2. Create `.env.local` file with `APP_SECRET=your_secret_key`
3. Initialize the system with a developer account and tenant

### Testing Subdomains on Localhost

#### Method 1: Using `/etc/hosts` (Recommended)

1. **Edit your hosts file**:
   ```bash
   # On macOS/Linux
   sudo nano /etc/hosts
   
   # On Windows
   # Edit C:\Windows\System32\drivers\etc\hosts as Administrator
   ```

2. **Add subdomain entries**:
   ```
   127.0.0.1  localhost
   127.0.0.1  rancour.localhost
   127.0.0.1  demo.localhost
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Test the URLs**:
   - Main domain: `http://localhost:3000`
   - Developer portal: `http://localhost:3000/developer`
   - Tenant subdomain (rancour): `http://rancour.localhost:3000`
   - Tenant employee dashboard: `http://rancour.localhost:3000/employee`
   - Tenant admin dashboard: `http://rancour.localhost:3000/admin`

#### Method 2: Browser Extensions
- Use browser extensions like **subdomain.localhost** to handle subdomain routing
- This is less reliable and may not work in all browsers

### Creating a Test Tenant

1. **Create developer account** (if not already done):
   ```bash
   npm run setup
   ```

2. **Login to developer portal**:
   - Navigate to `http://localhost:3000/developer/login`
   - Use the developer credentials you created

3. **Create a tenant**:
   - Go to developer dashboard
   - Click "Create New Tenant"
   - Name: `Rancour Bangladesh`
   - Slug: `rancour` (this will be the subdomain)
   - Save the tenant

4. **Create admin user for the tenant**:
   - In the developer dashboard, select the tenant
   - Add an admin user with username and password

### Testing the Flow

#### Test 1: Main Domain Routes
```bash
# Should work
✅ http://localhost:3000/developer
✅ http://localhost:3000/developer/dashboard

# Should redirect to /
❌ http://localhost:3000/employee
❌ http://localhost:3000/admin
```

#### Test 2: Tenant Subdomain Routes
```bash
# Should redirect to /employee
✅ http://rancour.localhost:3000/

# Should work
✅ http://rancour.localhost:3000/employee
✅ http://rancour.localhost:3000/admin

# Should redirect to /employee
❌ http://rancour.localhost:3000/developer
```

#### Test 3: Login and Authentication
1. **Employee Login**:
   - Go to `http://rancour.localhost:3000/employee`
   - Enter employee ID and password
   - Should see employee dashboard

2. **Admin Login**:
   - Go to `http://rancour.localhost:3000/admin`
   - Enter admin username and password
   - Should see admin dashboard

## Production Deployment

### Cloudflare DNS Setup

1. **Add wildcard DNS record**:
   - Log in to Cloudflare
   - Go to DNS settings for `rosterbhai.me`
   - Add a new CNAME record:
     - Name: `*` (wildcard)
     - Target: `rosterbhai.me` (or your server IP/domain)
     - Proxy status: DNS only (or Proxied, based on your needs)

2. **Add root domain A record**:
   - Name: `@`
   - Type: `A`
   - Content: Your server IP address
   - Proxy status: Proxied (recommended for Cloudflare protection)

### Server Configuration

#### Next.js Standalone Server
```bash
# Build the application
npm run build

# Start production server
npm start
```

The server will automatically handle subdomain routing.

#### Using a Reverse Proxy (Nginx)
```nginx
server {
    listen 80;
    server_name rosterbhai.me *.rosterbhai.me;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Environment Variables
Create `.env.production` with:
```env
APP_SECRET=your_production_secret_key_here
NODE_ENV=production
```

## Tenant Management

### Creating Tenants
1. Login to developer portal at `rosterbhai.me/developer`
2. Click "Create New Tenant"
3. Fill in:
   - Name: Display name for the tenant
   - Slug: Unique identifier (becomes the subdomain)
4. The tenant can now be accessed at `{slug}.rosterbhai.me`

### Managing Tenant Users
1. Navigate to the tenant in developer dashboard
2. Add admin users who can manage the tenant
3. Admin users login at `{slug}.rosterbhai.me/admin`

### Managing Employees
1. Admins can add employees through the admin dashboard
2. Employees login at `{slug}.rosterbhai.me/employee`

## Troubleshooting

### Subdomain not working on localhost
- Ensure `/etc/hosts` has the subdomain entry
- Clear browser cache and cookies
- Try a different browser
- Restart the dev server

### 404 on subdomain routes
- Check that the tenant exists in the database
- Verify the slug matches exactly
- Check middleware configuration

### Authentication issues
- Verify cookies are being set for the correct domain
- Check that the tenant is active
- Ensure admin/employee exists in the tenant's data

### Production subdomain issues
- Verify DNS records are propagated (use `dig {subdomain}.rosterbhai.me`)
- Check reverse proxy configuration
- Ensure wildcard SSL certificate is configured

## Architecture Notes

### How it Works
1. **Middleware** (`middleware.ts`):
   - Extracts subdomain from hostname
   - Routes requests based on subdomain presence
   - Enforces route protection rules

2. **Subdomain Utility** (`lib/subdomain.ts`):
   - Parses hostname to extract subdomain
   - Resolves tenant from subdomain slug
   - Works in both development and production

3. **API Routes**:
   - All tenant-aware APIs use subdomain to determine context
   - No need to pass tenant ID in request body
   - Automatic tenant isolation

### Security Considerations
- Each tenant's data is completely isolated
- Session cookies are scoped to the subdomain
- Middleware prevents cross-tenant access
- Admin users can only access their own tenant's data

## Next Steps
- [ ] Set up wildcard SSL certificate for production
- [ ] Configure CDN/caching rules for static assets
- [ ] Set up monitoring for subdomain routes
- [ ] Implement rate limiting per tenant
- [ ] Add custom domain support for tenants
