'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global application error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <CardTitle className="text-2xl font-bold">Critical Error</CardTitle>
                <CardDescription>
                  A critical error occurred that prevented the application from loading properly.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error.digest && (
                  <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                    Error ID: {error.digest}
                  </div>
                )}
                <div className="text-sm text-muted-foreground">
                  This is a global error that affects the entire application. Please try refreshing the page.
                </div>
                <div className="flex flex-col gap-3">
                  <Button onClick={reset} className="w-full">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try again
                  </Button>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/">
                      <Home className="w-4 h-4 mr-2" />
                      Go home
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </body>
    </html>
  );
}
