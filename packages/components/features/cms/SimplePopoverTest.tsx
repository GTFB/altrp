'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export function SimplePopoverTest() {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Simple Popover Test</h2>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline">Open Popover</Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4 z-[9999]">
          <div className="space-y-2">
            <h4 className="font-medium">Test Popover</h4>
            <p className="text-sm text-muted-foreground">
              This is a test popover to check if Radix UI is working correctly.
            </p>
            <Button onClick={() => setOpen(false)}>Close</Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
