# Admin Login Fix - Tenant Context Resolution

## Problem
Admin credentials created through the developer portal (tenant creation) were not working for login at `/admin/login`. The credentials existed in the tenant-specific `admin_users.json` file but authentication was failing.

## Root Cause
The admin login route (`app/api/admin/login/route.ts`) was calling `validateAdminLogin(username, password)` without passing the `tenantId` parameter. This caused the authentication to only check the legacy `admin_users.json` file instead of the tenant-specific file at `data/tenants/{tenant-id}/admin_users.json`.

## Solution Implemented

### 1. Created Admin Lookup Helper (`lib/adminLookup.ts`)
New utility file that searches across all active tenants to find which tenant an admin user belongs to:

```typescript
export function findAdminTenant(username: string): string | null {
  // Searches all active tenants
  // Returns tenant ID if admin user found
  // Returns null if not found
}
```

### 2. Updated Admin Login Route (`app/api/admin/login/route.ts`)
Modified the login flow to:
1. Find which tenant the admin belongs to using `findAdminTenant(username)`
2. Pass the tenant ID to `validateAdminLogin(username, password, tenantId)`
3. Store the tenant ID in the session via `createSession(username, tenantId)`

**Before:**
```typescript
if (validateAdminLogin(username, password)) {
  createSession(username);
  return NextResponse.json({ success: true });
}
```

**After:**
```typescript
const tenantId = findAdminTenant(username);

if (validateAdminLogin(username, password, tenantId || undefined)) {
  createSession(username, tenantId || undefined);
  return NextResponse.json({ success: true });
}
```

## How It Works

1. **Admin attempts login** with username "admin" and password "1234"
2. **findAdminTenant()** searches all active tenants:
   - Checks `data/tenants/8f44271b-dafc-466c-b350-3aba555097f6/admin_users.json`
   - Finds username "admin" in the test tenant
   - Returns tenant ID: "8f44271b-dafc-466c-b350-3aba555097f6"
3. **validateAdminLogin()** checks credentials:
   - Uses tenant ID to load correct admin_users.json file
   - Verifies password matches
   - Returns true
4. **createSession()** creates authenticated session:
   - Stores username: "admin"
   - Stores tenantId: "8f44271b-dafc-466c-b350-3aba555097f6"
   - Sets HTTP-only cookie
5. **Admin dashboard** loads with tenant context:
   - All data operations use tenant-scoped files
   - Admin only sees/manages their tenant's data

## Testing

### Test Case: Tenant Admin Login
1. Navigate to http://localhost:3000/admin/login
2. Enter credentials:
   - Username: `admin`
   - Password: `1234`
3. Click "Sign In"
4. Should successfully log in to admin dashboard
5. Session cookie contains tenant context

### Verification
Check that session includes tenant ID:
```typescript
// In any server component/API route
import { getSessionTenantId } from '@/lib/auth';
const tenantId = getSessionTenantId(); // Should return "8f44271b-dafc-466c-b350-3aba555097f6"
```

## Files Modified
- ✅ `lib/adminLookup.ts` (new file)
- ✅ `app/api/admin/login/route.ts` (updated)

## Files Already Supporting Tenant Context
- ✅ `lib/auth.ts` - Session management with tenant ID
- ✅ `lib/dataStore.tenant.ts` - Tenant-scoped data operations
- ✅ `lib/tenants.ts` - Tenant management functions

## Benefits
- ✅ Admin credentials from tenant creation now work
- ✅ Multi-tenant isolation maintained
- ✅ Session includes tenant context for all operations
- ✅ Backward compatible with legacy admin users (no tenant ID)
- ✅ Security maintained - only active tenants checked

## Next Steps (Optional Future Enhancements)
- Consider adding tenant selector on login page for admins belonging to multiple tenants
- Update all API routes to use tenant-scoped data functions
- Add tenant branding/customization in admin dashboard
- Implement tenant-specific settings and configurations
