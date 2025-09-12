# Admin API Documentation

This directory contains the admin API endpoints for managing content in the Jambo CMS.

## Available APIs

### Blog Posts (`/api/admin/blog`)
- `GET /api/admin/blog` - List all blog posts
- `POST /api/admin/blog` - Create a new blog post
- `GET /api/admin/blog/[slug]/edit` - Get blog post for editing
- `PUT /api/admin/blog/[slug]` - Update blog post (supports slug change)
- `DELETE /api/admin/blog/[slug]` - Delete blog post
- `POST /api/admin/blog/check-slug` - Check slug availability

### Categories (`/api/admin/categories`)
- `GET /api/admin/categories` - List all categories
- `POST /api/admin/categories` - Create a new category
- `GET /api/admin/categories/[slug]/edit` - Get category for editing
- `PUT /api/admin/categories/[slug]` - Update category (supports slug change)
- `DELETE /api/admin/categories/[slug]` - Delete category
- `POST /api/admin/categories/check-slug` - Check slug availability

### Authors (`/api/admin/authors`)
- `GET /api/admin/authors` - List all authors
- `POST /api/admin/authors` - Create a new author
- `GET /api/admin/authors/[slug]/edit` - Get author for editing
- `PUT /api/admin/authors/[slug]` - Update author (supports slug change)
- `DELETE /api/admin/authors/[slug]` - Delete author
- `POST /api/admin/authors/check-slug` - Check slug availability

### Pages (`/api/admin/pages`)
- `GET /api/admin/pages` - List all pages
- `POST /api/admin/pages` - Create a new page
- `GET /api/admin/pages/[slug]/edit` - Get page for editing
- `PUT /api/admin/pages/[slug]` - Update page (supports slug change)
- `DELETE /api/admin/pages/[slug]` - Delete page
- `POST /api/admin/pages/check-slug` - Check slug availability

## Features

### Slug Management
- All APIs support slug changes when updating content
- Automatic file/folder renaming when slug changes
- Slug uniqueness validation
- Slug format validation (lowercase letters, numbers, hyphens only)

### Content Structure
- **Blog Posts**: Stored in `content/blog/[slug]/index.mdx`
- **Categories**: Stored in `content/categories/[slug].mdx`
- **Authors**: Stored in `content/authors/[slug].mdx`
- **Pages**: Stored in `content/pages/[slug].mdx`

### Frontmatter Fields
- **Blog Posts**: title, description, date, tags, excerpt, category, author
- **Categories**: title, date, tags, excerpt
- **Authors**: name, avatar, bio
- **Pages**: title, description, date, tags, excerpt

## Testing

Run the test script to verify all APIs:
```bash
node test-admin-api.js
```

## Security Note

⚠️ **Important**: These APIs currently have no authentication or authorization. They should be protected in production environments.
