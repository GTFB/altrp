import { getMessages,  } from 'next-intl/server';

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {

  return (

        <main className="flex-1">
          {children}
        </main>
  );
}
