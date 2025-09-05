import { NextResponse } from 'next/server';
import { MediaRepository } from '@/repositories/media.repository';

export async function GET() {
  try {
    const mediaRepo = MediaRepository.getInstance();
    const stats = await mediaRepo.getMediaStats();

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching media stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch media stats' },
      { status: 500 }
    );
  }
}
