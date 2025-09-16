'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PASSWORD_GROUPS } from '../../../settings'
import { useTranslations } from '@/hooks/use-translations'

export function PasswordGroupsInfo() {
  const t = useTranslations()
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{t('title')}</h3>
      <p className="text-sm text-muted-foreground">
        {t('description')}
      </p>
      <div className="grid gap-4">
        {Object.entries(PASSWORD_GROUPS).map(([groupKey, config]) => (
          <Card key={groupKey}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{config.name}</CardTitle>
                <Badge variant="outline">{groupKey}</Badge>
              </div>
              <CardDescription>{config.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium">{t('password')} </span>
                  <code className="bg-muted px-2 py-1 rounded text-sm">{config.password}</code>
                </div>
                <div>
                  <span className="text-sm font-medium">{t('sections')} </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(config.sections as readonly (string | '*')[]).map((section) => (
                      <Badge key={section} variant="secondary" className="text-xs">
                        {section === '*' ? t('allOtherSections') : `${t('section')} ${section}`}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {(config.sections as readonly (string | '*')[]).some((s) => s === '*') 
                    ? t('coversAllSections')
                    : t('coversSpecifiedSections')
                  }
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
