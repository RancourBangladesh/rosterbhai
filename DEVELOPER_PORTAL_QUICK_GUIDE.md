# Developer Portal - Quick Reference Guide

## 🚀 Access Developer Portal
**URL**: `http://localhost:3000/developer/login`

---

## 📊 Dashboard Features

### Statistics Overview
```
┌─────────────────────────────────────────────────────┐
│  Total Tenants | Active Tenants | Total Users | Employees  │
│       5        |       4        |     12      |    245      │
└─────────────────────────────────────────────────────┘
```

### Tenant Cards
```
┌────────────────────────────────────────────┐
│  [Logo]  Acme Corporation     [Active]     │
│          @acme-corp                        │
│          Created: Nov 1, 2025              │
│                                            │
│  👤 3 users / 10  👥 45 employees / 100   │
│                                            │
│  [Manage] [Deactivate]                    │
└────────────────────────────────────────────┘
```

---

## 🎛️ Tenant Management Page

### Navigation Tabs
```
[Overview] [Admin Users] [Employees] [Data Management] [Settings]
```

### 1. Overview Tab
**Quick Stats:**
- 👤 Admin Users count (with limit)
- 👥 Total Employees (with limit)
- ✅ Active Employees
- 📅 Creation Date

**Tenant Information:**
- Tenant Name
- Slug (@identifier)
- Organization Name
- Status (Active/Inactive)

### 2. Admin Users Tab
**Actions:**
- ➕ Add Admin User button

**User Table:**
```
┌────────────┬──────────────┬────────┬─────────────┬──────────┐
│ Username   │ Full Name    │ Role   │ Created     │ Actions  │
├────────────┼──────────────┼────────┼─────────────┼──────────┤
│ admin      │ John Doe     │ admin  │ Nov 1, 2025 │ [Delete] │
│ manager    │ Jane Smith   │ admin  │ Nov 2, 2025 │ [Delete] │
└────────────┴──────────────┴────────┴─────────────┴──────────┘
```

**Add User Modal:**
```
┌─────────────────────────────────────────┐
│  Create Admin User                      │
│                                         │
│  Username: [____________]               │
│  Password: [____________] [👁️]         │
│  Full Name: [____________]              │
│  Role: [Admin ▼]                       │
│                                         │
│  [Create User] [Cancel]                │
└─────────────────────────────────────────┘
```

### 3. Employees Tab
**Employee Table:**
```
┌─────────────┬───────────────┬─────────┬──────────┬─────────────┐
│ Employee ID │ Name          │ Team    │ Status   │ Actions     │
├─────────────┼───────────────┼─────────┼──────────┼─────────────┤
│ 9150        │ Alice Johnson │ Team A  │ Active   │ [Deactivate]│
│ 9151        │ Bob Wilson    │ Team B  │ Inactive │ [Activate]  │
└─────────────┴───────────────┴─────────┴──────────┴─────────────┘
```

### 4. Data Management Tab
**Action Cards:**
```
┌──────────────────────────────────────────┐
│  📥 Export Data                          │
│  Download complete tenant data backup    │
│  in JSON format                          │
│  [Export All Data]                       │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│  🔄 Refresh Cache                        │
│  Clear and reload tenant data from       │
│  storage                                 │
│  [Refresh Data]                          │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│  🗑️ Reset Tenant Data                   │
│  ⚠️ Permanently delete all tenant data.  │
│  This cannot be undone!                  │
│  [Reset All Data]                        │
└──────────────────────────────────────────┘
```

### 5. Settings Tab
**Editable Fields:**
```
Basic Information
─────────────────
Tenant Name:        [Acme Corporation      ]
Slug:               [acme-corp             ]
Organization Name:  [Acme Corp             ]

Limits
──────
Max Admin Users:    [10                    ] (unlimited if empty)
Max Employees:      [100                   ] (unlimited if empty)

Status
──────
[✓] Tenant is Active
```

---

## 🔧 Common Operations

### Creating a New Tenant
1. Click **"Create Tenant"** on dashboard
2. Fill in tenant details:
   - Name, Slug, Limits
   - Admin credentials
3. Click **"Create Tenant"**
4. Save displayed credentials (won't be shown again!)

### Adding Admin User
1. Go to tenant → **Admin Users** tab
2. Click **"Add Admin User"**
3. Enter username, password, full name, role
4. Click **"Create User"**

### Exporting Tenant Data
1. Go to tenant → **Data Management** tab
2. Click **"Export All Data"**
3. JSON file downloads automatically
4. File name: `tenant-{slug}-export-{date}.json`

### Resetting Tenant Data
1. Go to tenant → **Data Management** tab
2. Click **"Reset All Data"**
3. Confirm in dialog
4. Type **"RESET"** to proceed
5. ⚠️ **WARNING**: This is irreversible!

### Editing Tenant Settings
1. Go to tenant → **Settings** tab
2. Click **"Edit Tenant"** in header
3. Modify fields as needed
4. Click **"Save Changes"**

### Activating/Deactivating Tenant
1. From dashboard, click tenant's **[Deactivate]** button
   OR
2. From tenant settings, uncheck **"Tenant is Active"**

### Managing Employee Status
1. Go to tenant → **Employees** tab
2. Find employee in table
3. Click **[Activate]** or **[Deactivate]**

---

## 📦 Export Data Format

```json
{
  "tenant": {
    "id": "uuid-here",
    "name": "Acme Corporation",
    "slug": "acme-corp",
    "created_at": "2025-11-01T...",
    "is_active": true,
    "settings": {
      "max_users": 10,
      "max_employees": 100,
      "organization_name": "Acme Corp"
    }
  },
  "admin_users": [
    {
      "username": "admin",
      "full_name": "John Doe",
      "role": "admin",
      "created_at": "2025-11-01T..."
    }
  ],
  "employees": [ /* all employees */ ],
  "schedule_requests": {
    "shift_change_requests": [ /* ... */ ],
    "swap_requests": [ /* ... */ ],
    "stats": { /* counts */ }
  },
  "modified_shifts": [ /* modifications */ ],
  "export_metadata": {
    "exported_at": "2025-11-02T...",
    "exported_by": "developer",
    "version": "1.0"
  }
}
```

---

## 🎨 Status Color Codes

| Status | Color | Badge |
|--------|-------|-------|
| Active Tenant | Green | `[Active]` |
| Inactive Tenant | Red | `[Inactive]` |
| Admin User | Blue | `admin` |
| Active Employee | Green | `Active` |
| Inactive Employee | Red | `Inactive` |

---

## ⚠️ Important Warnings

### Data Reset
```
⚠️ WARNING: This will reset ALL tenant data including 
employees, schedules, and requests. This action 
cannot be undone. Are you sure?

Type "RESET" to confirm: [________]
```

### Password Security
- Passwords are hidden by default
- Click 👁️ icon to toggle visibility
- Passwords NOT included in exports

### Tenant Limits
- Leave blank for unlimited
- Users can't exceed max_users limit
- Employees can't exceed max_employees limit

---

## 🔐 Security Notes

✅ **All operations require developer authentication**
✅ **Confirmation required for destructive actions**
✅ **Audit trail maintained for all changes**
✅ **Passwords never exported**
✅ **Visual warnings for dangerous operations**

---

## 📞 Support Scenarios

### Tenant Locked Out
1. Go to tenant management
2. Add new admin user
3. Share credentials securely

### Data Corruption
1. Export current data for analysis
2. Review JSON for issues
3. Reset if needed
4. Re-import clean data (future feature)

### Employee Issues
1. Check employee status in Employees tab
2. Toggle active/inactive as needed
3. Changes apply immediately

### Exceeding Limits
1. Go to Settings tab
2. Edit max_users or max_employees
3. Increase limits as needed
4. Save changes

---

## 🚦 Status Indicators

### Dashboard
- **Green Badge**: Active tenant
- **Red Badge**: Inactive tenant
- **User Count**: Current / Max
- **Employee Count**: Current / Max

### Management Page
- **Green Alert**: Success message
- **Red Alert**: Error message
- **Loading**: Operation in progress

---

## 📋 Checklist: New Tenant Setup

- [ ] Create tenant with basic info
- [ ] Set appropriate user/employee limits
- [ ] Create first admin user account
- [ ] Save admin credentials
- [ ] Test admin login
- [ ] Verify tenant is active
- [ ] Export initial backup

---

## 🔄 Maintenance Tasks

### Daily
- Monitor active tenant count
- Check for locked accounts

### Weekly
- Export data backups for all tenants
- Review employee counts vs limits

### Monthly
- Audit admin user access
- Review inactive tenants

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Can't log in to tenant | Create emergency admin user |
| Employee not appearing | Check if employee is active |
| Tenant not accessible | Verify tenant is_active = true |
| Data looks wrong | Export → review → reset if needed |
| Exceeding limits | Edit settings → increase limits |

---

## 📊 Best Practices

1. **Always export before reset**
2. **Use descriptive admin usernames**
3. **Set realistic limits from start**
4. **Keep credentials secure**
5. **Document major changes**
6. **Regular data backups**
7. **Monitor employee counts**
8. **Test changes in dev first**

---

## 🎯 Key Shortcuts

- `Ctrl+Click` on tenant card → Open in new tab
- `Esc` → Close modal
- Tab navigation → Between form fields
- Enter → Submit forms

---

This developer portal provides complete control over all tenants with an intuitive, secure interface for troubleshooting and management!
