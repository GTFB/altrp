"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";

interface BreadcrumbItem {
  label: string;
  href: string;
  isLast?: boolean;
}

export function useBreadcrumbs(): BreadcrumbItem[] {
  const pathname = usePathname();

  return useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);

    // If we're not in admin panel, return empty array
    if (segments[0] !== "admin") {
      return [];
    }

    const breadcrumbs: BreadcrumbItem[] = [];

    // Always add Dashboard as first element
    breadcrumbs.push({
      label: "Dashboard",
      href: "/admin/dashboard",
    });

    // Process remaining segments
    if (segments.length > 1) {
      const section = segments[1];

      // Add section (pages, posts, authors, etc.)
      const sectionLabels: Record<string, string> = {
        pages: "Pages",
        posts: "Posts",
        authors: "Authors",
        categories: "Categories",
        media: "Media",
        editor: "Editor",
      };

      if (sectionLabels[section]) {
        breadcrumbs.push({
          label: sectionLabels[section],
          href: `/admin/${section}`,
        });
      }

      // If there's a slug (e.g., about in /admin/pages/about/edit)
      if (segments.length > 2) {
        const slug = segments[2];

        // If this is an edit page
        if (segments[3] === "edit") {
          breadcrumbs.push({
            label: slug.charAt(0).toUpperCase() + slug.slice(1),
            href: `/admin/${section}/${slug}/edit`,
            isLast: true,
          });
        } else if (segments[3] === "new") {
          breadcrumbs.push({
            label: "New",
            href: `/admin/${section}/new`,
            isLast: true,
          });
        } else {
          // Regular page with slug
          breadcrumbs.push({
            label: slug.charAt(0).toUpperCase() + slug.slice(1),
            href: `/admin/${section}/${slug}`,
            isLast: true,
          });
        }
      }
    }

    return breadcrumbs;
  }, [pathname]);
}
