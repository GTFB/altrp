"use client";

import { AuthorCard } from "@/components/blocks-app/AuthorCard";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, Users } from "lucide-react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { type Author } from "@/packages/types/author";

interface AuthorSectionProps {
  limit?: number;
  showViewAll?: boolean;
  title?: string;
  description?: string;
}

export function AuthorPostsSection({
  limit = 6,
  showViewAll = true,
  title = "Our Authors",
  description = "Meet the talented writers behind our content",
}: AuthorSectionProps) {
  const locale = useLocale() === "en" ? "" : useLocale();
  const localePath = locale !== "" ? `/${locale}` : "";
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const response = await fetch("/api/authors");
        if (!response.ok) {
          throw new Error("Failed to fetch authors");
        }
        const data = await response.json();
        setAuthors(data.authors.slice(0, limit));
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setLoading(false);
      }
    };

    fetchAuthors();
  }, [limit]);

  if (error) {
    return (
      <section className="py-12">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-muted-foreground mr-2" />
            <h2 className="text-3xl font-bold">{title}</h2>
          </div>
          <p className="text-destructive mb-4">
            Error loading authors: {error}
          </p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="py-12">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-muted-foreground mr-2" />
            <h2 className="text-3xl font-bold">{title}</h2>
          </div>
          <p className="text-muted-foreground mb-6">{description}</p>
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  if (authors.length === 0) {
    return (
      <section className="py-12">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-muted-foreground mr-2" />
            <h2 className="text-3xl font-bold">{title}</h2>
          </div>
          <p className="text-muted-foreground mb-6">{description}</p>
          <p className="text-muted-foreground">No authors found</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Users className="h-8 w-8 text-muted-foreground mr-2" />
          <h2 className="text-3xl font-bold">{title}</h2>
        </div>
        <p className="text-muted-foreground mb-6">{description}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {authors.map((author) => (
          <AuthorCard key={author.slug} author={author} />
        ))}
      </div>

      {showViewAll && (
        <div className="text-center">
          <Button asChild variant="outline" size="lg">
            <Link
              href={{
                pathname: `${localePath}/authors`,
              }}
            >
              View All Authors
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
    </section>
  );
}
