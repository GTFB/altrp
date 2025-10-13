/**
 * E2E Test Authentication Helper
 * 
 * Automatically logs in as the first admin from db.json
 * No OAuth configuration needed!
 */
import { Page, APIRequestContext } from '@playwright/test';

/**
 * Login as first admin from db.json for E2E tests
 * This bypasses OAuth and directly creates a session
 */
export async function loginAsFirstAdmin(page: Page): Promise<void> {
  console.log('🔐 E2E: Logging in as first admin from db.json...');

  // Call test endpoint to create session
  const response = await page.request.post('/api/test/auth');

  if (!response.ok()) {
    const error = await response.text();
    throw new Error(`Failed to authenticate: ${error}`);
  }

  const data = await response.json();
  console.log('✅ E2E: Logged in as:', data.user.email);

  // Session cookie is automatically set by the response
  // No need to manually handle cookies
}

/**
 * Check if test auth is available
 */
export async function isTestAuthAvailable(request: APIRequestContext): Promise<boolean> {
  try {
    const response = await request.get('/api/test/auth');
    if (!response.ok()) return false;

    const data = await response.json();
    return data.available === true;
  } catch {
    return false;
  }
}

/**
 * Get first admin info from db.json
 */
export async function getFirstAdminInfo(request: APIRequestContext): Promise<{
  email: string;
  name: string;
} | null> {
  try {
    const response = await request.get('/api/test/auth');
    if (!response.ok()) return null;

    const data = await response.json();
    return data.admin || null;
  } catch {
    return null;
  }
}

/**
 * Logout (clear session)
 */
export async function logout(page: Page): Promise<void> {
  await page.goto('/api/auth/signout');
  await page.waitForLoadState('domcontentloaded');
}

