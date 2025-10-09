"use client";

import { ReactNode } from "react";

interface MDXLayoutProps {
  children: ReactNode;
}

export function MDXLayout({ children }: MDXLayoutProps) {
  return <div className="mdx-content">{children}</div>;
}
