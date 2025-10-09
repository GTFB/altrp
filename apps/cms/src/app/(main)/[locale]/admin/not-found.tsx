import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileX, ArrowLeft, Home, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

export default function AdminNotFound() {
  return (
    <div className="p-6">
      <div className="max-w-md mx-auto">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto mb-4 w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
              <FileX className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
            <CardTitle className="text-2xl font-bold">Admin Page Not Found</CardTitle>
            <CardDescription>
              The admin page you&apos;re looking for doesn&apos;t exist.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Check the URL or navigate back to a valid admin page.
            </div>
            <div className="flex flex-col gap-3">
              <Button asChild className="w-full">
                <Link href="/admin/dashboard">
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Go to dashboard
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/admin">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to admin
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/">
                  <Home className="w-4 h-4 mr-2" />
                  Go to site
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
