# Multi-Tenant Roster Management System

A modern, multi-tenant workforce roster management system built with Next.js (App Router + TypeScript). This system allows a single deployment to serve multiple organizations (tenants) with complete data isolation.

## 🎯 Key Features

### Multi-Tenancy
- **Complete Data Isolation**: Each tenant has their own isolated data storage
- **Developer Portal**: Central management dashboard for creating and managing tenants
- **Tenant-Scoped Authentication**: Separate login and session management per tenant
- **Flexible Architecture**: Subdomain or path-based tenant routing

### Roster Management
- **Dual Data Layers**: Google Sheets sync + Admin modifications
- **CSV Integration**: Import/export with Google Sheets published CSVs
- **Shift Management**: In-place editing, change requests, swap requests
- **Modification Tracking**: Complete audit trail with monthly statistics
- **Team Management**: Multi-team support with employee team changes

### User Roles
- **Developer**: System-level access to manage all tenants
- **Admin**: Tenant-level access to manage rosters and users
- **Employee**: View schedules, submit change requests, track history

### Employee Features
- Calendar view with shift visualization
- Today/Tomorrow quick view
- Upcoming work days
- Time-off tracking
- Shift change request submission
- Personal schedule history

### Admin Features
- Data synchronization dashboard
- Google Sheets link management
- Team and employee management
- Schedule request approval workflow
- Shift modification interface
- User management
- Monthly statistics and reporting

---

## 🏗️ Architecture

### Directory Structure

```
data/
  tenants/              # Multi-tenant data isolation
    {tenant-id}/
      admin_data.json
      google_data.json
      modified_shifts.json
      google_links.json
      schedule_requests.json
      admin_users.json
      settings.json
      roster_templates/
  tenants.json          # Tenant registry
  developers.json       # Developer users
app/
  developer/            # Developer portal
    login/
    dashboard/
  admin/                # Admin portal (tenant-scoped)
    login/
    dashboard/
  api/
    developer/          # Developer API routes
    admin/              # Admin API routes (tenant-scoped)
  page.tsx              # Employee dashboard
components/
lib/
  tenants.ts            # Tenant management
  auth.ts               # Multi-role authentication
  dataStore.ts          # Data access layer
  dataStore.tenant.ts   # Tenant-scoped operations
  dataStore.legacy.ts   # Legacy compatibility
styles/
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd multi-tenant-roster-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   
   Create `.env.local` file:
   ```env
   APP_SECRET=your_secret_key_here
   ```

4. **Initialize system**
   
   Create initial developer user by creating `data/developers.json`:
   ```json
   {
     "developers": [
       {
         "username": "dev",
         "password": "change_this_password",
         "full_name": "System Developer",
         "role": "developer",
         "created_at": "2024-01-01T00:00:00.000Z"
       }
     ]
   }
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Access the portals**
   - Developer Portal: http://localhost:3000/developer/login
   - Admin Panel: http://localhost:3000/admin/login (after creating a tenant)
   - Employee Dashboard: http://localhost:3000

---

## 🎮 Usage

### For Developers

1. **Login to Developer Portal** at `/developer/login`
2. **Create a new tenant** with:
   - Tenant name
   - URL slug (unique identifier)
   - Optional: Maximum users and employees
3. **Manage tenants**: Activate/deactivate, view statistics
4. **Create admin users** for each tenant

### For Tenant Admins

1. **Login to Admin Panel** at `/admin/login`
2. **Configure data sources**:
   - Add Google Sheets CSV links
   - Import roster data
   - Set up teams and employees
3. **Manage schedules**:
   - Edit shifts
   - Approve/reject change requests
   - Track modifications
4. **Manage users**: Add/remove admin users for your tenant

### For Employees

1. **Access dashboard** at root URL
2. **Enter employee ID** to view schedule
3. **View shift information**: Today, tomorrow, upcoming days
4. **Submit requests**: Change shifts or swap with colleagues
5. **Track history**: View all submitted requests and their status

---

## 📊 Data Isolation

Each tenant's data is completely isolated:

- **Separate directories**: `data/tenants/{tenant-id}/`
- **Independent authentication**: Tenant-scoped admin sessions
- **No data leakage**: API routes verify tenant context
- **Cache isolation**: In-memory caches are tenant-specific

---

## 🔐 Security

### Authentication Levels

1. **Developer**: System-wide access, manages all tenants
2. **Admin**: Tenant-scoped access, manages single tenant
3. **Employee**: Read-only access to personal schedule

### Session Management

- HTTP-only cookies for session tokens
- HMAC-SHA256 signature verification
- 8-hour session expiration
- Separate cookie namespaces per role

### Best Practices

- Change default developer password immediately
- Use strong `APP_SECRET` in production
- Implement HTTPS in production
- Regularly audit user access
- Consider implementing rate limiting

---

## 🔧 Configuration

### Shift Codes

Default shift codes (configurable in `lib/constants.ts`):

| Code | Description |
|------|-------------|
| M2   | 8 AM – 5 PM |
| M3   | 9 AM – 6 PM |
| M4   | 10 AM – 7 PM |
| D1   | 12 PM – 9 PM |
| D2   | 1 PM – 10 PM |
| DO   | Day Off |
| SL   | Sick Leave |
| CL   | Casual Leave |
| EL   | Emergency Leave |
| HL   | Holiday Leave |

### Tenant Settings

Each tenant can configure:
- Maximum users (admins)
- Maximum employees
- Auto-sync settings
- Custom roster templates

---

## 📦 Deployment

### Production Build

```bash
npm run build
npm start
```

### Environment Variables

Required for production:
```env
APP_SECRET=generate_a_strong_random_secret
NODE_ENV=production
```

### Recommended Hosting

- Vercel (easiest deployment)
- AWS EC2 / Azure VM
- Docker container
- Any Node.js hosting platform

---

## 🛠️ Development

### Adding New Features

1. **Tenant-aware features**: Always use `*ForTenant()` functions
2. **API routes**: Verify tenant context with `requireTenantAdmin()`
3. **UI components**: Pass `tenantId` prop where needed
4. **Data operations**: Use `dataStore.tenant.ts` functions

### Testing Multi-Tenancy

1. Create multiple test tenants
2. Create users in each tenant
3. Verify data isolation between tenants
4. Test tenant switching scenarios

---

## 📝 Migration from Single-Tenant

If migrating from an older single-tenant version:

1. Existing data files remain in `data/` directory
2. Legacy functions still work for backward compatibility
3. Gradually migrate to tenant-scoped functions
4. Move data to `data/tenants/{new-tenant-id}/` when ready

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

[Add your license here]

---

## 🆘 Support

For issues and questions:
- Create a GitHub issue
- Check existing documentation
- Review the code comments

---

## 🗺️ Roadmap

Future enhancements:
- [ ] Database backend option (PostgreSQL, MySQL)
- [ ] Email notifications
- [ ] Mobile app
- [ ] Advanced reporting and analytics
- [ ] Integration with HR systems
- [ ] Custom shift templates per tenant
- [ ] API access for third-party integrations
- [ ] Audit log export
- [ ] Multi-language support

- Not production hardened (no hashing, RBAC, rate limiting).
- Add proper auth (NextAuth/JWT), validation (zod), and DB (Postgres) before production.
- Consider locking request spam & input sanitization.

---

## Extending

- Add historical month filters to modified shifts tab.
- Add per-user dashboards for request status breakdown.
- Migrate JSON persistence to a database layer.

---

## Scripts

| Script | Description |
|--------|-------------|
| dev | Start Next.js dev server |
| build | Production build |
| start | Start production server |

---

## License

MIT (adapt as needed).

---

## Credits

Original Flask implementation by you. Port & refactor scaffold generated via AI assistance.
