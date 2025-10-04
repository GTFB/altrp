import { CMS_PROVIDER } from "../../../settings";
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
} from "@/types/providers";

export function createAuthorProvider(): AuthorDataProvider {
  return CMS_PROVIDER === "sqlite"
    ? new SqliteAuthorProvider()
    : new MdxAuthorProvider();
}

export function createCategoryProvider(): CategoryDataProvider {
  return CMS_PROVIDER === "sqlite"
    ? new SqliteCategoryProvider()
    : new MdxCategoryProvider();
}

export function createMediaProvider(): MediaDataProvider {
  return CMS_PROVIDER === "sqlite"
    ? new SqliteMediaProvider()
    : new MdxMediaProvider();
}

export function createPageProvider(): PageDataProvider {
  return CMS_PROVIDER === "sqlite"
    ? new SqlitePageProvider()
    : new MdxPageProvider();
}

export function createPostProvider(): PostDataProvider {
  return CMS_PROVIDER === "sqlite"
    ? new SqlitePostProvider()
    : new MdxPostProvider();
}
