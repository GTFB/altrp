"use client";

import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import React from "react";

const ButtonCopyDemo = () => {
  const { isCopied, copyToClipboard } = useCopyToClipboard();
  const link = "https://www.shadcnui-blocks.com";

  return (
    <div className="flex items-center border rounded-full overflow-hidden p-1 w-full max-w-md">
      <p className="pl-4 pr-2 flex-1 text-ellipsis overflow-hidden whitespace-nowrap text-sm">
        {link}
      </p>
      <Button
        size="icon"
        className="rounded-full flex-shrink-0"
        onClick={() => copyToClipboard(link)}
      >
        {isCopied ? <Check /> : <Copy />}
      </Button>
    </div>
  );
};

// @hooks/use-copy-to-clipboard.tsx
function useCopyToClipboard({
  timeout = 2000,
  onCopy,
}: {
  timeout?: number;
  onCopy?: () => void;
} = {}) {
  const [isCopied, setIsCopied] = React.useState(false);

  const copyToClipboard = (value: string) => {
    if (typeof window === "undefined" || !navigator.clipboard.writeText) {
      return;
    }

    if (!value) return;

    navigator.clipboard.writeText(value).then(() => {
      setIsCopied(true);

      if (onCopy) {
        onCopy();
      }

      setTimeout(() => {
        setIsCopied(false);
      }, timeout);
    }, console.error);
  };

  return { isCopied, copyToClipboard };
}

export default ButtonCopyDemo;
