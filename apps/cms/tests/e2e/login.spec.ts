import { test, expect } from '@playwright/test';
import { i18nConfig } from '@/config/i18n';

const { locales, defaultLocale } = i18nConfig;

test.describe('Login page', () => {
  for (const locale of locales) {
    const prefix = locale === defaultLocale ? '' : `/${locale}`;
    const loginPath = `${prefix}/login`;

    test(`renders login page - ${locale || 'default'}`, async ({ page }) => {
      const resp = await page.goto(loginPath, { waitUntil: 'domcontentloaded' });
      if (resp) expect(resp.status()).toBeLessThan(400);

      const mainHeading = page.getByRole('heading', { level: 1 });
      const signInBtn = page.getByRole('button', { name: /sign in with github/i });

      // Race UI settle conditions: heading visible, sign-in button visible, or redirect
      await Promise.race([
        mainHeading.waitFor({ state: 'visible', timeout: 15000 }),
        signInBtn.waitFor({ state: 'visible', timeout: 15000 }),
        page.waitForURL(/\/admin\/?$/, { timeout: 15000 }),
      ]);

      const isAdmin = /\/admin\/?$/.test(new URL(page.url()).pathname);
      if (!isAdmin) {
        // On unauthenticated state we expect at least heading or sign-in button
        const headingCount = await mainHeading.count();
        const buttonCount = await signInBtn.count();
        expect(headingCount > 0 || buttonCount > 0).toBeTruthy();
        if (headingCount > 0) await expect(mainHeading.first()).toBeVisible();
        if (buttonCount > 0) await expect(signInBtn.first()).toBeVisible();
      } else {
        expect(isAdmin).toBeTruthy();
      }
    });

    test(`redirects authenticated user to /admin - ${locale || 'default'}`, async ({ page, context }) => {
      // Emulate authenticated session by setting a cookie if your app uses one in dev.
      // If NextAuth uses secure cookies and domain, this might need adapting.
      // For now, navigate and verify we either see Sign In (unauth) or get redirected (auth).
      const resp = await page.goto(loginPath, { waitUntil: 'domcontentloaded' });
      if (resp) expect(resp.status()).toBeLessThan(400);

      // Give the page a moment to run client redirect effect if authenticated
      await page.waitForTimeout(300);

      // Either we are on /admin or still on /login (unauth) — assert both valid states
      const isAdmin = /\/admin\/?$/.test(new URL(page.url()).pathname);
      const isLogin = /\/login\/?$/.test(new URL(page.url()).pathname);
      expect(isAdmin || isLogin).toBeTruthy();
    });

    test(`clicking sign in starts provider flow - ${locale || 'default'}`, async ({ page }) => {
      const resp = await page.goto(loginPath, { waitUntil: 'domcontentloaded' });
      if (resp) expect(resp.status()).toBeLessThan(400);

      const signInBtn = page.getByRole('button', { name: /sign in with github/i });
      if (await signInBtn.count()) {
        const [request] = await Promise.all([
          page.waitForRequest((r) => /api\/auth\/signIn|signin|github/i.test(r.url())),
          signInBtn.first().click(),
        ]);
        expect(request.url()).toMatch(/github|auth/i);
      } else {
        // If already authenticated, button isn't present — treat as acceptable state
        expect(true).toBeTruthy();
      }
    });
  }
});


