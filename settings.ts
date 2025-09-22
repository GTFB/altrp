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
  name: 'Jambo',
  description: 'Commercial Proposal Generator',
  defaultLanguage: 'en',
  defaultTheme: 'light',
  supportedThemes: ['light', 'dark',],
} as const;

// Language configuration (ordered by popularity)
export const LANGUAGES = [
  { code: 'en', name: 'English', shortName: 'EN' },
  { code: 'zh', name: '中文', shortName: 'CN' },
  { code: 'hi', name: 'हिन्दी', shortName: 'IN' },
  { code: 'es', name: 'Español', shortName: 'ES' },
  { code: 'fr', name: 'Français', shortName: 'FR' },
  { code: 'ar', name: 'العربية', shortName: 'AR' },
  { code: 'pt', name: 'Português', shortName: 'PT' },
  { code: 'ru', name: 'Русский', shortName: 'RU' },
  { code: 'ja', name: '日本語', shortName: 'JP' },
  { code: 'de', name: 'Deutsch', shortName: 'DE' },
  { code: 'ko', name: '한국어', shortName: 'KR' },
  { code: 'it', name: 'Italiano', shortName: 'IT' },
] as const;

// Get supported language codes
export const SUPPORTED_LANGUAGES: string[] = LANGUAGES.map(lang => lang.code);

// Password groups configuration
export const PASSWORD_GROUPS = {
  'group1': {
    password: 'password1',
    sections: ['2', '3'], // Sections A, B, C
    name: 'Group 1 - Basic Access',
    description: 'Access to basic content sections'
  },
  'group2': {
    password: 'password2', 
    sections: ['4', '5', '6'], // Sections D, E, F
    name: 'Group 2 - Premium Access',
    description: 'Access to premium content sections'
  },
  'default': {
    password: 'password',
    sections: ['*'], // All other sections
    name: 'Default Group',
    description: 'Access to all other content'
  }
} as const;


// Static navigation items based on MDX files
// This will be updated when MDX files change
export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: '1',
    title: 'MDX Styling Examples',
    icon: Code,
    href: '/widgets'
  },
  {
    id: '2',
    title: 'Group 1 - Section A',
    icon: Users,
    href: '/group-1-section-a'
  },
  {
    id: '4',
    title: 'Group 2 - Section D',
    icon: Cpu,
    href: '/group-2-section-d'
  }
]

export const MDX_FILES = NAVIGATION_ITEMS.map(item => ({
  id: item.id,
  name: item.title
}));
