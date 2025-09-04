import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
        <span className="text-primary-foreground font-bold text-sm">J</span>
      </div>
      <span className="font-bold text-lg">{siteConfig.name}</span>
    </div>
  );
}
