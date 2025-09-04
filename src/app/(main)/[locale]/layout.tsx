import { IntlProvider } from '@/components/providers/IntlProvider';

export default async function MainLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <IntlProvider locale={params.locale}>
      <section className="min-h-screen">{children}</section>
    </IntlProvider>
  );
}
