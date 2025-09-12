# Project Structure

This document outlines the ideal project structure, designed for scalability, clear separation of concerns, and alignment with Next.js App Router best practices. It is tailored to the project's specific technology stack.

## Root Directory Structure

```
.
├── .github/              # GitHub settings (Actions, PR templates, etc.)
├── .husky/               # Husky configuration for Git hooks
├── .vscode/              # VS Code project settings (settings.json)
├── _templates/           # Templates for the Hygen code generator
├── apps/                 # Applications in the monorepo
│   └── site/             # Main Next.js application
├── content/              # The "database" for the Git-as-CMS strategy
├── docs/                 # Project documentation
├── .eslintrc.json        # ESLint configuration
├── .gitignore
├── .lintstagedrc.js      # lint-staged configuration
├── .prettierrc.js        # Prettier configuration
├── bun.lockb             # Bun lockfile
├── LICENSE
├── Makefile
├── package.json          # Root package.json for monorepo
└── README.md
```

## Detailed `apps/site/` Directory Structure

This is the heart of the application. The `apps/site/` directory contains the main Next.js application and is designed to logically group files by their purpose.

```
apps/site/
├── app/                  # App Router: pages, layouts, API routes
│   ├── (main)/           # Route group for the public-facing site
│   │   ├── [locale]/     # Dynamic segment for i18n (next-intl)
│   │   │   ├── [slug]/   # Dynamic page routing
│   │   │   │   └── page.tsx
│   │   │   ├── authors/  # Authors listing and individual pages
│   │   │   │   ├── [slug]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── blog/     # Blog posts
│   │   │   │   ├── [slug]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── categories/ # Categories listing and individual pages
│   │   │   │   ├── [slug]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── layout.tsx     # Main layout with Header/Footer
│   │   │   └── page.tsx       # Home page
│   │   └── not-found.tsx  # Custom 404 page
│   │
│   ├── admin/            # Admin panel (CMS)
│   │   ├── authors/      # Author management
│   │   │   ├── [slug]/
│   │   │   │   └── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── categories/   # Category management
│   │   │   ├── [slug]/
│   │   │   │   └── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── dashboard/    # Dashboard page (using Tremor)
│   │   │   └── page.tsx
│   │   ├── editor/       # TipTap editor
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   ├── media/        # Media management
│   │   │   └── page.tsx
│   │   ├── pages/        # Page management
│   │   │   ├── [slug]/
│   │   │   │   └── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── posts/        # Post management
│   │   │   ├── [slug]/
│   │   │   │   └── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── layout.tsx    # Admin layout
│   │   └── page.tsx      # Admin home
│   │
│   ├── api/              # API routes
│   │   ├── admin/        # Admin API endpoints
│   │   │   ├── authors/  # Author CRUD operations
│   │   │   ├── blog/     # Blog post operations
│   │   │   ├── categories/ # Category operations
│   │   │   ├── media/    # Media operations
│   │   │   ├── pages/    # Page operations
│   │   │   └── README.md
│   │   ├── authors/      # Public author API
│   │   │   ├── [slug]/
│   │   │   │   └── route.ts
│   │   │   └── route.ts
│   │   ├── categories/   # Public category API
│   │   │   ├── [slug]/
│   │   │   │   └── route.ts
│   │   │   └── route.ts
│   │   ├── media/        # Media API
│   │   │   ├── [slug]/
│   │   │   └── stats/
│   │   ├── posts/        # Public post API
│   │   │   ├── [slug]/
│   │   │   │   └── route.ts
│   │   │   ├── authors/
│   │   │   │   └── route.ts
│   │   │   ├── categories/
│   │   │   │   └── route.ts
│   │   │   └── route.ts
│   │   ├── revalidate/   # Cache revalidation
│   │   │   └── route.ts
│   │   └── rss/          # RSS feed
│   │       └── route.ts
│   │
│   ├── globals.css       # Global styles and Tailwind directives
│   ├── layout.tsx        # Root layout (<html>, <body> tags)
│   └── page.tsx          # Root page
│
├── components/           # Reusable React components
│   ├── AppSidebar/       # Application sidebar component
│   │   └── AppSidebar.tsx
│   ├── AuthorCard/       # Author card component
│   │   └── AuthorCard.tsx
│   ├── AuthorList/       # Author list component
│   │   └── AuthorList.tsx
│   ├── CategoryCard/     # Category card component
│   │   └── CategoryCard.tsx
│   ├── CategoryList/     # Category list component
│   │   └── CategoryList.tsx
│   ├── DynamicHtml.tsx   # Dynamic HTML rendering
│   ├── features/         # Components responsible for specific business logic
│   │   ├── blog/         # Blog-related components
│   │   │   ├── [14 files in subtree: 10 *.tsx, 4 *.ts]
│   │   ├── cms/          # CMS components
│   │   │   ├── [12 files in subtree: 11 *.tsx, 1 *.ts]
│   │   ├── HeroBlock/    # Hero section component
│   │   │   └── HeroBlock.tsx
│   │   └── search/       # Search component with Fuse.js integration
│   │       └── GlobalSearch.tsx
│   │
│   ├── layout/           # Components for page structure
│   │   ├── Footer/
│   │   │   └── [1 file in subtree: 1 *.tsx]
│   │   ├── Header/
│   │   │   └── [1 file in subtree: 1 *.tsx]
│   │   └── Sidebar/
│   │       └── [1 file in subtree: 1 *.tsx]
│   │
│   ├── providers/        # Context providers and wrappers
│   │   ├── IntlProvider.tsx # For next-intl
│   │   └── Providers.tsx # Combined providers
│   │
│   ├── Seo/              # SEO components
│   ├── SeoDefault/       # Default SEO component
│   │   └── SeoDefault.tsx
│   ├── SessionProvider/  # NextAuth session provider
│   │   └── SessionProvider.tsx
│   ├── shared/           # General, atomic components (not from shadcn)
│   │   ├── Icon/         # Icon component
│   │   │   └── [1 file in subtree: 1 *.tsx]
│   │   └── Logo/         # Logo component
│   │       └── [1 file in subtree: 1 *.tsx]
│   │
│   ├── SiteHeader/       # Site header component
│   │   └── SiteHeader.tsx
│   ├── ThemeProvider/    # Theme provider
│   │   └── ThemeProvider.tsx
│   │
│   └── ui/               # Components from the Shadcn/ui library (generated by CLI)
│       ├── accordion.tsx
│       ├── alert-dialog.tsx
│       ├── alert.tsx
│       ├── aspect-ratio.tsx
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── breadcrumb.tsx
│       ├── button.tsx
│       ├── calendar.tsx
│       ├── card.tsx
│       ├── carousel.tsx
│       ├── chart.tsx
│       ├── checkbox.tsx
│       ├── collapsible.tsx
│       ├── command.tsx
│       ├── context-menu.tsx
│       ├── dialog.tsx
│       ├── drawer.tsx
│       ├── dropdown-menu.tsx
│       ├── hover-card.tsx
│       ├── input-otp.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── menubar.tsx
│       ├── navigation-menu.tsx
│       ├── notification-container.tsx
│       ├── pagination.tsx
│       ├── popover.tsx
│       ├── progress.tsx
│       ├── radio-group.tsx
│       ├── resizable.tsx
│       ├── scroll-area.tsx
│       ├── search-form.tsx
│       ├── select.tsx
│       ├── separator.tsx
│       ├── sheet.tsx
│       ├── sidebar.tsx
│       ├── skeleton.tsx
│       ├── slider.tsx
│       ├── switch.tsx
│       ├── table.tsx
│       ├── tabs.tsx
│       ├── textarea.tsx
│       ├── toggle-group.tsx
│       ├── toggle.tsx
│       └── tooltip.tsx
│
├── config/               # Application-wide configuration files
│   ├── auth.ts           # NextAuth.js configuration
│   ├── i18n.ts           # next-intl configuration
│   ├── marketing.ts      # Configuration for SEO, sitemap, etc.
│   └── site.ts           # General site configuration (name, URL)
│
├── hooks/                # Custom React hooks
│   ├── use-blog-posts-simple.ts
│   ├── use-blog-posts.ts
│   ├── use-breadcrumbs.ts
│   ├── use-debounce.ts
│   ├── use-locale.ts
│   ├── use-mobile.ts
│   ├── use-notifications.ts
│   └── use-slug-validation.ts
│
├── lib/                  # Helper code not related to React
│   ├── api/              # Clients for external APIs
│   │   └── github.ts     # Initialization and configuration of Octokit.js
│   │
│   ├── html-to-markdown.ts
│   ├── mdx.tsx           # Logic for parsing and rendering MDX (next-mdx-remote)
│   ├── rss.ts            # RSS feed generation
│   ├── search.test.ts    # Search tests
│   ├── search.ts         # Logic for Fuse.js (content indexing)
│   ├── sharp.ts          # Functions for image processing with Sharp
│   ├── transliteration.ts
│   ├── utils.ts          # General utilities (e.g., `cn` for Tailwind, date formatting)
│   └── validators/       # Zod validation schemas
│       ├── content.schema.test.ts # Tests for content schema
│       ├── content.schema.ts     # Schema for MDX file frontmatter
│       └── form.schema.ts        # Schemas for React Hook Form
│
├── messages/             # Localization files for next-intl
│   ├── en.json
│   └── ru.json
│
├── public/               # Static assets (favicon, images, fonts)
│   └── images/
│       ├── Gemini_Generated_Image_lztpxslztpxslztp.jpg
│       └── logo.svg
│
├── repositories/         # Implementation of the Repository Pattern
│   ├── author.repository.ts
│   ├── base.repository.ts
│   ├── category.repository.ts
│   ├── media.repository.ts
│   ├── page.repository.ts
│   ├── post.repository.ts
│   └── README.md
│
├── stores/               # Global state managers (Zustand)
│   ├── ui.store.ts       # Store for UI state (e.g., is sidebar open)
│   └── user.store.ts     # Store for user data
│
├── types/                # Global TypeScript definitions
│   ├── content.d.ts      # Types for posts, authors, etc.
│   └── next-auth.d.ts    # Extending types for the NextAuth session
│
├── bun.lock              # Bun lockfile
├── components.json       # shadcn/ui configuration
├── i18n.ts              # i18n configuration
├── middleware.ts         # Next.js middleware
├── next-env.d.ts        # Next.js environment types
├── next-sitemap.config.js # next-sitemap configuration
├── next.config.mjs      # Next.js configuration
├── package.json         # Application dependencies
├── postcss.config.js    # PostCSS configuration (for Tailwind)
├── tailwind.config.ts   # Tailwind CSS configuration
└── tsconfig.json        # TypeScript configuration
```

## Detailed `content/` Directory Structure

This is your file-based "database" and the core of the **Git-as-CMS** strategy.

```
content
├── authors/              # Information about authors
│   └── john-doe.mdx
├── blog/                 # Blog posts
│   └── my-first-post/      # Folder for a post to co-locate images
│       ├── index.mdx       # The post itself with frontmatter
│       └── hero-image.png  # Image associated with the post
│   └── another-post.mdx  # Alternatively, posts can be stored as single files
│
└── pages/                # Standalone pages (e.g., About, Contact)
    └── about.mdx
```

## Key Architectural Decisions

1.  **Monorepo Architecture**: The project uses a monorepo structure with `apps/site/` containing the main Next.js application. This allows for future expansion with additional applications while keeping the main site code organized.

2.  **`apps/site/` Directory**: The main application is contained within `apps/site/`, separating it from root-level configuration files and allowing for a cleaner project structure.

3.  **Next.js Route Groups `(main)` & Admin**: The `(main)` route group handles the public-facing site, while the `admin/` directory contains the CMS functionality. This allows for different layouts and functionality without affecting the URL structure.

4.  **`[locale]` for i18n**: This is the standard pattern for `next-intl`, making the locale a dynamic segment of the URL (e.g., `/en/blog`, `/ru/blog`).

5.  **`components/` Breakdown**:
    *   **`ui/`**: Strictly for components generated by the `shadcn/ui` CLI. These should not be manually edited; instead, they should be updated via the CLI.
    *   **`shared/`**: Your own custom, atomic components that are application-agnostic and can be used anywhere (e.g., `Logo`, `Icon`).
    *   **`features/`**: Larger, "smarter" components that handle specific business logic or features (e.g., `PostCard` knows how to display post data; `GlobalSearch` contains search logic).
    *   **Component Organization**: Each major component gets its own directory (e.g., `AuthorCard/`, `CategoryList/`) for better organization and co-location of related files.

6.  **`lib/` vs `hooks/` vs `stores/`**:
    *   **`lib/`**: For pure TypeScript/JavaScript modules that are not React-specific. This is the perfect place for API clients, Zod validators, and utility functions.
    *   **`hooks/`**: For custom React Hooks that encapsulate stateful logic and can be reused across components.
    *   **`stores/`**: For global state management using Zustand. Each store is separated into its own file (e.g., `ui.store.ts`) for better organization.

7.  **`repositories/`**: This is the core of our **Data Strategy**. A repository (e.g., `post.repository.ts`) encapsulates all logic for fetching and processing data from the `content/` directory. It reads files, parses frontmatter with Zod, processes MDX, and returns structured data to the application. This isolates business logic from the data source.

8.  **`config/`**: Moving configurations (NextAuth, i18n) into a dedicated `config/` directory keeps the application code cleaner and makes project settings easier to find.

9.  **`content/`**: Structuring content by type (e.g., `blog`, `authors`) allows for easy extension of data models. Using a dedicated folder for each post (`my-first-post/index.mdx`) is a convenient pattern for co-locating images with their corresponding content.

10. **API Organization**: The API routes are organized into `admin/` and public endpoints, with clear separation between administrative functions and public-facing APIs.

11. **Testing**: Test files (`*.test.ts`, `*.test.tsx`) should be co-located with the source files they are testing (e.g., `apps/site/lib/utils.test.ts` or `apps/site/components/features/blog/PostCard.test.tsx`).

12. **CMS Integration**: The admin section includes comprehensive content management with separate sections for authors, categories, posts, pages, and media, providing a complete content management experience.

13. **Static Assets**: The `public/` directory is located within `apps/site/` to keep assets scoped to the specific application.