import { AuthorList } from '@/components/AuthorList/AuthorList';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Authors | Jambo Blog',
  description: 'Meet our talented authors and discover their stories.',
};

export default function AuthorsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Our Authors</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover the talented writers behind our content and explore their unique perspectives.
        </p>
      </div>
      <AuthorList />
    </div>
  );
}
