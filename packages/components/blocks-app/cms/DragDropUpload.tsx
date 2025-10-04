"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface DragDropUploadProps {
  onUploadSuccess?: () => void;
}

interface UploadFile {
  file: File;
  preview: string;
  uploading: boolean;
  progress: number;
}

export function DragDropUpload({ onUploadSuccess }: DragDropUploadProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const imageFiles = acceptedFiles.filter((file) =>
      file.type.startsWith("image/"),
    );

    if (imageFiles.length !== acceptedFiles.length) {
      toast.error("Only image files are allowed");
    }

    const newFiles = imageFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      uploading: false,
      progress: 0,
    }));

    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp", ".svg"],
    },
    multiple: true,
  });

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setIsUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Update upload status
        setFiles((prev) =>
          prev.map((f, index) =>
            index === i ? { ...f, uploading: true, progress: 0 } : f,
          ),
        );

        const formData = new FormData();
        formData.append("file", file.file);

        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setFiles((prev) =>
            prev.map((f, index) =>
              index === i
                ? { ...f, progress: Math.min(f.progress + 10, 90) }
                : f,
            ),
          );
        }, 100);

        const response = await fetch("/api/admin/media", {
          method: "POST",
          body: formData,
        });

        clearInterval(progressInterval);

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        // Complete progress
        setFiles((prev) =>
          prev.map((f, index) => (index === i ? { ...f, progress: 100 } : f)),
        );

        await new Promise((resolve) => setTimeout(resolve, 200)); // Small delay for UX
      }

      toast.success(`${files.length} file(s) uploaded successfully`);
      setFiles([]);
      onUploadSuccess?.();
    } catch (error) {
      toast.error("Upload failed. Please try again.");
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const openFileDialog = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files) {
        onDrop(Array.from(target.files));
      }
    };
    input.click();
  };

  return (
    <div className="space-y-4">
      {/* Drag & Drop Area */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50"
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 rounded-full bg-muted">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <p className="text-lg font-medium">
              {isDragActive ? "Drop images here" : "Drag & drop images here"}
            </p>
            <p className="text-sm text-muted-foreground">
              or click to select files
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Supports: JPG, PNG, GIF, WebP, SVG
            </p>
          </div>
        </div>
      </div>

      {/* File Preview */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-12 gap-2">
            {files.map((file, index) => (
              <Card key={index} className="relative">
                <CardContent className="p-1">
                  <div className="relative aspect-square">
                    <img
                      src={file.preview}
                      alt={file.file.name}
                      className="w-full h-full object-cover rounded"
                    />
                    {file.uploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded">
                        <div className="text-center text-white">
                          <div className="text-xs font-medium mb-1">
                            {file.progress}%
                          </div>
                          <Progress value={file.progress} className="w-12" />
                        </div>
                      </div>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 p-0"
                      onClick={() => removeFile(index)}
                      disabled={file.uploading}
                    >
                      <X className="h-2 w-2" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {file.file.name}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={openFileDialog}
              disabled={isUploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              Add More Files
            </Button>
            <Button
              onClick={uploadFiles}
              disabled={isUploading || files.length === 0}
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? "Uploading..." : `Upload ${files.length} file(s)`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
