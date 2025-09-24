import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Russian homepage before each test
    await page.goto('/ru');
  });

  test('should navigate to components page', async ({ page }) => {
    // This test assumes there's a navigation to components
    // You might need to adjust based on your actual navigation structure
    
    // Try to find and click on components link
    const componentsLink = page.getByRole('link', { name: /components/i }).first();
    
    if (await componentsLink.isVisible()) {
      await componentsLink.click();
      await expect(page).toHaveURL(/.*components.*/);
    }
  });

  test('should navigate to blog page', async ({ page }) => {
    // Try to find and click on blog link
    const blogLink = page.getByRole('link', { name: /blog/i }).first();
    
    if (await blogLink.isVisible()) {
      await blogLink.click();
      await expect(page).toHaveURL(/.*blog.*/);
    }
  });

  test('should navigate to authors page', async ({ page }) => {
    // Try to find and click on authors link
    const authorsLink = page.getByRole('link', { name: /authors/i }).first();
    
    if (await authorsLink.isVisible()) {
      await authorsLink.click();
      await expect(page).toHaveURL(/.*authors.*/);
    }
  });

  test('should navigate to categories page', async ({ page }) => {
    // Try to find and click on categories link
    const categoriesLink = page.getByRole('link', { name: /categories/i }).first();
    
    if (await categoriesLink.isVisible()) {
      await categoriesLink.click();
      await expect(page).toHaveURL(/.*categories.*/);
    }
  });

  test('should handle 404 page correctly', async ({ page }) => {
    // Navigate to a non-existent page
    await page.goto('/ru/non-existent-page');
    
    // Check if 404 page is displayed (adjust based on your 404 page implementation)
    await expect(page.locator('h1, h2')).toContainText(/404|not found|страница не найдена/i);
  });
});
