import { NextRequest, NextResponse } from 'next/server';
import { requireDeveloper } from '@/lib/auth';
import { getTenantById, addTenantAdminUser, getTenantAdminUsers, saveTenantAdminUsers } from '@/lib/tenants';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requireDeveloper();
    
    const tenant = getTenantById(params.id);
    if (!tenant) {
      return NextResponse.json({ 
        success: false, 
        error: 'Tenant not found' 
      }, { status: 404 });
    }
    
    const { username, password, full_name, role } = await req.json();
    
    if (!username || !password || !full_name) {
      return NextResponse.json({ 
        success: false, 
        error: 'Username, password, and full name are required' 
      }, { status: 400 });
    }
    
    const user = addTenantAdminUser(params.id, {
      username,
      password,
      full_name,
      role: role || 'admin'
    });
    
    return NextResponse.json({ 
      success: true, 
      user 
    });
  } catch (err: any) {
    console.error('Create admin user error:', err);
    return NextResponse.json({ 
      success: false, 
      error: err.message || 'Failed to create admin user' 
    }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requireDeveloper();
    
    const tenant = getTenantById(params.id);
    if (!tenant) {
      return NextResponse.json({ 
        success: false, 
        error: 'Tenant not found' 
      }, { status: 404 });
    }
    
    const { username } = await req.json();
    
    if (!username) {
      return NextResponse.json({ 
        success: false, 
        error: 'Username is required' 
      }, { status: 400 });
    }
    
    const adminUsers = getTenantAdminUsers(params.id);
    const userIndex = adminUsers.users.findIndex(u => u.username === username);
    
    if (userIndex === -1) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 });
    }
    
    adminUsers.users.splice(userIndex, 1);
    saveTenantAdminUsers(params.id, adminUsers);
    
    return NextResponse.json({ 
      success: true 
    });
  } catch (err: any) {
    console.error('Delete admin user error:', err);
    return NextResponse.json({ 
      success: false, 
      error: err.message || 'Failed to delete admin user' 
    }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requireDeveloper();

    const tenant = getTenantById(params.id);
    if (!tenant) {
      return NextResponse.json({
        success: false,
        error: 'Tenant not found'
      }, { status: 404 });
    }

    const { username, full_name, role, password } = await req.json();

    if (!username) {
      return NextResponse.json({
        success: false,
        error: 'Username is required'
      }, { status: 400 });
    }

    const adminUsers = getTenantAdminUsers(params.id);
    const userIndex = adminUsers.users.findIndex(u => u.username === username);

    if (userIndex === -1) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    // Update allowed fields
    if (typeof full_name === 'string' && full_name.trim().length > 0) {
      adminUsers.users[userIndex].full_name = full_name.trim();
    }
    if (typeof role === 'string' && role.trim().length > 0) {
      adminUsers.users[userIndex].role = role.trim();
    }
    if (typeof password === 'string' && password.trim().length > 0) {
      adminUsers.users[userIndex].password = password;
    }

    saveTenantAdminUsers(params.id, adminUsers);

    return NextResponse.json({
      success: true,
      user: adminUsers.users[userIndex]
    });
  } catch (err: any) {
    console.error('Update admin user error:', err);
    return NextResponse.json({
      success: false,
      error: err.message || 'Failed to update admin user'
    }, { status: 500 });
  }
}
