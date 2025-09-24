import { test, expect } from '@playwright/test';

test.describe('Components Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to components page
    await page.goto('/ru/components');
  });

  test('should display components page', async ({ page }) => {
    // Check if components page loads
    await expect(page.locator('h1, h2')).toContainText(/components|компоненты/i);
  });

  test('should display button component page', async ({ page }) => {
    // Navigate to button component
    await page.goto('/ru/components/button');
    
    // Check if button component page loads
    await expect(page.locator('h1, h2')).toContainText(/button/i);
  });

  test('should display card component page', async ({ page }) => {
    // Navigate to card component
    await page.goto('/ru/components/card');
    
    // Check if card component page loads
    await expect(page.locator('h1, h2')).toContainText(/card/i);
  });

  test('should display accordion component page', async ({ page }) => {
    // Navigate to accordion component
    await page.goto('/ru/components/accordion');
    
    // Check if accordion component page loads
    await expect(page.locator('h1, h2')).toContainText(/accordion/i);
  });

  test('should display alert component page', async ({ page }) => {
    // Navigate to alert component
    await page.goto('/ru/components/alert');
    
    // Check if alert component page loads
    await expect(page.locator('h1, h2')).toContainText(/alert/i);
  });

  test('should display avatar component page', async ({ page }) => {
    // Navigate to avatar component
    await page.goto('/ru/components/avatar');
    
    // Check if avatar component page loads
    await expect(page.locator('h1, h2')).toContainText(/avatar/i);
  });

  test('should display badge component page', async ({ page }) => {
    // Navigate to badge component
    await page.goto('/ru/components/badge');
    
    // Check if badge component page loads
    await expect(page.locator('h1, h2')).toContainText(/badge/i);
  });

  test('should display breadcrumb component page', async ({ page }) => {
    // Navigate to breadcrumb component
    await page.goto('/ru/components/breadcrumb');
    
    // Check if breadcrumb component page loads
    await expect(page.locator('h1, h2')).toContainText(/breadcrumb/i);
  });

  test('should display carousel component page', async ({ page }) => {
    // Navigate to carousel component
    await page.goto('/ru/components/carousel');
    
    // Check if carousel component page loads
    await expect(page.locator('h1, h2')).toContainText(/carousel/i);
  });

  test('should display checkbox component page', async ({ page }) => {
    // Navigate to checkbox component
    await page.goto('/ru/components/checkbox');
    
    // Check if checkbox component page loads
    await expect(page.locator('h1, h2')).toContainText(/checkbox/i);
  });
});
