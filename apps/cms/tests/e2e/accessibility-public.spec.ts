import { test, expect } from '@playwright/test';
import { i18nConfig } from '@/config/i18n';
import fs from 'node:fs';
import path from 'node:path';
const { locales, defaultLocale } = i18nConfig;

for (const locale of locales) {
  test.describe(`Accessibility Public Pages Tests - ${locale}`, () => {
    test(`should have proper heading structure on all pages - ${locale}`, async ({ page }) => {
      test.setTimeout(600_000);

      const pages: string[] = await getPages(locale === defaultLocale ? '' : locale);

      for (const _page of pages) {
        await page.context().clearCookies();
        console.log(`Checking page: ${_page}`);
        await page.goto(_page);

        // Check if main heading exists
        const h1 = page.locator('h1').first();
        await expect(h1).toBeVisible();

        // Check if heading has proper text content
        const headingText = await h1.textContent();
        expect(headingText).toBeTruthy();

        // Check if title exists
        const title = page.locator('title').first();

        // Check if title has proper text content
        const titleText = await title.textContent();
        expect(titleText).toBeTruthy();
      }

    });

  });
}



const getPages: (lang?: string) => Promise<string[]> = async (lang = '') => {
  const appDir = path.resolve(process.cwd(), 'src', 'app', '(main)', '[locale]');

  const staticPaths = new Set<string>();

  const isDynamic = (segment: string) => segment.includes('[') && segment.includes(']');
  const isGroup = (segment: string) => segment.startsWith('(') && segment.endsWith(')');

  const walk = (dirAbs: string, urlSegments: string[]) => {
    const entries = fs.readdirSync(dirAbs, { withFileTypes: true });

    const hasPage = entries.some(e => e.isFile() && (e.name === 'page.tsx' || e.name === 'page.ts'));
    if (hasPage) {
      const url = '/' + urlSegments.filter(Boolean).join('/');
      staticPaths.add(url === '//' || url === '' ? '/' : url);
    }

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const segName = entry.name;
        if (isDynamic(segName)) continue;

        const nextDir = path.join(dirAbs, segName);
        const nextSegments = [...urlSegments];
        // ignore group segments in URL path but traverse inside
        if (!isGroup(segName)) {
          nextSegments.push(segName);
        }
        walk(nextDir, nextSegments);
      }
    }
  };

  // start from root of [locale]
  walk(appDir, []);

  const result: string[] = [];
  const prefix = lang ? `/${lang}` : '';

  for (const basePath of staticPaths) {
    const localized = basePath === '/' ? (prefix || '/') : `${prefix}${basePath}`;
    result.push(localized);
  }

  return Array.from(new Set(result));
}