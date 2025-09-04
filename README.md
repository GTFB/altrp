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

Copy the `.env.example` file to `.env.local` and fill in the required values.

```bash
cp .env.example .env.local
```

You will need credentials for NextAuth.js (e.g., for GitHub authentication):

```env
# .env.local
GITHUB_ID=...
GITHUB_SECRET=...
NEXTAUTH_SECRET=... # Generate a secret key (openssl rand -base64 32)
NEXTAUTH_URL=http://localhost:3000
```

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

---

## 🤝 Contributing

Contributions are welcome! Please see `CONTRIBUTING.md` for more details on how to get started.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.