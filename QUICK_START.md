# Multi-Tenant Roster System - Quick Start Guide# Quick Start Guide - Next-Roster



## 🎯 Overview## 🚀 Get Started in 3 Minutes



This system is designed to serve multiple organizations (tenants) from a single deployment. Each tenant has:### Prerequisites

- Completely isolated data- Node.js 18+ installed

- Their own admin users- npm or yarn package manager

- Independent roster management

---

## 🚀 Quick Setup (5 minutes)

## 📦 Installation

### Step 1: Install Dependencies

```bash

```bash# Clone the repository (if not already done)

npm installgit clone https://github.com/fhrahid/next-roster.git

```cd next-roster



### Step 2: Run Setup Script# Install dependencies

npm install

```bash

node setup.js# Start development server

```npm run dev

```

This interactive script will:

- Create a developer accountThe application will be available at `http://localhost:3000`

- Optionally create a demo tenant

- Optionally create an admin user---



### Step 3: Start the Server## 🔐 Login Credentials



```bash### Client Dashboard

npm run devNavigate to: `http://localhost:3000`

```

**Test User:**

### Step 4: Access the System- Employee ID: `SLL-88717`

- Name: Efat Anan Shekh (VOICE team)

**Developer Portal:**

- URL: http://localhost:3000/developer/login### Admin Panel

- Use the credentials you created in setupNavigate to: `http://localhost:3000/admin/login`



**Admin Panel (if you created a demo tenant):****Admin Accounts:**

- URL: http://localhost:3000/admin/login| Username | Password | Role |

- Use the admin credentials you created|----------|----------|------|

| `admin` | `password123` | Super Admin |

**Employee Dashboard:**| `istiaque` | `cartup123` | Admin |

- URL: http://localhost:3000| `abbas` | `voice2024` | Team Leader (Voice) |

- Enter any employee ID to view (after you've imported roster data)

---

---

## 🎯 What to Try First

## 📋 Manual Setup (Alternative)

### Client Side (5 minutes)

If you prefer manual setup:1. **Login**: Use ID `SLL-88717`

2. **View Schedule**: See today and tomorrow's shifts

### 1. Create Developer Account3. **Open Calendar**: Click "Select Date from Calendar" button

4. **Search Employee**: Type "Abbas" and select him

Create `data/developers.json`:5. **View Stats**: Click on stat cards to expand details

6. **Try Shift View**: Click the "Shift View" button

```json

{### Admin Side (5 minutes)

  "developers": [1. **Login**: Use `istiaque` / `cartup123`

    {2. **Dashboard**: View the graphs and statistics

      "username": "dev",3. **User Management**: Add a test user

      "password": "your_password",4. **Profile**: Update your profile information

      "full_name": "System Developer",5. **Schedule Requests**: View and approve/decline requests

      "role": "developer",6. **Team Management**: Browse teams and employees

      "created_at": "2024-01-01T00:00:00.000Z"

    }---

  ]

}## 📚 Key Features

```

### ✨ Client Dashboard

### 2. Create Tenant Registry- 📅 **Collapsible Calendar** - Modern date selector

- 🔍 **Employee Search** - View any employee's schedule

Create `data/tenants.json`:- 📊 **Dynamic Stat Cards** - Expand for details

- 🎨 **Visual Indicators** - Color-coded shifts

```json- ✅ **Approved Requests** - Track approved shifts

{

  "tenants": []### 🛠️ Admin Panel

}- 📈 **Analytics Dashboard** - Team health metrics

```- 👥 **User Management** - CRUD for admin users

- 📋 **Request Management** - Approve/decline workflow

### 3. Start Server and Use Developer Portal- 🎨 **Modern Dark Theme** - Professional appearance

- 👤 **Profile Management** - Self-service updates

```bash

npm run dev---

```

## 🎨 Theme Overview

Then visit http://localhost:3000/developer/login and use the portal to create tenants.

The application uses a modern dark corporate theme:

---- **Background**: Deep blacks and dark grays

- **Accents**: Professional blues and subtle gradients

## 🎮 Using the System- **Highlights**: Green (working), Red (off), Orange (pending)

- **Typography**: Clean, readable fonts

### For Developers

---

1. **Login** at `/developer/login`

2. **Create Tenant**: Click "Create Tenant" button## 📱 Responsive Design

   - Enter tenant name (e.g., "Acme Corporation")

   - Enter slug (e.g., "acme") - this becomes part of URLsThe application works on:

   - Optionally set limits- 💻 **Desktop** (1200px+) - Full features

3. **View Tenant Stats**: See user count, employee count- 📱 **Tablet** (768-1200px) - Adapted layout

4. **Manage Tenants**: Activate/deactivate as needed- 📱 **Mobile** (<768px) - Compact view



### For Tenant Admins---



After a developer creates your tenant and admin account:## 🔧 Common Tasks



1. **Login** at `/admin/login`### Submit a Shift Change Request

2. **Import Data**:1. Login to client dashboard

   - Go to "CSV Import" tab2. Click "Request Shift Change"

   - Download template or upload existing roster CSV3. Select date from mini calendar

   - OR connect Google Sheets in "Google Links" tab4. Choose requested shift

3. **Manage Teams**:5. Enter reason and submit

   - Go to "Team Management" tab

   - Add/edit teams### Approve a Request (Admin)

   - Assign employees1. Login to admin panel

4. **Handle Requests**:2. Go to "Schedule Requests" tab

   - Go to "Schedule Requests" tab3. Find pending request

   - Approve/reject employee change requests4. Click "Approve" or "Reject"



### For Employees### Add a Team Leader (Admin)

1. Login as admin

1. **Visit** the root URL (http://localhost:3000)2. Go to "User Management" tab

2. **Enter Employee ID** (e.g., "EMP001")3. Click "Add New User"

3. **View Schedule**:4. Fill in details with role "Team Leader"

   - Today's shift5. Submit

   - Tomorrow's shift

   - Full calendar view### Change Your Password

   - Upcoming work days1. Login to admin panel

4. **Submit Requests**:2. Go to "My Profile" tab

   - Click "Request Change" for shift changes3. Enter current password

   - Click "Request Swap" to swap with a colleague4. Enter new password twice

5. Click "Change Password"

---

---

## 🔐 Security Checklist

## 📖 Documentation

Before going to production:

For detailed information, see:

- [ ] Change all default passwords- **TESTING_GUIDE.md** - Comprehensive testing procedures

- [ ] Set strong `APP_SECRET` in environment variables- **IMPLEMENTATION_SUMMARY.md** - Technical details

- [ ] Enable HTTPS- **README.md** - Project overview

- [ ] Set up proper firewall rules

- [ ] Implement backup strategy for `data/` directory---

- [ ] Review and limit developer access

- [ ] Set up monitoring and logging## 🐛 Troubleshooting



---### Port Already in Use

```bash

## 📂 Data Structure# Next.js will automatically use port 3001 if 3000 is busy

# Or kill the process using the port:

```lsof -ti:3000 | xargs kill

data/```

├── developers.json          # System developers

├── tenants.json            # Tenant registry### Build Errors

└── tenants/```bash

    └── {tenant-id}/        # Each tenant's data# Clear cache and rebuild

        ├── admin_users.jsonrm -rf .next

        ├── google_data.jsonnpm run build

        ├── admin_data.json```

        ├── modified_shifts.json

        ├── google_links.json### Login Issues

        ├── schedule_requests.json- Ensure `.env.local` file exists (created automatically)

        ├── settings.json- Check `data/admin_users.json` for user list

        └── roster_templates/- Verify correct credentials from table above

```

---

---

## 🎯 Quick Testing Checklist

## 🆘 Troubleshooting

### Client Side ✓

### "Cannot find module" errors- [ ] Login works

- [ ] Calendar selector expands/collapses

```bash- [ ] Employee search shows full schedule

npm install- [ ] Stat cards expand with details

```- [ ] Can submit shift change request

- [ ] Can submit swap request

### Port 3000 already in use

### Admin Side ✓

```bash- [ ] Admin login works

# Use different port- [ ] Dashboard shows statistics

PORT=3001 npm run dev- [ ] Can manage users

```- [ ] Can approve requests

- [ ] Profile editing works

### Can't login to developer portal- [ ] Theme looks professional



Check `data/developers.json` exists and has correct format.---



### Tenant data not showing## 🚀 Build for Production



1. Check if tenant is active in developer portal```bash

2. Verify data files exist in `data/tenants/{tenant-id}/`# Create optimized production build

3. Try importing CSV data through admin panelnpm run build



### Session expired too quickly# Start production server

npm start

Sessions last 8 hours by default. Change in `lib/auth.ts`:```



```typescript---

maxAge: 60*60*8  // 8 hours in seconds

```## 💡 Tips



---1. **Use Chrome DevTools** for best debugging experience

2. **Check Browser Console** for any errors

## 🎓 Next Steps3. **Test on Multiple Devices** for responsive design

4. **Clear Browser Cache** if seeing old data

1. **Import Real Data**: Use CSV import or Google Sheets sync5. **Use Incognito Mode** to test fresh sessions

2. **Create Admin Users**: Through developer portal for each tenant

3. **Customize Shifts**: Modify shift codes in `lib/constants.ts`---

4. **Brand the UI**: Update styles in `styles/` directory

5. **Set Up Production**: Follow deployment guide in main README## 📞 Support



---If you encounter issues:

1. Check the **TESTING_GUIDE.md** for detailed procedures

## 📞 Support2. Review **IMPLEMENTATION_SUMMARY.md** for technical details

3. Verify credentials are correct

- Check main README.md for detailed documentation4. Check console for error messages

- Review code comments for technical details5. Ensure all dependencies are installed

- Create issues for bugs or feature requests

---

---

## ✅ Next Steps

## ✅ Verification Steps

1. ✅ Complete Quick Start (above)

After setup, verify everything works:2. ✅ Review TESTING_GUIDE.md for detailed testing

3. ✅ Read IMPLEMENTATION_SUMMARY.md for technical overview

1. [ ] Can login to developer portal4. ✅ Test all features systematically

2. [ ] Can create a new tenant5. ✅ Report any issues found

3. [ ] Can login to admin panel for tenant6. ✅ Deploy to production when satisfied

4. [ ] Can import CSV data

5. [ ] Can view employee dashboard---

6. [ ] Can submit schedule change request

7. [ ] Can approve request as admin## 🎉 Enjoy Your New Roster Management System!

8. [ ] Data is isolated between tenants

All features are implemented and ready to use. The application is production-ready with:

---- Modern, professional interface

- Complete feature set

**Ready to get started? Run `node setup.js` now!**- Comprehensive documentation

- Secure authentication
- Responsive design

**Happy scheduling!** 📅✨

---

*For detailed testing procedures, see TESTING_GUIDE.md*
*For technical documentation, see IMPLEMENTATION_SUMMARY.md*
