/**
 * Utility functions for working with Markdown
 */

import type { marked } from "marked";

let markedInstance: typeof marked | null = null;

/**
 * Get configured marked instance
 */
async function getMarked() {
  if (!markedInstance) {
    const { marked } = await import("marked");
    markedInstance = marked;

    // Configure marked options
    markedInstance.setOptions({
      gfm: true, // GitHub Flavored Markdown
      breaks: true, // Convert \n to <br>
    });
  }

  return markedInstance;
}

/**
 * Parse Markdown content to HTML
 * @param content - Markdown string
 * @returns HTML string
 */
export async function parseMarkdown(content: string): Promise<string> {
  if (!content || content.trim() === "") {
    return "";
  }

  try {
    const marked = await getMarked();
    return await marked(content);
  } catch (error) {
    console.warn("Warning: Could not parse markdown:", error);
    return content; // Fallback to raw content if markdown parsing fails
  }
}
