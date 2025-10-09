import { z } from "zod";

export const frontmatterSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  date: z.string().optional(),
  tags: z.array(z.string()).optional(),
  excerpt: z.string().optional(),
  media: z.string().optional(),
  category: z.string().optional(),
  author: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
});

export type Frontmatter = z.infer<typeof frontmatterSchema>;
