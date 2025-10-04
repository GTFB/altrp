"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { MDXLayout } from "./mdx-layout";
import { MDXRenderer } from "./mdx-renderer";
import { PasswordPrompt } from "./password-prompt";
import { NAVIGATION_ITEMS } from "../../../settings";
import { useAuth } from "@/components/providers/AuthProvider";
import { useMdx } from "../providers/MdxProvider";

interface MDXFrontmatter {
  title: string;
  icon: string;
  nextButtonText: string;
  prevButtonText?: string;
  ctaLink?: string;
  ctaText?: string;
  locked?: boolean;
  slug?: string;
}

interface MDXContentProps {
  sectionId: string;
  onFrontmatterChange?: (frontmatter: MDXFrontmatter) => void;
  onTocChange?: (
    toc: Array<{ id: string; title: string; level: number; slug?: string }>,
  ) => void;
  onH1Change?: (h1Title: string) => void;
  onLoadingChange?: (loading: boolean) => void;
}

// function processInlineMarkdown(text: string): string {
//   return text
//     .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
//     .replace(/\*(.*?)\*/g, '<em>$1</em>')
//     .replace(/~~(.*?)~~/g, '<del>$1</del>')
//     .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:text-primary/80 underline">$1</a>')
//     .replace(/`([^`]+)`/g, '<code class="bg-muted px-2 py-1 rounded text-sm font-mono text-foreground border">$1</code>')
//     .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="my-6 rounded-lg shadow-md max-w-full h-auto" />')
// }

// async function highlightCode(code: string, language: string = 'text'): Promise<string> {
//   // Simple syntax highlighting without external dependencies
//   const escapedCode = code.replace(/</g, "&lt;").replace(/>/g, "&gt;")
//   return `<pre class="code-block" data-language="${language}"><code class="code">${escapedCode}</code></pre>`
// }

// function processList(listLines: string[]): string {
//   if (listLines.length === 0) return ''
//   let html = ''
//   const stack: Array<{ type: 'ul' | 'ol'; indent: number }> = []
//   let currentIndent = -1
//   const getIndent = (line: string) => line.match(/^\s*/)?.[0].length || 0

//   for (const line of listLines) {
//     const indent = getIndent(line)
//     const trimmedLine = line.trim()
//     const isOrdered = /^\d+\./.test(trimmedLine)
//     const listType = isOrdered ? 'ol' : 'ul'
//     const content = processInlineMarkdown(trimmedLine.replace(/^(\*|-|\d+\.)\s*/, ''))

//     if (indent > currentIndent) {
//       stack.push({ type: listType, indent: indent })
//       html += `<${listType}>`
//     } else if (indent < currentIndent) {
//       while (stack.length > 0 && stack[stack.length - 1].indent > indent) {
//         const last = stack.pop()
//         html += `</li></${last!.type}>`
//       }
//       html += '</li>'
//     } else {
//       html += '</li>'
//     }
//     html += `<li>${content}`
//     currentIndent = indent
//   }

//   while (stack.length > 0) {
//     const last = stack.pop()
//     html += `</li></${last!.type}>`
//   }
//   return html
// }

// function processBlockquote(quoteLines: string[]): string {
//   if (quoteLines.length === 0) return ''
//   let html = '<blockquote>'
//   let currentParagraph: string[] = []

//   for (const line of quoteLines) {
//     const content = line.trim().replace(/^>\s?/, '')
//     if (line.trim() === '>') {
//       if (currentParagraph.length > 0) {
//         html += `<p>${processInlineMarkdown(currentParagraph.join(' '))}</p>`
//         currentParagraph = []
//       }
//     } else {
//       currentParagraph.push(content)
//     }
//   }

//   if (currentParagraph.length > 0) {
//     html += `<p>${processInlineMarkdown(currentParagraph.join(' '))}</p>`
//   }

//   html += '</blockquote>'
//   return html
// }

// function processTable(tableLines: string[]): string {
//   if (tableLines.length < 2) return tableLines.join('\n')

//   const [headerLine, separatorLine, ...bodyLines] = tableLines
//   const headers = headerLine.split('|').map(h => h.trim()).filter(Boolean)
//   const rows = bodyLines.map(rowLine => rowLine.split('|').map(c => c.trim()).filter(Boolean))

//   // Determine alignment for each column
//   const alignments: string[] = []
//   if (separatorLine) {
//     const separatorCells = separatorLine.split('|').map(c => c.trim()).filter(Boolean)
//     separatorCells.forEach(cell => {
//       if (cell.startsWith(':') && cell.endsWith(':')) {
//         alignments.push('center')
//       } else if (cell.endsWith(':')) {
//         alignments.push('right')
//       } else if (cell.startsWith(':')) {
//         alignments.push('left')
//       } else {
//         alignments.push('left') // default
//       }
//     })
//   } else {
//     // If there's no separator line, align all columns to the left
//     headers.forEach(() => alignments.push('left'))
//   }

//   let html = '<table><thead><tr>'
//   headers.forEach((header, index) => {
//     const alignment = alignments[index] || 'left'
//     html += `<th style="text-align: ${alignment}">${processInlineMarkdown(header)}</th>`
//   })
//   html += '</tr></thead><tbody>'

//   rows.forEach(row => {
//     if (row.length === headers.length) {
//       html += '<tr>'
//       row.forEach((cell, index) => {
//         const alignment = alignments[index] || 'left'
//         html += `<td style="text-align: ${alignment}">${processInlineMarkdown(cell)}</td>`
//       })
//       html += '</tr>'
//     }
//   })

//   html += '</tbody></table>'
//   return html
// }

// Interface for diagram settings
// interface MermaidSettings {
//   enableZoom?: boolean
//   height?: string
//   zoomMin?: number
//   zoomMax?: number
//   zoomInitial?: number
//   tooltipText?: string
//   disableTooltip?: boolean
// }

// Function to extract settings from comments in diagram code
// function extractMermaidSettings(code: string): MermaidSettings {
//   const settings: MermaidSettings = {}

//   // Look for comments with settings
//   const lines = code.split('\n')

//   for (const line of lines) {
//     const trimmedLine = line.trim()

//     // Skip empty lines and comments without settings
//     if (!trimmedLine || !trimmedLine.startsWith('%%')) continue

//     // Extract settings from comments like %% zoom: true
//     if (trimmedLine.includes('zoom:')) {
//       const zoomMatch = trimmedLine.match(/zoom:\s*(true|false)/i)
//       if (zoomMatch) {
//         settings.enableZoom = zoomMatch[1].toLowerCase() === 'true'
//       }
//     }

//     if (trimmedLine.includes('height:')) {
//       const heightMatch = trimmedLine.match(/height:\s*([^\s]+)/i)
//       if (heightMatch) {
//         settings.height = heightMatch[1]
//       }
//     }

//     if (trimmedLine.includes('zoom-min:')) {
//       const zoomMinMatch = trimmedLine.match(/zoom-min:\s*([0-9.]+)/i)
//       if (zoomMinMatch) {
//         settings.zoomMin = parseFloat(zoomMinMatch[1])
//       }
//     }

//     if (trimmedLine.includes('zoom-max:')) {
//       const zoomMaxMatch = trimmedLine.match(/zoom-max:\s*([0-9.]+)/i)
//       if (zoomMaxMatch) {
//         settings.zoomMax = parseFloat(zoomMaxMatch[1])
//       }
//     }

//     if (trimmedLine.includes('zoom-initial:')) {
//       const zoomInitialMatch = trimmedLine.match(/zoom-initial:\s*([0-9.]+)/i)
//       if (zoomInitialMatch) {
//         settings.zoomInitial = parseFloat(zoomInitialMatch[1])
//       }
//     }

//     if (trimmedLine.includes('tooltip:')) {
//       const tooltipMatch = trimmedLine.match(/tooltip:\s*(.+)/i)
//       if (tooltipMatch) {
//         settings.tooltipText = tooltipMatch[1].trim()
//       }
//     }

//     if (trimmedLine.includes('disable-tooltip:')) {
//       const disableTooltipMatch = trimmedLine.match(/disable-tooltip:\s*(true|false)/i)
//       if (disableTooltipMatch) {
//         settings.disableTooltip = disableTooltipMatch[1].toLowerCase() === 'true'
//       }
//     }
//   }

//   return settings
// }

async function processMarkdownContent(
  markdown: string,
): Promise<{ content: string; mermaidCharts: string[] }> {
  const contentWithoutFrontmatter = markdown
    .replace(/^---\r?\n[\s\S]*?\r?\n---/, "")
    .trim();

  // Remove slug lines from content
  const cleanContent = contentCleaner(contentWithoutFrontmatter);

  const mermaidCharts: string[] = [];

  // Extract Mermaid diagrams
  const mermaidRegex = /```mermaid\n([\s\S]*?)\n```/g;
  cleanContent.replace(mermaidRegex, (match, code) => {
    const cleanCode = code.replace(/^%% .*$/gm, "").trim();
    mermaidCharts.push(cleanCode);
    return match; // Return original match to not change content
  });

  return { content: cleanContent, mermaidCharts };
}

function transliterateToLatin(text: string): string {
  const translitMap: Record<string, string> = {
    а: "a",
    б: "b",
    в: "v",
    г: "g",
    д: "d",
    е: "e",
    ё: "yo",
    ж: "zh",
    з: "z",
    и: "i",
    й: "y",
    к: "k",
    л: "l",
    м: "m",
    н: "n",
    о: "o",
    п: "p",
    р: "r",
    с: "s",
    т: "t",
    у: "u",
    ф: "f",
    х: "h",
    ц: "ts",
    ч: "ch",
    ш: "sh",
    щ: "sch",
    ъ: "",
    ы: "y",
    ь: "",
    э: "e",
    ю: "yu",
    я: "ya",
    А: "A",
    Б: "B",
    В: "V",
    Г: "G",
    Д: "D",
    Е: "E",
    Ё: "Yo",
    Ж: "Zh",
    З: "Z",
    И: "I",
    Й: "Y",
    К: "K",
    Л: "L",
    М: "M",
    Н: "N",
    О: "O",
    П: "P",
    Р: "R",
    С: "S",
    Т: "T",
    У: "U",
    Ф: "F",
    Х: "H",
    Ц: "Ts",
    Ч: "Ch",
    Ш: "Sh",
    Щ: "Sch",
    Ъ: "",
    Ы: "Y",
    Ь: "",
    Э: "E",
    Ю: "Yu",
    Я: "Ya",
  };

  return text
    .split("")
    .map((char) => translitMap[char] || char)
    .join("");
}

function generateSlug(title: string): string {
  // First transliterate Cyrillic to Latin
  const transliterated = transliterateToLatin(title);

  // Then apply standard slug generation
  return transliterated
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function extractToc(
  markdown: string,
  _pageSlug?: string,
): Array<{ id: string; title: string; level: number; slug?: string }> {
  const contentWithoutFrontmatter = markdown
    .replace(/^---\r?\n[\s\S]*?\r?\n---/, "")
    .trim();
  const lines = contentWithoutFrontmatter.replace(/\r/g, "").split("\n");
  const toc: Array<{
    id: string;
    title: string;
    level: number;
    slug?: string;
  }> = [];

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith("#")) {
      const level = trimmedLine.match(/^#+/)?.[0].length || 0;
      if (level > 0 && level <= 6) {
        const title = trimmedLine.substring(level).trim().replace(/\*\*/g, "");

        // Check if next line contains slug definition
        const nextLine = lines[index + 1]?.trim();
        let headingSlug: string | undefined;

        if (nextLine && nextLine.startsWith("slug:")) {
          // Extract slug from next line
          headingSlug = nextLine
            .replace("slug:", "")
            .trim()
            .replace(/['"]/g, "");
        } else {
          // Fallback to auto-generated slug with transliteration
          headingSlug = generateSlug(title);
        }

        const id = headingSlug; // Use only slug as ID for URL compatibility
        toc.push({ id, title, level, slug: headingSlug });
      }
    }
  });
  return toc;
}

function extractH1Title(markdown: string): string | null {
  const contentWithoutFrontmatter = markdown
    .replace(/^---\r?\n[\s\S]*?\r?\n---/, "")
    .trim();
  const lines = contentWithoutFrontmatter.replace(/\r/g, "").split("\n");
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith("# ")) {
      return trimmedLine.substring(2).replace(/\*\*/g, "");
    }
  }
  return null;
}

export function MDXContent({
  sectionId,
  onFrontmatterChange,
  onTocChange,
  onH1Change,
  onLoadingChange,
}: MDXContentProps) {
  const router = useRouter();
  const { mdx } = useMdx();

  const [content, setContent] = useState<string>(
    contentCleaner(mdx?.content || ""),
  );
  const [mermaidCharts, setMermaidCharts] = useState<string[]>([]);
  const [toc, setToc] = useState<
    Array<{ id: string; title: string; level: number; slug?: string }>
  >([]);
  const [contentCache, setContentCache] = useState<
    Record<
      string,
      {
        content: string;
        mermaidCharts: string[];
        frontmatter?: any;
        toc?: any;
        h1Title?: string;
      }
    >
  >({});
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const { sessionData } = useAuth();
  const onFrontmatterChangeRef = useRef(onFrontmatterChange);
  const onTocChangeRef = useRef(onTocChange);
  const onH1ChangeRef = useRef(onH1Change);
  const onLoadingChangeRef = useRef(onLoadingChange);

  useEffect(() => {
    onFrontmatterChangeRef.current = onFrontmatterChange;
    onTocChangeRef.current = onTocChange;
    onH1ChangeRef.current = onH1Change;
    onLoadingChangeRef.current = onLoadingChange;
  }, [onFrontmatterChange, onTocChange, onH1Change, onLoadingChange]);

  // Check authentication status

  const isAuthenticated =
    sessionData?.sections?.includes(sectionId) ||
    sessionData?.sections?.includes("*");

  useEffect(() => {
    const loadMDX = async () => {
      console.log("MDXContent: Loading content for sectionId:", sectionId);
      console.log("MDXContent: isAuthenticated:", isAuthenticated);

      // Don't load content if we're still checking access

      try {
        // Check cache
        if (contentCache[sectionId]) {
          const cached = contentCache[sectionId];

          // Check if content is locked and user is not authenticated
          if (cached.frontmatter?.locked === true && !isAuthenticated) {
            setIsLocked(true);
            return;
          }

          setContent(cached.content);
          setMermaidCharts(cached.mermaidCharts);
          setToc(cached.toc || []);

          if (cached.frontmatter) {
            onFrontmatterChangeRef.current?.(cached.frontmatter);
          }
          if (cached.toc) {
            onTocChangeRef.current?.(cached.toc);
          }
          if (cached.h1Title) {
            onH1ChangeRef.current?.(cached.h1Title);
          }
          return;
        }

        onLoadingChangeRef.current?.(true);

        console.log("MDXContent: Fetching from API:", `/api/mdx/${sectionId}`);
        const response = await fetch(`/api/mdx/${sectionId}`);
        console.log("MDXContent: API response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`API Error ${response.status}:`, errorText);
          throw new Error(
            `Failed to load MDX: ${response.status} - ${errorText}`,
          );
        }

        const data = await response.json();
        if (data.error) {
          console.error("API returned error:", data.error);
          throw new Error(data.error);
        }

        // Check if content is locked and user is not authenticated
        if (data.frontmatter?.locked === true && !isAuthenticated) {
          setIsLocked(true);
          return;
        }

        const { content: markdownContent, mermaidCharts: charts } =
          await processMarkdownContent(data.content);

        const toc = extractToc(data.content, data.frontmatter?.slug);
        const h1Title = extractH1Title(data.content);

        // Save to cache
        const cacheData = {
          content: markdownContent,
          mermaidCharts: charts,
          frontmatter: data.frontmatter,
          toc,
          h1Title: h1Title || undefined,
        };

        setContentCache((prev) => ({ ...prev, [sectionId]: cacheData }));
        setContent(markdownContent);
        setMermaidCharts(charts);
        setToc(toc);

        if (data.frontmatter) {
          onFrontmatterChangeRef.current?.(data.frontmatter);
        }

        if (toc) {
          onTocChangeRef.current?.(toc);
        }

        if (h1Title) {
          onH1ChangeRef.current?.(h1Title);
        }
      } catch (error) {
        console.error("Error loading MDX:", error);
        setContent(`<h1>Error loading content for section ${sectionId}</h1>`);
      } finally {
        onLoadingChangeRef.current?.(false);
      }
    };

    loadMDX();
  }, [sectionId, isAuthenticated]);

  const handleAuthSuccess = () => {
    setIsLocked(false);
  };

  const handleAuthCancel = () => {
    // Go back to previous section or stay on current if it's the only one
    const currentIndex = NAVIGATION_ITEMS.findIndex(
      (item) => item.id === sectionId,
    );
    if (currentIndex > 0) {
      // Go to previous section
      const prevSection = NAVIGATION_ITEMS[currentIndex - 1];
      router.push(prevSection.href);
    } else {
      // If it's the first section, reload to show password prompt again
      window.location.reload();
    }
  };

  // Show password prompt if content is locked and user is not authenticated
  if (isLocked && !isAuthenticated) {
    return (
      <PasswordPrompt
        sectionId={sectionId}
        onSuccess={handleAuthSuccess}
        onCancel={handleAuthCancel}
      />
    );
  }

  return (
    <MDXLayout>
      <div className="mt-8">
        <MDXRenderer
          markdownContent={content}
          mermaidCharts={mermaidCharts}
          toc={toc}
        />
      </div>
    </MDXLayout>
  );
}

const contentCleaner = (content: string) => {
  return content
    .replace(/\r/g, "")
    .split("\n")
    .filter((line) => !line.trim().startsWith("slug:"))
    .join("\n");
};
