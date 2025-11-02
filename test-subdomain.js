#!/usr/bin/env node

/**
 * Subdomain Testing Script
 * 
 * This script helps test the subdomain routing functionality
 * by creating test data and providing URLs to test.
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dataDir = path.join(__dirname, 'data');
const tenantsDir = path.join(dataDir, 'tenants');

// Ensure data directories exist
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(tenantsDir)) {
  fs.mkdirSync(tenantsDir, { recursive: true });
}

// Create developers.json if it doesn't exist
const developersFile = path.join(dataDir, 'developers.json');
if (!fs.existsSync(developersFile)) {
  const developers = {
    developers: [
      {
        username: 'dev',
        password: 'dev123',
        full_name: 'Developer',
        role: 'developer',
        created_at: new Date().toISOString()
      }
    ]
  };
  fs.writeFileSync(developersFile, JSON.stringify(developers, null, 2));
  console.log('✅ Created developers.json with default developer (username: dev, password: dev123)');
}

// Create tenants.json if it doesn't exist
const tenantsFile = path.join(dataDir, 'tenants.json');
if (!fs.existsSync(tenantsFile)) {
  const tenants = {
    tenants: []
  };
  fs.writeFileSync(tenantsFile, JSON.stringify(tenants, null, 2));
  console.log('✅ Created tenants.json');
}

// Read existing tenants
const tenantsData = JSON.parse(fs.readFileSync(tenantsFile, 'utf8'));

// Create test tenant if it doesn't exist
const testTenantSlug = 'rancour';
let testTenant = tenantsData.tenants.find(t => t.slug === testTenantSlug);

if (!testTenant) {
  testTenant = {
    id: uuidv4(),
    name: 'Rancour Bangladesh',
    slug: testTenantSlug,
    created_at: new Date().toISOString(),
    is_active: true,
    settings: {}
  };
  
  tenantsData.tenants.push(testTenant);
  fs.writeFileSync(tenantsFile, JSON.stringify(tenantsData, null, 2));
  
  // Create tenant directory and files
  const tenantDir = path.join(tenantsDir, testTenant.id);
  if (!fs.existsSync(tenantDir)) {
    fs.mkdirSync(tenantDir, { recursive: true });
  }
  
  // Create admin_users.json for the tenant
  const adminUsers = {
    users: [
      {
        username: 'admin',
        password: 'admin123',
        full_name: 'Admin User',
        role: 'admin',
        created_at: new Date().toISOString()
      }
    ]
  };
  fs.writeFileSync(path.join(tenantDir, 'admin_users.json'), JSON.stringify(adminUsers, null, 2));
  
  // Create other required files
  const emptyFiles = [
    'google_data.json',
    'admin_data.json',
    'modified_shifts.json',
    'google_links.json',
    'schedule_requests.json',
    'settings.json'
  ];
  
  emptyFiles.forEach(file => {
    const filePath = path.join(tenantDir, file);
    if (!fs.existsSync(filePath)) {
      const defaultContent = file === 'google_links.json' ? { links: [] } :
                           file === 'schedule_requests.json' ? { requests: [] } :
                           file === 'modified_shifts.json' ? { modifications: [] } :
                           file === 'settings.json' ? {} :
                           { teams: {}, headers: [], allEmployees: [] };
      fs.writeFileSync(filePath, JSON.stringify(defaultContent, null, 2));
    }
  });
  
  console.log(`✅ Created test tenant: ${testTenant.name} (slug: ${testTenantSlug})`);
  console.log(`   Tenant ID: ${testTenant.id}`);
  console.log(`   Admin username: admin, password: admin123`);
}

console.log('\n' + '='.repeat(80));
console.log('SUBDOMAIN TESTING GUIDE');
console.log('='.repeat(80));

console.log('\n📋 PREREQUISITES:');
console.log('1. Add this to your /etc/hosts file (requires sudo):');
console.log('   127.0.0.1  rancour.localhost');
console.log('\n2. Start the development server:');
console.log('   npm run dev');

console.log('\n🧪 TEST URLS:');
console.log('\nMain Domain (localhost:3000):');
console.log('  ✅ http://localhost:3000              - Landing page');
console.log('  ✅ http://localhost:3000/developer    - Developer portal (login with dev/dev123)');
console.log('  ❌ http://localhost:3000/employee     - Should redirect to /');
console.log('  ❌ http://localhost:3000/admin        - Should redirect to /');

console.log('\nTenant Subdomain (rancour.localhost:3000):');
console.log('  ✅ http://rancour.localhost:3000/              - Should redirect to /employee');
console.log('  ✅ http://rancour.localhost:3000/employee      - Employee login page');
console.log('  ✅ http://rancour.localhost:3000/admin         - Admin login (use admin/admin123)');
console.log('  ❌ http://rancour.localhost:3000/developer     - Should redirect to /employee');

console.log('\n📝 TESTING CHECKLIST:');
console.log('  [ ] Main domain can access /developer');
console.log('  [ ] Main domain redirects /employee and /admin to /');
console.log('  [ ] Tenant subdomain redirects root to /employee');
console.log('  [ ] Tenant subdomain can access /employee and /admin');
console.log('  [ ] Tenant subdomain redirects /developer to /employee');
console.log('  [ ] Admin can login on tenant subdomain');
console.log('  [ ] Employee can login on tenant subdomain (after adding employees)');

console.log('\n🎯 CREDENTIALS:');
console.log('  Developer: dev / dev123');
console.log('  Admin (rancour): admin / admin123');

console.log('\n💡 TIPS:');
console.log('  - Clear browser cache/cookies if you encounter issues');
console.log('  - Check browser developer console for errors');
console.log('  - Use incognito mode to test fresh sessions');
console.log('  - Check the middleware.ts file for routing logic');

console.log('\n' + '='.repeat(80) + '\n');
