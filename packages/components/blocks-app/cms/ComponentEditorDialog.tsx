"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Editor from "@monaco-editor/react";
import { Block } from "@/types/page-editor";

interface ComponentEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  block: Block | null;
  initialContent: string;
  onSave: (content: string) => Promise<void>;
}

export function ComponentEditorDialog({
  open,
  onOpenChange,
  block,
  initialContent,
  onSave,
}: ComponentEditorDialogProps) {
  const [editorContent, setEditorContent] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setEditorContent(initialContent);
  }, [initialContent]);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setEditorContent("");
      setSaving(false);
    }
    onOpenChange(newOpen);
  };

  const handleSave = async () => {
    if (!editorContent.trim()) return;

    setSaving(true);
    try {
      await onSave(editorContent);
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving component:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleEditorDidMount = (editor: any, monaco: any) => {
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.Latest,
      allowNonTsExtensions: true,
      noEmit: true,
      jsx: monaco.languages.typescript.JsxEmit.React,
      allowJs: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      baseUrl: "./",
      paths: {
        "@/*": ["src/*"],
        "@/components/*": ["src/components/*"],
        "@/lib/*": ["src/lib/*"],
        "@/types/*": ["src/types/*"],
      },
    });

    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: false,
    });

    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      `declare module 'lucide-react' {
        import { ComponentType } from 'react';
        export const AlertTriangle: ComponentType<any>;
        export const CheckCircle: ComponentType<any>;
        export const Info: ComponentType<any>;
        export const XCircle: ComponentType<any>;
        export const CircleFadingArrowUpIcon: ComponentType<any>;
        export const OctagonAlert: ComponentType<any>;
        export const ShieldAlert: ComponentType<any>;
      }`,
      "file:///node_modules/@types/lucide-react.d.ts",
    );

    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      `declare module 'next-intl' {
        export function useTranslations(namespace: string): (key: string) => string;
      }`,
      "file:///node_modules/@types/next-intl.d.ts",
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-7xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Component</DialogTitle>
          <DialogDescription>
            {block ? `Editing ${block.label}` : "Loading..."}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 min-h-0">
          <Editor
            height="100%"
            defaultLanguage="typescript"
            language="typescript"
            value={editorContent}
            onMount={handleEditorDidMount}
            onChange={(value) => setEditorContent(value || "")}
            theme="vs-dark"
            path={block ? `component-${block.id}.tsx` : "component.tsx"}
            options={{
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 14,
              wordWrap: "on",
              automaticLayout: true,
              formatOnPaste: true,
              formatOnType: true,
            }}
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !editorContent.trim()}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
