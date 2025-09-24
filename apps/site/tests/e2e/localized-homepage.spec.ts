import { test, expect } from '@playwright/test';

test.describe('Localized Homepage', () => {
  test('should display Russian localized content', async ({ page }) => {
    await page.goto('/ru');

    // Check if the Russian welcome message is visible
    await expect(page.getByText('Добро пожаловать в Jambo')).toBeVisible();
    
    // Check if the description is visible
    await expect(page.getByText('aModernGitAsCmsPoweredWebsite')).toBeVisible();
    
    // Check if the current locale is displayed
    await expect(page.getByText('currentLocale: ru')).toBeVisible();
    
    // Check if components section is visible
    await expect(page.getByText('availableComponents')).toBeVisible();
    await expect(page.getByText('all50ShadcnUiComponentsAreReadyToUse')).toBeVisible();
  });

  test('should display English localized content', async ({ page }) => {
    await page.goto('/en');

    // Check if the English welcome message is visible
    await expect(page.getByText('Welcome to Jambo')).toBeVisible();
    
    // Check if the description is visible
    await expect(page.getByText('aModernGitAsCmsPoweredWebsite')).toBeVisible();
    
    // Check if the current locale is displayed
    await expect(page.getByText('currentLocale: en')).toBeVisible();
    
    // Check if components section is visible
    await expect(page.getByText('availableComponents')).toBeVisible();
    await expect(page.getByText('all50ShadcnUiComponentsAreReadyToUse')).toBeVisible();
  });

  test('should display blog sections', async ({ page }) => {
    await page.goto('/ru');

    // Check if blog sections are present
    await expect(page.getByText('latestPosts')).toBeVisible();
    await expect(page.getByText('readOurLatestArticlesAndUpdates')).toBeVisible();
    
    // Check if category section is present
    await expect(page.getByText('categories')).toBeVisible();
    await expect(page.getByText('exploreOurContentOrganizedByTopics')).toBeVisible();
    
    // Check if author section is present
    await expect(page.getByText('ourAuthors')).toBeVisible();
    await expect(page.getByText('meetTheTalentedWritersBehindOurContent')).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/ru');

    // Check if content is still visible on mobile
    await expect(page.getByText('Добро пожаловать в Jambo')).toBeVisible();
    
    // Check if the page is scrollable
    await expect(page.locator('main')).toBeVisible();
  });
});
