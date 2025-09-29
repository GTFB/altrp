import { NextResponse } from 'next/server';
import { LocalesRepository } from '@/repositories/locales.repository';
import { i18nConfig } from '@/config/i18n';

export async function GET() {
  try {
    const repo = LocalesRepository.getInstance();
    const files = await repo.listLocales();
    return NextResponse.json({ success: true, locales: files, supported: i18nConfig.locales });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Failed to list locales' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const repo = LocalesRepository.getInstance();
    const body = await request.json();
    const { locale, data } = body || {};
    if (!locale || typeof locale !== 'string') {
      return NextResponse.json({ success: false, error: 'locale is required' }, { status: 400 });
    }
    // Ensure file exists; if data provided, write; else create empty
    if (data && typeof data === 'object') {
      await repo.writeLocale(locale, data);
    } else {
      await repo.ensureLocaleFile(locale);
    }
    const result = await repo.readLocale(locale);
    return NextResponse.json({ success: true, locale, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Failed to create locale' }, { status: 500 });
  }
}


