import { NextRequest, NextResponse } from 'next/server';
import { ComponentRepository } from '@/repositories/component.repository';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string }> }
) {
  try {
    const { path: relativePath } = await params;
    const repository = ComponentRepository.getInstance();
    
    const result = await repository.getComponentFileContent(relativePath);
    return NextResponse.json(result);

  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Invalid path') {
        return NextResponse.json(
          { error: 'Invalid path' },
          { status: 400 }
        );
      }
      if (error.message === 'Only .tsx files are supported') {
        return NextResponse.json(
          { error: 'Only .tsx files are supported' },
          { status: 400 }
        );
      }
      if (error.message === 'File not found') {
        return NextResponse.json(
          { error: 'File not found' },
          { status: 404 }
        );
      }
    }
    
    console.error('Error reading component file:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string }> }
) {
  try {
    const { path: relativePath } = await params;
    const body = await request.json();
    const repository = ComponentRepository.getInstance();
    
    const result = await repository.updateComponentFile(relativePath, body.content);
    return NextResponse.json(result);

  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Content is required and must be a string') {
        return NextResponse.json(
          { error: 'Content is required and must be a string' },
          { status: 400 }
        );
      }
      if (error.message === 'Invalid path') {
        return NextResponse.json(
          { error: 'Invalid path' },
          { status: 400 }
        );
      }
      if (error.message === 'Only .tsx files are supported') {
        return NextResponse.json(
          { error: 'Only .tsx files are supported' },
          { status: 400 }
        );
      }
    }
    
    console.error('Error writing component file:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string }> }
) {
  try {
    const { path: relativePath } = await params;
    const repository = ComponentRepository.getInstance();
    
    const result = await repository.deleteComponentFile(relativePath);
    return NextResponse.json(result);

  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Invalid path') {
        return NextResponse.json(
          { error: 'Invalid path' },
          { status: 400 }
        );
      }
      if (error.message === 'Only .tsx files are supported') {
        return NextResponse.json(
          { error: 'Only .tsx files are supported' },
          { status: 400 }
        );
      }
      if (error.message === 'File not found') {
        return NextResponse.json(
          { error: 'File not found' },
          { status: 404 }
        );
      }
    }
    
    console.error('Error deleting component file:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
