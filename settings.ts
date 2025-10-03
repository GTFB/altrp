import { 
  FileText, 
  Component, 
  Users, 
  Cpu, 
  Share2, 
  TestTube, 
  CheckCircle, 
  Code,
  LucideIcon
} from 'lucide-react'

// Layout configuration
export const LAYOUT_CONFIG = {
  containerWidth: '1440px',
} as const;

// Map of icon names to Lucide React components
const ICON_MAP: Record<string, LucideIcon> = {
  'FileText': FileText,
  'Component': Component,
  'Users': Users,
  'Cpu': Cpu,
  'Share2': Share2,
  'TestTube': TestTube,
  'CheckCircle': CheckCircle,
  'Code': Code,
}


export interface NavigationItem {
  id: string
  title: string
  icon: LucideIcon
  href: string
}

export const PROJECT_SETTINGS = {
  name: 'Altrp',
  description: 'Website Builder',
  defaultLanguage: 'en',
  defaultTheme: 'light',
  supportedThemes: ['light', 'dark',],
} as const;

// Language configuration (ordered by popularity)
export const LANGUAGES = [
  { code: 'en', name: 'English', shortName: 'EN' },
  // { code: 'rs', name: 'Srpski', shortName: 'RS' },
  // { code: 'zh', name: '中文', shortName: 'CN' },
  // { code: 'hi', name: 'हिन्दी', shortName: 'IN' },
  // { code: 'es', name: 'Español', shortName: 'ES' },
  // { code: 'fr', name: 'Français', shortName: 'FR' },
  // { code: 'ar', name: 'العربية', shortName: 'AR' },
  // { code: 'pt', name: 'Português', shortName: 'PT' },
  // { code: 'ru', name: 'Русский', shortName: 'RU' },
  // { code: 'ja', name: '日本語', shortName: 'JP' },
  // { code: 'de', name: 'Deutsch', shortName: 'DE' },
  // { code: 'ko', name: '한국어', shortName: 'KR' },
  // { code: 'it', name: 'Italiano', shortName: 'IT' },
] as const;

// Get supported language codes
export const SUPPORTED_LANGUAGES: string[] = LANGUAGES.map(lang => lang.code);

export const CMS_PROVIDER: 'mdx' | 'sqlite' = 'mdx'