import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { MediaRepository } from '@/repositories/media.repository';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const alt = formData.get('alt') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Get file extension
    const fileExtension = path.extname(file.name);
    const baseName = path.basename(file.name, fileExtension);
    
    // Generate unique filename with original extension
    let fileName = `${baseName}${fileExtension}`;
    let counter = 1;
    
    while (true) {
      const filePath = path.join(process.cwd(), 'public', 'images', fileName);
      try {
        const fs = await import('fs/promises');
        await fs.access(filePath); // Check if file exists
        // File exists, try next number
        fileName = `${baseName}-${counter}${fileExtension}`;
        counter++;
      } catch (error: any) {
        if (error.code === 'ENOENT') {
          // File doesn't exist, we can use this name
          break;
        } else {
          throw error;
        }
      }
    }

    // Ensure public/images directory exists
    const imagesDir = path.join(process.cwd(), 'public', 'images');
    await mkdir(imagesDir, { recursive: true });

    // Save file to public/images
    const filePath = path.join(imagesDir, fileName);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Create media record in content/media
    const mediaRepo = MediaRepository.getInstance();
    const mediaSlug = fileName; // slug with extension
    
    const mediaData = {
      slug: mediaSlug,
      title: title || baseName,
      description: `Uploaded image: ${fileName}`,
      date: new Date().toISOString().split('T')[0],
      tags: ['uploaded'],
      url: `/images/${fileName}`, // full filename with extension
      alt: alt || baseName,
      type: 'image' as const,
      size: file.size,
    };

    const createdMedia = await mediaRepo.createMedia(mediaData);

    if (!createdMedia) {
      // If media creation failed, clean up the file
      try {
        const fs = await import('fs/promises');
        await fs.unlink(filePath);
      } catch (error) {
        console.error('Error cleaning up file:', error);
      }
      
      return NextResponse.json(
        { error: 'Failed to create media record' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      fileName: mediaSlug, // Return with extension for form field
      fullFileName: fileName, // Return with extension for display
      media: createdMedia,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
