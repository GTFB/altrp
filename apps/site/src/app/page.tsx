import Link from "next/link";
import { Container } from "@/components/misc/layout/Container";
import Hero01 from "@/components/blocks-app/Hero01";
import { Settings } from "lucide-react";

export default function Home() {
  return (
      <div className="flex-1">
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <Container className="py-4">
            <ul className="flex items-center gap-6">
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
                  href="/admin" 
                  target="_blank"
                  className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary"
                >
                  <Settings className="h-4 w-4" />
                  Admin
                </Link>
              </li>
            </ul>
          </Container>
        </nav>
        <Container className="py-8">
          <Hero01 />
        </Container>
      </div>
  );
}
