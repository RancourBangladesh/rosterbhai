#!/usr/bin/env node

/**
 * Multi-Tenant Roster System - Initial Setup Script
 * 
 * This script helps initialize the system with a developer account
 * and optionally creates a demo tenant for testing.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function setup() {
  console.log('='.repeat(60));
  console.log('Multi-Tenant Roster Management System - Setup');
  console.log('='.repeat(60));
  console.log('');

  // Ensure data directory exists
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Check if developers.json already exists
  const developersFile = path.join(dataDir, 'developers.json');
  if (fs.existsSync(developersFile)) {
    const existing = JSON.parse(fs.readFileSync(developersFile, 'utf8'));
    if (existing.developers && existing.developers.length > 0) {
      console.log('⚠️  Developer account already exists!');
      console.log('');
      const overwrite = await question('Do you want to add another developer? (y/n): ');
      if (overwrite.toLowerCase() !== 'y') {
        console.log('Setup cancelled.');
        rl.close();
        return;
      }
    }
  }

  console.log('Step 1: Create Developer Account');
  console.log('-'.repeat(40));
  
  const username = await question('Developer username: ');
  const password = await question('Developer password: ');
  const fullName = await question('Full name: ');

  if (!username || !password) {
    console.log('❌ Username and password are required!');
    rl.close();
    return;
  }

  // Create or update developers.json
  let developersData = { developers: [] };
  if (fs.existsSync(developersFile)) {
    developersData = JSON.parse(fs.readFileSync(developersFile, 'utf8'));
  }

  // Check if username already exists
  if (developersData.developers.find(d => d.username === username)) {
    console.log('❌ Developer with this username already exists!');
    rl.close();
    return;
  }

  developersData.developers.push({
    username,
    password,
    full_name: fullName,
    role: 'developer',
    created_at: new Date().toISOString()
  });

  fs.writeFileSync(developersFile, JSON.stringify(developersData, null, 2));
  console.log('✅ Developer account created successfully!');
  console.log('');

  // Ask about creating tenants.json
  const tenantsFile = path.join(dataDir, 'tenants.json');
  if (!fs.existsSync(tenantsFile)) {
    fs.writeFileSync(tenantsFile, JSON.stringify({ tenants: [] }, null, 2));
    console.log('✅ Tenant registry initialized');
    console.log('');
  }

  // Ask about demo tenant
  console.log('Step 2: Create Demo Tenant (Optional)');
  console.log('-'.repeat(40));
  const createDemo = await question('Create a demo tenant? (y/n): ');

  if (createDemo.toLowerCase() === 'y') {
    const tenantName = await question('Tenant name [Demo Company]: ') || 'Demo Company';
    const tenantSlug = await question('Tenant slug [demo]: ') || 'demo';

    const tenantsData = JSON.parse(fs.readFileSync(tenantsFile, 'utf8'));
    
    // Check if slug exists
    if (tenantsData.tenants.find(t => t.slug === tenantSlug)) {
      console.log('⚠️  Tenant with this slug already exists!');
    } else {
      const tenantId = require('crypto').randomUUID();
      const newTenant = {
        id: tenantId,
        name: tenantName,
        slug: tenantSlug,
        created_at: new Date().toISOString(),
        is_active: true,
        settings: {}
      };

      tenantsData.tenants.push(newTenant);
      fs.writeFileSync(tenantsFile, JSON.stringify(tenantsData, null, 2));

      // Create tenant directory and files
      const tenantDir = path.join(dataDir, 'tenants', tenantId);
      fs.mkdirSync(tenantDir, { recursive: true });
      fs.mkdirSync(path.join(tenantDir, 'roster_templates'), { recursive: true });

      // Initialize tenant files
      const defaultFiles = {
        'google_data.json': { teams: {}, headers: [], allEmployees: [] },
        'admin_data.json': { teams: {}, headers: [], allEmployees: [] },
        'modified_shifts.json': { modifications: [], monthly_stats: {} },
        'google_links.json': {},
        'schedule_requests.json': {
          shift_change_requests: [],
          swap_requests: [],
          approved_count: 0,
          pending_count: 0
        },
        'admin_users.json': { users: [] },
        'settings.json': { autoSyncEnabled: false }
      };

      for (const [filename, content] of Object.entries(defaultFiles)) {
        fs.writeFileSync(
          path.join(tenantDir, filename),
          JSON.stringify(content, null, 2)
        );
      }

      console.log('✅ Demo tenant created successfully!');
      console.log('');
      console.log('Tenant Details:');
      console.log(`  Name: ${tenantName}`);
      console.log(`  Slug: ${tenantSlug}`);
      console.log(`  ID: ${tenantId}`);
      console.log('');

      // Ask about creating admin user
      const createAdmin = await question('Create an admin user for this tenant? (y/n): ');
      if (createAdmin.toLowerCase() === 'y') {
        const adminUsername = await question('Admin username: ');
        const adminPassword = await question('Admin password: ');
        const adminFullName = await question('Admin full name: ');

        const adminUsersFile = path.join(tenantDir, 'admin_users.json');
        const adminUsersData = JSON.parse(fs.readFileSync(adminUsersFile, 'utf8'));
        
        adminUsersData.users.push({
          username: adminUsername,
          password: adminPassword,
          role: 'admin',
          full_name: adminFullName,
          tenant_id: tenantId,
          created_at: new Date().toISOString()
        });

        fs.writeFileSync(adminUsersFile, JSON.stringify(adminUsersData, null, 2));
        console.log('✅ Admin user created successfully!');
      }
    }
  }

  console.log('');
  console.log('='.repeat(60));
  console.log('✅ Setup Complete!');
  console.log('='.repeat(60));
  console.log('');
  console.log('Next steps:');
  console.log('1. Run: npm run dev');
  console.log('2. Visit: http://localhost:3000/developer/login');
  console.log(`3. Login with username: ${username}`);
  console.log('');

  rl.close();
}

setup().catch(console.error);
