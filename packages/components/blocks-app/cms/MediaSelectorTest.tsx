"use client";

import { useState } from "react";
import { MediaSelectorPopover } from "./MediaSelectorPopover";
import { Button } from "@/components/ui/button";

export function MediaSelectorTest() {
  const [selectedMedia, setSelectedMedia] = useState<string>("");

  const handleImageUpload = async (file: File) => {
    console.log("Uploading file:", file.name);
    // Simulate upload
    const mockSlug = `test-${Date.now()}`;
    setSelectedMedia(mockSlug);
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-semibold">Media Selector Test</h2>

      <div className="space-y-2">
        <label>Selected Media: {selectedMedia || "None"}</label>

        <MediaSelectorPopover
          value={selectedMedia}
          onChange={setSelectedMedia}
          onUpload={handleImageUpload}
          trigger={<Button variant="outline">Select Media</Button>}
        />
      </div>
    </div>
  );
}
