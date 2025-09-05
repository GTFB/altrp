'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  Code, 
  Heading2, 
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo
} from 'lucide-react';

interface TipTapEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
}

export function TipTapEditor({ content = '', onChange, placeholder }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none tiptap-editor',
        placeholder: placeholder || 'Start writing...',
      },
    },
    onUpdate: ({ editor }) => {
      // Get HTML content
      const html = editor.getHTML();
      onChange?.(html);
    },
  });

  // Add custom styles for TipTap editor
  useEffect(() => {
    const styleId = 'tiptap-editor-styles';
    
    // Remove existing styles if they exist
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }

    // Create new style element
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .tiptap-editor h2,
      .ProseMirror h2,
      .prose h2 {
        font-size: 1.5rem !important;
        font-weight: 600 !important;
        line-height: 1.3 !important;
        margin-top: 1.5rem !important;
        margin-bottom: 0.75rem !important;
        color: #1f2937 !important;
      }
      
      .tiptap-editor h3,
      .ProseMirror h3,
      .prose h3 {
        font-size: 1.25rem !important;
        font-weight: 600 !important;
        line-height: 1.4 !important;
        margin-top: 1.25rem !important;
        margin-bottom: 0.5rem !important;
        color: #374151 !important;
      }
      
      .tiptap-editor h2:first-child,
      .tiptap-editor h3:first-child {
        margin-top: 0 !important;
      }
      
      /* Dark theme styles */
      .dark .tiptap-editor h2,
      .dark .ProseMirror h2,
      .dark .prose h2 {
        color: #f9fafb !important;
      }
      
      .dark .tiptap-editor h3,
      .dark .ProseMirror h3,
      .dark .prose h3 {
        color: #e5e7eb !important;
      }
      
      /* Additional editor styles */
      .tiptap-editor p,
      .ProseMirror p,
      .prose p {
        margin-bottom: 1rem !important;
        line-height: 1.6 !important;
      }
      
      .tiptap-editor ul, .tiptap-editor ol,
      .ProseMirror ul, .ProseMirror ol,
      .prose ul, .prose ol {
        margin-bottom: 1rem !important;
        padding-left: 1.5rem !important;
      }
      
      .tiptap-editor li,
      .ProseMirror li,
      .prose li {
        margin-bottom: 0.25rem !important;
      }
      
      .tiptap-editor blockquote,
      .ProseMirror blockquote,
      .prose blockquote {
        border-left: 4px solid #e5e7eb !important;
        padding-left: 1rem !important;
        margin: 1rem 0 !important;
        font-style: italic !important;
        color: #6b7280 !important;
      }
      
      .dark .tiptap-editor blockquote,
      .dark .ProseMirror blockquote,
      .dark .prose blockquote {
        border-left-color: #374151 !important;
        color: #9ca3af !important;
      }
      
      .tiptap-editor code,
      .ProseMirror code,
      .prose code {
        background-color: #f3f4f6 !important;
        padding: 0.125rem 0.25rem !important;
        border-radius: 0.25rem !important;
        font-size: 0.875rem !important;
        font-family: 'Courier New', monospace !important;
      }
      
      .dark .tiptap-editor code,
      .dark .ProseMirror code,
      .dark .prose code {
        background-color: #374151 !important;
        color: #f9fafb !important;
      }
    `;
    
    document.head.appendChild(style);

    // Cleanup function
    return () => {
      const styleElement = document.getElementById(styleId);
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, []);

  const handleToolbarClick = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-md">
      {/* Toolbar */}
      <div className="border-b p-2 flex flex-wrap gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={(e) => handleToolbarClick(e, () => editor.chain().focus().toggleBold().run())}
          className={editor.isActive('bold') ? 'bg-accent text-accent-foreground' : ''}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={(e) => handleToolbarClick(e, () => editor.chain().focus().toggleItalic().run())}
          className={editor.isActive('italic') ? 'bg-accent text-accent-foreground' : ''}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={(e) => handleToolbarClick(e, () => editor.chain().focus().toggleStrike().run())}
          className={editor.isActive('strike') ? 'bg-accent text-accent-foreground' : ''}
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={(e) => handleToolbarClick(e, () => editor.chain().focus().toggleCode().run())}
          className={editor.isActive('code') ? 'bg-accent text-accent-foreground' : ''}
          title="Code"
        >
          <Code className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={(e) => handleToolbarClick(e, () => editor.chain().focus().toggleHeading({ level: 2 }).run())}
          className={editor.isActive('heading', { level: 2 }) ? 'bg-accent text-accent-foreground' : ''}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={(e) => handleToolbarClick(e, () => editor.chain().focus().toggleHeading({ level: 3 }).run())}
          className={editor.isActive('heading', { level: 3 }) ? 'bg-accent text-accent-foreground' : ''}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={(e) => handleToolbarClick(e, () => editor.chain().focus().toggleBulletList().run())}
          className={editor.isActive('bulletList') ? 'bg-accent text-accent-foreground' : ''}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={(e) => handleToolbarClick(e, () => editor.chain().focus().toggleOrderedList().run())}
          className={editor.isActive('orderedList') ? 'bg-accent text-accent-foreground' : ''}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={(e) => handleToolbarClick(e, () => editor.chain().focus().toggleBlockquote().run())}
          className={editor.isActive('blockquote') ? 'bg-accent text-accent-foreground' : ''}
          title="Quote"
        >
          <Quote className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={(e) => handleToolbarClick(e, () => editor.chain().focus().undo().run())}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={(e) => handleToolbarClick(e, () => editor.chain().focus().redo().run())}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </Button>
      </div>

      {/* Editor Content */}
      <div className="p-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
