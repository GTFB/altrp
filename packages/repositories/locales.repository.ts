import { promises as fs } from 'fs';
import * as path from 'path';
import { i18nConfig } from '../../apps/cms/src/config/i18n';

export type LocaleCode = (typeof i18nConfig.locales)[number];
export type LocaleData = Record<string, unknown>;

function getLocalesDir(): string {
  // In Next.js apps in this monorepo, process.cwd() points to apps/site
  // Keep the same convention as other repositories that go two levels up
  return path.join(process.cwd(), '../../packages/content/locales');
}

async function ensureLocalesDir(): Promise<void> {
  const dir = getLocalesDir();
  await fs.mkdir(dir, { recursive: true });
}

function getLocaleFilePath(locale: string): string {
  return path.join(getLocalesDir(), `${locale}.json`);
}

function isSupportedLocale(locale: string): locale is LocaleCode {
  return i18nConfig.locales.includes(locale as LocaleCode);
}

function deepMerge(target: Record<string, any>, source: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = Array.isArray(target) ? [...target] : { ...target };
  for (const [key, value] of Object.entries(source)) {
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      typeof result[key] === 'object' &&
      result[key] !== null &&
      !Array.isArray(result[key])
    ) {
      result[key] = deepMerge(result[key], value as Record<string, any>);
    } else {
      result[key] = value;
    }
  }
  return result;
}

export class LocalesRepository {
  private static instance: LocalesRepository | null = null;

  private constructor() {}

  public static getInstance(): LocalesRepository {
    if (!LocalesRepository.instance) {
      LocalesRepository.instance = new LocalesRepository();
    }
    return LocalesRepository.instance;
  }

  async listLocales(): Promise<string[]> {
    try {
      await ensureLocalesDir();
      const entries = await fs.readdir(getLocalesDir(), { withFileTypes: true });
      return entries
        .filter(e => e.isFile() && e.name.endsWith('.json'))
        .map(e => e.name.replace(/\.json$/, ''));
    } catch (error) {
      console.error('Error listing locales:', error);
      return [];
    }
  }

  async readLocale(locale: string): Promise<LocaleData> {
    try {
      if (!isSupportedLocale(locale)) {
        throw new Error(`Unsupported locale: ${locale}`);
      }
      const filePath = getLocaleFilePath(locale);
      const raw = await fs.readFile(filePath, 'utf8').catch(async err => {
        if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
          await this.ensureLocaleFile(locale);
          return '{}';
        }
        throw err;
      });
      const data = JSON.parse(raw || '{}') as LocaleData;
      return data;
    } catch (error) {
      console.error(`Error reading locale ${locale}:`, error);
      return {};
    }
  }

  async ensureLocaleFile(locale: string): Promise<void> {
    if (!isSupportedLocale(locale)) {
      throw new Error(`Unsupported locale: ${locale}`);
    }
    await ensureLocalesDir();
    const filePath = getLocaleFilePath(locale);
    try {
      await fs.access(filePath);
    } catch {
      await fs.writeFile(filePath, '{}\n', 'utf8');
    }
  }

  async writeLocale(locale: string, data: LocaleData, options?: { sortKeys?: boolean }): Promise<void> {
    if (!isSupportedLocale(locale)) {
      throw new Error(`Unsupported locale: ${locale}`);
    }
    await ensureLocalesDir();
    const filePath = getLocaleFilePath(locale);
    const normalized = options?.sortKeys ? this.sortObjectKeys(data) : data;
    await fs.writeFile(filePath, JSON.stringify(normalized, null, 2) + '\n', 'utf8');
  }

  async upsertLocale(locale: string, partial: LocaleData, options?: { sortKeys?: boolean }): Promise<LocaleData> {
    if (!isSupportedLocale(locale)) {
      throw new Error(`Unsupported locale: ${locale}`);
    }
    const current = await this.readLocale(locale);
    const merged = deepMerge(current as Record<string, any>, partial as Record<string, any>);
    await this.writeLocale(locale, merged, { sortKeys: options?.sortKeys });
    return merged;
  }

  async removeKeys(locale: string, keys: string[], options?: { sortKeys?: boolean }): Promise<LocaleData> {
    if (!isSupportedLocale(locale)) {
      throw new Error(`Unsupported locale: ${locale}`);
    }
    const current = (await this.readLocale(locale)) as Record<string, any>;
    for (const key of keys) {
      delete current[key];
    }
    await this.writeLocale(locale, current, { sortKeys: options?.sortKeys });
    return current;
  }

  private sortObjectKeys(input: unknown): unknown {
    if (Array.isArray(input)) {
      return input.map(v => this.sortObjectKeys(v));
    }
    if (input && typeof input === 'object') {
      const obj = input as Record<string, unknown>;
      const sortedKeys = Object.keys(obj).sort((a, b) => a.localeCompare(b));
      const out: Record<string, unknown> = {};
      for (const k of sortedKeys) {
        out[k] = this.sortObjectKeys(obj[k]);
      }
      return out;
    }
    return input;
  }
}


