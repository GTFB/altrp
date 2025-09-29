import { NextResponse } from 'next/server';
import { LocalesRepository } from '@/repositories/locales.repository';

export async function GET(
  _req: Request,
  { params }: { params: { locale: string } }
) {
  try {
    const repo = LocalesRepository.getInstance();
    const data = await repo.readLocale(params.locale);
    return NextResponse.json({ success: true, locale: params.locale, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Failed to read locale' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { locale: string } }
) {
  try {
    const body = await request.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, error: 'Invalid body' }, { status: 400 });
    }
    const repo = LocalesRepository.getInstance();
    await repo.writeLocale(params.locale, body);
    const data = await repo.readLocale(params.locale);
    return NextResponse.json({ success: true, locale: params.locale, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Failed to write locale' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { locale: string } }
) {
  try {
    const body = await request.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, error: 'Invalid body' }, { status: 400 });
    }
    const repo = LocalesRepository.getInstance();
    const data = await repo.upsertLocale(params.locale, body);
    return NextResponse.json({ success: true, locale: params.locale, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Failed to update locale' }, { status: 500 });
  }
}


