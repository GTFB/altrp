# SQLite Migration Guide

## Что было сделано

### 1. Репозитории теперь используют динамическую фабрику провайдеров
- ✅ `PostRepository` → использует `createPostProvider()`
- ✅ `PageRepository` → использует `createPageProvider()`  
- ✅ `AuthorRepository` → использует `createAuthorProvider()`
- ✅ `CategoryRepository` → использует `createCategoryProvider()`
- ✅ `MediaRepository` → использует `createMediaProvider()`

### 2. Фабрика провайдеров использует переменную окружения
```typescript
// packages/repositories/providers/factory.ts
function getCmsProvider(): 'mdx' | 'sqlite' {
  const provider = process.env.CMS_PROVIDER || 'mdx';
  return provider as 'mdx' | 'sqlite';
}
```

### 3. Миграции созданы
- ✅ `migrations/cms/0000_wide_martin_li.sql`
- ✅ База данных: `packages/db/cms.database.sqlite`

## Как использовать

### Для разработки с SQLite:
1. Создайте `.env` файл в `apps/cms/`:
```env
CMS_PROVIDER=sqlite
CMS_SQLITE_PATH=../../packages/db/cms.database.sqlite
```

2. Или экспортируйте переменную окружения:
```bash
export CMS_PROVIDER=sqlite
```

### Для разработки с MDX:
1. Не устанавливайте `CMS_PROVIDER` (по умолчанию 'mdx')
2. Или установите явно:
```env
CMS_PROVIDER=mdx
```

## Исправление тестов

### Проблема
Прямой импорт репозиториев в начале тестов создаёт циклические зависимости:
```typescript
import { PostRepository } from '@/repositories/post.repository'; // ❌ Ошибка!
```

### Решение
Используйте динамический импорт внутри тестов:
```typescript
// Вместо импорта в начале файла
const { PostRepository } = await import('@/repositories/post.repository'); // ✅
```

### Список файлов для исправления

**Исправлены:**
- ✅ `apps/cms/tests/integration/api/admin/authors.root.test.ts`
- ✅ `apps/cms/tests/integration/api/api-posts.test.ts`

**Требуют исправления (15 файлов):**
- `apps/cms/tests/integration/api/admin/media.root.test.ts`
- `apps/cms/tests/integration/api/admin/pages.root.test.ts`
- `apps/cms/tests/integration/api/admin/media.stats.test.ts`
- `apps/cms/tests/integration/api/admin/pages.slug.test.ts`
- `apps/cms/tests/integration/api/admin/media.slug.test.ts`
- `apps/cms/tests/integration/api/admin/blog.slug.test.ts`
- `apps/cms/tests/integration/api/admin/blog.root.test.ts`
- `apps/cms/tests/integration/api/admin/categories.root.test.ts`
- `apps/cms/tests/integration/api/api-authors-slug.test.ts`
- `apps/cms/tests/integration/api/api-authors.test.ts`
- `apps/cms/tests/integration/api/api-categories-slug.test.ts`
- `apps/cms/tests/integration/api/api-categories.test.ts`
- `apps/cms/tests/integration/api/api-content-info.test.ts`
- `apps/cms/tests/integration/api/api-search.test.ts`
- `apps/cms/tests/integration/api/api-posts-authors.test.ts`
- `apps/cms/tests/integration/api/api-posts-slug.test.ts`
- `apps/cms/tests/integration/api/api-posts-categories.test.ts`

### Пример исправления

**Было:**
```typescript
import { PostRepository } from '@/repositories/post.repository';

it('test case', async () => {
  const original = PostRepository.getInstance;
  // ...
});
```

**Стало:**
```typescript
// Удалить импорт из начала файла

it('test case', async () => {
  const { PostRepository } = await import('@/repositories/post.repository');
  const original = PostRepository.getInstance;
  // ...
});
```

## Что нужно закоммитить

```bash
git add migrations/cms/
git add packages/repositories/*.ts
git add packages/repositories/providers/
git add apps/cms/drizzle.config.ts
git add apps/cms/example.env
git add apps/cms/tests/integration/api/admin/authors.root.test.ts
git add apps/cms/tests/integration/api/api-posts.test.ts
git commit -m "feat: migrate CMS to SQLite with dynamic provider selection

- Add SQLite providers for all repositories
- Implement factory pattern with env-based provider selection
- Generate SQLite migrations for CMS schema
- Fix circular dependency issues in tests using dynamic imports
- Update example.env with CMS_PROVIDER configuration"
```

## Следующие шаги

1. Исправить оставшиеся 15 тестовых файлов (использовать динамический импорт)
2. Запустить все интеграционные тесты: `bun test tests/integration`
3. Убедиться, что SQLite база работает корректно
4. Создать тестовые данные в SQLite базе для разработки

