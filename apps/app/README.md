# ALTRP CMS

Payload CMS application for managing ALTRP website content.

## Setup

### 1. Install dependencies

```bash
bun install
```

### 2. PostgreSQL database setup

Create a PostgreSQL database:

```sql
CREATE DATABASE altrp_cms;
```

### 3. Environment variables configuration

Copy the `env.example` file to `.env` and configure the variables:

```bash
cp env.example .env
```

Update the following variables in `.env`:

```env
PAYLOAD_SECRET=your-very-secret-key-here
DATABASE_URL=postgresql://username:password@localhost:5432/altrp_cms
```

### 4. Run in development mode

```bash
bun run dev
```

Admin panel will be available at: http://localhost:3001/admin

### 5. Generate TypeScript types

```bash
bun run generate:types
```

## Available collections

- **Users** - System users with roles (admin, editor, user)
- **Posts** - Blog articles with category and tag support
- **Categories** - Article categories
- **Media** - Files and images
- **Pages** - Static website pages

## Scripts

- `bun run dev` - Run in development mode
- `bun run build` - Build for production
- `bun run start` - Run production version
- `bun run generate:types` - Generate TypeScript types
- `bun run migrate` - Run database migrations

## Frontend integration

For integration with the frontend application, use Payload REST API or GraphQL API:

- REST API: `http://localhost:3001/api/{collection}`
- GraphQL: `http://localhost:3001/api/graphql`

Example of fetching posts:

```typescript
const posts = await fetch('http://localhost:3001/api/posts').then(res => res.json())
```
