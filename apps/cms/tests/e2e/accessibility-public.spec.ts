import { test, expect } from '@playwright/test';
import { i18nConfig } from '@/config/i18n';
import fs from 'node:fs';
import path from 'node:path';
const { locales, defaultLocale } = i18nConfig;

for (const locale of locales) {
  test.describe.parallel(`Accessibility Public Pages Tests - ${locale}`, () => {
    const pages: string[] = getPages(locale === defaultLocale ? '' : locale);

    for (const _page of pages) {
      test(`should have proper heading structure - ${locale} - ${_page}`, async ({ page, request }) => {
        test.setTimeout(600_000);

        const response = await page.goto(_page, { waitUntil: 'domcontentloaded' });
        if (response) {
          const status = response.status();
          console.log(_page, response.status());
          expect(status, `Bad HTTP status ${status} for ${_page}`).toBeLessThan(400);
        } else {
          console.warn(`No main resource response for ${_page}; continuing checks`);
        }

        await expect(page.locator('h1')).toHaveCount(1);
        const h1 = page.locator('h1').first();
        await expect(h1).toBeVisible();
        const headingText = (await h1.textContent())?.trim();
        expect(!!headingText && headingText.length > 0, `Empty H1 on ${_page}`).toBeTruthy();

        await expect(page).toHaveTitle(/\S/);

        // Check that all internal links are working (status < 400)
        const currentOrigin = new URL(page.url()).origin;
        const hrefs = await page.$$eval('a[href]', (anchors) =>
          anchors
            .map((a) => (a.getAttribute('href') || '').trim())
            .filter(Boolean)
        );

        const urls = Array.from(new Set(hrefs))
          .filter((href) =>
            !href.startsWith('#') &&
            !href.startsWith('mailto:') &&
            !href.startsWith('tel:') &&
            !href.toLowerCase().startsWith('javascript:')
          )
          .map((href) => {
            try {
              return new URL(href, page.url()).toString();
            } catch {
              return '';
            }
          })
          .filter(Boolean)
          .filter((url) => {
            try {
              return new URL(url).origin === currentOrigin;
            } catch {
              return false;
            }
          });

        for (const url of urls) {
          const res = await request.get(url, { maxRedirects: 5 });
          const linkStatus = res.status();
          expect(linkStatus, `Broken link ${url} on ${_page}`).toBeLessThan(400);
        }
      });
    }
  });
}



function getPages(lang: string = ''): string[] {
  const candidates = [
    path.resolve(process.cwd(), 'apps', 'cms', 'src', 'app'),
    path.resolve(process.cwd(), 'src', 'app'),
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore __dirname is available in transpiled tests
    path.resolve(__dirname, '../../src/app'),
  ];
  const appDir = candidates.find(p => fs.existsSync(p)) ?? path.resolve(process.cwd(), 'src', 'app');

  const localizedPaths = new Set<string>();
  const nonLocalizedPaths = new Set<string>();

  const isDynamic = (segment: string) => segment.includes('[') && segment.includes(']');
  const isGroup = (segment: string) => segment.startsWith('(') && segment.endsWith(')');
  const isLocaleDir = (segment: string) => segment === '[locale]';

  const normalizeUrl = (url: string) => (url === '//' || url === '' ? '/' : url);

  const walk = (dirAbs: string, urlSegments: string[], underLocale: boolean) => {
    const entries = fs.readdirSync(dirAbs, { withFileTypes: true });

    const hasPage = entries.some(e => e.isFile() && (e.name === 'page.tsx' || e.name === 'page.ts'));
    if (hasPage) {
      const url = '/' + urlSegments.filter(Boolean).join('/');
      const normalized = normalizeUrl(url);
      if (underLocale) {
        localizedPaths.add(normalized);
      } else {
        nonLocalizedPaths.add(normalized);
      }
    }

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const segName = entry.name;
        if (isDynamic(segName) && !isLocaleDir(segName)) continue;

        const nextDir = path.join(dirAbs, segName);
        const nextSegments = [...urlSegments];
        const nextUnderLocale = underLocale || isLocaleDir(segName);
        // ignore group and [locale] segments in URL path but traverse inside
        if (!isGroup(segName) && !isLocaleDir(segName)) {
          nextSegments.push(segName);
        }
        walk(nextDir, nextSegments, nextUnderLocale);
      }
    }
  };

  // start from root of app
  walk(appDir, [], false);

  const result: string[] = [];
  const prefix = lang ? `/${lang}` : '';

  // include non-localized pages only once (for default locale run)
  if (lang === '') {
    for (const basePath of nonLocalizedPaths) {
      result.push(basePath);
    }
  }

  for (const basePath of localizedPaths) {
    const localized = basePath === '/' ? (prefix || '/') : `${prefix}${basePath}`;
    result.push(localized);
  }

  const deduped = Array.from(new Set(result));
  const filtered = deduped.filter((p) => {
    const parts = p.split('/').filter(Boolean);
    if (parts.length === 0) return true; // keep root
    let idx = 0;
    if (locales.includes(parts[0])) idx++;
    const blockedFirstSegments = new Set(['admin', 'login']);
    return !blockedFirstSegments.has(parts[idx]);
  });

  return filtered;
}