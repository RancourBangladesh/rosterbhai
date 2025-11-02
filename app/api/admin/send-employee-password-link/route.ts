import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, getSessionTenantId } from '@/lib/auth';
import { generatePasswordResetToken } from '@/lib/employeeAuth';

export async function POST(req: NextRequest) {
  const user = getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { employee_id, employee_name, email } = await req.json();

    if (!employee_id || !email) {
      return NextResponse.json({ 
        success: false, 
        error: 'Employee ID and email are required' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid email format' 
      });
    }

    const tenantId = getSessionTenantId();
    const token = generatePasswordResetToken(tenantId, employee_id, email);

    // Generate password reset link
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const host = req.headers.get('host') || 'localhost:3000';
    const resetLink = `${protocol}://${host}/set-password?token=${token}`;

    // In a production environment, you would send an actual email here
    // For now, we'll return the link so admins can copy and send it
    
    return NextResponse.json({
      success: true,
      message: 'Password reset link generated successfully',
      reset_link: resetLink,
      employee_id,
      employee_name,
      email,
      instructions: 'Copy this link and send it to the employee via email. The link is valid for 24 hours.'
    });

  } catch (error) {
    console.error('Error generating password reset link:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to generate password reset link' 
    }, { status: 500 });
  }
}
