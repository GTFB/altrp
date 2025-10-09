import TurndownService from "turndown";
// Create a turndown service instance
const turndownService = new TurndownService({
  headingStyle: "atx", // Use # for headings
  bulletListMarker: "-", // Use - for bullet lists
  codeBlockStyle: "fenced", // Use ``` for code blocks
  emDelimiter: "*", // Use * for emphasis
  strongDelimiter: "**", // Use ** for strong
  linkStyle: "inlined", // Use [text](url) for links
  linkReferenceStyle: "full", // Use [text][ref] for link references
});

// Add custom rules for better Markdown conversion
turndownService.addRule("strikethrough", {
  filter: ["del", "s"],
  replacement: (content) => `~~${content}~~`,
});

turndownService.addRule("underline", {
  filter: "u",
  replacement: (content) => `<u>${content}</u>`,
});

turndownService.addRule("horizontalRule", {
  filter: "hr",
  replacement: () => "\n\n---\n\n",
});

turndownService.addRule("blockquote", {
  filter: "blockquote",
  replacement: (content) => {
    const lines = content.split("\n");
    return lines.map((line) => `> ${line}`).join("\n") + "\n\n";
  },
});

/**
 * Convert HTML to Markdown
 * @param html - HTML string to convert
 * @returns Markdown string
 */
export function htmlToMarkdown(html: string): string {
  if (!html || html.trim() === "") {
    return "";
  }

  try {
    return turndownService.turndown(html);
  } catch (error) {
    console.error("Error converting HTML to Markdown:", error);
    return html; // Fallback to original HTML if conversion fails
  }
}

/**
 * Convert Markdown to HTML (using marked)
 * @param markdown - Markdown string to convert
 * @returns HTML string
 */
export async function markdownToHtml(markdown: string): Promise<string> {
  if (!markdown || markdown.trim() === "") {
    return "";
  }

  try {
    const { marked } = await import("marked");
    return marked(markdown);
  } catch (error) {
    console.error("Error converting Markdown to HTML:", error);
    return markdown; // Fallback to original Markdown if conversion fails
  }
}
