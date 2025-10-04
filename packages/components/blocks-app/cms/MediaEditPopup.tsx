"use client";

import { useState } from "react";
import { Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";

interface MediaItem {
  id: string;
  url: string;
  alt?: string;
  title?: string;
  description?: string;
  filename: string;
  size: number;
  mimeType: string;
  createdAt: string;
}

interface MediaEditPopupProps {
  media: MediaItem;
  onClose: () => void;
  onUpdate: (media: MediaItem) => void;
  onDelete: (mediaId: string) => void;
}

export function MediaEditPopup({
  media,
  onClose,
  onUpdate,
  onDelete,
}: MediaEditPopupProps) {
  const [formData, setFormData] = useState({
    alt: media.alt || "",
    title: media.title || "",
    description: media.description || "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const response = await fetch(`/api/admin/media/${media.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update media");
      }

      const updatedMedia = await response.json();
      onUpdate(updatedMedia);
      toast.success("Media updated successfully");
    } catch (error) {
      console.error("Error updating media:", error);
      toast.error("Failed to update media");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this media file? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      setIsDeleting(true);

      const response = await fetch(`/api/admin/media/${media.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete media");
      }

      onDelete(media.id);
      toast.success("Media deleted successfully");
    } catch (error) {
      console.error("Error deleting media:", error);
      toast.error("Failed to delete media");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] sm:max-w-[90vw] h-[90vh] p-0 overflow-hidden">
        <div className="flex h-full rounded-lg overflow-hidden">
          {/* Left side - Image */}
          <div className="w-2/3 bg-muted/50 flex items-center justify-center p-8 overflow-hidden">
            <div className="w-full h-full flex items-center justify-center overflow-hidden">
              <img
                src={media.url}
                alt={media.alt || media.filename}
                className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
              />
            </div>
          </div>

          {/* Right side - Form */}
          <div className="w-1/3 border-l bg-background flex flex-col">
            {/* Header */}
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">Edit Media</h2>
            </div>

            {/* Form */}
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
              {/* File info */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  File Information
                </Label>
                <div className="space-y-1 text-sm">
                  <div>
                    <strong>Filename:</strong> {media.filename}
                  </div>
                  <div>
                    <strong>Size:</strong> {formatFileSize(media.size)}
                  </div>
                  <div>
                    <strong>Type:</strong> {media.mimeType}
                  </div>
                  <div>
                    <strong>Uploaded:</strong>{" "}
                    {new Date(media.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Alt text */}
              <div className="space-y-2">
                <Label htmlFor="alt">Alt Text</Label>
                <Input
                  id="alt"
                  value={formData.alt}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, alt: e.target.value }))
                  }
                  placeholder="Describe the image for accessibility"
                />
                <p className="text-xs text-muted-foreground">
                  Important for accessibility and SEO
                </p>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Enter a title for this media"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Enter a description for this media"
                  rows={4}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t space-y-3">
              <div className="flex space-x-2">
                <Button
                  onClick={handleSave}
                  disabled={isSaving || isDeleting}
                  className="flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isSaving || isDeleting}
                  className="flex-1"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </div>
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full"
                disabled={isSaving || isDeleting}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
