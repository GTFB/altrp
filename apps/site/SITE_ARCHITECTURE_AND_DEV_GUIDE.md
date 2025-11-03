## Overview of `apps/site`

**Purpose**: Next.js (App Router) web application for the public site and the ALTRP admin panel. Hosted on Cloudflare Pages, server-side handlers are Cloudflare Pages Functions, database is Cloudflare D1.

### Technologies and infrastructure
- **Next.js 15** with `src/app` directory (Server/Client Components).
- **Tailwind CSS 4** and **shadcn/ui** (configured via `components.json`, Tailwind in `tailwind.config.ts`).
- **Cloudflare Pages + D1**: configuration in `wrangler.toml` (binding `DB`).
- Sessions and auth implemented with Cloudflare Workers Web Crypto (AES-GCM, `session` cookie).
- UI libraries: Radix, lucide-react, etc.

### Directory structure (simplified)
- `src/app/` — routes and app layers:
  - `page.tsx` — homepage.
  - `login/page.tsx` — sign in.
  - `admin/` — admin area: `layout.tsx` wraps content with `AdminAuthGuard`.
- `src/components/` — UI components, guards (`AdminAuthGuard`, `RoleAuthGuard`), marketing/app blocks.
- `functions/` — Cloudflare Pages Functions (server endpoints):
  - `api/auth/*` — authentication (`login`, `logout`, `me`, `check-users`, `create-first-user`).
  - `api/admin/*` — admin endpoints; protected by `functions/api/admin/_middleware.ts`.
  - `_shared/*` — sessions (`session.ts`), password utilities (`password.ts`), schema, repositories, utils.
- `public/` — static assets.
- `dist/` — static export directory (when `STATIC_EXPORT=true`).
- Configs: `next.config.js`, `tailwind.config.ts`, `wrangler.toml`, `tsconfig.json`.

### Routing and UI layer
- Root layout `src/app/layout.tsx` enables themes (`next-themes`), optimizers, and metadata.
- Home (`src/app/page.tsx`) — public navigation + marketing blocks.
- Login (`src/app/login/page.tsx`) — sends POST to `/api/auth/login`; redirects based on roles.
- Admin (`src/app/admin/*`) — pages are accessible only after `AdminAuthGuard` checks.

### Authentication and sessions
- `functions/api/auth/login.ts`:
  - Finds user and roles via `MeRepository` (D1), verifies password (`password.ts`, SHA-256).
  - Creates encrypted `session` cookie (`session.ts`, AES-GCM, HttpOnly, Secure, SameSite=Strict, Max-Age=7 days).
- `functions/api/auth/me.ts` — validates session and returns user with roles (re-validated from DB).
- `functions/api/auth/check-users.ts` — checks if any users exist (first-run scenario).
- `functions/api/auth/create-first-user.ts` — creates the first user (Administrator role if absent), then logs in (issues session cookie).
- Client-side `AdminAuthGuard` validates session periodically (every minute):
  - No users — redirect to `/admin/create-new-user`.
  - Invalid session — redirect to `/login`.

### Admin API and security
- All `/api/admin/*` routes are protected by `functions/api/admin/_middleware.ts`:
  - Reads the user from cookie (`getSession`) and checks role via `isAdmin`.
  - No valid session: 401; no administrator rights: 403.

### Working with the database (Cloudflare D1)
- D1 binding configured in `wrangler.toml` (`DB`).
- `MeRepository` aggregates user profile (`users`), roles (`roles` via `user_roles`), and related entities (`humans`).
- Migrations and helper SQL files live in `migrations/site/*` (executed via `package.json` scripts).

### Build and deploy
- `next.config.js`:
  - With `STATIC_EXPORT=true` — static export to `dist` with `trailingSlash`.
  - Image optimizations disabled in production for Pages compatibility (`images.unoptimized`).
- Scripts (`package.json`):
  - `dev` (Next on `:3100`), `dev:wrangler` (Pages Functions on `:3300`), `dev:all` — both services + proxy on `:3400`.
  - `build` / `build:static`, `start`, `type-check`.
  - D1 commands: create DB, run migrations, queries (`wrangler d1 execute ...`).
- Deploy to Cloudflare Pages: `wrangler pages deploy dist` (see `README.md`).

### End-to-end flow
1. On first run, the frontend checks `/api/auth/check-users`. If there are no users — show create-first-user form (`/admin/create-new-user`), then auto login.
2. The user signs in via `/login` → `POST /api/auth/login`:
   - The server validates credentials (D1) and issues an encrypted session cookie.
   - The client redirects based on roles/settings (admin → `/admin`, otherwise `/`).
3. Access to admin pages is guarded by `AdminAuthGuard` (client) and `_middleware.ts` (server for `/api/admin/*`).

### Environment variables (essentials)
- `AUTH_SECRET` — key for session cookie encryption (required).
- `DB` — Cloudflare D1 binding (set by Wrangler/Pages).

### Notes
- Styling: only Tailwind utilities + shadcn/ui components; global styles in `src/app/globals.css`.
- `components.json` defines aliases `@/components`, `@/lib`, `@/hooks`, `@/components/ui` and style presets.

If you need a more detailed data model (tables, relations) or request sequences — say the word, and we’ll add a section based on `functions/_shared/schema/*`.


### Development recommendations

- General
  - Prefer Server Components; mark `use client` only when necessary.
  - Strict TypeScript; avoid `any` and implicit coercions.
  - Clear naming and small components; self-documenting code.

- Git/branches/PR
  - Do not commit to `main`/`develop`; use `feature/*`, `fix/*`, `chore/*` and PRs.
  - Commit messages and branch names — in English, meaningful.

- Package manager/versions
  - Use `bun`; do not mix npm/yarn/pnpm.
  - Do not commit `.env`; store secrets in Cloudflare Dashboard.

- Next.js/App Router
  - Use `metadata`/`layout.tsx` for head; do not duplicate `<head>`.
  - Avoid client `fetch` when data can be fetched on the server.
  - Do not use Node APIs incompatible with Pages Functions on the client.

- Components and styles
  - Generate new components with `bun hygen component new --name ComponentName`.
  - Tailwind CSS 4 utilities + shadcn/ui only; no custom CSS/inline `<style>`.
  - Reuse `@/components/ui`; follow the design tokens.

- Accessibility and UX
  - Keep focus styles, aria attributes, contrast; do not remove system outlines.
  - Provide meaningful text and `aria-label` for icons when needed.

- Authentication and security
  - Use `/api/auth/*`; do not duplicate auth logic.
  - Use HttpOnly `session` cookie only; do not store tokens in `localStorage`.
  - Handle 401/403 with predictable redirects.
  - `AUTH_SECRET` ≥ 32 bytes, only in CF Env; avoid logging PII.

- Admin area and guards
  - Use `AdminAuthGuard` in the admin layout.
  - For `/api/admin/*`, rely on `_middleware.ts`; do not bypass it.

- API/server logic (Pages Functions)
  - Reuse repositories from `functions/_shared/repositories`; avoid scattered SQL.
  - Validate inputs (e.g., `zod`), return consistent JSON errors.
  - Respect CORS/credentials; do not weaken `SameSite`/`Secure` for cookies.

- Database and migrations (D1)
  - The source of truth is collections in `apps/app/src/collections`.
  - Change/add collections first → from the repo root, run:

```bash
bun run db:app:generate
bun run db:site:migrate:local
```

- Performance
  - Mark client components only when needed; keep bundle size low.
  - Use dynamic imports for heavy widgets; watch dependency size.
  - Consider that `next/image` is `unoptimized` in production (Pages setting).

- Code quality
  - ESLint + `type-check` in CI; avoid deep nesting; use early returns.
  - Do not catch errors without handling; show clear user-facing messages.

- Development/run
  - `bun run dev` (3100), `dev:wrangler` (3300), `dev:all` (both + proxy 3400).
  - For new projects, you can change dev ports in `apps/site/package.json` (e.g., 3101/3301/3401).
  - Test scenarios: zero users, login, session expiration, admin rights.

- Deploy/Cloudflare configuration
  - `AUTH_SECRET` and D1 binding live only in Cloudflare; not in the repo.
  - For static export use `STATIC_EXPORT=true` and verify `dist`.

- Logs and monitoring
  - Locally — detailed logs without sensitive data; in prod — minimal PII.
  - For Pages Functions — `console.error` with sufficient context.


