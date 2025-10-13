/**
 * Test-only endpoint for E2E authentication
 * Automatically logs in the first admin from db.json
 * 
 * ⚠️ ONLY WORKS IN DEVELOPMENT MODE WITH E2E_TESTING FLAG
 * 
 * Security measures:
 * 1. Requires NODE_ENV=development
 * 2. Requires E2E_TESTING=true env variable
 * 3. Uses signed token to prevent cookie forgery
 * 4. Auto-disabled in production builds
 */
import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

const dbFilePath = path.join(process.cwd(), '../..', 'db.json');

// Generate a secure token for E2E testing
function generateE2EToken(email: string): string {
  const secret = process.env.NEXTAUTH_SECRET || 'dev-secret';
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(`e2e-${email}-${Date.now()}`);
  return hmac.digest('hex');
}

export async function POST(req: NextRequest) {
  // Multi-layer security checks
  
  // 1. Check NODE_ENV
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Not available in production' },
      { status: 403 }
    );
  }
  
  // 2. Require explicit E2E_TESTING flag
  if (process.env.E2E_TESTING !== 'true') {
    return NextResponse.json(
      { error: 'E2E testing not enabled. Set E2E_TESTING=true' },
      { status: 403 }
    );
  }

  try {
    // Read db.json
    const dbContent = await fs.readFile(dbFilePath, 'utf8');
    const db = JSON.parse(dbContent);

    // Get first admin
    const firstAdmin = db.admins?.[0];

    if (!firstAdmin) {
      return NextResponse.json(
        { error: 'No admins found in db.json' },
        { status: 404 }
      );
    }

    // Generate secure token
    const token = generateE2EToken(firstAdmin.email);
    
    console.log('🧪 E2E Test: Auto-login initiated for:', firstAdmin.email.substring(0, 3) + '***');

    // Create response
    const response = NextResponse.json({
      success: true,
      user: {
        email: firstAdmin.email,
        name: firstAdmin.name,
        role: 'admin',
      },
    });

    // Set E2E test bypass cookie with signed token
    // Format: email:token
    const cookieValue = `${firstAdmin.email}:${token}`;
    
    response.cookies.set('e2e-test-admin', cookieValue, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: false, // false for localhost, true for https
      maxAge: 60 * 60, // 1 hour (shorter is safer)
    });

    return response;
  } catch (error) {
    console.error('Error in test auth endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to authenticate', details: String(error) },
      { status: 500 }
    );
  }
}

// GET endpoint to check current auth status
export async function GET() {
  if (process.env.NODE_ENV !== 'development' || process.env.E2E_TESTING !== 'true') {
    return NextResponse.json(
      { error: 'Not available' },
      { status: 403 }
    );
  }

  try {
    const dbContent = await fs.readFile(dbFilePath, 'utf8');
    const db = JSON.parse(dbContent);
    const firstAdmin = db.admins?.[0];

    return NextResponse.json({
      available: !!firstAdmin,
      admin: firstAdmin ? {
        email: firstAdmin.email,
        name: firstAdmin.name,
      } : null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to read db.json' },
      { status: 500 }
    );
  }
}

