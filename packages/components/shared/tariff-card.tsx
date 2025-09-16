'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check,  } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from '@/hooks/use-translations'
interface TariffCardProps {
  title: string
  description: string
  price: string
  features: string[]
  isRecommended?: boolean
  isPopular?: boolean
  ctaText: string
  ctaLink: string
}

export function TariffCard({ 
  title, 
  description, 
  price, 
  features, 
  isRecommended = false,
  isPopular = false,
  ctaText,
  ctaLink 
}: TariffCardProps) {
  const t = useTranslations()
  
  return (
    <Card className={`relative h-full flex flex-col ${isRecommended ? 'border-primary scale-105 shadow-lg' : ''}`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
            {t('popular')}
          </span>
        </div>
      )}
      
      <CardHeader className="pt-6">
        <CardTitle className="text-2xl">{title}</CardTitle>
        <p className="text-muted-foreground">{description}</p>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        <div className="text-4xl font-bold mb-6">{price}</div>
        
        <ul className="space-y-3 mb-8 flex-1">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
        
        <Button 
          className="w-full" 
          variant={isRecommended ? "default" : "outline"}
          asChild
        >
          <Link href={ctaLink} target="_blank" rel="noopener noreferrer">
            {ctaText}
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
