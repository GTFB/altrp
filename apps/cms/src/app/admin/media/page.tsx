"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DragDropUpload } from "@/components/blocks-app/cms/DragDropUpload"
import { MediaGrid } from "@/components/blocks-app/cms/MediaGrid"
import { MediaEditPopup } from "@/components/blocks-app/cms/MediaEditPopup"

export default function MediaPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleMediaUploaded = () => {
    // Update media list after upload
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Media Library</h1>
        <p className="text-muted-foreground">
          Upload and manage your media files (18 per page)
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Media</CardTitle>
        </CardHeader>
        <CardContent>
          <DragDropUpload onUploadSuccess={handleMediaUploaded} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Media Library</CardTitle>
        </CardHeader>
        <CardContent>
          <MediaGrid refreshTrigger={refreshTrigger} />
        </CardContent>
      </Card>
    </div>
  )
}
