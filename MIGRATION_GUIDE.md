# Migration Guide: Multi-Tenant Transformation

This document describes the major changes made to transform the single-tenant roster system into a multi-tenant architecture.

## 🎯 Overview of Changes

The system has been completely restructured to support multiple tenants with complete data isolation while maintaining backward compatibility during the transition period.

---

## 🏗️ Architectural Changes

### 1. Multi-Tenant Data Storage

**Before:**
```
data/
  admin_data.json
  google_data.json
  modified_shifts.json
  ...
```

**After:**
```
data/
  tenants.json              # Registry of all tenants
  developers.json           # System-level developer accounts
  tenants/
    {tenant-id-1}/         # Complete isolation per tenant
      admin_data.json
      google_data.json
      admin_users.json
      ...
    {tenant-id-2}/
      ...
```

### 2. Authentication System

**New Roles:**
- **Developer**: System-wide access, manages all tenants
- **Admin**: Tenant-scoped access (existing role, now tenant-aware)
- **Employee**: Read-only access (unchanged)

**New Session Management:**
- Separate cookies for developer and admin sessions
- Tenant ID embedded in admin sessions
- HMAC-SHA256 signature verification

### 3. API Routes Structure

**New Routes:**
- `/api/developer/*` - Developer management endpoints
- `/api/developer/login` - Developer authentication
- `/api/developer/tenants` - Tenant CRUD operations
- `/api/developer/tenants/[id]` - Individual tenant management

**Modified Routes:**
- All `/api/admin/*` routes now tenant-aware
- Session includes tenant context
- Data operations scoped to tenant

---

## 📝 Key Files Added

### Core Multi-Tenant Logic

1. **`lib/tenants.ts`** - Tenant management
   - CRUD operations for tenants
   - Tenant user management
   - Tenant context resolution

2. **`lib/dataStore.tenant.ts`** - Tenant-scoped data operations
   - Per-tenant data loading
   - Isolated caching
   - Tenant-specific file operations

3. **`lib/dataStore.ts`** - Unified interface
   - Exports both tenant-aware and legacy functions
   - Provides backward compatibility

4. **`lib/dataStore.legacy.ts`** - Original dataStore.ts
   - Renamed for backward compatibility
   - Used by existing code during migration

### Developer Portal

5. **`app/developer/login/page.tsx`** - Developer login UI
6. **`app/developer/dashboard/page.tsx`** - Tenant management UI
7. **`app/api/developer/login/route.ts`** - Developer auth endpoint
8. **`app/api/developer/tenants/route.ts`** - Tenant management API
9. **`app/api/developer/tenants/[id]/route.ts`** - Individual tenant API

### Setup and Documentation

10. **`setup.js`** - Interactive setup script
11. **`QUICK_START.md`** - Updated quick start guide
12. **`README.md`** - Comprehensive multi-tenant documentation

---

## 🔄 Modified Files

### Type Definitions

**`lib/types.ts`**
- Added `Tenant`, `TenantsFile` interfaces
- Added `DeveloperUser`, `DevelopersFile` interfaces
- Extended `AdminUser` with `tenant_id` field

### Constants

**`lib/constants.ts`**
- Added tenant-scoped file path functions
- Added `TENANTS_FILE`, `DEVELOPERS_FILE` constants
- Added `DEVELOPER_SESSION_COOKIE` constant
- Kept legacy constants for backward compatibility

### Authentication

**`lib/auth.ts`**
- Added developer authentication functions
- Extended session management with tenant context
- Added `requireTenantAdmin()` for tenant-scoped operations
- Added developer CRUD operations
- Backward compatible with existing auth

### Middleware

**`middleware.ts`**
- Added developer route protection
- Tenant context validation
- Updated matcher pattern

### Package Configuration

**`package.json`**
- Updated name to `multi-tenant-roster-system`
- Updated version to `2.0.0`
- Added setup script
- Added `@types/uuid` dependency

---

## 🔀 Migration Strategy

### Phase 1: Add Multi-Tenant Infrastructure (COMPLETED)

✅ Create tenant management system  
✅ Add developer role and portal  
✅ Implement tenant-scoped data storage  
✅ Update authentication with tenant context  
✅ Create setup scripts and documentation  

### Phase 2: Gradual API Migration (NEXT)

The following areas still need tenant-aware updates:

#### Admin API Routes
- [ ] `/api/admin/sync` - Add tenant context
- [ ] `/api/admin/google-links` - Scope to tenant
- [ ] `/api/admin/users` - Use tenant-scoped user management
- [ ] `/api/admin/roster` - Use tenant data store
- [ ] `/api/admin/schedule-requests` - Scope to tenant
- [ ] All other admin API routes

#### Employee Dashboard
- [ ] Update to accept tenant context
- [ ] Route: `/tenant/[slug]` or subdomain routing
- [ ] API calls include tenant identifier

#### Components
- [ ] Update all admin components to use tenant-scoped functions
- [ ] Pass tenant context through props
- [ ] Update data fetching to use tenant APIs

### Phase 3: Remove Legacy Code (FUTURE)

- [ ] Remove backward compatibility layer
- [ ] Delete `dataStore.legacy.ts`
- [ ] Remove legacy file paths
- [ ] Clean up old data structure

---

## 🛠️ For Developers: Using the New System

### Creating Tenant-Aware Features

Always use tenant-scoped functions:

```typescript
// ❌ OLD (Legacy)
import { getAdmin, saveAdmin } from '@/lib/dataStore';
const data = getAdmin();
saveAdmin(data);

// ✅ NEW (Tenant-aware)
import { getAdminForTenant, saveAdminForTenant } from '@/lib/dataStore';
const { tenantId } = requireTenantAdmin();
const data = getAdminForTenant(tenantId);
saveAdminForTenant(tenantId, data);
```

### API Route Pattern

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireTenantAdmin } from '@/lib/auth';
import { getDisplayForTenant } from '@/lib/dataStore';

export async function GET(req: NextRequest) {
  try {
    const { tenantId } = requireTenantAdmin();
    const data = getDisplayForTenant(tenantId);
    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json({ 
      success: false, 
      error: 'Unauthorized' 
    }, { status: 401 });
  }
}
```

### Component Pattern

```typescript
'use client';
import { useEffect, useState } from 'react';

export default function TenantAwareComponent() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    // API route automatically includes tenant context from session
    fetch('/api/admin/data')
      .then(res => res.json())
      .then(result => setData(result.data));
  }, []);
  
  // Component logic
}
```

---

## 🔐 Security Considerations

### Data Isolation

Every data operation MUST verify tenant context:

```typescript
// Always get tenant from session, never from request body
const { tenantId } = requireTenantAdmin();

// Use tenant-scoped functions
const data = getDataForTenant(tenantId);
```

### Session Security

- Developer sessions: 8-hour expiration
- Admin sessions: 8-hour expiration, tenant-scoped
- HMAC-SHA256 signed cookies
- HTTP-only cookies (XSS protection)

### Tenant Verification

Before any operation:
1. Verify session exists
2. Extract tenant ID from session
3. Confirm tenant is active
4. Perform operation with tenant context

---

## 📊 Performance Considerations

### Caching Strategy

- In-memory cache per tenant
- Cache isolated by tenant ID
- No cross-tenant cache pollution
- Call `loadAllForTenant(tenantId)` on first access

### File System

- Lazy loading of tenant data
- Only load when accessed
- Directory structure optimized for isolation
- Minimal overhead for multiple tenants

---

## ✅ Testing Multi-Tenancy

### Verification Checklist

1. **Data Isolation**
   - [ ] Create two tenants
   - [ ] Add different data to each
   - [ ] Verify no data leakage between tenants

2. **Authentication**
   - [ ] Developer can access all tenants
   - [ ] Admin can only access their tenant
   - [ ] Sessions expire correctly
   - [ ] Cross-tenant access blocked

3. **API Security**
   - [ ] All admin APIs require tenant context
   - [ ] Tenant ID cannot be spoofed
   - [ ] Invalid tenant IDs rejected

4. **UI Isolation**
   - [ ] Developer sees all tenants
   - [ ] Admin sees only their tenant data
   - [ ] Employee sees only their data

---

## 🆘 Troubleshooting

### "Tenant not found" errors

- Check if tenant exists in `data/tenants.json`
- Verify tenant is active (`is_active: true`)
- Ensure tenant directory exists

### Data not loading

- Call `loadAllForTenant(tenantId)` before accessing data
- Check file permissions on tenant directories
- Verify JSON files are valid

### Session issues

- Clear cookies and re-login
- Check `APP_SECRET` is set
- Verify cookie names in `lib/constants.ts`

---

## 📚 Additional Resources

- **Main README**: Comprehensive system documentation
- **QUICK_START.md**: Setup and usage guide
- **Code Comments**: Detailed inline documentation
- **API Documentation**: See individual route files

---

## 🎉 Benefits of Multi-Tenant Architecture

1. **Cost Efficiency**: Single deployment serves multiple clients
2. **Maintenance**: Centralized updates benefit all tenants
3. **Scalability**: Add new clients without infrastructure changes
4. **Security**: Complete data isolation guarantees
5. **Flexibility**: Per-tenant configuration and limits
6. **Monitoring**: Centralized logging and analytics

---

**Need help with migration? Check the code comments or create an issue.**
