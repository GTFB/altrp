'use client';

import { ThemeProvider } from 'next-themes';
import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { SessionProvider } from '@/components/providers/SessionProvider';
import { Toaster } from 'sonner';
import { LeftSidebarProvider } from './LeftSidebarProvider';

export function Providers({ children, session = {} }: { children: React.ReactNode, session: any }) {
const{leftSidebarOpen=true,theme='light'} = session || {};
  
  

  return (
    <SessionProvider session={session}>
      <NextAuthSessionProvider>
        <LeftSidebarProvider open={leftSidebarOpen} >
          <ThemeProvider
            themes={['light', 'dark']}
            attribute="class"
            defaultTheme={theme}>
            {children}
            <Toaster />
          </ThemeProvider>
        </LeftSidebarProvider>
      </NextAuthSessionProvider>
    </SessionProvider>
  );
}
