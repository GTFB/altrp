import type { Metadata } from 'next'
import './globals.css'


export const metadata: Metadata = {

  title: 'altrp CMS - Content Management System',
  description: 'Payload CMS admin panel for altrp website',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (<>
    {children}
  </>
  )
}
