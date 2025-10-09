import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Play, Zap, Shield, Globe } from "lucide-react";
import { Container } from "@/components/misc/layout/Container";
import { useTranslations } from "next-intl";
export function HeroBlock() {
  const  t  = useTranslations('home');
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-20 lg:py-32">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />

      <Container className="relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <Badge variant="secondary" className="font-sans">
              <Zap className="w-3 h-3 mr-1" />
               {t('hero.badge')}
            </Badge>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold tracking-tight mb-6">
            {t('hero.title')}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t('hero.subtitle')}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground font-sans mb-8 max-w-3xl mx-auto leading-relaxed">
            {t('hero.description')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="font-sans">
              {t('hero.button.start')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="outline" size="lg" className="font-sans">
              <Play className="w-4 h-4 mr-2" />
              {t('hero.button.demo')}
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="text-3xl font-heading font-bold text-primary mb-2">
                10K+
              </div>
              <div className="text-sm text-muted-foreground font-sans">
                {t('hero.stats.users')}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-heading font-bold text-primary mb-2">
                99.9%
              </div>
              <div className="text-sm text-muted-foreground font-sans">
                {t('hero.stats.time')}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-heading font-bold text-primary mb-2">
                24/7
              </div>
              <div className="text-sm text-muted-foreground font-sans">
                {t('hero.stats.support')}
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2">
                  Git-as-CMS
                </h3>
                <p className="text-sm text-muted-foreground font-sans">
                  {t('hero.features.git.description')}
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2">
                  {t('hero.features.fast.title')}
                </h3>
                <p className="text-sm text-muted-foreground font-sans">
                  {t('hero.features.fast.description')}
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2">
                  {t('hero.features.security.title')}
                </h3>
                <p className="text-sm text-muted-foreground font-sans">
                  {t('hero.features.security.description')}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Social Proof */}
          <div className="mt-16 pt-8 border-t">
            <p className="text-sm text-muted-foreground font-sans mb-4">
              {t('hero.testimonials.title')}
            </p>
            <div className="flex justify-center items-center space-x-8 opacity-60">
              <div className="text-2xl font-heading font-bold">Microsoft</div>
              <div className="text-2xl font-heading font-bold">Google</div>
              <div className="text-2xl font-heading font-bold">Netflix</div>
              <div className="text-2xl font-heading font-bold">Spotify</div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
