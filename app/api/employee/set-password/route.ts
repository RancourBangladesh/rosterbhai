import { NextRequest, NextResponse } from 'next/server';
import { verifyResetToken, setPasswordWithToken } from '@/lib/employeeAuth';

export async function POST(req: NextRequest) {
  try {
    const { token, password, tenant_id } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ 
        success: false, 
        error: 'Token and password are required' 
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json({ 
        success: false, 
        error: 'Password must be at least 6 characters long' 
      });
    }

    // Verify the token is valid
    const verification = verifyResetToken(tenant_id || null, token);
    if (!verification.valid) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid or expired reset link' 
      });
    }

    // Set the new password
    const success = setPasswordWithToken(tenant_id || null, token, password);

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Password set successfully! You can now login with your new password.',
        employee_id: verification.employeeId
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to set password' 
      });
    }

  } catch (error) {
    console.error('Error setting password:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to set password' 
    }, { status: 500 });
  }
}

// GET endpoint to verify token validity
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    const tenant_id = searchParams.get('tenant_id');

    if (!token) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Token is required' 
      });
    }

    const verification = verifyResetToken(tenant_id || null, token);

    return NextResponse.json({
      valid: verification.valid,
      employee_id: verification.employeeId
    });

  } catch (error) {
    console.error('Error verifying token:', error);
    return NextResponse.json({ 
      valid: false, 
      error: 'Failed to verify token' 
    }, { status: 500 });
  }
}
