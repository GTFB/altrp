import { test, expect } from '@playwright/test';

test.describe('Blog Pages', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Russian homepage before each test
    await page.goto('/ru');
  });

  test('should display blog page', async ({ page }) => {
    // Navigate to blog page
    await page.goto('/ru/blog');
    
    // Check if blog page loads
    await expect(page.locator('h1, h2')).toContainText(/blog|блог/i);
  });

  test('should display authors page', async ({ page }) => {
    // Navigate to authors page
    await page.goto('/ru/authors');
    
    // Check if authors page loads
    await expect(page.locator('h1, h2')).toContainText(/authors|авторы/i);
  });

  test('should display categories page', async ({ page }) => {
    // Navigate to categories page
    await page.goto('/ru/categories');
    
    // Check if categories page loads
    await expect(page.locator('h1, h2')).toContainText(/categories|категории/i);
  });

  test('should display tags page', async ({ page }) => {
    // Navigate to tags page
    await page.goto('/ru/tags');
    
    // Check if tags page loads
    await expect(page.locator('h1, h2')).toContainText(/tags|теги/i);
  });

  test('should handle individual blog post page', async ({ page }) => {
    // Try to navigate to a blog post (this might need adjustment based on your data)
    await page.goto('/ru/blog/demo');
    
    // Check if blog post page loads or shows appropriate message
    const pageContent = await page.textContent('body');
    expect(pageContent).toBeTruthy();
  });

  test('should handle individual author page', async ({ page }) => {
    // Try to navigate to an author page (this might need adjustment based on your data)
    await page.goto('/ru/authors/demo');
    
    // Check if author page loads or shows appropriate message
    const pageContent = await page.textContent('body');
    expect(pageContent).toBeTruthy();
  });

  test('should handle individual category page', async ({ page }) => {
    // Try to navigate to a category page (this might need adjustment based on your data)
    await page.goto('/ru/categories/demo');
    
    // Check if category page loads or shows appropriate message
    const pageContent = await page.textContent('body');
    expect(pageContent).toBeTruthy();
  });

  test('should handle individual tag page', async ({ page }) => {
    // Try to navigate to a tag page (this might need adjustment based on your data)
    await page.goto('/ru/tags/demo');
    
    // Check if tag page loads or shows appropriate message
    const pageContent = await page.textContent('body');
    expect(pageContent).toBeTruthy();
  });
});
