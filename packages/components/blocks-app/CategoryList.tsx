import { CategoryRepository } from "@/repositories/category.repository";
import { CategoryCard } from "@/components/blocks-app/CategoryCard";

export const dynamic = "force-dynamic";

export async function CategoryList() {
  const categoryRepo = CategoryRepository.getInstance();
  const categories = await categoryRepo.findAll();

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No categories found.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => (
        <CategoryCard key={category.slug} category={category} />
      ))}
    </div>
  );
}
