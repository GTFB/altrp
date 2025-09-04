import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Globe, Github, Twitter, Linkedin, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-heading font-bold text-xl">Jambo</span>
            </div>
            <p className="text-sm text-muted-foreground font-sans max-w-xs">
              Современная платформа для создания и управления контентом с использованием Git-as-CMS архитектуры.
            </p>
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Github className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Linkedin className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h3 className="font-heading font-semibold">Продукт</h3>
            <div className="space-y-2">
              <Link href="/features" className="block text-sm text-muted-foreground hover:text-foreground font-sans">
                Возможности
              </Link>
              <Link href="/pricing" className="block text-sm text-muted-foreground hover:text-foreground font-sans">
                Цены
              </Link>
              <Link href="/integrations" className="block text-sm text-muted-foreground hover:text-foreground font-sans">
                Интеграции
              </Link>
              <Link href="/changelog" className="block text-sm text-muted-foreground hover:text-foreground font-sans">
                Обновления
              </Link>
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="font-heading font-semibold">Ресурсы</h3>
            <div className="space-y-2">
              <Link href="/docs" className="block text-sm text-muted-foreground hover:text-foreground font-sans">
                Документация
              </Link>
              <Link href="/tutorials" className="block text-sm text-muted-foreground hover:text-foreground font-sans">
                Уроки
              </Link>
              <Link href="/api" className="block text-sm text-muted-foreground hover:text-foreground font-sans">
                API
              </Link>
              <Link href="/status" className="block text-sm text-muted-foreground hover:text-foreground font-sans">
                Статус
              </Link>
            </div>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="font-heading font-semibold">Компания</h3>
            <div className="space-y-2">
              <Link href="/about" className="block text-sm text-muted-foreground hover:text-foreground font-sans">
                О нас
              </Link>
              <Link href="/blog" className="block text-sm text-muted-foreground hover:text-foreground font-sans">
                Блог
              </Link>
              <Link href="/careers" className="block text-sm text-muted-foreground hover:text-foreground font-sans">
                Карьера
              </Link>
              <Link href="/contact" className="block text-sm text-muted-foreground hover:text-foreground font-sans">
                Контакты
              </Link>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground font-sans">
            <span>© 2024 Jambo. Все права защищены.</span>
            <Badge variant="outline" className="text-xs">
              Beta v1.0.0
            </Badge>
          </div>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground font-sans">
            <Link href="/privacy" className="hover:text-foreground">
              Конфиденциальность
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Условия
            </Link>
            <Link href="/cookies" className="hover:text-foreground">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
