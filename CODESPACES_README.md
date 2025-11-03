# RosterBhai - Roster Management System

A modern, multi-tenant roster management system built with Next.js 14.

## 🚀 Quick Start with GitHub Codespaces

1. **Open in Codespaces**:
   - Go to your GitHub repository
   - Click the green **"Code"** button
   - Select **"Codespaces"** tab
   - Click **"Create codespace on main"**

2. **Wait for Setup**:
   - Codespace will automatically install dependencies
   - Dev server will start automatically on port 3000

3. **Access the App**:
   - Click the **"Ports"** tab at the bottom
   - Find port 3000 and click the globe icon 🌐
   - Your app will open in a new tab!

## 📋 Default Access

### Developer Portal
- URL: `/developer/login`
- Username: `developer`
- Password: `dev123`

### Admin Portal
- URL: `/admin/login`
- Create tenants through Developer Portal first

### Client Portal
- URL: `/`
- Employees can view their schedules

## 🎨 Features

- ✅ Multi-tenant architecture
- ✅ Modern landing page with CMS
- ✅ Animated logo cloud
- ✅ Admin dashboard for roster management
- ✅ Employee schedule viewer
- ✅ Shift swapping and requests
- ✅ Real-time notifications
- ✅ Mobile responsive

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── page.tsx           # Landing page
│   ├── admin/             # Admin portal
│   ├── developer/         # Developer portal
│   └── api/               # API routes
├── components/            # Shared components
├── data/                  # JSON data storage
├── lib/                   # Utilities and helpers
└── styles/               # CSS files
```

## 🌐 Landing Page CMS

Manage company logos and content through:
- Developer Portal → Landing CMS
- Add/Edit/Delete company logos
- Preview changes before saving
- Logos appear in animated scroll section

## 📝 License

Private - All rights reserved
