"use client";

import * as React from "react";
import Link from "next/link";
import { Container } from "@/components/misc/layout/Container";
import Hero01 from "@/components/blocks-app/Hero01";
import { Settings, LogIn, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
      <div className="flex-1">
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <Container className="py-4">
            <div className="flex items-center justify-between">
              {/* Desktop Navigation */}
              <ul className="hidden md:flex items-center gap-6">
                <li>
                  <Link 
                    href="/authors" 
                    className="text-sm font-medium transition-colors hover:text-primary"
                  >
                    Authors
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/blog" 
                    className="text-sm font-medium transition-colors hover:text-primary"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/categories" 
                    className="text-sm font-medium transition-colors hover:text-primary"
                  >
                    Categories
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/tags" 
                    className="text-sm font-medium transition-colors hover:text-primary"
                  >
                    Tags
                  </Link>
                </li>
                <li className="ml-auto">
                  <Link 
                    href="/login" 
                    className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary"
                  >
                    <LogIn className="h-4 w-4" />
                    Login
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/admin" 
                    target="_blank"
                    className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary"
                  >
                    <Settings className="h-4 w-4" />
                    Admin
                  </Link>
                </li>
              </ul>

              {/* Mobile Burger Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </Container>
        </nav>

        {/* Mobile Menu Dialog */}
        <Dialog open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <DialogContent className="max-w-full h-screen w-full m-0 rounded-none p-0 flex flex-col left-0 top-0 translate-x-0 translate-y-0 sm:left-0 sm:top-0 sm:translate-x-0 sm:translate-y-0">
            <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl font-semibold">Menu</DialogTitle>
                <DialogClose asChild>
                  <Button variant="ghost" size="icon" aria-label="Close menu">
                    <X className="h-5 w-5" />
                  </Button>
                </DialogClose>
              </div>
            </DialogHeader>
            <nav className="flex-1 px-6 py-6 overflow-y-auto">
              <ul className="flex flex-col gap-6">
                <li>
                  <Link 
                    href="/authors" 
                    className="text-base font-medium transition-colors hover:text-primary block py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Authors
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/blog" 
                    className="text-base font-medium transition-colors hover:text-primary block py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/categories" 
                    className="text-base font-medium transition-colors hover:text-primary block py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Categories
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/tags" 
                    className="text-base font-medium transition-colors hover:text-primary block py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Tags
                  </Link>
                </li>
                <li className="pt-4 border-t">
                  <Link 
                    href="/login" 
                    className="flex items-center gap-2 text-base font-medium transition-colors hover:text-primary py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LogIn className="h-5 w-5" />
                    Login
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/admin" 
                    target="_blank"
                    className="flex items-center gap-2 text-base font-medium transition-colors hover:text-primary py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Settings className="h-5 w-5" />
                    Admin
                  </Link>
                </li>
              </ul>
            </nav>
          </DialogContent>
        </Dialog>
        <Container className="py-8">
          <Hero01 />
        </Container>
      </div>
  );
}
