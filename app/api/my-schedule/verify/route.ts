import { NextRequest, NextResponse } from 'next/server';
import { getDisplay } from '@/lib/dataStore';
import { getDisplayForTenant, loadAllForTenant } from '@/lib/dataStore.tenant';
import { findEmployeeTenant } from '@/lib/employeeAuth';

export async function POST(req: NextRequest) {
  try {
    const { employeeId } = await req.json();
    
    if (!employeeId) {
      return NextResponse.json({ 
        success: false 
      }, { status: 400 });
    }

    // Find which tenant this employee belongs to
    const tenantId = findEmployeeTenant(employeeId);
    
    let displayData;
    if (tenantId) {
      loadAllForTenant(tenantId);
      displayData = getDisplayForTenant(tenantId);
    } else {
      displayData = getDisplay();
    }
    
    // Find employee by ID
    const employee = displayData.allEmployees.find(
      emp => emp.id.toLowerCase() === employeeId.toLowerCase()
    );

    if (!employee) {
      return NextResponse.json({ 
        success: false 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      employee: {
        id: employee.id,
        name: employee.name,
        team: employee.currentTeam || employee.team
      }
    });
  } catch (err) {
    return NextResponse.json({ 
      success: false 
    }, { status: 500 });
  }
}
