import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// POST /api/admin/tsx/pages
// Body: { path: string, code: string }
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const relPath = (body?.path || '').trim();
    const code = body?.code || '';

    if (!relPath) {
      return NextResponse.json({ success: false, error: 'Path is required' }, { status: 400 });
    }
    if (!code) {
      return NextResponse.json({ success: false, error: 'Code is empty' }, { status: 400 });
    }

    // Base: apps/site/src/app/(main)/[locale]
    const baseDir = path.join(process.cwd(), 'src', 'app', '(main)', '[locale]');

    // Normalize and ensure inside baseDir
    const targetDir = path.normalize(path.join(baseDir, relPath));
    if (!targetDir.startsWith(path.normalize(baseDir))) {
      return NextResponse.json({ success: false, error: 'Invalid path' }, { status: 400 });
    }

    const targetFile = path.join(targetDir, 'page.tsx');

    try {
      await fs.access(targetFile);
      return NextResponse.json({ success: false, error: 'File already exists' }, { status: 409 });
    } catch {
      // not exists, OK
    }

    await fs.mkdir(targetDir, { recursive: true });
    await fs.writeFile(targetFile, code, 'utf8');

    return NextResponse.json({ success: true, file: path.relative(process.cwd(), targetFile) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Failed to save file' }, { status: 500 });
  }
}


