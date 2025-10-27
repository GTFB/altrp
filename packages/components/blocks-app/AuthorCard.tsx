"use client";

import { type Author } from "@/packages/types/author";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User } from "lucide-react";

interface AuthorCardProps {
  author: Author;
}

export function AuthorCard({ author }: AuthorCardProps) {
  const locale = useLocale() === "en" ? "" : useLocale();
  const localePath = locale !== "" ? `/${locale}` : "";

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={author.avatar} alt={author.name} />
            <AvatarFallback>
              <User className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
        </div>
        <CardTitle className="text-xl">
          <Link
            href={{
              pathname: `${localePath}/authors/${author.slug}`,
            }}
            className="hover:text-primary"
          >
            {author.name}
          </Link>
        </CardTitle>
        {author.bio && (
          <CardDescription className="line-clamp-3">
            {author.bio}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="text-center">
        <Link
          href={{
            pathname: `${localePath}/authors/${author.slug}`,
          }}
          className="text-sm text-muted-foreground hover:text-primary"
        >
          View posts by {author.name}
        </Link>
      </CardContent>
    </Card>
  );
}
