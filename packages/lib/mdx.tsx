import { MDXRemote } from 'next-mdx-remote/rsc';

export function RenderMdx({ source }: { source: any }) {
  // Consumers provide MDX components mapping if needed
  // Using RSC variant for Next.js App Router
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <MDXRemote {...source} />;
}
