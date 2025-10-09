import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileX, Home, Search } from 'lucide-react';
import Link from 'next/link';
import { Container } from '@/components/misc/layout/Container';

export default function NotFound() {
  return (
    <Container className="py-16">
      <div className="max-w-md mx-auto">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto mb-4 w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
              <FileX className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
            <CardTitle className="text-2xl font-bold">Page Not Found</CardTitle>
            <CardDescription>
              Sorry, we couldn&apos;t find the page you&apos;re looking for.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              The page you requested might have been moved, deleted, or doesn&apos;t exist.
            </div>
            <div className="flex flex-col gap-3">
              <Button asChild className="w-full">
                <Link href="/">
                  <Home className="w-4 h-4 mr-2" />
                  Go home
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/blog">
                  <Search className="w-4 h-4 mr-2" />
                  Browse blog
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
