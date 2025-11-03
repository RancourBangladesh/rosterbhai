import { NextRequest, NextResponse } from 'next/server';
import { validateDeveloperLogin, createDeveloperSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    
    if (!username || !password) {
      return NextResponse.json({ 
        success: false, 
        error: 'Username and password required' 
      }, { status: 400 });
    }

    const valid = validateDeveloperLogin(username, password);
    
    if (valid) {
      createDeveloperSession(username);
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid credentials' 
      }, { status: 401 });
    }
  } catch (err) {
    console.error('Developer login error:', err);
    return NextResponse.json({ 
      success: false, 
      error: 'Login failed' 
    }, { status: 500 });
  }
}
