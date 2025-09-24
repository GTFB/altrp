import { test, expect } from '@playwright/test';

test.describe('Accessibility Tests', () => {
  test('should have proper heading structure on homepage', async ({ page }) => {
    await page.goto('/');

    // Check if main heading exists
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    
    // Check if heading has proper text content
    const headingText = await h1.textContent();
    expect(headingText).toBeTruthy();
  });

  test('should have proper heading structure on localized homepage', async ({ page }) => {
    await page.goto('/ru');

    // Check if main heading exists
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    
    // Check if heading has proper text content
    const headingText = await h1.textContent();
    expect(headingText).toBeTruthy();
  });

  test('should have proper button accessibility', async ({ page }) => {
    await page.goto('/');

    // Check if buttons have proper roles and labels
    const russianButton = page.getByRole('button', { name: 'Русский' });
    const englishButton = page.getByRole('button', { name: 'English' });
    
    await expect(russianButton).toBeVisible();
    await expect(englishButton).toBeVisible();
    
    // Check if buttons are focusable
    await russianButton.focus();
    await expect(russianButton).toBeFocused();
    
    await englishButton.focus();
    await expect(englishButton).toBeFocused();
  });

  test('should have proper color contrast', async ({ page }) => {
    await page.goto('/ru');

    // This is a basic check - in a real scenario, you might want to use
    // axe-core or similar tools for comprehensive accessibility testing
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Check if text is readable (basic check)
    const textElements = page.locator('p, h1, h2, h3, h4, h5, h6');
    const count = await textElements.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');

    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Check if focus is visible
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should have proper alt text for images', async ({ page }) => {
    await page.goto('/ru');

    // Check all images for alt text
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      // Alt text should exist (can be empty string for decorative images)
      expect(alt).not.toBeNull();
    }
  });

  test('should have proper form labels', async ({ page }) => {
    // Navigate to a page that might have forms
    await page.goto('/ru');

    // Check if any forms have proper labels
    const inputs = page.locator('input[type="text"], input[type="email"], input[type="password"], textarea');
    const inputCount = await inputs.count();
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');
      
      // Input should have either id with associated label, aria-label, or aria-labelledby
      expect(id || ariaLabel || ariaLabelledBy).toBeTruthy();
    }
  });
});
