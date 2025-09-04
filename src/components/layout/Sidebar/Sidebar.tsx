'use client';

import { useUiStore } from '@/stores/ui.store';
import { X } from 'lucide-react';

export function Sidebar() {
  const { isSidebarOpen, toggleSidebar } = useUiStore();

  if (!isSidebarOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={toggleSidebar}>
      <div
        className="fixed left-0 top-0 h-full w-80 bg-card border-r"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Navigation</h2>
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-muted rounded-md"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <a
                href="/"
                className="block p-2 hover:bg-muted rounded-md"
                onClick={toggleSidebar}
              >
                Home
              </a>
            </li>
            <li>
              <a
                href="/blog"
                className="block p-2 hover:bg-muted rounded-md"
                onClick={toggleSidebar}
              >
                Blog
              </a>
            </li>
            <li>
              <a
                href="/about"
                className="block p-2 hover:bg-muted rounded-md"
                onClick={toggleSidebar}
              >
                About
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
