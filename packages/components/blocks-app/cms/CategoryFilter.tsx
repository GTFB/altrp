"use client";

import { useEffect, useState } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface Category {
  slug: string;
  title: string;
}

interface CategoryFilterProps {
  className?: string;
}

export function CategoryFilter({ className = "" }: CategoryFilterProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const currentCategory = searchParams.get("category");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/categories");
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCategories(data.categories || []);
        }
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const createUrl = (category: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (category) {
      params.set("category", category);
    } else {
      params.delete("category");
    }

    return `${pathname}?${params.toString()}`;
  };

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="text-sm text-muted-foreground">
          Loading categories...
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      <span className="text-sm font-medium text-muted-foreground">
        Filter by category:
      </span>

      {/* All posts */}
      {currentCategory ? (
        <Link href={{ pathname: createUrl(null) }}>
          <Badge variant="outline" className="cursor-pointer hover:bg-muted">
            All Posts
          </Badge>
        </Link>
      ) : (
        <Badge variant="default" className="cursor-default">
          All Posts
        </Badge>
      )}

      {/* Category filters */}
      {categories.map((category) => {
        const isActive = currentCategory === category.slug;

        return isActive ? (
          <Badge
            key={category.slug}
            variant="default"
            className="cursor-default"
          >
            {category.title}
          </Badge>
        ) : (
          <Link key={category.slug} href={{ pathname: createUrl(category.slug) }}>
            <Badge variant="outline" className="cursor-pointer hover:bg-muted">
              {category.title}
            </Badge>
          </Link>
        );
      })}

      {categories.length === 0 && (
        <span className="text-sm text-muted-foreground">
          No categories found
        </span>
      )}
    </div>
  );
}
