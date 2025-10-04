import { test, expect } from '@playwright/test';
import { i18nConfig } from '@/config/i18n';
const { locales, defaultLocale } = i18nConfig;

test.describe(`Quick Public Pages Tests`, () => {
  test(`should have proper heading structure on main pages`, async ({ page }) => {
    for (const locale of locales) {
      const _page: string = locale === defaultLocale ? '' : locale
      await page.context().clearCookies();



      await page.goto(`/${_page}`);

      // Check if main heading exists
      const h1 = page.locator('h1').first();
      await expect(h1).toBeVisible();

      // Check if heading has proper text content
      const headingText = await h1.textContent();
      expect(headingText).toBeTruthy();
      console.log(`Heading: ${headingText}`);

      // Check if title exists
      const title = page.locator('title').first();

      // Check if title has proper text content
      const titleText = await title.textContent();
      console.log(`Title: ${titleText}`);
      expect(titleText).toBeTruthy();
    }

  });
});

