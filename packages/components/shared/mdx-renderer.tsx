'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { CodeHighlight } from './code-highlight'
import rehypeRaw from 'rehype-raw'
import { InteractiveMermaid } from './interactive-mermaid'
import { shouldEnableZoom } from '../../lib/mermaid-config'
import { useTheme } from '../../hooks/use-theme'
import { Button } from '../ui/button'
import Link from 'next/link'
import { Check, Square, CheckSquare, SquareCheck, Info, CheckCircle, AlertTriangle, XCircle, Link as LinkIcon } from 'lucide-react'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../ui/accordion'
import { Avatar } from '../ui/avatar'
import { Breadcrumb } from '../ui/breadcrumb'
import { Badge } from '../ui/badge'
import { Card } from '../ui/card'
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '../ui/carousel'
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartStyle, } from '../ui/chart'
import { Checkbox } from '../ui/checkbox'
import { Collapsible } from '../ui/collapsible'
import { DropdownMenu } from '../ui/dropdown-menu'
import { Label } from '../ui/label'
import { Select } from '../ui/select'
import { Separator } from '../ui/separator'
import { Switch } from '../ui/switch'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs'
import { Toggle } from '../ui/toggle'
import { ToggleGroup } from '../ui/toggle-group'
import { Tooltip } from '../ui/tooltip'
import { Input } from '../ui/input'
import { VideoPlayer } from '../ui/video-player'
import { Skeleton } from '../ui/skeleton'
import { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption } from '../ui/table'
import { useAuth } from '@/components/providers/AuthProvider'

// Interface for diagram settings
interface MermaidSettings {
  enableZoom?: boolean
  height?: string
  zoomMin?: number
  zoomMax?: number
  zoomInitial?: number
  tooltipText?: string
  disableTooltip?: boolean
}

// Function to extract settings from comments in diagram code
function extractMermaidSettings(code: string): MermaidSettings {
  const settings: MermaidSettings = {}

  // Look for comments with settings
  const lines = code.split('\n')

  for (const line of lines) {
    const trimmedLine = line.trim()

    // Skip empty lines and comments without settings
    if (!trimmedLine || !trimmedLine.startsWith('%%')) continue

    // Extract settings from comments like %% zoom: true
    if (trimmedLine.includes('zoom:')) {
      const zoomMatch = trimmedLine.match(/zoom:\s*(true|false)/i)
      if (zoomMatch) {
        settings.enableZoom = zoomMatch[1].toLowerCase() === 'true'
      }
    }

    if (trimmedLine.includes('height:')) {
      const heightMatch = trimmedLine.match(/height:\s*([^\s]+)/i)
      if (heightMatch) {
        settings.height = heightMatch[1]
      }
    }

    if (trimmedLine.includes('zoom-min:')) {
      const zoomMinMatch = trimmedLine.match(/zoom-min:\s*([0-9.]+)/i)
      if (zoomMinMatch) {
        settings.zoomMin = parseFloat(zoomMinMatch[1])
      }
    }

    if (trimmedLine.includes('zoom-max:')) {
      const zoomMaxMatch = trimmedLine.match(/zoom-max:\s*([0-9.]+)/i)
      if (zoomMaxMatch) {
        settings.zoomMax = parseFloat(zoomMaxMatch[1])
      }
    }

    if (trimmedLine.includes('zoom-initial:')) {
      const zoomInitialMatch = trimmedLine.match(/zoom-initial:\s*([0-9.]+)/i)
      if (zoomInitialMatch) {
        settings.zoomInitial = parseFloat(zoomInitialMatch[1])
      }
    }

    if (trimmedLine.includes('tooltip:')) {
      const tooltipMatch = trimmedLine.match(/tooltip:\s*(.+)/i)
      if (tooltipMatch) {
        settings.tooltipText = tooltipMatch[1].trim()
      }
    }

    if (trimmedLine.includes('disable-tooltip:')) {
      const disableTooltipMatch = trimmedLine.match(/disable-tooltip:\s*(true|false)/i)
      if (disableTooltipMatch) {
        settings.disableTooltip = disableTooltipMatch[1].toLowerCase() === 'true'
      }
    }
  }

  return settings
}

interface MDXRendererProps {
  markdownContent: string
  mermaidCharts: string[]
  toc?: Array<{ id: string; title: string; level: number; slug?: string }>
}

const extractText = (children: any): string => {
  if (typeof children === 'string') {
    return children;
  }
  if (Array.isArray(children)) {
    return children.map(extractText).join('');
  }
  if (children && typeof children === 'object' && children.props) {
    return extractText(children.props.children);
  }
  return '';
};

// Function to create heading components with ID support
const createHeadingComponents = (toc?: Array<{ id: string; title: string; level: number; slug?: string }>) => {
  const getHeadingId = (level: number, children: any) => {
    if (!toc) return undefined

    const title = typeof children === 'string' ? children :
      Array.isArray(children) ? children.join('') :
        children?.toString() || ''

    // Clean the title from markdown formatting
    const cleanTitle = title.replace(/\*\*/g, '').trim()

    const tocItem = toc.find(item =>
      item.level === level &&
      item.title.trim() === cleanTitle
    )


    return tocItem?.id
  }

  return {
    // Headings
    h1: ({ children, ...props }: any) => {
      const id = getHeadingId(1, children)
      const tocItem = toc?.find(item => item.id === id)

      const copyLink = () => {
        if (tocItem?.slug) {
          const url = `${window.location.origin}${window.location.pathname}#${tocItem.slug}`
          navigator.clipboard.writeText(url)
        }
      }

      return (
        <div className="group relative">
          <h1
            id={id}
            className="text-3xl sm:text-4xl font-sans font-extrabold mb-6 text-foreground scroll-mt-20"
            {...props}
          >
            {children}
          </h1>
          {tocItem?.slug && (
            <button
              onClick={copyLink}
              className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded"
              title="Copy link to this heading"
            >
              <LinkIcon className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
      )
    },
    h2: ({ children, ...props }: any) => {
      const id = getHeadingId(2, children)
      const tocItem = toc?.find(item => item.id === id)

      const copyLink = () => {
        if (tocItem?.slug) {
          const url = `${window.location.origin}${window.location.pathname}#${tocItem.slug}`
          navigator.clipboard.writeText(url)
        }
      }

      return (
        <div className="group relative">
          <h2
            id={id}
            className="text-2xl sm:text-3xl font-sans font-bold mb-4 text-foreground scroll-mt-20 mt-8"
            {...props}
          >
            {children}
          </h2>
          {tocItem?.slug && (
            <button
              onClick={copyLink}
              className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded"
              title="Copy link to this heading"
            >
              <LinkIcon className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
      )
    },
    h3: ({ children, ...props }: any) => {
      const id = getHeadingId(3, children)
      const tocItem = toc?.find(item => item.id === id)

      const copyLink = () => {
        if (tocItem?.slug) {
          const url = `${window.location.origin}${window.location.pathname}#${tocItem.slug}`
          navigator.clipboard.writeText(url)
        }
      }

      return (
        <div className="group relative">
          <h3
            id={id}
            className="text-xl sm:text-2xl font-sans font-semibold mb-3 text-foreground scroll-mt-20 mt-8"
            {...props}
          >
            {children}
          </h3>
          {tocItem?.slug && (
            <button
              onClick={copyLink}
              className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded"
              title="Copy link to this heading"
            >
              <LinkIcon className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
      )
    },
    h4: ({ children, ...props }: any) => {
      const id = getHeadingId(4, children)
      const tocItem = toc?.find(item => item.id === id)

      const copyLink = () => {
        if (tocItem?.slug) {
          const url = `${window.location.origin}${window.location.pathname}#${tocItem.slug}`
          navigator.clipboard.writeText(url)
        }
      }

      return (
        <div className="group relative">
          <h4
            id={id}
            className="text-lg font-bold mb-2 text-foreground scroll-mt-20"
            {...props}
          >
            {children}
          </h4>
          {tocItem?.slug && (
            <button
              onClick={copyLink}
              className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded"
              title="Copy link to this heading"
            >
              <LinkIcon className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
      )
    },
    h5: ({ children, ...props }: any) => {
      const id = getHeadingId(5, children)
      const tocItem = toc?.find(item => item.id === id)

      const copyLink = () => {
        if (tocItem?.slug) {
          const url = `${window.location.origin}${window.location.pathname}#${tocItem.slug}`
          navigator.clipboard.writeText(url)
        }
      }

      return (
        <div className="group relative">
          <h5
            id={id}
            className="text-base font-semibold mb-2 text-foreground scroll-mt-20"
            {...props}
          >
            {children}
          </h5>
          {tocItem?.slug && (
            <button
              onClick={copyLink}
              className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded"
              title="Copy link to this heading"
            >
              <LinkIcon className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
      )
    },
    h6: ({ children, ...props }: any) => {
      const id = getHeadingId(6, children)
      const tocItem = toc?.find(item => item.id === id)

      const copyLink = () => {
        if (tocItem?.slug) {
          const url = `${window.location.origin}${window.location.pathname}#${tocItem.slug}`
          navigator.clipboard.writeText(url)
        }
      }

      return (
        <div className="group relative">
          <h6
            id={id}
            className="text-sm font-medium mb-2 text-muted-foreground scroll-mt-20"
            {...props}
          >
            {children}
          </h6>
          {tocItem?.slug && (
            <button
              onClick={copyLink}
              className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded"
              title="Copy link to this heading"
            >
              <LinkIcon className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
      )
    },

    // Paragraphs
    p: ({ node, children, ...props }: any) => {
      if (
        node &&
        node.children.length === 1 &&
        node.children[0].type === 'element' &&
        node.children[0].tagName.endsWith('ui')
      ) {
        return <>{children}</>;
      }
      return (
        <p className="text-foreground mb-4 leading-relaxed text-sm sm:text-base" {...props}>
          {children}
        </p>
      );
    },

    // Lists
    ul: ({ children, ...props }: any) => {
      // Check if any child contains ✓ symbol
      const hasCheckedItems = React.Children.toArray(children).some(child => {
        if (React.isValidElement(child)) {
          const childText = child.props?.children?.toString() || ''
          return childText.includes('✓')
        }
        return false
      })

      if (hasCheckedItems) {
        // For checked lists, render as div container instead of ul
        return (
          <div className="mb-6 space-y-2" {...props}>
            {children}
          </div>
        )
      }

      return (
        <ul className="mb-6 space-y-2 pl-6 list-disc" {...props}>
          {children}
        </ul>
      )
    },
    ol: ({ children, ...props }: any) => (
      <ol className="mb-6 space-y-2 pl-6 list-decimal" {...props}>
        {children}
      </ol>
    ),
    input: ({ checked, type, ...props }: any) => {
      if (type === 'checkbox') {
        return (
          <div className="absolute -left-6 top-1/2 -translate-y-1/2 flex-shrink-0">
            {checked ? (
              <CheckSquare className="w-4 h-4 text-green-600 dark:text-green-400" />
            ) : (
              <Square className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        )
      }
      return <input {...props} />
    },
    li: ({ children, ...props }: any) => {
      const isTaskListItem = props.className?.includes('task-list-item')
      const baseClasses = 'text-foreground text-sm sm:text-base leading-relaxed mb-1 relative'
      const listClasses = isTaskListItem ? 'list-none' : ''

      // Check if the first child is text that starts with "✓ "
      const childrenArray = React.Children.toArray(children)
      const firstChild = childrenArray[0]
      let isCheckedItem = false
      let content = children

      if (typeof firstChild === 'string' && firstChild.startsWith('✓ ')) {
        isCheckedItem = true
        content = childrenArray.slice(0, 1).map((child, index) => {
          if (index === 0 && typeof child === 'string') {
            return child.slice(2) // Remove "✓ " prefix
          }
          return child
        }).concat(childrenArray.slice(1))
      }

      if (isCheckedItem) {
        return (
          <div className="flex items-center gap-2 text-foreground text-sm sm:text-base leading-relaxed mb-1">
            <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
            <span>{content}</span>
          </div>
        );
      }

      const finalListClasses = listClasses
      props.className = (props.className || '') + ' ' + baseClasses + ' ' + finalListClasses
      
      return (
        <li {...props}>
          {children}
        </li>
      );
    },

    // Text formatting
    strong: ({ children, ...props }: any) => (
      <strong className="text-foreground font-semibold" {...props}>
        {children}
      </strong>
    ),
    em: ({ children, ...props }: any) => (
      <em className="italic" {...props}>
        {children}
      </em>
    ),
    del: ({ children, ...props }: any) => (
      <del className="text-muted-foreground line-through" {...props}>
        {children}
      </del>
    ),

    // Links
    a: ({ children, href, ...props }: any) => (
      <Button
        asChild
        variant="link"
        className="h-auto p-0 text-primary hover:text-primary/80 underline"
      >
        <Link href={href || '#'} {...props}>
          {children}
        </Link>
      </Button>
    ),

    // Code
    code: ({ children, className, ...props }: any) => {
      const isInline = !className?.includes('language-')
      if (isInline) {
        return (
          <code className="bg-muted px-2 py-1 rounded text-sm font-mono text-foreground border" {...props}>
            {children}
          </code>
        )
      }
      // For code blocks with language, pass through to pre component
      return (
        <code className={className} {...props}>
          {children}
        </code>
      )
    },

    // Code blocks
    pre: ({ children, ...props }: any) => {
      // Check if this is a code block with language
      if (React.Children.count(children) === 1) {
        const codeElement = React.Children.only(children) as React.ReactElement
        
        // Check if it's a code element with language class
        if (codeElement?.props?.className?.includes('language-')) {
          const match = codeElement.props.className.match(/language-(\w+)/)
          
          if (match) {
            const language = match[1]
            
            // Extract text content from children (can be string, array, or React elements)
            const extractTextContent = (children: any): string => {
              if (typeof children === 'string') {
                return children
              }
              if (typeof children === 'number') {
                return String(children)
              }
              if (Array.isArray(children)) {
                return children.map(extractTextContent).join('')
              }
              if (children && typeof children === 'object' && children.props) {
                return extractTextContent(children.props.children)
              }
              return ''
            }
            
            const code = extractTextContent(codeElement.props.children)
            
            return (
              <CodeHighlight 
                code={code} 
                language={language}
                className="shiki-code-block"
              />
            )
          }
        }
      }
      
      // Fallback for regular pre blocks
      return (
        <pre className="relative my-6 rounded-lg overflow-hidden border bg-muted/50" {...props}>
          {children}
        </pre>
      )
    },

// Blockquote
blockquote: ({ children, ...props }: any) => {
  const childrenArray = React.Children.toArray(children);
  
  // Find the last React element (not string)
  const reactElements = childrenArray.filter(child => React.isValidElement(child));
  const lastChild = reactElements[reactElements.length - 1];

  let author = null;
  let content = children;

  if (
    React.isValidElement(lastChild) &&
    typeof lastChild.type === 'function' &&
    lastChild.type.name === 'p'
  ) {
    const lastChildText = extractText(lastChild.props.children);

    if (lastChildText.trim().startsWith('—')) {
      // Extract author as React element (preserving links and other markup)
      const authorContent = lastChild.props.children;
      // Remove the "— " prefix from the author content
      if (Array.isArray(authorContent)) {
        // If it's an array, find the first text element and remove "— " from it
        const modifiedAuthorContent = authorContent.map((item, index) => {
          if (index === 0 && typeof item === 'string' && item.startsWith('— ')) {
            return item.substring(2); // Remove "— " prefix
          }
          return item;
        });
        author = modifiedAuthorContent;
      } else if (typeof authorContent === 'string' && authorContent.startsWith('— ')) {
        author = authorContent.substring(2); // Remove "— " prefix
      } else {
        author = authorContent;
      }
      
      // Remove the last React element from content
      const lastElementIndex = childrenArray.lastIndexOf(lastChild);
      content = childrenArray.slice(0, lastElementIndex);

      if (content.length === 0) {
        content = children;
        author = null;
      }
    }
  }

  // Process content to modify heading styles inside blockquote
  const processedContent = React.Children.map(content, (child) => {
    if (React.isValidElement(child) && typeof child.type === 'function') {
      // Check if it's a heading element
      if (child.type.name === 'h1' || child.type.name === 'h2' || child.type.name === 'h3' || 
          child.type.name === 'h4' || child.type.name === 'h5' || child.type.name === 'h6') {
        // Clone the element with modified className
        const originalClassName = (child.props as any).className || '';
        const modifiedClassName = originalClassName.replace(/mt-\d+/g, 'mt-2');
        
        return React.cloneElement(child, {
          ...(child.props as any),
          className: modifiedClassName
        });
      }
    }
    return child;
  });

  return (
    <blockquote 
      className="my-6 border-l-4 pl-6 pr-6 py-2 italic text-muted-foreground rounded-r-lg"
      {...props}
    >
      {processedContent}
      {author && (
        <footer 
          className="mt-4 text-sm font-bold text-foreground not-italic text-left sm:text-right"
        >
          {author}
        </footer>
      )}
    </blockquote>
  );
},

    // Tables
    table: ({ children, ...props }: any) => (
      <table className="my-6 w-full text-sm sm:text-base border-collapse border border-border rounded-lg overflow-hidden" {...props}>
        {children}
      </table>
    ),
    thead: ({ children, ...props }: any) => (
      <thead {...props}>
        {children}
      </thead>
    ),
    tbody: ({ children, ...props }: any) => (
      <tbody {...props}>
        {children}
      </tbody>
    ),
    tr: ({ children, ...props }: any) => (
      <tr className="hover:bg-secondary/50 border-b border-border" {...props}>
        {children}
      </tr>
    ),
    th: ({ children, ...props }: any) => (
      <th className="p-4 text-left bg-muted font-semibold text-foreground" {...props}>
        {children}
      </th>
    ),
    td: ({ children, ...props }: any) => (
      <td className="p-4 text-left" {...props}>
        {children}
      </td>
    ),

    // Images
    img: ({ src, alt, ...props }: any) => {
      return (
        <img
          src={src}
          alt={alt}
          className="my-6 rounded-lg shadow-md max-w-full h-auto block"
          onError={(e) => {
            console.error('Image failed to load:', src)
            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZjNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4='
          }}
          onLoad={() => {
          }}
          {...props}
        />
      )
    },
    //Accordion
    accordionui: ({ children, ...props }: any) => {
      return (
        <Accordion {...props}>
          {children}
        </Accordion>
      )
    },
    //AccordionItem
    accordionitemui: ({ children, ...props }: any) => {
      return (
        <AccordionItem {...props}>{children}</AccordionItem>)
    },
    //AccordionTrigger
    accordiontriggerui: ({ children, ...props }: any) => {
      return (
        <AccordionTrigger className="hover:no-underline" {...props}>{children}</AccordionTrigger>)
    },
    //AccordionContent
    accordioncontentui: ({ children, ...props }: any) => {
      return (
        <AccordionContent {...props}>{children}</AccordionContent>)
    },
    //buttonui
    buttonui: ({ children, ...props }: any) => {
      return (
        <Button {...props}>{children}</Button>)
    },
    //avatarui
    avatarui: ({ children, ...props }: any) => {
      return (
        <Avatar {...props}>{children}</Avatar>)
    },
    //badgeui
    badgeui: ({ children, ...props }: any) => {
      return (
        <Badge {...props} span={true}>{children}</Badge>)
    },
    //breadcrumbui
    breadcrumbui: ({ children, ...props }: any) => {
      return (
        <Breadcrumb {...props}>{children}</Breadcrumb>)
    },
    cardui: ({ children, ...props }: any) => {
      return (
        <Card className="p-6" {...props}>{children}</Card>)
    },
     //carouselui
     carouselui: ({ children, ...props }: any) => {
       return (
         <Carousel {...props}>{children}</Carousel>)
     },
     //carouselcontentui
     carouselcontentui: ({ children, ...props }: any) => {
       return (
         <CarouselContent {...props}>{children}</CarouselContent>)
     },
     //carouselitemui
     carouselitemui: ({ children, ...props }: any) => {
       return (
         <CarouselItem {...props}>{children}</CarouselItem>)
     },
     //carouselpreviousui
     carouselpreviousui: ({ ...props }: any) => {
       return (
         <CarouselPrevious {...props} />
       )
     },
     //carouselnextui
     carouselnextui: ({ ...props }: any) => {
       return (
         <CarouselNext {...props} />
       )
     },
    //chartstyleui
    chartstyleui: ({ children, ...props }: any) => {
      return (
        <ChartStyle {...props}>{children}</ChartStyle>)
    },
    //charttooltipui
    charttooltipui: ({ children, ...props }: any) => {
      return (
        <ChartTooltip {...props}>{children}</ChartTooltip>)
    },
    //charttooltipcontentui
    charttooltipcontentui: ({ children, ...props }: any) => {
      return (
        <ChartTooltipContent {...props}>{children}</ChartTooltipContent>)
    },
    //chartlegendui
    chartlegendui: ({ children, ...props }: any) => {
      return (
        <ChartLegend {...props}>{children}</ChartLegend>)
    },
    //chartlegendcontentui
    chartlegendcontentui: ({ children, ...props }: any) => {
      return (
        <ChartLegendContent {...props}>{children}</ChartLegendContent>)
    },
    //chartcontainerui
    chartcontainerui: ({ children, ...props }: any) => {
      return (
        <ChartContainer {...props}>{children}</ChartContainer>)
    },
    //checkboxui
    checkboxui: ({ children, ...props }: any) => {
      return (
        <Checkbox {...props}>{children}</Checkbox>)
    },
    //collapsibleui
    collapsibleui: ({ children, ...props }: any) => {
      return (
        <Collapsible {...props}>{children}</Collapsible>)
    },
    //dropdownmenuui
    dropdownmenuui: ({ children, ...props }: any) => {
      return (
        <DropdownMenu {...props}>{children}</DropdownMenu>)
    },
    //labelui
    labelui: ({ children, ...props }: any) => {
      return (
        <Label {...props}>{children}</Label>)
    },
    //selectui
    selectui: ({ children, ...props }: any) => {
      return (
        <Select {...props}>{children}</Select>)
    },
    //separatorui
    separatorui: ({ children, ...props }: any) => {
      return (
        <div className="my-4 h-px bg-border" {...props} />)
    },
    //switchui
    switchui: ({ ...props }: any) => {
      return (
        <Switch {...props} />
      )
    },
    //tabsui
    tabsui: ({ children, ...props }: any) => {
      // Convert defaultvalue to defaultValue for React compatibility
      const { defaultvalue, ...restProps } = props;
      const correctedProps = defaultvalue !== undefined ? { ...restProps, defaultValue: defaultvalue } : restProps;
      return (
        <Tabs {...correctedProps}>{children}</Tabs>)
    },
    //tabslistui
    tabslistui: ({ children, ...props }: any) => {
      return (
        <TabsList {...props}>{children}</TabsList>)
    },
    //tabstriggerui
    tabstriggerui: ({ children, ...props }: any) => {
      return (
        <TabsTrigger {...props}>{children}</TabsTrigger>)
    },
    //tabscontentui
    tabscontentui: ({ children, ...props }: any) => {
      return (
        <TabsContent {...props}>{children}</TabsContent>)
    },
    //tooggleui
    tooggleui: ({ children, ...props }: any) => {
      return (
        <Toggle {...props}>{children}</Toggle>)
    },
    //toogglegroupui
    toogglegroupui: ({ children, ...props }: any) => {
      return (
        <ToggleGroup {...props}>{children}</ToggleGroup>)
    },
    //tooltipui
    tooltipui: ({ children, ...props }: any) => {
      return (
        <Tooltip {...props}>{children}</Tooltip>)
    },
    //inputui
    inputui: ({ children, ...props }: any) => {
      return (
        <Input {...props}>{children}</Input>)
    },
    //VideoPlayeroui
    videoplayerui: ({ children, ...props }: any) => {
      return (
        <VideoPlayer {...props}>{children}</VideoPlayer>)
    },
  //skeletonui
  skeletonui: ({ children, ...props }: any) => {
    // Skeleton doesn't support children, ignore them
    return (
      <Skeleton {...props} />
    )
  },
    //tableui
    tableui: ({ children, ...props }: any) => {
      return (<Table {...props}>{children}</Table>)
    },
    //tableheaderui
    tableheaderui: ({ children, ...props }: any) => {
      const filteredChildren = React.Children.toArray(children).filter(
        child => !(typeof child === 'string' && child.trim() === '')
      );
      return (<TableHeader {...props}>{filteredChildren}</TableHeader>)
    },
    //tablebodyui
    tablebodyui: ({ children, ...props }: any) => {
      const filteredChildren = React.Children.toArray(children).filter(
        child => !(typeof child === 'string' && child.trim() === '')
      );
      return (<TableBody {...props}>{filteredChildren}</TableBody>)
    },
    //tablefooterui
    tablefooterui: ({ children, ...props }: any) => {
      const filteredChildren = React.Children.toArray(children).filter(
        child => !(typeof child === 'string' && child.trim() === '')
      );
      return (<TableFooter {...props}>{filteredChildren}</TableFooter>)
    },
    //tableheadui
    tableheadui: ({ children, ...props }: any) => {
      return (<TableHead {...props}>{children}</TableHead>)
    },
    //tablerowui
    tablerowui: ({ children, ...props }: any) => {
      return (<TableRow {...props}>{children}</TableRow>)
    },
    //tablecellui
    tablecellui: ({ children, ...props }: any) => {
      return (<TableCell {...props}>{children}</TableCell>)
    },
    //tablecaptionui
    tablecaptionui: ({ children, ...props }: any) => {
      return (<TableCaption {...props}>{children}</TableCaption>)
    },

    // Admonitions
    admonition: ({ children, type = 'info', title, ...props }: any) => {
      const admonitionConfig = {
        info: {
          icon: Info,
          className: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950',
          iconClassName: 'text-blue-600 dark:text-blue-400',
          titleClassName: 'text-blue-800 dark:text-blue-200'
        },
        success: {
          icon: CheckCircle,
          className: 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950',
          iconClassName: 'text-green-600 dark:text-green-400',
          titleClassName: 'text-green-800 dark:text-green-200'
        },
        warning: {
          icon: AlertTriangle,
          className: 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950',
          iconClassName: 'text-yellow-600 dark:text-yellow-400',
          titleClassName: 'text-yellow-800 dark:text-yellow-200'
        },
        danger: {
          icon: XCircle,
          className: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950',
          iconClassName: 'text-red-600 dark:text-red-400',
          titleClassName: 'text-red-800 dark:text-red-200'
        }
      }

      const config = admonitionConfig[type as keyof typeof admonitionConfig] || admonitionConfig.info
      const IconComponent = config.icon

      return (
        <div className={`rounded-lg border p-4 my-4 ${config.className}`} {...props}>
          <div className="flex items-start gap-3">
            <IconComponent className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconClassName}`} />
            <div className="flex-1">
              {title && (
                <h4 className={`font-semibold mb-2 ${config.titleClassName}`}>
                  {title}
                </h4>
              )}
              <div className="text-sm text-foreground">
                {children}
              </div>
            </div>
          </div>
        </div>
      )
    },
    // Horizontal line
    hr: ({ ...props }: any) => (
      <hr className="my-8 border-t border-border" {...props} />
    ),

    // Highlighted text
    mark: ({ children, ...props }: any) => (
      <mark className="bg-yellow-200 dark:bg-yellow-800 dark:text-yellow-200 px-1 py-0.5 rounded-sm font-medium" {...props}>
        {children}
      </mark>
    ),

    // Keyboard keys
    kbd: ({ children, ...props }: any) => (
      <kbd className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-1 py-0.5 text-sm font-mono" {...props}>
        {children}
      </kbd>
    ),

    // Subscript
    sub: ({ children, ...props }: any) => (
      <sub className="text-xs" {...props}>
        {children}
      </sub>
    ),

    // Superscript
    sup: ({ children, ...props }: any) => (
      <sup className="text-xs" {...props}>
        {children}
      </sup>
    ),

    // Highlighting
    u: ({ children, ...props }: any) => (
      <u className="underline decoration-2 decoration-primary/50" {...props}>
        {children}
      </u>
    ),

    // Bold underlined text (combination of strong + u)
    'strong u': ({ children, ...props }: any) => (
      <strong className="text-foreground font-semibold">
        <u className="underline decoration-2 decoration-primary/50" {...props}>
          {children}
        </u>
      </strong>
    ),

    // Bold italic (styled as bold underlined)
    'strong em': ({ children, ...props }: any) => (
      <strong className="text-foreground font-semibold">
        <u className="underline decoration-2 decoration-primary/50" {...props}>
          {children}
        </u>
      </strong>
    ),
  }
}

export function MDXRenderer({ markdownContent, mermaidCharts, toc }: MDXRendererProps) {
  const theme = useTheme()
  const { sessionData } = useAuth()

  // Check that markdownContent exists
  if (!markdownContent) {
    return <div className="mdx-content">Loading...</div>
  }


  // Create components with TOC support
  const components = createHeadingComponents(toc)
  // Process Mermaid diagrams
  let processedContent = markdownContent
  let chartIndex = 0

  // Replace mermaid code blocks with placeholders
  const mermaidPlaceholders: Array<{ index: number; settings: MermaidSettings }> = []

  processedContent = processedContent.replace(/```mermaid\n([\s\S]*?)\n```/g, (match, code) => {
    // Extract settings from comments before the diagram
    const settings = extractMermaidSettings(code)

    // Remove Mermaid comments before saving
    const cleanCode = code.replace(/^%% .*$/gm, '').trim()
    mermaidCharts.push(cleanCode)

    const currentIndex = chartIndex++
    mermaidPlaceholders.push({ index: currentIndex, settings })
    return `MERMAID_PLACEHOLDER_${currentIndex}`
  })

  // Split content into parts and process
  const parts = processedContent.split(/(MERMAID_PLACEHOLDER_\d+)/g)

  return (
    <div className="mdx-content" key={theme.theme || 'light'}>
      {parts.map((part, index) => {
        if (part.startsWith('MERMAID_PLACEHOLDER_')) {
          const chartIndex = parseInt(part.replace('MERMAID_PLACEHOLDER_', ''), 10)
          const placeholder = mermaidPlaceholders.find(p => p.index === chartIndex)
          const settings = placeholder?.settings || {}
          const chart = mermaidCharts[chartIndex]

          if (chart) {
            const enableZoom = settings.enableZoom !== undefined
              ? settings.enableZoom
              : shouldEnableZoom(chart, chartIndex)

            return (
              <div
                key={`mermaid-${chartIndex}-${chart.slice(0, 20)}`}
                className="interactive-mermaid-container"
                style={settings.height ? { height: settings.height } : undefined}
              >
                <InteractiveMermaid
                  chart={chart}
                  id={`mermaid-${chartIndex}-${chart.slice(0, 20)}`}
                  enableZoom={enableZoom}
                  settings={settings}
                  theme={theme.theme || 'light'}
                />
              </div>
            )
          }
        }

        return (
          <ReactMarkdown
            key={index}
            remarkPlugins={[
              [remarkGfm, {
                taskListItems: true,
                singleTilde: false
              }]
            ]}
            rehypePlugins={[
              [rehypeHighlight, {
                detect: true,
                ignoreMissing: true,
                subset: false
              }],
              rehypeRaw
            ]}
            components={components}
          >
            {part}
          </ReactMarkdown>
        )
      })}
    </div>
  )
}
