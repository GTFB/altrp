import { notFound } from 'next/navigation';

interface LocalizedHomeProps {
  params: { locale: string };
}

export default async function LocalizedHome({ params }: LocalizedHomeProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">Welcome to Jambo</h1>
      <p className="text-xl text-muted-foreground">
        A modern Git-as-CMS powered website
      </p>
      <p className="mt-4 text-sm text-muted-foreground">
        Current locale: {params.locale}
      </p>
    </div>
  );
}
