'use client';

import { useUiStore } from '@/stores/ui.store';
import { Menu, Search } from 'lucide-react';

export function Header() {
  const { toggleSidebar } = useUiStore();

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-muted rounded-md"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold">Jambo</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border rounded-md bg-background"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
