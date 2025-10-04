import { MDXRemote } from "next-mdx-remote/rsc";

export function RenderMdx({ source }: { source: unknown }) {
  // Consumers provide MDX components mapping if needed
  // Using RSC variant for Next.js App Router
  return <MDXRemote {...source} />;
}
