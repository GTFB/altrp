'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Globe } from 'lucide-react'
import { useLocale } from '@/hooks/use-locale'
import { US, RU, ES, FR, DE, IT, PT, JP, KR, CN, SA, IN } from 'country-flag-icons/react/3x2'
import { LANGUAGES } from '@/settings'

// Map language codes to flag components
const FLAG_MAP = {
  'en': US,
  'ru': RU,
  'es': ES,
  'fr': FR,
  'de': DE,
  'it': IT,
  'pt': PT,
  'ja': JP,
  'ko': KR,
  'zh': CN,
  'ar': SA,
  'hi': IN,
} as const

// Create languages array with flags from settings
const languages = LANGUAGES.map(lang => ({
  ...lang,
  flag: FLAG_MAP[lang.code as keyof typeof FLAG_MAP]
}))

type LanguageSwitcherVariant = 'default' | 'compact' | 'minimal' | 'inline'
type LanguageSwitcherSize = 'sm' | 'md' | 'lg'

interface LanguageSwitcherProps {
  variant?: LanguageSwitcherVariant
  size?: LanguageSwitcherSize
  showGlobe?: boolean
  showText?: boolean
  className?: string
}

export function LanguageSwitcher({ 
  variant = 'default',
  size = 'sm',
  showGlobe = true,
  showText = true,
  className = ''
}: LanguageSwitcherProps) {
  const { locale, setLocale } = useLocale()
  const t = useTranslations('common')

  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0]

  const handleLanguageChange = (newLocale: string) => {
    setLocale(newLocale)
   
  }

  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8', 
    lg: 'h-10'
  }

  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        {showGlobe && <Globe className="h-4 w-4 text-muted-foreground" />}
        <div className="flex gap-1">
          {languages.map((language) => (
            <Button
              key={language.code}
              variant={locale === language.code ? "default" : "ghost"}
              size="sm"
              onClick={() => handleLanguageChange(language.code)}
              className="h-6 px-2 text-xs"
            >
              <language.flag className="w-4 h-3 mr-1" />
              <span>{language.shortName}</span>
            </Button>
          ))}
        </div>
      </div>
    )
  }

  if (variant === 'minimal') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`h-6 w-6 p-0 border-0 focus:ring-0 focus:outline-none cursor-pointer hover:bg-muted hover:text-muted-foreground ${className}`}
          >
            <currentLanguage.flag className="w-4 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {languages.map((language) => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`cursor-pointer ${locale === language.code ? 'bg-accent' : ''}`}
            >
              <language.flag className="w-4 h-3 mr-2" />
              <span>{language.name}</span>
              {locale === language.code && (
                <span className="ml-auto text-xs text-muted-foreground">✓</span>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  if (variant === 'compact') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`${sizeClasses[size]} w-auto px-2 border-0 focus:ring-0 focus:outline-none ${className}`}
          >
            <Globe className="h-4 w-4" />
            {showText && (
              <currentLanguage.flag className="w-3 h-2 ml-1" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {languages.map((language) => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`cursor-pointer ${locale === language.code ? 'bg-accent' : ''}`}
            >
              <language.flag className="w-4 h-3 mr-2" />
              <span>{language.name}</span>
              {locale === language.code && (
                <span className="ml-auto text-xs text-muted-foreground">✓</span>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className={`h-8 w-auto px-2 border-0 focus:ring-0 focus:outline-none ${className}`}>
          {showGlobe && <Globe className="h-4 w-4 mr-2" />}
          {showText && (
            <>
              <span className="hidden sm:flex items-center gap-1">
                <currentLanguage.flag className="w-4 h-3" />
                {currentLanguage.name}
              </span>
              <span className="sm:hidden">
                <currentLanguage.flag className="w-4 h-3" />
              </span>
            </>
          )}
          {!showText && <currentLanguage.flag className="w-4 h-3" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`cursor-pointer ${locale === language.code ? 'bg-accent' : ''}`}
          >
            <language.flag className="w-4 h-3 mr-2" />
            <span>{language.name}</span>
            {locale === language.code && (
              <span className="ml-auto text-xs text-muted-foreground">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
