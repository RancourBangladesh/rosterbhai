import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'landing_cms.json');

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ logos: [] }, null, 2));
  }
}

export async function GET(request: NextRequest) {
  try {
    ensureDataDir();
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to load CMS data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    ensureDataDir();
    const body = await request.json();
    
    // Validate
    if (!body.logos || !Array.isArray(body.logos)) {
      return NextResponse.json({ success: false, error: 'Invalid data format' }, { status: 400 });
    }

    // Save
    fs.writeFileSync(DATA_FILE, JSON.stringify(body, null, 2));
    
    return NextResponse.json({ success: true, message: 'CMS data saved successfully' });
  } catch (error) {
    console.error('Error saving CMS data:', error);
    return NextResponse.json({ success: false, error: 'Failed to save CMS data' }, { status: 500 });
  }
}
