import * as path from "path";

/**
 * Universal function for getting content directory path
 * @param contentType - content type (authors, blog, categories, pages, media)
 * @returns full path to content directory
 */
export function getContentDir(
  contentType: "authors" | "blog" | "categories" | "pages" | "media",
): string {
  const projectRoot = process.cwd();

  return path.join(projectRoot, "../../packages/content/mdxs/", contentType);
}
