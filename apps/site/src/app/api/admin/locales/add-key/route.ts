import { NextResponse } from 'next/server';
import { LocalesRepository } from '@/repositories/locales.repository';
import { i18nConfig } from '@/config/i18n';

function setDeep(obj: Record<string, any>, path: string, value: unknown) {
  const parts = path.split('.').filter(Boolean);
  let ref = obj;
  for (let i = 0; i < parts.length; i++) {
    const key = parts[i];
    if (i === parts.length - 1) {
      if (ref[key] === undefined) {
        ref[key] = value;
      }
    } else {
      if (typeof ref[key] !== 'object' || ref[key] === null || Array.isArray(ref[key])) {
        ref[key] = {};
      }
      ref = ref[key];
    }
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { key, value } = body || {};
    if (!key || typeof key !== 'string') {
      return NextResponse.json({ success: false, error: 'key is required' }, { status: 400 });
    }
    const repo = LocalesRepository.getInstance();
    const locales = i18nConfig.locales;
    const result: Record<string, any> = {};
    for (const locale of locales) {
      const data = (await repo.readLocale(locale)) as Record<string, any>;
      setDeep(data, key, value ?? '');
      await repo.writeLocale(locale, data, { sortKeys: true });
      result[locale] = true;
    }
    return NextResponse.json({ success: true, affected: locales.length, locales: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Failed to add key' }, { status: 500 });
  }
}


