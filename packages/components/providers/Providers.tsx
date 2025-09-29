'use client';

import { ThemeProvider } from 'next-themes';
import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { SessionProvider } from '@/components/providers/SessionProvider';
import { Toaster } from 'sonner';
import { LeftSidebarProvider } from './LeftSidebarProvider';
import { TooltipProvider } from '@/components/ui/tooltip';

export function Providers({ children, session = {} }: { children: React.ReactNode, session: any }) {
const{leftSidebarOpen=true,theme='light'} = session || {};
  
  

  return (
    <SessionProvider session={session}>
      <NextAuthSessionProvider>
        <LeftSidebarProvider open={leftSidebarOpen} >
          <TooltipProvider>
            <ThemeProvider
              themes={['light', 'dark']}
              attribute="class"
              defaultTheme={theme}>
              {children}
              <Toaster />
            </ThemeProvider>
          </TooltipProvider>
        </LeftSidebarProvider>
      </NextAuthSessionProvider>
    </SessionProvider>
  );
}
