'use client';

import { AppSidebar, type NavigationItem } from "@/components/AppSidebar/AppSidebar"
import { useLeftSidebar } from "@/components/providers/LeftSidebarProvider";
import { SiteHeader } from "@/components/SiteHeader/SiteHeader"
import {
  SidebarInset,
  SidebarProvider
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  BetweenHorizontalEnd,
  FolderKanban,
  BookImage,
  PenLine,
  LibraryBig,
} from "lucide-react"
import { useEffect, useState } from "react"

const sidebarItems: NavigationItem[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    icon: <LayoutDashboard className="w-4 h-4" />,
    href: "/admin/dashboard",
  },
  {
    id: "pages",
    title: "Pages",
    icon: <FolderKanban className="w-4 h-4" />,
    href: "/admin/pages",
  },
  {
    id: "posts",
    title: "Posts",
    icon: <BetweenHorizontalEnd className="w-4 h-4" />,
    href: "/admin/posts",
  },
  {
    id: "media",
    title: "Media",
    icon: <BookImage className="w-4 h-4" />,
    href: "/admin/media",
  },
  {
    id: "categories",
    title: "Categories",
    icon: <LibraryBig className="w-4 h-4" />,
    href: "/admin/categories",
  },
  {
    id: "authors",
    title: "Authors",
    icon: <PenLine className="w-4 h-4" />,
    href: "/admin/authors",
  },

];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarWidth, setSidebarWidth] = useState(320); // Default width (20rem = 320px)
  const{leftSidebarOpen, setLeftSidebarOpen} = useLeftSidebar()

  useEffect(() => {
    // Get sidebar width from CSS variable or measure it
    const updateSidebarWidth = () => {
      const sidebar = document.querySelector('[data-sidebar]');
      if (sidebar) {
        const width = sidebar.getBoundingClientRect().width;
        setSidebarWidth(width);
      }
    };

    // Update on mount and resize
    updateSidebarWidth();
    window.addEventListener('resize', updateSidebarWidth);
    
    // Also listen for sidebar toggle events
    const observer = new MutationObserver(updateSidebarWidth);
    const sidebarElement = document.querySelector('[data-sidebar]');
    if (sidebarElement) {
      observer.observe(sidebarElement, { 
        attributes: true, 
        attributeFilter: ['class', 'style'] 
      });
    }

    return () => {
      window.removeEventListener('resize', updateSidebarWidth);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-background" style={{ '--sidebar-transition-duration': '300ms' } as React.CSSProperties}>
      <SidebarProvider>
        <AppSidebar items={sidebarItems} />
        <div 
          className="flex flex-col min-h-screen  w-[calc(100vw-var(--sidebar-width))] duration-200 transition-transform flex-1"
          
        >
          <SiteHeader />
          <div className="flex-1 p-4 ">
            {children}
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}

