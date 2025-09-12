# Next.js & Git-CMS: Modern Content Platform

![Project Screenshot](https://via.placeholder.com/1200x600.png?text=Your+Project+Screenshot)

<p align="center">
  <a href="#-about-the-project">About The Project</a> •
  <a href="#-key-features">Key Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-project-structure">Project Structure</a> •
  <a href="#-getting-started">Getting Started</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/runtime-Bun-black?style=for-the-badge&logo=bun" alt="Bun">
  <img src="https://img.shields.io/badge/framework-Next.js-black?style=for-the-badge&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/language-TypeScript-blue?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/styling-Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS">
</p>

## ✨ About The Project

This isn't just another blog template. It's a modern, type-safe, and high-performance foundation for building content-driven web applications. It's built upon a **Git-as-CMS** strategy, where all content is stored as MDX files directly within the Git repository. This approach ensures versioning, simplicity, and full control over your data without the need for an external database.

The project is built with a strong focus on **Developer Experience (DX)** and scalability, leveraging the best tools from the modern web ecosystem.

## 🚀 Key Features

*   **⚡️ Blazing Fast Performance**: Powered by Bun and Next.js App Router with Server Components.
*   **📂 Git-Powered CMS**: All content is version-controlled in the repository and easily editable.
*   **✍️ Built-in Editor**: Edit MDX content directly in the browser with a Tiptap-based editor.
*   **🛡️ End-to-end Type Safety**: TypeScript throughout, with schema validation for content and forms via Zod.
*   **🌐 Internationalization (i18n) Ready**: Built-in support for multiple languages with `next-intl`.
*   **🎨 Flexible UI Customization**: Components built with shadcn/ui and styled with Tailwind CSS 4.
*   **🔎 Lightning-Fast Search**: Client-side content search powered by Fuse.js.
*   **📈 SEO Optimized**: Automatic sitemap generation, RSS feeds, and metadata management with `next-seo`.
*   **🛠️ Superior Developer Experience**: Linting, formatting, Git hooks, and code generation out-of-the-box.

## 🛠️ Tech Stack

This project uses a carefully curated set of technologies to achieve maximum efficiency and a great developer experience.

### Core & Architecture

| Technology | Purpose |
| :--- | :--- |
| **Bun** | An incredibly fast JavaScript runtime, bundler, and package manager. |
| **Next.js** | The React Framework with App Router for hybrid and server rendering. |
| **TypeScript** | Strict typing for code reliability and scalability. |
| **Tailwind CSS 4** | A utility-first CSS framework for rapid and consistent styling. |
| **Git-as-CMS** | The strategy of using Git as a version-controlled content database. |
| **Repository Pattern** | A design pattern to abstract data access logic from the application. |
| **Zustand** | A minimalistic and powerful state management solution. |

### UI & Frontend

| Technology | Purpose |
| :--- | :--- |
| **Shadcn/ui** | Not a library, but a collection of reusable, customizable components. |
| **Lucide React** | Beautiful and consistent open-source icons. |
| **next-themes** | Theme management (light/dark mode) integrated with Next.js. |
| **Tremor** | Components for building insightful dashboards in the CMS. |
| **Sonner** | An elegant and simple toast notification library. |

### Data & Content

| Technology | Purpose |
| :--- | :--- |
| **MDX** | A content format that lets you use React components in Markdown. |
| **next-mdx-remote**| A powerful tool for rendering MDX strings. |
| **Zod** | Schema validation for MDX frontmatter and form data. |
| **Fuse.js** | A lightweight fuzzy-search library for client-side search. |
| **TipTap** | A headless editor framework for creating custom WYSIWYG experiences. |
| **Sharp** | A high-performance image optimization library. |

### Tooling & DX

| Technology | Purpose |
| :--- | :--- |
| **React Hook Form** | Performant and flexible form management. |
| **Husky + lint-staged**| Automatically run linters and tests before each commit. |
| **ESLint + Prettier** | Enforcing consistent code style and catching errors. |
| **Hygen** | A code generator for quickly scaffolding components, hooks, etc. |

## 📁 Project Structure

The project structure is organized around the principle of Separation of Concerns for easy navigation and scalability.

<details>
<summary>View detailed folder structure</summary>

```
src
├── app/                  # App Router: pages, layouts, API routes
├── components/           # Reusable React components (ui, features, layout)
├── lib/                  # Helper functions, API clients, validators
├── repositories/         # Implementation of the Repository Pattern for data access
├── stores/               # Zustand global state stores
├── hooks/                # Custom React hooks
├── config/               # Application-wide configuration files (auth, i18n, site)
├── messages/             # Localization files for next-intl
└── types/                # Global TypeScript definitions
```

</details>

## 🚀 Getting Started

Follow these steps to get the project running locally.

### 1. Clone the repository

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### 2. Install dependencies

This project uses **Bun**. If you don't have it installed, please [install it first](https://bun.sh/docs/installation).

```bash
bun install
```

### 3. Configure Environment Variables

#### Option 1: Using Make Command (Recommended)
Generate the `.env` file automatically with a pre-generated `NEXTAUTH_SECRET`:

```bash
make env
```

This command will:
- Copy `apps/site/example.env` to `apps/site/.env`
- Automatically generate a secure `NEXTAUTH_SECRET` using OpenSSL
- Backup existing `.env` file if it exists

#### Option 2: Manual Setup
If you prefer to set up manually:

```bash
cp apps/site/example.env apps/site/.env
```

Then fill in the required values in `apps/site/.env`:

```env
# apps/site/.env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
NEXTAUTH_SECRET=your_generated_secret # Generate with: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
```

**Note**: You'll need to obtain OAuth credentials from your chosen providers (Google, GitHub, etc.) and add them to the `.env` file.

### 4. Run the Development Server

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

*   `bun dev`: Runs the app in development mode.
*   `bun build`: Builds the app for production.
*   `bun start`: Starts the production server.
*   `bun lint`: Lints the codebase with ESLint.
*   `bun format`: Formats the code with Prettier.
*   `bun test`: Runs unit tests.

### Available Make Commands

*   `make env`: Generate `.env` file from `example.env` with auto-generated `NEXTAUTH_SECRET`
*   `make component NAME=ComponentName`: Generate a new React component
*   `make init`: Initialize all project configurations
*   `make dev`: Run the development server
*   `make build`: Build the project for production

## 🔐 Access & Permissions

### Getting Admin Access

To access the admin panel and manage content:

1. **Authentication Setup**: Configure your authentication provider in `.env.local`
2. **Admin Role**: Currently, admin access is hardcoded for testing (see `AdminGuard.tsx`)
3. **Access Admin Panel**: Navigate to `/admin` after authentication

### API Endpoints

The project provides several API endpoints for content management:

#### Content Management
- `GET /api/admin/blog` - Get all blog posts with pagination
- `POST /api/admin/blog` - Create a new blog post
- `PUT /api/admin/blog/[slug]` - Update a blog post
- `DELETE /api/admin/blog/[slug]` - Delete a blog post

#### Authors & Categories
- `GET /api/authors` - Get all authors
- `GET /api/categories` - Get all categories

#### Public Content
- `GET /api/posts` - Get published posts
- `GET /api/rss` - RSS feed for blog posts

### Content Creation

#### Creating New Components
Use the built-in code generator to create new React components:

```bash
bun hygen component new --name ComponentName
```

#### Adding New Content
1. **Blog Posts**: Add MDX files to `content/blog/[slug]/index.mdx`
2. **Pages**: Add MDX files to `content/pages/[slug].mdx`
3. **Authors**: Add MDX files to `content/authors/[slug].mdx`
4. **Categories**: Add MDX files to `content/categories/[slug].mdx`

### Development Workflow

1. **Start Development**: `bun dev`
2. **Access Admin**: Go to `http://localhost:3000/admin`
3. **Create Content**: Use the admin interface or add MDX files directly
4. **Preview Changes**: Content updates automatically in development mode

---

## 🤝 Contributing

Contributions are welcome! Please see `CONTRIBUTING.md` for more details on how to get started.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.