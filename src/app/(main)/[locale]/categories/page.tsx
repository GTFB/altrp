import { CategoryList } from '@/components/CategoryList/CategoryList';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Categories | Jambo Blog',
  description: 'Explore our content organized by categories.',
};

export default function CategoriesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Categories</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover our content organized by topics and themes.
        </p>
      </div>
      <CategoryList />
    </div>
  );
}
