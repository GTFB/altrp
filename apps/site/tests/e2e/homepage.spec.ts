import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should display language selection page', async ({ page }) => {
    await page.goto('/');

    // Check if the main heading is visible
    await expect(page.getByText('Выберите язык')).toBeVisible();
    
    // Check if language buttons are present
    await expect(page.getByRole('button', { name: 'Русский' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'English' })).toBeVisible();
    
    // Check if the subtitle is visible
    await expect(page.getByText('Выберите язык для продолжения')).toBeVisible();
  });

  test('should navigate to Russian page when Russian button is clicked', async ({ page }) => {
    await page.goto('/');

    // Click on Russian language button
    await page.getByRole('button', { name: 'Русский' }).click();

    // Check if we're redirected to Russian page
    await expect(page).toHaveURL('/ru');
    
    // Check if the Russian content is displayed
    await expect(page.getByText('Добро пожаловать в Jambo')).toBeVisible();
  });

  test('should navigate to English page when English button is clicked', async ({ page }) => {
    await page.goto('/');

    // Click on English language button
    await page.getByRole('button', { name: 'English' }).click();

    // Check if we're redirected to English page
    await expect(page).toHaveURL('/en');
    
    // Check if the English content is displayed
    await expect(page.getByText('Welcome to Jambo')).toBeVisible();
  });

  test('should display technology stack info', async ({ page }) => {
    await page.goto('/');

    // Check if technology stack info is displayed
    await expect(page.getByText('Next.js + Bun + Tailwind + Shadcn/ui')).toBeVisible();
    await expect(page.getByText('Inter для текста, Inter Tight для заголовков')).toBeVisible();
  });
});
