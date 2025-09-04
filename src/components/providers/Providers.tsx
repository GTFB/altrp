'use client';

import { SessionProvider } from '@/components/SessionProvider/SessionProvider';
import { ThemeProvider } from '@/components/ThemeProvider/ThemeProvider';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        {children}
        <Toaster />
      </ThemeProvider>
    </SessionProvider>
  );
}
