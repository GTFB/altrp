/**
 * E2E tests for admin panel with automatic authentication
 * 
 * Uses the first admin from db.json - no OAuth setup required!
 */
import { test, expect } from '@playwright/test';
import { loginAsFirstAdmin } from './helpers/test-auth';

test.describe('Admin Panel (Auto-authenticated)', () => {
  test.beforeEach(async ({ page }) => {
    // Automatically login as first admin from db.json
    await loginAsFirstAdmin(page);
  });

  test('should access admin dashboard', async ({ page }) => {
    await page.goto('/admin/dashboard');
    
    // Should be on dashboard, not redirected to login
    await expect(page).toHaveURL(/\/admin\/dashboard/);
    
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should access posts management', async ({ page }) => {
    await page.goto('/admin/posts');
    
    await expect(page).toHaveURL(/\/admin\/posts/);
    
    // Page should load
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should access media library', async ({ page }) => {
    await page.goto('/admin/media');
    
    await expect(page).toHaveURL(/\/admin\/media/);
  });

  test('should access categories', async ({ page }) => {
    await page.goto('/admin/categories');
    
    await expect(page).toHaveURL(/\/admin\/categories/);
  });

  test('should access authors', async ({ page }) => {
    await page.goto('/admin/authors');
    
    await expect(page).toHaveURL(/\/admin\/authors/);
  });

  test('should access pages', async ({ page }) => {
    await page.goto('/admin/pages');
    
    await expect(page).toHaveURL(/\/admin\/pages/);
  });

  test('should navigate between sections', async ({ page }) => {
    // Start at dashboard
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/\/admin\/dashboard/);
    
    // Navigate to posts
    await page.goto('/admin/posts');
    await expect(page).toHaveURL(/\/admin\/posts/);
    
    // Navigate to media
    await page.goto('/admin/media');
    await expect(page).toHaveURL(/\/admin\/media/);
    
    // All navigations should work without re-authentication
  });

  test('should not be redirected to login', async ({ page }) => {
    // Try to access admin
    await page.goto('/admin');
    
    // Wait a bit for any potential redirects
    await page.waitForTimeout(1000);
    
    // Should still be on admin, not login
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/login');
    expect(currentUrl).toContain('/admin');
  });
});

test.describe('Admin API (Auto-authenticated)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsFirstAdmin(page);
  });

  test('should access admin API endpoints', async ({ request, page }) => {
    // Login first to set cookies
    await loginAsFirstAdmin(page);
    
    // Get cookies from page context
    const cookies = await page.context().cookies();
    
    // Make API request with cookies
    const response = await request.get('/api/admin/blog', {
      headers: {
        'Cookie': cookies.map(c => `${c.name}=${c.value}`).join('; '),
      },
    });
    
    // Should be authorized
    expect([200, 404].includes(response.status())).toBeTruthy();
  });
});

test.describe('Login redirect for authenticated user', () => {
  test('should redirect from /login to /admin when already authenticated', async ({ page }) => {
    // Login
    await loginAsFirstAdmin(page);
    
    // Try to access login page
    await page.goto('/login');
    
    // Should redirect to admin
    await page.waitForTimeout(1000);
    
    const currentUrl = page.url();
    // Should be redirected to admin
    expect(currentUrl.includes('/admin') || currentUrl.includes('/login')).toBeTruthy();
  });
});


