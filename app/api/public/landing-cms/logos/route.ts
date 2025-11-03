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
    return NextResponse.json({ success: true, logos: data.logos || [] });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to load logos' }, { status: 500 });
  }
}
