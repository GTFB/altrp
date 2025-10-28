import {
  MdxAuthorProvider,
  MdxCategoryProvider,
  MdxMediaProvider,
  MdxPageProvider,
  MdxPostProvider,
} from "./mdx";
import { SqliteAuthorProvider } from "./sqlite/author.provider";
import { SqliteCategoryProvider } from "./sqlite/category.provider";
import { SqliteMediaProvider } from "./sqlite/media.provider";
import { SqlitePageProvider } from "./sqlite/page.provider";
import { SqlitePostProvider } from "./sqlite/post.provider";
import type {
  AuthorDataProvider,
  CategoryDataProvider,
  MediaDataProvider,
  PageDataProvider,
  PostDataProvider,
} from "@/packages/types/providers";
import { CMS_PROVIDER as SETTINGS_PROVIDER } from "@/settings";

function getCmsProvider(): 'mdx' | 'sqlite' {
  const envProvider = (process.env.CMS_PROVIDER as 'mdx' | 'sqlite' | undefined);
  return envProvider || SETTINGS_PROVIDER;
}

export function createAuthorProvider(): AuthorDataProvider {
  return getCmsProvider() === "sqlite"
    ? new SqliteAuthorProvider()
    : new MdxAuthorProvider();
}

export function createCategoryProvider(): CategoryDataProvider {
  return getCmsProvider() === "sqlite"
    ? new SqliteCategoryProvider()
    : new MdxCategoryProvider();
}

export function createMediaProvider(): MediaDataProvider {
  return getCmsProvider() === "sqlite"
    ? new SqliteMediaProvider()
    : new MdxMediaProvider();
}

export function createPageProvider(): PageDataProvider {
  return getCmsProvider() === "sqlite"
    ? new SqlitePageProvider()
    : new MdxPageProvider();
}

export function createPostProvider(): PostDataProvider {
  return getCmsProvider() === "sqlite"
    ? new SqlitePostProvider()
    : new MdxPostProvider();
}
