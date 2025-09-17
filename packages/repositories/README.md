# PostRepository

## 🎯 Описание

`PostRepository` - это класс для работы с постами блога, который читает MDX файлы из файловой системы и предоставляет методы для их фильтрации, сортировки и поиска.

## ✨ Возможности

### **Парсинг контента**
- ✅ **Frontmatter** - извлечение метаданных из YAML заголовков
- ✅ **Markdown** - автоматическое преобразование Markdown в HTML
- ✅ **Валидация** - проверка структуры frontmatter с помощью Zod
- ✅ **Обработка ошибок** - graceful fallback при ошибках парсинга

### **Фильтрация и поиск**
- ✅ **По категории** - фильтрация постов по категории
- ✅ **По тегам** - фильтрация по одному или нескольким тегам
- ✅ **По автору** - фильтрация постов по автору
- ✅ **Поиск по тексту** - поиск по заголовку, описанию, excerpt и тегам

### **Сортировка**
- ✅ **По дате** - сортировка по дате публикации
- ✅ **По заголовку** - алфавитная сортировка
- ✅ **По времени создания** - сортировка по времени создания
- ✅ **Порядок** - поддержка возрастающего и убывающего порядка

## 🔧 Использование

### **Базовое использование**

```typescript
import { PostRepository } from '@/repositories/post.repository';

const postRepo = new PostRepository();

// Получить все посты
const posts = await postRepo.findAll();

// Получить пост по slug
const post = await postRepo.findBySlug('my-first-post');

// Получить все категории
const categories = await postRepo.findAllCategories();

// Получить всех авторов
const authors = await postRepo.findAllAuthors();
```

### **Фильтрация и сортировка**

```typescript
// Фильтрация по категории
const tutorials = await postRepo.findByCategory('tutorials');

// Фильтрация по автору
const johnPosts = await postRepo.findByAuthor('john-doe');

// Комплексная фильтрация и сортировка
const filteredPosts = await postRepo.findWithFilters(
  {
    category: 'tutorials',
    tags: ['react', 'nextjs'],
    author: 'john-doe',
    search: 'MDX'
  },
  {
    field: 'date',
    order: 'desc'
  }
);
```

## 📁 Структура файлов

```
content/blog/
├── my-first-post/
│   └── index.mdx
├── another-post/
│   └── index.mdx
└── ...
```

## 📝 Формат MDX файлов

```markdown
---
title: My First Post
date: 2024-01-01
tags: [demo, hello]
excerpt: This is a demo post.
category: main-category
author: john-doe
---

# Hello MDX

This is content stored in Git.

## Features

- **Markdown** support
- **MDX** components
- **Frontmatter** metadata
```

## 🎨 Настройки Markdown

Repository автоматически настраивает `marked` с оптимальными параметрами:

```typescript
marked.setOptions({
  gfm: true,        // GitHub Flavored Markdown
  breaks: true,     // Convert \n to <br>
});
```

## 🔍 Поиск

Поиск работает по следующим полям:
- **Заголовок** (`title`)
- **Описание** (`description`)
- **Excerpt** (`excerpt`)
- **Теги** (`tags`)

Поиск нечувствителен к регистру и поддерживает частичное совпадение.

## 📊 Интерфейсы

### **Post**
```typescript
interface Post {
  slug: string;
  title: string;
  description?: string;
  date?: string;
  tags?: string[];
  excerpt?: string;
  content?: string;  // HTML после парсинга Markdown
  category?: string;
  author?: string;
}
```

### **PostFilters**
```typescript
interface PostFilters {
  category?: string;
  tags?: string[];
  author?: string;
  search?: string;
}
```

### **PostSortOptions**
```typescript
interface PostSortOptions {
  field: 'date' | 'title' | 'created';
  order: 'asc' | 'desc';
}
```

## 🚀 API Routes

Repository интегрирован с Next.js API routes:

- `GET /api/posts` - получить список постов с фильтрацией
- `GET /api/posts/[slug]` - получить конкретный пост
- `GET /api/posts/categories` - получить все категории
- `GET /api/posts/authors` - получить всех авторов

## ⚡ Производительность

- **Кэширование** - посты читаются из файловой системы при каждом запросе
- **Ленивая загрузка** - посты загружаются только при необходимости
- **Оптимизированная сортировка** - эффективные алгоритмы сортировки
- **Фильтрация в памяти** - быстрая фильтрация без дополнительных запросов

## 🛠️ Расширение

Для добавления новых полей в frontmatter:

1. Обновите схему в `src/lib/validators/content.schema.ts`
2. Добавьте поле в интерфейс `Post`
3. Обновите метод `findBySlug` для извлечения нового поля
4. Добавьте фильтрацию в `applyFilters` если необходимо
